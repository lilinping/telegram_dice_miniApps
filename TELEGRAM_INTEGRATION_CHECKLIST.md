# Telegram 小程序集成检查清单

## ✅ 已完成的集成

### 1. Telegram WebApp SDK 加载
- ✅ 在 `src/app/layout.tsx` 中正确引入了 Telegram WebApp 脚本
- ✅ 脚本地址：`https://telegram.org/js/telegram-web-app.js`
- ✅ 使用 `async` 加载，不阻塞页面渲染

### 2. TelegramContext 实现
- ✅ 创建了 `src/contexts/TelegramContext.tsx`
- ✅ 正确获取 `window.Telegram.WebApp`
- ✅ 调用 `tg.ready()` 初始化
- ✅ 调用 `tg.expand()` 展开应用
- ✅ 从 `tg.initDataUnsafe.user` 获取用户信息

### 3. 用户信息字段映射
- ✅ `id` - 用户ID
- ✅ `first_name` → `firstName`
- ✅ `last_name` → `lastName`
- ✅ `username` - 用户名
- ✅ `language_code` → `languageCode`
- ✅ `photo_url` → `photoUrl`

### 4. 后端用户初始化
- ✅ 调用 `apiService.initUser()` 初始化后端用户
- ✅ 转换为 `BackendUser` 格式
- ✅ 包含所有必需字段

### 5. 开发环境支持
- ✅ 提供模拟用户数据（当 Telegram WebApp 不可用时）
- ✅ 支持环境变量配置测试用户
- ✅ 错误处理和降级方案

### 6. Provider 层级结构
- ✅ `TelegramProvider` 包裹整个应用
- ✅ `WalletProvider` 和 `GameProvider` 在内层
- ✅ 正确的 Context 嵌套顺序

## 📋 发布前检查清单

### 必须完成的配置

#### 1. 环境变量配置
创建 `.env.local` 文件（生产环境使用 `.env.production`）：

```bash
# Telegram Bot 配置
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=你的Bot Token
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=你的Bot用户名

# 后端API地址
NEXT_PUBLIC_API_URL=https://你的后端API地址

# 测试用户配置（仅开发环境）
NEXT_PUBLIC_TEST_USER_ID=你的测试用户ID
NEXT_PUBLIC_TEST_USER_NAME=测试用户名
NEXT_PUBLIC_TEST_USERNAME=test_user
```

#### 2. Telegram Bot 设置
在 @BotFather 中配置：

```
/newbot - 创建新bot
/setmenubutton - 设置菜单按钮
/setdomain - 设置Web App域名
```

设置 Web App URL：
```
https://你的域名.com
```

#### 3. 后端API端点确认
确保以下端点可用：
- ✅ `POST /user/init/` - 用户初始化
- ✅ `POST /payment/order/{userId}/{amount}` - 创建支付订单
- ✅ `GET /payment/order/status/{orderId}` - 查询支付状态
- ✅ `GET /account/query/{userId}` - 查询账户余额
- ✅ 其他游戏和钱包相关端点

#### 4. CORS 配置
确保后端API允许来自你的域名的请求：

```javascript
// 后端需要配置
Access-Control-Allow-Origin: https://你的域名.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

#### 5. HTTPS 配置
- ⚠️ **必须使用 HTTPS** - Telegram WebApp 要求
- 配置 SSL 证书
- 确保所有资源都通过 HTTPS 加载

## 🔍 测试步骤

### 本地开发测试

1. **启动开发服务器**
```bash
npm run dev
```

2. **使用 ngrok 创建 HTTPS 隧道**
```bash
ngrok http 3000
```

3. **在 @BotFather 中设置 Web App URL**
使用 ngrok 提供的 HTTPS URL

4. **在 Telegram 中打开 Bot**
点击菜单按钮或发送命令打开 Web App

### 生产环境测试

1. **部署到生产服务器**
```bash
npm run build
npm start
```

2. **验证 HTTPS 配置**
访问 `https://你的域名.com`

3. **在 @BotFather 中更新 Web App URL**
设置为生产域名

