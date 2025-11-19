/**
 * Telegram骰宝API测试脚本
 * 使用方法: node test-api.js
 */

const http = require('http');
const API_BASE_URL = 'http://46.250.168.177:8079';
const TEST_USER_ID = '6784471903';

// ANSI颜色代码
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// 日志函数
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function section(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${message}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

// API请求函数
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options
    });
    
    const duration = Date.now() - startTime;
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: data,
      duration: duration
    };
  } catch (err) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      error: err.message,
      duration: duration
    };
  }
}

// 测试1: 用户初始化
async function testUserInit(userId) {
  section('测试1: 用户初始化');
  
  const user = {
    id: parseInt(userId),
    first_name: '测试用户',
    last_name: '',
    username: 'test_user',
    language_code: 'zh',
    is_bot: false,
    can_join_groups: false,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
    is_premium: false,
    added_to_attachment_menu: false
  };
  
  info(`请求: POST /user/init/`);
  info(`用户ID: ${userId}`);
  
  const result = await apiRequest('/user/init/', {
    method: 'POST',
    body: JSON.stringify(user)
  });
  
  if (result.success) {
    success(`用户初始化成功 (${result.duration}ms)`);
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    error(`用户初始化失败 (${result.duration}ms)`);
    console.log(result.error || result.data);
  }
  
  return result;
}

// 测试2: 查询账户
async function testQueryAccount(userId) {
  section('测试2: 查询账户余额');
  
  info(`请求: GET /account/query/${userId}`);
  
  const result = await apiRequest(`/account/query/${userId}`);
  
  if (result.success) {
    success(`查询账户成功 (${result.duration}ms)`);
    console.log(JSON.stringify(result.data, null, 2));
    
    if (result.data.data) {
      info(`当前余额: ${result.data.data.balance || 0}`);
    }
  } else {
    error(`查询账户失败 (${result.duration}ms)`);
    console.log(result.error || result.data);
  }
  
  return result;
}

// 测试3: 充值
async function testRecharge(userId, amount) {
  section(`测试3: 账户充值 (${amount})`);
  
  info(`请求: GET /account/recharge/${userId}/${amount}`);
  
  const result = await apiRequest(`/account/recharge/${userId}/${amount}`);
  
  if (result.success) {
    success(`充值成功 (${result.duration}ms)`);
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    error(`充值失败 (${result.duration}ms)`);
    console.log(result.error || result.data);
  }
  
  return result;
}

// 测试4: 开始游戏
async function testStartGame(userId) {
  section('测试4: 开始游戏');
  
  info(`请求: GET /dice/start/${userId}`);
  
  const result = await apiRequest(`/dice/start/${userId}`);
  
  if (result.success) {
    success(`开始游戏成功 (${result.duration}ms)`);
    console.log(JSON.stringify(result.data, null, 2));
    
    if (result.data.data) {
      info(`游戏ID: ${result.data.data}`);
    }
  } else {
    error(`开始游戏失败 (${result.duration}ms)`);
    console.log(result.error || result.data);
  }
  
  return result;
}

// 测试5: 下注
async function testPlaceBet(gameId, chooseId, bet) {
  section(`测试5: 下注 (选项${chooseId}, 金额${bet})`);
  
  info(`请求: GET /dice/bet/${gameId}/${chooseId}/${bet}`);
  
  const result = await apiRequest(`/dice/bet/${gameId}/${chooseId}/${bet}`);
  
  if (result.success) {
    success(`下注成功 (${result.duration}ms)`);
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    error(`下注失败 (${result.duration}ms)`);
    console.log(result.error || result.data);
  }
  
  return result;
}

// 测试6: 查询游戏
async function testQueryGame(gameId) {
  section('测试6: 查询游戏状态');
  
  info(`请求: GET /dice/query/${gameId}`);
  
  const result = await apiRequest(`/dice/query/${gameId}`);
  
  if (result.success) {
    success(`查询游戏成功 (${result.duration}ms)`);
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    error(`查询游戏失败 (${result.duration}ms)`);
    console.log(result.error || result.data);
  }
  
  return result;
}

// 测试7: 结束游戏
async function testEndGame(gameId) {
  section('测试7: 结束游戏');
  
  info(`请求: GET /dice/end/${gameId}`);
  
  const result = await apiRequest(`/dice/end/${gameId}`);
  
  if (result.success) {
    success(`结束游戏成功 (${result.duration}ms)`);
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    error(`结束游戏失败 (${result.duration}ms)`);
    console.log(result.error || result.data);
  }
  
  return result;
}

// 测试8: 查询下注选项
async function testGetDiceDisplay() {
  section('测试8: 查询下注选项对照表');
  
  info(`请求: GET /dice/display`);
  
  const result = await apiRequest('/dice/display');
  
  if (result.success) {
    success(`查询成功 (${result.duration}ms)`);
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    error(`查询失败 (${result.duration}ms)`);
    console.log(result.error || result.data);
  }
  
  return result;
}

// 主测试流程
async function runFullTest() {
  log('\n🎲 Telegram骰宝API完整测试', 'bright');
  log(`📍 API地址: ${API_BASE_URL}`, 'cyan');
  log(`👤 测试用户ID: ${TEST_USER_ID}\n`, 'cyan');
  
  let gameId = null;
  
  try {
    // 1. 初始化用户
    await testUserInit(TEST_USER_ID);
    await sleep(1000);
    
    // 2. 查询初始余额
    let accountResult = await testQueryAccount(TEST_USER_ID);
    await sleep(1000);
    
    // 3. 充值
    await testRecharge(TEST_USER_ID, 1000);
    await sleep(1000);
    
    // 4. 再次查询余额
    accountResult = await testQueryAccount(TEST_USER_ID);
    await sleep(1000);
    
    // 5. 查询下注选项
    await testGetDiceDisplay();
    await sleep(1000);
    
    // 6. 开始游戏
    const startResult = await testStartGame(TEST_USER_ID);
    if (startResult.success && startResult.data.data) {
      gameId = startResult.data.data;
      await sleep(1000);
      
      // 7. 下注 (选项1=大, 金额10)
      await testPlaceBet(gameId, 1, 10);
      await sleep(1000);
      
      // 8. 查询游戏
      await testQueryGame(gameId);
      await sleep(1000);
      
      // 9. 结束游戏
      await testEndGame(gameId);
      await sleep(1000);
    } else {
      warn('未能获取游戏ID，跳过游戏流程测试');
    }
    
    // 10. 查询最终余额
    await testQueryAccount(TEST_USER_ID);
    
    section('测试完成');
    success('所有测试已完成！');
    
  } catch (err) {
    error(`测试过程中发生错误: ${err.message}`);
    console.error(err);
  }
}

// 辅助函数：延迟
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 运行测试
runFullTest().then(() => {
  log('\n✨ 测试脚本执行完毕\n', 'green');
}).catch(err => {
  error(`脚本执行失败: ${err.message}`);
  process.exit(1);
});
