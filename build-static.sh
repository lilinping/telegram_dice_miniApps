#!/bin/bash

# 静态部署构建脚本
# 用于生成纯静态文件，通过 Nginx 反向代理访问后端

echo "🚀 开始构建静态资源包..."

# 设置环境变量 - 使用相对路径
export STATIC_EXPORT=true
export NEXT_PUBLIC_API_BASE_URL="/api/backend"

echo "📋 构建配置:"
echo "   - 静态导出: 启用"
echo "   - API 地址: $NEXT_PUBLIC_API_BASE_URL (相对路径)"

# 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf .next
rm -rf out

# 临时重命名 API 路由目录（静态导出不支持 API 路由）
echo "📝 临时禁用 API 路由..."
if [ -d "src/app/api" ]; then
    mv src/app/api ./api.backup.tmp
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

BUILD_STATUS=$?

# 恢复 API 路由目录
echo "📝 恢复 API 路由..."
if [ -d "./api.backup.tmp" ]; then
    mv ./api.backup.tmp src/app/api
fi

if [ $BUILD_STATUS -eq 0 ]; then
    echo "✅ 构建成功！"
    echo "📁 静态文件位置: ./out"
    echo ""
    echo "📋 部署说明:"
    echo "   1. 将 out 目录中的所有文件上传到服务器"
    echo "   2. 配置 Nginx 反向代理（见下方配置）"
    echo ""
    echo "🔧 Nginx 配置示例:"
    echo "-----------------------------------"
    echo "server {"
    echo "    listen 80;"
    echo "    server_name your-domain.com;"
    echo "    root /var/www/dice-game;"
    echo "    index index.html;"
    echo ""
    echo "    # 前端静态文件"
    echo "    location / {"
    echo "        try_files \$uri \$uri.html \$uri/ /index.html;"
    echo "    }"
    echo ""
    echo "    # API 反向代理到后端"
    echo "    location /api/backend/ {"
    echo "        proxy_pass http://46.250.168.177:8079/api/backend/;"
    echo "        proxy_set_header Host \$host;"
    echo "        proxy_set_header X-Real-IP \$remote_addr;"
    echo "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
    echo "        proxy_set_header X-Forwarded-Proto \$scheme;"
    echo "    }"
    echo ""
    echo "    # 静态资源缓存"
    echo "    location /_next/static {"
    echo "        add_header Cache-Control \"public, max-age=31536000, immutable\";"
    echo "    }"
    echo "}"
    echo "-----------------------------------"
    echo ""
    echo "⚠️  重要: 必须配置 Nginx 反向代理，否则 API 请求会失败！"
    
    # 创建压缩包
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    ARCHIVE_NAME="static-${TIMESTAMP}.tar.gz"
    echo ""
    echo "📦 创建压缩包: $ARCHIVE_NAME"
    tar -czf "$ARCHIVE_NAME" -C out .
    echo "✅ 压缩包已创建"
    
    # 创建 Nginx 配置文件
    cat > nginx-config-example.conf << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/dice-game;
    index index.html;

    # 前端静态文件
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }

    # API 反向代理到后端
    location /api/backend/ {
        proxy_pass http://46.250.168.177:8079/api/backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
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
EOF
    echo ""
    echo "📝 Nginx 配置文件已生成: nginx-config-example.conf"
else
    echo "❌ 构建失败！"
    exit 1
fi