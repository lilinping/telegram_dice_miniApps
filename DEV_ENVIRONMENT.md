# 开发环境配置指南

## 🎯 当前状态

✅ **好消息**: API 路由工作正常！
- 500 错误已修复
- 现在返回 401 错误，说明请求成功到达后端
- 后端正确验证 `initData` 并拒绝无效的认证

## ⚠️ 开发环境的 401 问题

### 问题原因
后端 API 需要有效的 Telegram `initData` 进行认证。在开发环境中：
- 我们模拟了 `initData`，但它无法通过后端的签名验证
- 后端会验证 `initData` 的 hash 是否与 Telegram Bot Token 匹配
- 模拟的 `initData` 无法通过这个验证

### 解决方案

有三种方法可以在开发环境中测试：

---

## 方案 1: 使用真实的 Telegram 环境（推荐）

### 步骤 1: 使用 ngrok 暴露本地服务
```bash
# 安装 ngrok
brew install ngrok  # macOS
# 或从 https://ngrok.com/download 下载

# 启动本地开发服务器
npm run dev

# 在另一个终端窗口，暴露本地服务
ngrok http 3000
```

### 步骤 2: 更新 Telegram Bot 配置
1. 复制 ngrok 提供的 HTTPS URL（例如：`https://abc123.ngrok.io`）
2. 打开 [@BotFather](https://t.me/BotFather)
3. 发送 `/mybots` → 选择你的 Bot → Bot Settings → Menu Button → Edit Menu Button URL
4. 输入：`https://abc123.ngrok.io`

### 步骤 3: 在 Telegram 中测试
1. 打开你的 Bot
2. 点击菜单按钮或发送 `/start`
3. 现在应该可以正常使用了！

**优点**:
- ✅ 使用真实的 Telegram 环境
- ✅ 可以测试所有功能
- ✅ `initData` 是真实有效的

**缺点**:
- ❌ 需要额外的工具（ngrok）
- ❌ 每次重启 ngrok 都需要更新 Bot URL

---

## 方案 2: 后端添加开发模式（需要后端配合）

如果你可以修改后端代码，可以添加一个开发模式：

### 后端修改（示例）
```java
// 在后端添加开发模式配置
@Value("${app.dev-mode:false}")
private boolean devMode;

// 在验证 initData 的地方
if (devMode && initData.startsWith("DEV_MODE_")) {
    // 开发模式：跳过验证
    return true;
}
```

### 前端配置
在 `.env.local` 中添加：
```env
NEXT_PUBLIC_DEV_MODE=true
```

修改 `src/lib/api.ts`：
```typescript
private getInitData(): string {
  if (typeof window === 'undefined') return '';
  
  // 开发模式：使用特殊的 initData
  if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    return 'DEV_MODE_123456789';
  }
  
  // 生产模式：使用真实的 initData
  if (window.Telegram?.WebApp?.initData) {
    return window.Telegram.WebApp.initData;
  }
  
  return '';
}
```

**优点**:
- ✅ 不需要额外工具
- ✅ 开发体验好

**缺点**:
- ❌ 需要修改后端代码
- ❌ 需要确保生产环境不启用开发模式

---

## 方案 3: 使用测试账号的真实 initData（临时方案）

### 步骤 1: 获取真实的 initData
1. 部署到 Vercel（或其他平台）
2. 在 Telegram 中打开 Mini App
3. 打开浏览器开发者工具（Telegram Desktop）
4. 在 Console 中运行：
   ```javascript
   console.log(window.Telegram.WebApp.initData);
   ```
5. 复制输出的字符串

### 步骤 2: 在本地使用
在 `.env.local` 中添加：
```env
NEXT_PUBLIC_TEST_INIT_DATA=你复制的initData字符串
```

修改 `src/lib/api.ts`：
```typescript
private getInitData(): string {
  if (typeof window === 'undefined') return '';
  
  // 开发环境：使用测试 initData
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_TEST_INIT_DATA) {
    return process.env.NEXT_PUBLIC_TEST_INIT_DATA;
  }
  
  // 生产环境：使用真实 initData
  if (window.Telegram?.WebApp?.initData) {
    return window.Telegram.WebApp.initData;
  }
  
  return '';
}
```

**优点**:
- ✅ 不需要修改后端
- ✅ 不需要额外工具

**缺点**:
- ❌ initData 会过期（通常 24 小时）
- ❌ 需要定期更新
- ❌ 只能使用一个测试账号

---

## 🚀 推荐的开发流程

### 日常开发
1. 使用 **方案 1（ngrok）** 进行完整功能测试
2. 或使用 **方案 3（测试 initData）** 进行快速开发

### 生产部署
1. 部署到 Vercel
2. 在 Vercel Dashboard 设置环境变量：
   - `BACKEND_API_URL` = `http://46.250.168.177:8079`
   - `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` = 你的 Bot Token
3. 在 Telegram 中测试

---

## 📝 验证 API 路由是否正常

即使返回 401，你也可以验证 API 路由是否正常工作：

### 测试 1: 检查请求是否到达后端
```bash
# 在终端运行
curl -v http://localhost:3000/api/backend/dice/display \
  -H "Content-Type: application/json" \
  -H "initData: test"
```

**期望结果**:
- 状态码: 401
- 响应: "Missing initData header" 或类似的认证错误
- ✅ 这说明 API 路由工作正常！

### 测试 2: 查看 Next.js 日志
在终端中应该看到：
```
[API Proxy] GET http://46.250.168.177:8079/dice/display
[API Proxy] Response status: 401
[API Proxy] 401 Unauthorized for http://46.250.168.177:8079/dice/display
[API Proxy] Response: Missing initData header
```

✅ 如果看到这些日志，说明一切正常！

---

## 🎉 总结

**当前状态**: ✅ API 路由工作正常
- 500 错误已修复
- 401 错误是预期的（因为缺少有效的 initData）

**下一步**:
1. 选择一个开发方案（推荐方案 1 或 3）
2. 或者直接部署到 Vercel 进行测试
3. 在真实的 Telegram 环境中，一切都会正常工作！

**部署到 Vercel 后**:
- ✅ 不会有 401 错误（因为有真实的 initData）
- ✅ 所有功能都会正常工作
- ✅ 只需要在 Telegram 中打开 Mini App
