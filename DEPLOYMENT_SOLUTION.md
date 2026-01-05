# 部署问题解决方案

## 问题描述

部署到服务器后，前端请求仍然使用硬编码的 IP 地址 `http://46.250.168.177:8079`，而不是使用服务器自己的域名。

## 根本原因

在构建静态包时，如果 `NEXT_PUBLIC_API_BASE_URL` 设置为完整的 URL（如 `http://46.250.168.177:8079/api/backend`），这个值会在构建时被固化到 JavaScript 代码中，导致部署后无法使用服务器自己的域名。

## 解决方案

### ✅ 正确的做法

1. **前端使用相对路径**：`NEXT_PUBLIC_API_BASE_URL=/api/backend`
2. **服务器配置 Nginx 反向代理**：将 `/api/backend` 请求代理到后端服务器

### 工作流程

```
用户浏览器
    ↓
请求: https://your-domain.com/api/backend/dice/display
    ↓
Nginx 服务器（你的服务器）
    ↓
反向代理: http://46.250.168.177:8079/api/backend/dice/display
    ↓
后端 API 服务器
    ↓
返回响应
    ↓
Nginx 服务器
    ↓
返回给用户浏览器
```

## 部署步骤

### 1. 构建静态包

```bash
./build-static.sh
```

这会生成：
- `out/` 目录：包含所有静态文件
- `static-YYYYMMDD-HHMMSS.tar.gz`：压缩包
- `nginx-config-example.conf`：Nginx 配置示例

### 2. 上传到服务器

```bash
# 上传压缩包
scp static-*.tar.gz user@your-server:/tmp/

# 在服务器上解压
ssh user@your-server
cd /var/www/dice-game
tar -xzf /tmp/static-*.tar.gz
```

### 3. 配置 Nginx（关键步骤！）

编辑 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/dice-game
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 修改为你的域名
    root /var/www/dice-game;      # 修改为你的路径
    index index.html;

    # 前端静态文件
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }

    # ⚠️ 关键：API 反向代理
    location /api/backend/ {
        proxy_pass http://46.250.168.177:8079/api/backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header initData $http_initdata;
    }

    # 静态资源缓存
    location /_next/static {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

启用配置并重启 Nginx：

```bash
sudo ln -s /etc/nginx/sites-available/dice-game /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. 验证部署

```bash
# 测试静态文件
curl http://your-domain.com/

# 测试 API 代理
curl http://your-domain.com/api/backend/dice/display
```

## 为什么这样做？

### ❌ 错误的做法

```javascript
// 构建时设置
NEXT_PUBLIC_API_BASE_URL=http://46.250.168.177:8079/api/backend

// 结果：IP 地址被固化到代码中
const API_BASE_URL = "http://46.250.168.177:8079/api/backend"
```

**问题**：
- 用户访问 `https://your-domain.com`
- 但前端请求 `http://46.250.168.177:8079/api/backend`
- 跨域问题、安全问题、无法使用自己的域名

### ✅ 正确的做法

```javascript
// 构建时设置
NEXT_PUBLIC_API_BASE_URL=/api/backend

// 结果：使用相对路径
const API_BASE_URL = "/api/backend"
```

**优点**：
- 用户访问 `https://your-domain.com`
- 前端请求 `https://your-domain.com/api/backend`（相对路径）
- Nginx 代理到 `http://46.250.168.177:8079/api/backend`
- 用户不知道后端真实地址
- 不需要后端配置 CORS
- 可以随时更换后端地址（只需修改 Nginx 配置）

## 关键点总结

1. ✅ **前端代码**：使用相对路径 `/api/backend`
2. ✅ **构建配置**：`NEXT_PUBLIC_API_BASE_URL=/api/backend`
3. ✅ **Nginx 配置**：反向代理 `/api/backend` 到后端服务器
4. ✅ **后端地址**：只在 Nginx 配置中出现，前端代码中不出现

## 常见问题

### Q: 为什么不直接让前端调用后端 API？

A: 会有以下问题：
- 跨域（CORS）问题
- 暴露后端真实地址
- 无法使用 HTTPS（如果后端不支持）
- 无法灵活更换后端地址

### Q: 如果后端地址改变了怎么办？

A: 只需修改 Nginx 配置中的 `proxy_pass`，不需要重新构建前端。

### Q: 可以不用 Nginx 吗？

A: 可以，但需要：
- 后端支持 CORS
- 前端构建时设置完整的后端 URL
- 每次后端地址改变都要重新构建前端

## 文件清单

- `build-static.sh` - 静态构建脚本
- `nginx.conf.example` - Nginx 配置示例
- `QUICK_DEPLOY.md` - 快速部署指南
- `DEPLOYMENT_GUIDE.md` - 详细部署指南

## 验证清单

部署完成后，请确认：

- [ ] 访问 `http://your-domain.com` 可以看到前端页面
- [ ] 浏览器开发者工具中，API 请求的 URL 是 `http://your-domain.com/api/backend/...`
- [ ] API 请求返回正常数据（不是 404 或 502）
- [ ] 没有 CORS 错误
- [ ] 没有硬编码的 `46.250.168.177` 出现在请求中