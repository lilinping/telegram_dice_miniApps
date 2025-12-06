# 修复提现订单ID显示为undefined的问题

## 问题描述
用户提现时，弹窗显示"订单ID: undefined"，说明从API返回的数据中没有正确提取订单ID。

## 根本原因分析

### 1. 数据结构不一致
后端API可能返回不同的字段名：
- `WithdrawalOrderResponse` 类型定义使用 `orderId: string`
- `WithdrawalOrder` 类型定义使用 `id: number`
- 实际后端返回的字段名可能是 `id`、`orderId` 或其他变体

### 2. 缺少空值检查
原代码直接访问 `result.data.orderId`，如果：
- `result.data` 为 `null` 或 `undefined`
- `result.data` 不包含 `orderId` 字段
就会导致显示 `undefined`

## 修复方案

### 1. 添加完善的空值检查
```typescript
// 检查data是否存在
if (!result.data) {
  console.warn('⚠️ API返回success=true但data为空');
  alert('提现申请已提交！\n请在钱包页面查看提现记录');
  router.push('/wallet');
  return;
}
```

### 2. 兼容多种字段名
```typescript
// 安全地获取订单ID - 兼容多种字段名
const orderIdValue = (result.data as any).orderId || 
                    (result.data as any).id || 
                    (result.data as any).orderid ||
                    '未知';
const orderId = String(orderIdValue);
```

### 3. 添加详细的调试日志
```typescript
console.log('💰 提现API完整返回:', JSON.stringify(result, null, 2));
console.log('💰 提现成功 - 订单ID:', orderId, 'txCode:', txCode);
```

### 4. 改进错误处理
```typescript
try {
  // ... 提现逻辑
} catch (err) {
  console.error('❌ 提现异常:', err);
  setError('提现失败，请稍后重试');
  setShowConfirm(false);
}
```

## 可能的后端返回格式

### 格式1：标准格式（符合类型定义）
```json
{
  "code": 200,
  "success": true,
  "message": null,
  "data": {
    "orderId": "123456",
    "txCode": -1,
    "txid": null
  }
}
```

### 格式2：使用id字段
```json
{
  "code": 200,
  "success": true,
  "message": null,
  "data": {
    "id": 123456,
    "txCode": -1
  }
}
```

### 格式3：data为空
```json
{
  "code": 200,
  "success": true,
  "message": "提现申请已提交",
  "data": null
}
```

## 测试步骤

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **打开浏览器控制台**
   - 按 F12 打开开发者工具
   - 切换到 Console 标签

3. **进行提现操作**
   - 进入钱包页面
   - 点击"提现"按钮
   - 输入提现金额和地址
   - 点击"确认提现"

4. **检查控制台日志**
   应该看到：
   ```
   💰 提现API完整返回: { ... }
   💰 提现成功 - 订单ID: xxx txCode: -1
   ```

5. **验证弹窗显示**
   - ✅ 如果有订单ID：显示 "订单ID: 123456"
   - ✅ 如果没有订单ID：显示 "订单ID: 未知"
   - ✅ 如果data为空：显示 "请在钱包页面查看提现记录"

## 预期结果

### 场景1：正常返回订单ID
```
提现申请已提交！
订单ID: 123456
状态: 待确认
```

### 场景2：返回id字段
```
提现申请已提交！
订单ID: 123456
状态: 待确认
```

### 场景3：data为空
```
提现申请已提交！
请在钱包页面查看提现记录
```

### 场景4：完全没有ID信息
```
提现申请已提交！
订单ID: 未知
状态: 待确认
```

## 后续优化建议

1. **统一后端返回格式**
   - 与后端团队确认标准的返回格式
   - 更新类型定义以匹配实际返回

2. **改进用户体验**
   - 如果没有订单ID，不显示"订单ID: 未知"
   - 直接跳转到提现记录页面
   - 在提现记录中高亮显示最新的订单

3. **添加错误追踪**
   - 使用错误监控服务（如 Sentry）
   - 记录API返回格式不符合预期的情况

## 修改文件
- `src/app/withdraw/page.tsx` - 改进订单ID提取和错误处理逻辑
