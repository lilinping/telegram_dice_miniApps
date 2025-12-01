#!/bin/bash

# Vercel 部署脚本

echo "🚀 开始部署到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI 未安装"
    echo "📦 正在安装 Vercel CLI..."
    npm i -g vercel
fi

# 检查环境变量
echo "📋 检查环境变量..."

if [ -z "$BACKEND_API_URL" ]; then
    echo "⚠️  BACKEND_API_URL 未设置"
    echo "💡 请在 Vercel Dashboard 中设置环境变量"
fi

if [ -z "$NEXT_PUBLIC_TELEGRAM_BOT_TOKEN" ]; then
    echo "⚠️  NEXT_PUBLIC_TELEGRAM_BOT_TOKEN 未设置"
    echo "💡 请在 Vercel Dashboard 中设置环境变量"
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

# 部署到 Vercel
echo "🚀 部署到 Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo "📱 请在 Telegram 中测试 Mini App"
else
    echo "❌ 部署失败"
    exit 1
fi