4. **测试用户流程**
- 打开 Bot
- 检查用户信息是否正确获取
- 测试充值流程
- 测试游戏功能
- 测试提现流程

## ⚠️ 常见问题和解决方案

### 问题 1: 获取不到用户信息
**症状**: `tg.initDataUnsafe.user` 为 undefined

**解决方案**:
1. 确认在 Telegram 内打开（不是浏览器直接访问）
2. 检查 Bot 设置是否正确
3. 确认 Web App URL 配置正确
4. 查看浏览器控制台错误信息

### 问题 2: API 请求失败
**症状**: 网络请求返回 CORS 错误

**解决方案**:
1. 检查后端 CORS 配置
2. 确认 API URL 正确
3. 检查网络连接
4. 查看后端日志

### 问题 3: 页面无法展开
**症状**: 页面显示不完整

**解决方案**:
1. 确认调用了 `tg.expand()`
2. 检查 viewport 配置
3. 测试不同设备

### 问题 4: 开发环境无法测试
**症状**: 本地开发时无法获取用户信息

**解决方案**:
1. 使用 ngrok 创建 HTTPS 隧道
2. 配置测试用户环境变量
3. 代码已包含降级方案，会使用模拟用户

## 📱 Telegram WebApp 功能使用

### 已集成的功能

```typescript
// 获取 WebApp 实例
const { webApp } = useTelegram()

// 显示返回按钮
webApp.BackButton.show()
webApp.BackButton.onClick(() => {
  // 返回逻辑
})

// 显示主按钮
webApp.MainButton.setText('确认')
webApp.MainButton.show()
webApp.MainButton.onClick(() => {
  // 确认逻辑
})

// 触觉反馈
webApp.HapticFeedback.impactOccurred('medium')
webApp.HapticFeedback.notificationOccurred('success')

// 显示弹窗
webApp.showAlert('提示信息')
webApp.showConfirm('确认信息')
```

### 可以添加的功能

1. **主题颜色适配**
```typescript
const themeParams = webApp.themeParams
// 使用 Telegram 主题颜色
```

2. **云存储**
```typescript
webApp.CloudStorage.setItem('key', 'value')
webApp.CloudStorage.getItem('key')
```

3. **扫码功能**
```typescript
webApp.showScanQrPopup({
  text: '扫描二维码'
})
```

## ✅ 发布检查清单

在发布前，请确认以下所有项目：

- [ ] 环境变量已正确配置
- [ ] Telegram Bot 已创建并配置
- [ ] Web App URL 已在 @BotFather 中设置
- [ ] 后端 API 可访问且 CORS 配置正确
- [ ] HTTPS 证书已配置
- [ ] 在 Telegram 中测试用户信息获取
- [ ] 测试充值流程
- [ ] 测试游戏功能
- [ ] 测试提现流程
- [ ] 测试错误处理
- [ ] 测试不同设备和屏幕尺寸
- [ ] 检查性能和加载速度
- [ ] 确认所有图片和资源正确加载

## 🚀 部署建议

### 推荐的部署平台

1. **Vercel** (推荐)
   - 自动 HTTPS
   - 全球 CDN
   - 简单部署流程

2. **Netlify**
   - 类似 Vercel
   - 良好的性能

3. **自建服务器**
   - 需要配置 Nginx/Apache
   - 需要配置 SSL 证书
   - 需要配置反向代理

### 部署命令

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 或使用 PM2
pm2 start npm --name "dice-treasure" -- start
```

## 📞 技术支持

如果遇到问题：
1. 查看浏览器控制台错误
2. 查看后端日志
3. 检查 Telegram Bot 日志
4. 参考 Telegram WebApp 官方文档：
   https://core.telegram.org/bots/webapps

## 总结

✅ **Telegram 小程序集成已完成**，包括：
- 用户信息获取
- 后端初始化
- 错误处理
- 开发环境支持

⚠️ **发布前需要**：
- 配置环境变量
- 设置 Telegram Bot
- 配置 HTTPS
- 测试完整流程

代码已经准备好可以发布使用，只需要完成上述配置即可！
