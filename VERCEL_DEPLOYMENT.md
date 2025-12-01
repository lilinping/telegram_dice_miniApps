# Vercel 部署指南

## 环境变量配置

在 Vercel 项目设置中，需要配置以下环境变量：

### 必需的环境变量

1. **BACKEND_API_URL** (服务端使用)
   - 值: `http://46.250.168.177:8079`
   - 说明: 后端 API 的实际地址，用于服务端请求

2. **NEXT_PUBLIC_TELEGRAM_BOT_TOKEN** (客户端使用)
   - 值: 你的 Telegram Bot Token
   - 说明: Telegram Mini App 所需的 Bot Token

3. **NEXT_PUBLIC_USDT_TRC20_ADDRESS** (客户端使用)
   - 值: 你的 USDT TRC20 钱包地址
   - 说明: 用于显示充值地址

### 可选的环境变量

4. **NEXT_PUBLIC_USDT_ERC20_ADDRESS**
   - 值: 你的 USDT ERC20 钱包地址
   - 说明: 如果支持 ERC20 充值

5. **NEXT_PUBLIC_TON_ADDRESS**
   - 值: 你的 TON 钱包地址
   - 说明: 如果支持 TON 充值

## 部署步骤

### 1. 通过 Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署到生产环境
vercel --prod
```

### 2. 配置环境变量

```bash
# 设置后端 API 地址
vercel env add BACKEND_API_URL production

# 设置 Telegram Bot Token
vercel env add NEXT_PUBLIC_TELEGRAM_BOT_TOKEN production

# 设置 USDT 钱包地址
vercel env add NEXT_PUBLIC_USDT_TRC20_ADDRESS production
```

### 3. 通过 Vercel Dashboard 部署

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 导入 GitHub 仓库
3. 在 Settings > Environment Variables 中添加上述环境变量
4. 触发重新部署

## API 代理说明

本项目使用 Next.js API Routes 来代理后端请求，避免 CORS 问题：

- 客户端请求: `/api/backend/*` 
- 服务端转发: `http://46.250.168.177:8079/*`

代理实现位于: `src/app/api/backend/[...path]/route.ts`

## 故障排查

### 401 Unauthorized 错误

**重要**: 后端 API 需要 Telegram `initData` 请求头进行认证！

如果遇到 401 错误，检查：

1. **Telegram initData 认证**
   - 后端 API 要求所有请求必须包含 `initData` 请求头
   - 这个头包含 Telegram WebApp 的认证信息
   - 前端会自动从 `window.Telegram.WebApp.initData` 获取并添加到请求中
   - **必须在 Telegram 中打开应用**，不能直接在浏览器中访问

2. **环境变量是否正确配置**
   - 在 Vercel Dashboard 中检查 `BACKEND_API_URL` 是否设置
   - 确保值为 `http://46.250.168.177:8079`（不要有尾部斜杠）

3. **API 路由是否正常工作**
   - API 路由会自动转发 `initData` 请求头到后端
   - 检查 Vercel Functions 日志，查看是否有错误

4. **后端服务是否可访问**
   - 确保后端服务 `http://46.250.168.177:8079` 正常运行
   - 检查后端是否允许来自 Vercel 的请求

5. **测试方法**
   - ❌ 不要直接在浏览器中访问 `https://your-domain.vercel.app`
   - ✅ 必须通过 Telegram Bot 打开 Mini App
   - ✅ 使用 Telegram Desktop 或移动端测试

### CORS 错误

如果遇到 CORS 错误：

1. 确保所有 API 请求都通过 `/api/backend` 代理
2. 不要直接从客户端访问 `http://46.250.168.177:8079`
3. 检查 `src/lib/api.ts` 中的 `API_BASE_URL` 配置

### 部署后更新环境变量

如果修改了环境变量，需要重新部署：

```bash
# 方法1: 通过 CLI
vercel --prod

# 方法2: 通过 Dashboard
# 在 Deployments 页面点击 "Redeploy"
```

## 测试部署

部署完成后，测试以下功能：

1. **用户初始化**: 打开 Telegram Mini App，检查是否能正常加载
2. **游戏功能**: 尝试开始游戏、下注、查看结果
3. **钱包功能**: 查看余额、充值、提现
4. **历史记录**: 查看游戏历史和交易记录

## 监控和日志

在 Vercel Dashboard 中查看：

1. **Functions 日志**: 查看 API 路由的请求日志
2. **Analytics**: 查看访问统计
3. **Speed Insights**: 查看性能指标

## 注意事项

1. **Vercel 免费计划限制**:
   - 每月 100GB 带宽
   - 每次函数执行最多 10 秒
   - 每月 100 小时函数执行时间

2. **后端服务稳定性**:
   - 确保后端服务 24/7 运行
   - 建议使用负载均衡和备份服务器

3. **安全性**:
   - 不要在客户端代码中暴露敏感信息
   - 使用环境变量存储密钥和配置
   - 定期更新依赖包

## 相关文档

- [Vercel 文档](https://vercel.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [环境变量配置](https://vercel.com/docs/concepts/projects/environment-variables)
