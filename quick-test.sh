#!/bin/bash

# 快速测试脚本
# 使用方法: bash quick-test.sh

# 禁用系统代理以避免干扰
unset ALL_PROXY
unset all_proxy
unset HTTP_PROXY
unset http_proxy
unset HTTPS_PROXY
unset https_proxy

echo "🎮 Telegram骰宝小程序 - 快速测试"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

USER_ID="6784471903"
API_BASE="http://localhost:3000/api/backend"

echo -e "${BLUE}测试用户ID: ${USER_ID}${NC}"
echo -e "${BLUE}API地址: ${API_BASE}${NC}"
echo ""

# 测试1: 用户初始化
echo -e "${YELLOW}[1/5] 测试用户初始化...${NC}"
INIT_RESULT=$(curl -s -X POST "${API_BASE}/user/init/" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": ${USER_ID},
    \"first_name\": \"测试用户\",
    \"username\": \"test_user\",
    \"language_code\": \"zh\",
    \"is_bot\": false,
    \"can_join_groups\": false,
    \"can_read_all_group_messages\": false,
    \"supports_inline_queries\": false,
    \"is_premium\": false,
    \"added_to_attachment_menu\": false
  }")

if echo "$INIT_RESULT" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ 用户初始化成功${NC}"
else
  echo -e "${RED}✗ 用户初始化失败${NC}"
fi
echo ""

# 测试2: 查询余额
echo -e "${YELLOW}[2/5] 查询账户余额...${NC}"
BALANCE_RESULT=$(curl -s "${API_BASE}/account/query/${USER_ID}")
BALANCE=$(echo "$BALANCE_RESULT" | grep -o '"cash":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$BALANCE" ]; then
  echo -e "${GREEN}✓ 当前余额: ${BALANCE} USDT${NC}"
else
  echo -e "${RED}✗ 查询余额失败${NC}"
fi
echo ""

# 测试3: 充值
echo -e "${YELLOW}[3/5] 测试充值 100 USDT...${NC}"
RECHARGE_RESULT=$(curl -s "${API_BASE}/account/recharge/${USER_ID}/100")

if echo "$RECHARGE_RESULT" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ 充值成功${NC}"
  
  # 再次查询余额
  BALANCE_RESULT=$(curl -s "${API_BASE}/account/query/${USER_ID}")
  NEW_BALANCE=$(echo "$BALANCE_RESULT" | grep -o '"cash":"[^"]*"' | cut -d'"' -f4)
  echo -e "${GREEN}✓ 充值后余额: ${NEW_BALANCE} USDT${NC}"
else
  echo -e "${RED}✗ 充值失败${NC}"
fi
echo ""

# 测试4: 开始游戏
echo -e "${YELLOW}[4/5] 开始游戏...${NC}"
GAME_RESULT=$(curl -s "${API_BASE}/dice/start/${USER_ID}")
GAME_ID=$(echo "$GAME_RESULT" | grep -o '"data":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$GAME_ID" ]; then
  echo -e "${GREEN}✓ 游戏开始成功${NC}"
  echo -e "${GREEN}  游戏ID: ${GAME_ID}${NC}"
  
  # 测试5: 下注
  echo ""
  echo -e "${YELLOW}[5/5] 测试下注（大，金额10）...${NC}"
  BET_RESULT=$(curl -s "${API_BASE}/dice/bet/${GAME_ID}/15/10")
  
  if echo "$BET_RESULT" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ 下注成功${NC}"
    
    # 查询游戏状态
    QUERY_RESULT=$(curl -s "${API_BASE}/dice/query/${GAME_ID}")
    echo -e "${GREEN}✓ 游戏状态已更新${NC}"
  else
    echo -e "${RED}✗ 下注失败${NC}"
  fi
else
  echo -e "${RED}✗ 开始游戏失败${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✨ 测试完成！${NC}"
echo ""
echo -e "${BLUE}访问应用:${NC}"
echo "  游戏大厅: http://localhost:3000/game"
echo "  测试工具: http://localhost:3000/test-telegram-api.html"
echo ""
