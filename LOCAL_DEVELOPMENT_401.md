# 本地开发 401 错误说明

## 问题

在本地开发环境中，所有 API 请求都返回 401 错误，响应内容为：
```
Invalid Telegram signature
```

## 原因

后端 API 需要验证 Telegram `initData` 的签名，以确保请求来自真实的 Telegram 用户。

开发环境生成的模拟 `initData` 使用了假的哈希值（`mock_hash_for_development`），无法通过后端的签名验证。

## 解决方案

### 方案 1：后端添加开发模式（推荐）

**需要后端配合**

在后端添加开发模式配置，允许跳过签名验证：

```java
// 后端代码示例
@Value("${app.dev-mode:false}")
private boolean devMode;

public boolean validateInitData(String initData) {
    // 开发模式：跳过验证
    if (devMode && initData.contains("mock_hash_for_development")) {
        logger.info("Development mode: skipping initData validation");
        return true;
    }
    
    // 生产模式：正常验证
    return telegramService.validateSignature(initData);
}
```

**配置文件**：
```yaml
# application-dev.yml
app:
  dev-mode: true
```

### 方案 2：使用 ngrok 获取真实 initData

**适用于需要完整测试的场景**

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **启动 ngrok**
   ```bash
   # 安装 ngrok（如果还没安装）
   brew install ngrok
   
   # 启动 ngrok
   ngrok http 3000
   ```

3. **配置 Telegram Bot**
   - 复制 ngrok 提供的 URL（例如：`https://abc123.ngrok.io`）
   - 打开 [@BotFather](https://t.me/BotFather)
   - 发送 `/mybots` → 选择你的 Bot → Bot Settings → Menu Button
   - 设置 Web App URL 为 ngrok URL

4. **在 Telegram 中测试**
   - 打开你的 Bot
   - 点击菜单按钮
   - 应用会使用真实的 `initData`

**优点**：
- 可以测试完整功能
- 使用真实的 Telegram 认证
- 后端 API 正常工作

**缺点**：
- 需要额外的工具（ngrok）
- 每次重启 ngrok 都需要更新 Bot 配置
- 需要网络连接

### 方案 3：前端 UI 开发（不需要后端）

**适用于只开发前端 UI 的场景**

如果只是开发前端界面，不需要后端数据：

1. **忽略 API 错误**
   - 前端会显示模拟用户信息
   - UI 可以正常显示和交互
   - API 请求会失败，但不影响 UI 开发

2. **使用 Mock 数据**
   - 可以在组件中使用假数据
   - 专注于 UI 和交互开发

## 当前开发环境配置

### 模拟用户信息
```typescript
// src/lib/dev-telegram.ts
const mockUser = {
  id: parseInt(process.env.NEXT_PUBLIC_TEST_USER_ID || '6784471903'),
  first_name: process.env.NEXT_PUBLIC_TEST_USER_NAME || '测试用户',
  last_name: 'Dev',
  username: process.env.NEXT_PUBLIC_TEST_USERNAME || 'test_user',
  language_code: 'zh',
};
```

### 环境变量
```bash
# .env.local
NEXT_PUBLIC_TEST_USER_ID=6784471903
NEXT_PUBLIC_TEST_USER_NAME=测试用户
NEXT_PUBLIC_TEST_USERNAME=test_user
```

## 推荐的开发流程

### 前端 UI 开发
```bash
npm run dev
# 忽略 401 错误，专注于 UI 开发
```

### 功能测试
```bash
# 终端 1: 启动开发服务器
npm run dev

# 终端 2: 启动 ngrok
ngrok http 3000

# 在 Telegram 中测试
```

### 部署前测试
```bash
# 部署到 Vercel
vercel --prod

# 在 Telegram 中测试生产环境
```

## 常见问题

### Q: 为什么不能直接在浏览器中测试？
A: Telegram Mini App 必须在 Telegram 环境中运行，才能获取有效的 `initData`。直接在浏览器中打开会使用模拟数据，后端无法验证。

### Q: 可以禁用后端的签名验证吗？
A: 不推荐在生产环境中禁用。应该只在开发环境中添加特殊处理。

### Q: 如何判断是否在 Telegram 环境中？
A: 检查 `window.Telegram?.WebApp?.initData` 是否存在且不为空。

### Q: 开发环境的模拟数据安全吗？
A: 模拟数据只在本地开发环境中使用，不会发送到生产环境。但后端应该始终验证 `initData` 的签名。

## 相关文档

- [DEV_ENVIRONMENT.md](./DEV_ENVIRONMENT.md) - 开发环境配置指南
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Vercel 部署指南
- [Telegram Mini Apps 文档](https://core.telegram.org/bots/webapps)

## 总结

本地开发时的 401 错误是**正常现象**，因为：
1. 开发环境使用模拟的 `initData`
2. 后端正确地拒绝了无效的签名
3. 这证明后端的安全验证是有效的

**解决方法**：
- **前端开发**：忽略 401 错误，专注于 UI
- **功能测试**：使用 ngrok + Telegram
- **最佳方案**：后端添加开发模式支持
