# 🎉 静态文件打包完成

## 📦 打包信息

- **打包时间**: 2026-01-08 22:19
- **压缩包**: `static-20260108-221903.tar.gz` (2.6M)
- **静态文件目录**: `out/`
- **API 配置**: 使用相对路径 `/api/backend`（无硬编码 IP）

## ✅ 验证结果

- ✅ 构建成功，无错误
- ✅ 所有页面已生成（20个页面）
- ✅ 没有硬编码的 IP 地址
- ✅ API 使用相对路径
- ✅ 压缩包已创建
- ✅ Nginx 配置文件已生成

## 📋 部署步骤

### 1. 上传文件到服务器

```bash
# 方式1：上传压缩包
scp static-20260108-221903.tar.gz user@your-server:/tmp/

# 方式2：直接同步目录
rsync -avz out/ user@your-server:/var/www/dice-game/
```

### 2. 在服务器上解压（如果使用压缩包）

```bash
ssh user@your-server
cd /var/www/dice-game
tar -xzf /tmp/static-20260108-221903.tar.gz
```

### 3. 配置 Nginx（关键步骤！）

使用生成的配置文件 `nginx-config-example.conf`：

```bash
# 复制配置文件到服务器
scp nginx-config-example.conf user@your-server:/tmp/

# 在服务器上配置
ssh user@your-server
sudo nano /etc/nginx/sites-available/dice-game
# 复制 nginx-config-example.conf 的内容
# 修改 server_name 和 root 路径

# 启用配置
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

## 🔧 Nginx 配置要点

**必须配置的关键部分**：

```nginx
# API 反向代理（必须！）
location /api/backend/ {
    proxy_pass http://46.250.168.177:8079/api/backend/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header initData $http_initdata;
}
```

## 📊 构建统计

| 路由 | 大小 | First Load JS |
|------|------|---------------|
| / | 3.62 kB | 300 kB |
| /game | 8.86 kB | 454 kB |
| /global-game | 6.65 kB | 452 kB |
| /wallet | 6.39 kB | 308 kB |
| 共享 JS | - | 294 kB |

## ⚠️ 重要提醒

1. **必须配置 Nginx 反向代理**，否则 API 请求会失败
2. **修改配置文件中的域名**：将 `your-domain.com` 改为你的实际域名
3. **修改静态文件路径**：将 `/var/www/dice-game` 改为你的实际路径
4. **确保后端 API 可访问**：`http://46.250.168.177:8079` 必须能正常访问

## 🎯 工作原理

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
```

**优点**：
- ✅ 前端不知道后端真实地址
- ✅ 不需要后端配置 CORS
- ✅ 可以随时更换后端地址（只需修改 Nginx）
- ✅ 使用自己的域名

## 📚 相关文档

- `QUICK_DEPLOY.md` - 快速部署指南
- `DEPLOYMENT_GUIDE.md` - 详细部署指南
- `DEPLOYMENT_SOLUTION.md` - 部署问题解决方案
- `nginx-config-example.conf` - Nginx 配置示例

## 🆘 遇到问题？

1. **API 请求 404**：检查 Nginx 配置中的 `location /api/backend/` 块
2. **页面刷新 404**：检查 Nginx 配置中的 `try_files` 指令
3. **静态资源加载失败**：检查文件路径和权限

查看详细的故障排除指南：`DEPLOYMENT_GUIDE.md`