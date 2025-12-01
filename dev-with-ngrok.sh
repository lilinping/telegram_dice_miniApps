#!/bin/bash

# 开发环境 + ngrok 快速启动脚本

echo "🚀 启动开发环境 + ngrok"
echo ""

# 检查 ngrok 是否安装
if ! command -v ngrok &> /dev/null
then
    echo "❌ ngrok 未安装"
    echo ""
    echo "请安装 ngrok:"
    echo "  macOS: brew install ngrok"
    echo "  或访问: https://ngrok.com/download"
    exit 1
fi

echo "✅ ngrok 已安装"
echo ""

# 检查是否已经有开发服务器在运行
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 3000 已被占用"
    echo "请先停止现有的开发服务器"
    exit 1
fi

echo "📦 启动 Next.js 开发服务器..."
npm run dev &
DEV_PID=$!

# 等待开发服务器启动
echo "⏳ 等待服务器启动..."
sleep 5

# 检查开发服务器是否成功启动
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ 开发服务器启动失败"
    exit 1
fi

echo "✅ 开发服务器已启动"
echo ""

echo "🌐 启动 ngrok..."
ngrok http 3000 &
NGROK_PID=$!

echo ""
echo "✅ 完成！"
echo ""
echo "📱 下一步："
echo "1. 访问 http://localhost:4040 查看 ngrok 控制台"
echo "2. 复制 ngrok 提供的公网 URL（例如: https://abc123.ngrok.io）"
echo "3. 在 Telegram BotFather 中设置 Web App URL"
echo "4. 在 Telegram 中打开你的 Bot 进行测试"
echo ""
echo "⚠️  按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
trap "echo ''; echo '🛑 停止服务...'; kill $DEV_PID $NGROK_PID 2>/dev/null; exit" INT TERM

wait
