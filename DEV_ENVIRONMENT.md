# 开发环境配置指南

## 问题：为什么本地测试用户"消失"了？

### 原因
添加了 `initData` 认证后，所有 API 请求都需要有效的 Telegram 认证信息。虽然前端会自动使用测试用户（ID: 6784471903），但后端 API 仍然会验证 `initData` 的有效性。

### 解决方案

有两种方式在本地开发环境中测试：

## 方案 1: 使用模拟的 initData（推荐用于前端开发）

开发环境会自动生成模拟的 `initData`，但后端可能不接受这个模拟数据。

### 配置步骤

1. **确保 `.env.local` 文件存在**
   ```bash
   # 文件已创建，包含以下配置：
   NEXT_PUBLIC_TEST_USER_ID=6784471903
   NEXT_PUBLIC_TEST_USER_NAME=测试用户
   NEXT_PUBLIC_TEST_USERNAME=test_user
   ```

2. **重启开发服务器**
   ```bash
   npm run dev
   ```

3. **查看控制台输出**
   应该看到：
   ```
   🔧 开发模式：模拟 Telegram WebApp
   ✅ Telegram WebApp 模拟完成
   👤 模拟用户: { id: 6784471903, ... }
   🔑 initData: user=%7B%22id%22%3A6784471903...
   ```

### 限制
- 后端 API 会返回 401 错误（因为 initData 是模拟的）
- 无法测试需要后端数据的功能
- 只能测试前端 UI 和交互

## 方案 2: 使用真实的 Telegram 环境（推荐用于完整测试）

### 配置步骤

1. **安装 ngrok**
   ```bash
   # macOS
   brew install ngrok
   
   # 或从官网下载
   # https://ngrok.com/download
   ```

2. **启动本地开发服务器**
   ```bash
   npm run dev
   ```

3. **使用 ngrok 暴露本地服务**
   ```bash
   ngrok http 3000
   ```
   
   会得到一个公网 URL，例如：
   ```
   https://abc123.ngrok.io
   ```

4. **配置 Telegram Bot**
   - 打开 [@BotFather](https://t.me/BotFather)
   - 发送 `/mybots`
   - 选择你的 Bot
   - 选择 "Bot Settings" → "Menu Button"
   - 设置 Web App URL 为 ngrok 提供的 URL

5. **在 Telegram 中测试**
   - 打开你的 Bot
   - 点击菜单按钮
   - 应用会在 Telegram 中打开，使用真实的 `initData`

### 优点
- 使用真实的 Telegram 认证
- 可以测试所有功能
- 后端 API 正常工作

### 缺点
- 需要额外的工具（ngrok）
- 每次重启 ngrok 都需要更新 Bot 配置
- 需要网络连接

## 方案 3: 后端开发模式（需要后端支持）

如果你有后端代码的访问权限，可以在后端添加开发模式，跳过 `initData` 验证。

### 后端修改（示例）
```java
// 在后端添加开发模式配置
if (isDevelopmentMode && initData.startsWith("mock_")) {
    // 跳过验证，直接使用 mock 数据
    return true;
}
```

### 前端配置
在 `src/lib/dev-telegram.ts` 中，`initData` 已经包含了 `mock_` 前缀的标识。

## 当前状态

### ✅ 已配置
- 开发环境自动模拟 Telegram WebApp
- 使用测试用户 ID: 6784471903
- 自动生成模拟的 `initData`
- API 请求自动包含 `initData` 请求头

### ⚠️ 限制
- 后端 API 会返回 401 错误（需要有效的 `initData`）
- 需要使用方案 2（ngrok）或方案 3（后端开发模式）来完整测试

## 快速测试

### 测试前端 UI（不需要后端）
```bash
npm run dev
# 访问 http://localhost:3000
# 可以看到 UI，但 API 请求会失败
```

### 测试完整功能（需要后端）
```bash
# 终端 1: 启动开发服务器
npm run dev

# 终端 2: 启动 ngrok
ngrok http 3000

# 然后在 Telegram Bot 中配置 ngrok URL
```

## 常见问题

### Q: 为什么看不到用户数据？
A: 因为后端 API 返回 401 错误。使用方案 2（ngrok）或方案 3（后端开发模式）。

### Q: 如何查看模拟的 initData？
A: 打开浏览器控制台，输入：
```javascript
console.log(window.Telegram?.WebApp?.initData);
```

### Q: 可以修改测试用户 ID 吗？
A: 可以！修改 `.env.local` 文件中的 `NEXT_PUBLIC_TEST_USER_ID`，然后重启开发服务器。

### Q: 为什么之前可以测试，现在不行了？
A: 之前可能后端没有启用 `initData` 验证，或者使用了不同的认证方式。现在添加了标准的 Telegram 认证，更安全但需要额外配置。

## 推荐的开发流程

1. **前端 UI 开发**: 直接使用 `npm run dev`，忽略 API 错误
2. **功能测试**: 使用 ngrok + Telegram
3. **部署前测试**: 部署到 Vercel，在 Telegram 中测试

## 相关文件

- `.env.local` - 本地环境变量配置
- `src/lib/dev-telegram.ts` - 开发环境 Telegram 模拟
- `src/contexts/TelegramContext.tsx` - Telegram 用户管理
- `src/lib/api.ts` - API 服务（包含 initData 认证）
