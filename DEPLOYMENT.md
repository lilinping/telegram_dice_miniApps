# 静态文件部署说明

## 部署方式

这是一个 React 应用，支持两种部署方式：

### 方式一：静态部署 + Nginx代理（推荐）

#### 1. 解压静态文件
```bash
tar -xzf static-20260105-100753.tar.gz
```

#### 2. 配置 Nginx 代理

**重要的 Nginx 配置**：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # 静态文件
    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }

    # API代理 - 关键配置
    location /api/backend/ {
        # 移除 /api/backend 前缀，转发到后端
        rewrite ^/api/backend/(.*)$ /$1 break;
        
        # 代理到后端服务器
        proxy_pass http://46.250.168.177:8079;
        
        # 代理头设置
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 转发所有头信息（包括 initData）
        proxy_pass_request_headers on;
        
        # CORS 设置
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, initData, Authorization";
        
        # 处理 OPTIONS 请求
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, initData, Authorization";
            return 204;
        }
    }

    # 静态资源缓存
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 字体文件
    location ~* \.(woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
}
```

### 方式二：Next.js 服务器部署

如果你想使用完整的 Next.js 服务器（支持API路由）：

#### 1. 安装依赖并构建
```bash
npm install
npm run build
npm start
```

#### 2. 使用 PM2 管理进程
```bash
npm install -g pm2
pm2 start npm --name "dice-app" -- start
pm2 save
pm2 startup
```

#### 方式二：Apache
将 `out/` 目录内容复制到 Apache 的 web 根目录：
```bash
cp -r out/* /var/www/html/
```

创建 `.htaccess` 文件：
```apache
RewriteEngine On

# SPA 路由支持
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# 静态资源缓存
<FilesMatch "\.(js|css|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable"
</FilesMatch>

# 确保正确的 MIME 类型
AddType application/javascript .js
AddType text/css .css
AddType font/woff .woff
AddType font/woff2 .woff2
```

### 3. 常见问题解决

#### 问题1：静态资源404错误
**症状**：页面加载但样式和功能异常，控制台显示 `/_next/static/` 文件404

**解决方案**：
1. 确保 `out/_next/` 目录完整复制到服务器
2. 检查文件权限：`chmod -R 644 /var/www/html/_next/`
3. 检查目录权限：`chmod -R 755 /var/www/html/_next/`

#### 问题2：路由404错误
**症状**：直接访问 `/game` 等路径返回404

**解决方案**：配置服务器支持 SPA 路由（见上面配置）

#### 问题3：MIME类型错误
**症状**：JS文件被当作文本加载

**解决方案**：确保服务器正确配置 MIME 类型（见上面配置）

### 4. 验证部署

部署完成后，检查以下内容：

1. **首页加载**：访问 `http://your-domain.com/` 应该正常显示
2. **静态资源**：访问 `http://your-domain.com/_next/static/chunks/main-app-36ca09fc039e0fdb.js` 应该返回JS文件
3. **路由**：访问 `http://your-domain.com/game/` 应该显示游戏页面
4. **控制台**：浏览器控制台不应该有404错误

### 5. CDN 部署

#### Vercel
```bash
npx vercel --prod
```

#### Netlify
直接拖拽 `out/` 目录到 Netlify 部署页面

#### GitHub Pages
将 `out/` 目录内容推送到 `gh-pages` 分支

## 重要说明

1. **纯静态应用**：无需 Node.js 运行时，只需要静态文件服务器
2. **API 调用**：应用会直接调用后端 API，需要配置 CORS
3. **环境变量**：构建时已经注入，无需运行时配置
4. **路由支持**：必须配置服务器支持 SPA 路由（fallback 到 index.html）
5. **文件大小**：总共约 4MB，包含所有资源

## 文件结构
```
out/
├── index.html          # 首页
├── 404.html           # 404 页面
├── _next/             # Next.js 静态资源
│   ├── static/        # JS/CSS 文件
│   │   ├── chunks/    # JavaScript 模块
│   │   ├── css/       # 样式文件
│   │   └── media/     # 字体和媒体文件
│   └── ...
├── game/              # 各个页面的 HTML
├── wallet/
├── ...
└── sounds/            # 音效文件
```

## 性能优化

- 所有 JS/CSS 已经压缩和优化
- 图片已经优化
- 支持现代浏览器的 ES6+ 特性
- 静态资源有合适的缓存头设置

部署完成后，直接访问域名即可使用应用。