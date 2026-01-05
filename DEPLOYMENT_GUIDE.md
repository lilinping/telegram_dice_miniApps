# 部署指南

本项目支持两种部署方式，请根据你的服务器环境选择合适的方式。

## 📦 方式一：静态部署（推荐用于 Nginx/Apache）

适用于：纯静态文件服务器（Nginx、Apache、CDN 等）

### 特点
- ✅ 部署简单，只需上传静态文件
- ✅ 不需要 Node.js 运行环境
- ✅ 性能最优，直接返回静态文件
- ⚠️ 前端直接调用后端 API，需要后端支持 CORS
- ⚠️ 不支持服务端渲染和 API 路由

### 构建步骤

1. **运行构建脚本**
   ```bash
   ./build-static.sh
   ```

2. **上传文件**
   - 构建完成后，`out` 目录包含所有静态文件
   - 将 `out` 目录中的所有文件上传到服务器
   - 或使用生成的压缩包：`static-YYYYMMDD-HHMMSS.tar.gz`

3. **配置 Web 服务器**

   **Nginx 配置示例：**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/dice-game;
       index index.html;

       # 处理 Next.js 路由
       location / {
           try_files $uri $uri.html $uri/ /index.html;
       }

       # 静态资源缓存
       location /_next/static {
           add_header Cache-Control "public, max-age=31536000, immutable";
       }

       # 禁用缓存 HTML 文件
       location ~* \.html$ {
           add_header Cache-Control "no-cache, no-store, must-revalidate";
       }
   }
   ```

   **Apache 配置示例（.htaccess）：**
   ```apache
   <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       
       # 如果请求的文件或目录存在，直接返回
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       
       # 否则重定向到 index.html
       RewriteRule . /index.html [L]
   </IfModule>

   # 静态资源缓存
   <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
       Header set Cache-Control "public, max-age=31536000, immutable"
   </FilesMatch>

   # 禁用缓存 HTML 文件
   <FilesMatch "\.html$">
       Header set Cache-Control "no-cache, no-store, must-revalidate"
   </FilesMatch>
   ```

4. **确保后端支持 CORS**
   
   后端需要允许来自前端域名的跨域请求：
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization, initData
   ```

### API 配置
- **前端请求**: `http://46.250.168.177:8079/api/backend/dice/display`
- **直接调用**: 前端直接调用后端 API，不经过代理

---

## 🚀 方式二：服务端渲染部署（推荐用于 Vercel/Node.js）

适用于：支持 Node.js 的服务器（Vercel、自建 Node.js 服务器等）

### 特点
- ✅ 支持服务端渲染（SSR）
- ✅ 支持 API 路由代理
- ✅ 不需要后端配置 CORS
- ✅ 更好的 SEO
- ⚠️ 需要 Node.js 运行环境
- ⚠️ 部署相对复杂

### 构建步骤

1. **运行构建脚本**
   ```bash
   ./deploy-with-api.sh
   ```
   
   或手动构建：
   ```bash
   npm run build
   ```

2. **部署到 Vercel**
   ```bash
   vercel --prod
   ```
   
   或使用 Vercel Dashboard 导入项目

3. **配置环境变量**
   
   在 Vercel Dashboard 或 `.env.production` 中设置：
   ```
   BACKEND_API_URL=http://46.250.168.177:8079
   NEXT_PUBLIC_API_BASE_URL=/api/backend
   ```

4. **自建 Node.js 服务器部署**
   ```bash
   # 构建项目
   npm run build
   
   # 启动服务
   npm start
   
   # 或使用 PM2
   pm2 start npm --name "dice-game" -- start
   ```

### API 配置
- **前端请求**: `/api/backend/dice/display`
- **代理转发**: Next.js API 路由代理到 `http://46.250.168.177:8079/api/backend/dice/display`
- **优点**: 前端不需要知道后端真实地址，后端不需要配置 CORS

---

## 🔍 如何选择部署方式

| 场景 | 推荐方式 | 原因 |
|------|---------|------|
| 使用 Nginx/Apache | 静态部署 | 简单、高性能 |
| 使用 Vercel | 服务端渲染 | 原生支持，零配置 |
| 自建 Node.js 服务器 | 服务端渲染 | 功能完整 |
| 使用 CDN | 静态部署 | 全球加速 |
| 后端不支持 CORS | 服务端渲染 | 通过代理解决 CORS |
| 需要 SEO 优化 | 服务端渲染 | 支持 SSR |

---

## 📋 部署检查清单

### 静态部署检查
- [ ] 运行 `./build-static.sh` 构建成功
- [ ] `out` 目录包含所有文件
- [ ] Web 服务器配置正确（支持 SPA 路由）
- [ ] 后端 API 支持 CORS
- [ ] 测试前端能否正常调用后端 API

### 服务端渲染部署检查
- [ ] 运行 `npm run build` 构建成功
- [ ] 环境变量配置正确
- [ ] API 代理路由存在：`src/app/api/backend/[...path]/route.ts`
- [ ] 测试 API 代理是否工作：`curl http://your-domain.com/api/backend/dice/display`
- [ ] Node.js 服务正常运行

---

## 🐛 常见问题

### 问题 1: 静态部署后 API 请求失败

**原因**: 后端不支持 CORS

**解决方案**:
1. 让后端添加 CORS 支持
2. 或改用服务端渲染部署

### 问题 2: 刷新页面出现 404

**原因**: Web 服务器没有正确配置 SPA 路由

**解决方案**: 参考上面的 Nginx/Apache 配置示例

### 问题 3: 服务端渲染部署后 API 代理不工作

**原因**: `next.config.js` 中设置了 `output: 'export'`

**解决方案**: 
1. 确保 `STATIC_EXPORT` 环境变量未设置或为 `false`
2. 检查 `src/app/api/backend/[...path]/route.ts` 文件存在

### 问题 4: 环境变量不生效

**原因**: 环境变量在构建时被固化

**解决方案**: 
1. 修改环境变量后重新构建
2. 使用 `NEXT_PUBLIC_` 前缀的环境变量才能在客户端使用

---

## 📞 技术支持

如有问题，请检查：
1. 构建日志是否有错误
2. 浏览器控制台是否有错误
3. 网络请求是否正常（开发者工具 Network 标签）
4. 后端 API 是否正常运行