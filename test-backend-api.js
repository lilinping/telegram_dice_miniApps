// 测试后端 API 连接
const BACKEND_URL = 'http://46.250.168.177:8079';

async function testAPI() {
  console.log('🔍 测试后端 API 连接...\n');
  
  // 测试1: 获取骰宝选项
  console.log('1️⃣ 测试 GET /dice/display');
  try {
    const response = await fetch(`${BACKEND_URL}/dice/display`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    console.log(`   状态码: ${response.status}`);
    console.log(`   状态文本: ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ 成功! 返回数据:`, JSON.stringify(data).substring(0, 100) + '...');
    } else {
      const text = await response.text();
      console.log(`   ❌ 失败! 响应:`, text);
    }
  } catch (error) {
    console.log(`   ❌ 错误:`, error.message);
  }
  
  console.log('\n');
  
  // 测试2: 初始化用户
  console.log('2️⃣ 测试 POST /user/init/');
  try {
    const testUser = {
      id: '123456789',
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      language_code: 'en'
    };
    
    const response = await fetch(`${BACKEND_URL}/user/init/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    console.log(`   状态码: ${response.status}`);
    console.log(`   状态文本: ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ 成功! 返回数据:`, data);
    } else {
      const text = await response.text();
      console.log(`   ❌ 失败! 响应:`, text);
    }
  } catch (error) {
    console.log(`   ❌ 错误:`, error.message);
  }
  
  console.log('\n');
  
  // 测试3: 查询账户（可能需要认证）
  console.log('3️⃣ 测试 GET /account/query/123456789');
  try {
    const response = await fetch(`${BACKEND_URL}/account/query/123456789`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    console.log(`   状态码: ${response.status}`);
    console.log(`   状态文本: ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ 成功! 返回数据:`, data);
    } else {
      const text = await response.text();
      console.log(`   ❌ 失败! 响应:`, text);
      
      if (response.status === 401) {
        console.log(`   💡 提示: 401 错误可能表示需要认证或用户不存在`);
      }
    }
  } catch (error) {
    console.log(`   ❌ 错误:`, error.message);
  }
  
  console.log('\n📊 测试完成!');
}

testAPI();
