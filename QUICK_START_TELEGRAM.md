# 🚀 Telegram 小程序快速启动指南

## 📋 前置要求

- Node.js 18+ 
- npm 或 yarn
- Telegram 账号
- 后端 API 服务器运行中

## 🔧 5分钟快速配置

### 步骤 1: 创建 Telegram Bot

1. 在 Telegram 中找到 [@BotFather](https://t.me/BotFather)
2. 发送 `/newbot` 创建新 bot
3. 按提示设置 bot 名称和用户名
4. 保存 Bot Token（类似：`123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`）

### 步骤 2: 配置环境变量

创建 `.env.local` 文件：

```bash
# 复制示例文件
cp .env.local.example .env.local

# 编辑配置
nano .env.local
```

最小配置：

```bash
# Telegram Bot
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=你的Bot_Token
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=你的Bot用户名

# 后端API（确保后端已启动）
NEXT_PUBLIC_API_URL=http://46.250.168.177:8079

# 开发测试用户（可选）
NEXT_PUBLIC_TEST_USER_ID=你的Telegram用户ID
NEXT_PUBLIC_TEST_USER_NAME=你的名字
NEXT_PUBLIC_TEST_USERNAME=你的用户名
```

### 步骤 3: 本地开发测试

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 步骤 4: 使用 ngrok 创建 HTTPS 隧道

Telegram WebApp 要求 HTTPS，使用 ngrok：

```bash
# 安装 ngrok（如果还没有）
# macOS: brew install ngrok
# 或访问 https://ngrok.com/download

# 创建隧道
ngrok http 3000
```

复制 ngrok 提供的 HTTPS URL（例如：`https://abc123.ngrok.io`）

### 步骤 5: 配置 Bot 的 Web App

回到 @BotFather：

```
/setmenubutton
选择你的 bot
选择 "Edit menu button URL"
输入 ngrok URL: https://abc123.ngrok.io
```

或者设置为命令：

```
/mybots
选择你的 bot
Bot Settings → Menu Button → Edit menu button URL
输入: https://abc123.ngrok.io
```

### 步骤 6: 测试

1. 在 Telegram 中找到你的 bot
2. 点击菜单按钮（或发送 `/start`）
3. Web App 应该会打开
4. 检查用户信息是否正确显示

## 🎯 验证集成是否成功

打开浏览器控制台（F12），应该看到：

```
✅ 用户初始化成功
```

如果看到用户信息，说明集成成功！

## 🐛 常见问题快速修复

### 问题：无法获取用户信息

```bash
# 检查是否在 Telegram 内打开
# 不要直接在浏览器访问 ngrok URL
# 必须通过 Telegram Bot 打开
```

### 问题：API 请求失败

```bash
# 检查后端是否运行
curl http://46.250.168.177:8079/user/init/

# 检查 CORS 配置
# 后端需要允许你的 ngrok 域名
```

### 问题：页面空白

```bash
# 检查控制台错误
# 确认 Telegram WebApp 脚本已加载
# 查看 Network 标签页
```

## 📱 获取你的 Telegram 用户 ID

方法 1: 使用 @userinfobot
1. 在 Telegram 中找到 @userinfobot
2. 发送任意消息
3. Bot 会返回你的用户 ID

方法 2: 使用 @getidsbot
1. 在 Telegram 中找到 @getidsbot
2. 发送 `/start`
3. Bot 会返回你的用户 ID

## 🚀 生产环境部署

### 使用 Vercel（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 设置环境变量
vercel env add NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
vercel env add NEXT_PUBLIC_API_URL

# 生产部署
vercel --prod
```

### 更新 Bot 配置

部署后，在 @BotFather 中更新 Web App URL 为你的生产域名：

```
https://你的域名.vercel.app
```

## ✅ 完成！

现在你的 Telegram 小程序已经可以使用了！

### 下一步

- 测试充值功能
- 测试游戏功能
- 测试提现功能
- 邀请朋友测试
- 收集反馈

## 📚 更多资源

- [Telegram WebApp 官方文档](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [项目完整文档](./README_DEV.md)
- [集成检查清单](./TELEGRAM_INTEGRATION_CHECKLIST.md)

## 💡 提示

- 开发时使用 ngrok，每次重启 ngrok URL 会变化，需要更新 Bot 配置
- 生产环境使用固定域名，只需配置一次
- 测试时可以使用环境变量配置的模拟用户
- 所有 Telegram WebApp 功能都已集成，可以直接使用

---

**需要帮助？** 查看 [TELEGRAM_INTEGRATION_CHECKLIST.md](./TELEGRAM_INTEGRATION_CHECKLIST.md) 获取详细的故障排除指南。
