#!/bin/bash

# 测试本地 API 路由

echo "🧪 测试本地 API 路由..."
echo ""

# 等待服务器启动
sleep 2

# 测试1: 通过代理访问 /dice/display
echo "1️⃣ 测试 GET /api/backend/dice/display"
curl -X GET http://localhost:3000/api/backend/dice/display \
  -H "Content-Type: application/json" \
  -H "initData: mock_init_data_for_testing" \
  -w "\n状态码: %{http_code}\n" \
  -s

echo ""
echo "---"
echo ""

# 测试2: 测试用户初始化
echo "2️⃣ 测试 POST /api/backend/user/init/"
curl -X POST http://localhost:3000/api/backend/user/init/ \
  -H "Content-Type: application/json" \
  -H "initData: mock_init_data_for_testing" \
  -d '{"id":"123456789","first_name":"Test","last_name":"User","username":"testuser","language_code":"en"}' \
  -w "\n状态码: %{http_code}\n" \
  -s

echo ""
echo "✅ 测试完成"
