# 跨域问题修复说明

## 问题描述
前端应用（如运行在 `localhost:3000`）请求后端API（`http://46.250.168.177:8079`）时，浏览器会因为跨域安全策略（CORS）阻止请求。

## 解决方案

### 1. Next.js API代理配置
通过Next.js的`rewrites`功能将API请求代理到后端服务器，绕过浏览器的跨域限制。

**配置位置**: `next.config.js`
```javascript
async rewrites() {
  return [
    {
      source: '/api/backend/:path*',
      destination: 'http://46.250.168.177:8079/:path*',
    },
  ]
}
```

### 2. API服务层更新
修改API基础URL，在客户端使用代理路径。

**配置位置**: `src/lib/api.ts`
```typescript
const API_BASE_URL = typeof window !== 'undefined' 
  ? '/api/backend'  // 客户端使用代理
  : 'http://46.250.168.177:8079'  // 服务端直接访问
```

### 3. Fetch配置优化
添加`mode: 'cors'`确保正确处理跨域请求。

## 使用说明

### 开发环境
1. 确保已安装依赖：`npm install`
2. **重启开发服务器**（重要！rewrites配置需要重启才能生效）：
   ```bash
   npm run dev
   ```
3. 所有API请求会自动通过 `/api/backend` 代理到后端服务器

### 生产环境
根据部署方式选择：

#### 方案A：使用代理（推荐）
- 保持当前配置不变
- Next.js会在运行时处理代理

#### 方案B：后端开启CORS
如果后端支持CORS，可以配置环境变量直接访问：
```bash
# .env.production
NEXT_PUBLIC_API_BASE_URL=http://46.250.168.177:8079
```

然后修改 `src/lib/api.ts`：
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/backend'
```

## 验证步骤
1. 重启开发服务器
2. 打开浏览器控制台（F12）
3. 访问应用并触发API请求
4. 检查Network标签：
   - 请求URL应该是 `/api/backend/...`
   - 状态码应该是 200
   - 没有CORS错误

## 常见问题

### Q: 修改配置后仍然报跨域错误
**A**: 确保已经**重启开发服务器**，rewrites配置需要重启才能生效。

### Q: 生产环境如何配置
**A**: 
- 如果使用Vercel/Netlify等平台，代理会自动工作
- 如果自己部署，确保Next.js服务器正常运行
- 如果使用静态导出（`next export`），需要后端开启CORS

### Q: 如何切换到直接访问后端
**A**: 修改 `src/lib/api.ts` 中的 `API_BASE_URL`：
```typescript
const API_BASE_URL = 'http://46.250.168.177:8079'
```
但需要后端添加CORS支持：
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
```

## 技术原理
- **同源策略**: 浏览器限制从一个源加载的文档/脚本与另一个源的资源交互
- **代理方案**: Next.js服务器与后端API同源（服务器间通信），绕过浏览器限制
- **请求路径**: 
  - 客户端 → Next.js服务器（`/api/backend/xxx`）
  - Next.js服务器 → 后端API（`http://46.250.168.177:8079/xxx`）
  - 后端API → Next.js服务器 → 客户端

## 相关文件
- `next.config.js` - Next.js配置文件
- `src/lib/api.ts` - API服务层
- `.env.local.example` - 环境变量示例
