#!/bin/bash

echo "🚀 构建服务器版本（包含 API 路由）"

# 不设置 STATIC_EXPORT，保持API路由
unset STATIC_EXPORT

# 构建项目
npm run build

echo "✅ 服务器版本构建完成"
echo ""
echo "📋 部署说明:"
echo "1. 上传整个项目到服务器"
echo "2. 运行: npm install"
echo "3. 运行: npm start"
echo "4. 或使用 PM2: pm2 start npm --name dice-app -- start"