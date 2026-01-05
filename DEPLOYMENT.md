# 静态文件部署说明

## 📦 静态包信息
- **包名**: `static-20260105-150104.tar.gz`
- **大小**: 1.3MB
- **类型**: 纯静态文件（HTML + JS + CSS）
- **构建时间**: 2026-01-05 15:01:04
- **API 修复**: 已修复 `/api/backend` 路径问题

## 🔧 API 配置说明

### 正确的 API 路径结构
根据后端 Swagger 文档 (`http://46.250.168.177:8079/swagger-ui/index.html`)，所有 API 端点都包含 `/api/backend` 前缀。

**当前配置**：
- **基础 URL**: `http://46.250.168.177:8079`
- **API 端点**: `/api/backend/account/hasSetPassword/${userId}`
- **完整请求**: `http://46.250.168.177:8079/api/backend/account/hasSetPassword/6784471903`

这确保了前端请求与后端 API 路径完全匹配。

## 🚀 部署步骤

### 1. 解压静态文件
```bash
tar -xzf static-20260105-143508.tar.gz
```

### 2. 部署到 Web 服务器

#### 方式一：Nginx（推荐）
将 `out/` 目录内容复制到 nginx 的 web 根目录：
```bash
cp -r out/* /var/www/html/
```

**重要的 Nginx 配置**：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # 支持 SPA 路由
    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }

    # 静态资源缓存
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # 确保 JS 文件有正确的 MIME 类型
        location ~* \.js$ {
            add_header Content-Type application/javascript;
        }
        
        # 确保 CSS 文件有正确的 MIME 类型
        location ~* \.css$ {
            add_header Content-Type text/css;
        }
    }

    # 字体文件
    location ~* \.(woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
}
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

## 🔧 API 调用说明

### 直接调用后端
静态版本直接调用后端完整地址：
```
前端请求: http://46.250.168.177:8079/api/backend/account/hasSetPassword/6784471903
```

### CORS 配置
后端服务器需要配置 CORS 允许前端域名访问：
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, initData
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