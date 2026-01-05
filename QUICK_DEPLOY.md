# 快速部署指南

## 🚀 静态部署（推荐）

### 第一步：构建静态包

```bash
./build-static.sh
```

构建完成后会生成：
- `out/` 目录：包含所有静态文件
- `static-YYYYMMDD-HHMMSS.tar.gz`：压缩包
- `nginx-config-example.conf`：Nginx 配置示例

### 第二步：上传文件到服务器

```bash
# 方式1：使用 scp 上传压缩包
scp static-*.tar.gz user@your-server:/tmp/

# 方式2：使用 rsync 同步目录
rsync -avz out/ user@your-server:/var/www/dice-game/
```

### 第三步：在服务器上解压（如果使用压缩包）

```bash
ssh user@your-server
cd /var/www/dice-game
tar -xzf /tmp/static-*.tar.gz
```

### 第四步：配置 Nginx

**重要：这是关键步骤！**

```bash
# 编辑 Nginx 配置
sudo nano /etc/nginx/sites-available/dice-game

# 复制以下配置（修改域名和路径）：
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/dice-game;
    index index.html;

    # 前端静态文件
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }

    # ⚠️ 关键配置：API 反向代理
    location /api/backend/ {
        proxy_pass http://46.250.168.177:8079/api/backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header initData $http_initdata;
    }

    # 静态资源缓存
    location /_next/static {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/dice-game /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 第五步：验证部署

```bash
# 测试静态文件
curl http://your-domain.com/

# 测试 API 代理
curl http://your-domain.com/api/backend/dice/display
```

---

## 🔍 工作原理

```
用户浏览器
    ↓
    请求: http://your-domain.com/api/backend/dice/display
    ↓
Nginx 服务器
    ↓
    匹配到 location /api/backend/
    ↓
    代理转发: http://46.250.168.177:8079/api/backend/dice/display
    ↓
后端 API 服务器
    ↓
    返回响应
    ↓
Nginx 服务器
    ↓
    返回给用户浏览器
```

**关键点**：
- ✅ 前端代码使用相对路径 `/api/backend`
- ✅ Nginx 负责将请求代理到后端
- ✅ 用户浏览器不知道后端真实地址
- ✅ 不需要后端配置 CORS

---

## ❌ 常见错误

### 错误 1：忘记配置 Nginx 反向代理

**症状**：前端显示 404 错误，API 请求失败

**解决**：按照上面的步骤配置 Nginx 的 `location /api/backend/` 块

### 错误 2：Nginx 配置错误

**症状**：Nginx 无法启动或重启失败

**解决**：
```bash
# 检查配置语法
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 错误 3：后端地址配置错误

**症状**：API 请求返回 502 Bad Gateway

**解决**：检查 Nginx 配置中的 `proxy_pass` 地址是否正确

---

## 📝 配置检查清单

部署前请确认：

- [ ] 运行 `./build-static.sh` 构建成功
- [ ] 静态文件已上传到服务器
- [ ] Nginx 已安装并运行
- [ ] Nginx 配置文件已创建
- [ ] Nginx 配置中的域名已修改
- [ ] Nginx 配置中的静态文件路径已修改
- [ ] Nginx 配置中的后端 API 地址已确认
- [ ] 已启用 Nginx 配置（软链接）
- [ ] Nginx 配置测试通过（`nginx -t`）
- [ ] Nginx 已重启
- [ ] 测试静态文件访问正常
- [ ] 测试 API 代理访问正常

---

## 🆘 需要帮助？

如果部署遇到问题：

1. **检查 Nginx 错误日志**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. **检查 Nginx 访问日志**
   ```bash
   sudo tail -f /var/log/nginx/access.log
   ```

3. **测试后端 API 是否正常**
   ```bash
   curl http://46.250.168.177:8079/api/backend/dice/display
   ```

4. **检查防火墙设置**
   ```bash
   sudo ufw status
   ```