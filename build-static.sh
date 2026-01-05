#!/bin/bash

echo "🚀 构建静态版本（使用 /api/backend 路径）"

# 设置环境变量启用静态导出
export STATIC_EXPORT=true

# 构建项目
npm run build

# 创建静态包
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PACKAGE_NAME="static-${TIMESTAMP}.tar.gz"

echo "📦 创建静态包: ${PACKAGE_NAME}"
tar -czf "${PACKAGE_NAME}" out/

echo "✅ 静态包创建完成: ${PACKAGE_NAME}"
echo ""
echo "📋 部署说明:"
echo "1. 解压: tar -xzf ${PACKAGE_NAME}"
echo "2. 复制到web目录: cp -r out/* /var/www/html/"
echo "3. 配置Nginx代理 /api/backend 到后端服务器"
echo ""
echo "详细配置请查看 DEPLOYMENT.md"