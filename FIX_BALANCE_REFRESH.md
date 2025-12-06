# 修复提现后余额不自动刷新的问题

## 问题描述
用户提现完成后返回钱包页面，余额没有自动更新，需要手动点击右上角的刷新按钮才能看到最新余额。

## 根本原因

### 1. 提现页面没有刷新余额
在 `src/app/withdraw/page.tsx` 中，提现成功后直接跳转到钱包页面，但没有调用 `refreshBalance()` 来更新余额。

```typescript
// 原代码
alert(`提现申请已提交！\n订单ID: ${orderId}\n状态: ${statusText}`);
router.push('/wallet');  // 直接跳转，没有刷新余额
```

### 2. 钱包页面没有自动刷新
`src/app/wallet/page.tsx` 在页面加载时没有自动刷新余额，只能通过手动点击刷新按钮。

## 修复方案

### 1. 提现成功后刷新余额

在 `src/app/withdraw/page.tsx` 中：

```typescript
// 修复后
if (result.success) {
  // ... 其他逻辑
  
  // 刷新余额
  console.log('💰 刷新余额...');
  await refreshBalance();
  console.log('💰 余额刷新完成');
  
  alert(`提现申请已提交！\n订单ID: ${orderId}\n状态: ${statusText}`);
  router.push('/wallet');
}
```

需要先从 `useWallet()` 中获取 `refreshBalance` 函数：

```typescript
const { balance, refreshBalance } = useWallet();
```

### 2. 钱包页面加载时自动刷新

在 `src/app/wallet/page.tsx` 中添加 `useEffect`：

```typescript
import { useEffect } from 'react';

export default function WalletPage() {
  const { balance, frozenBalance, bonusBalance, refreshBalance } = useWallet();

  // 页面加载时刷新余额
  useEffect(() => {
    console.log('💰 钱包页面加载，刷新余额...');
    refreshBalance();
  }, [refreshBalance]);
  
  // ... 其他代码
}
```

## 数据流

### 提现流程
1. 用户在提现页面提交提现申请
2. 调用 `apiService.withdrawUsdt()` 提交到后端
3. 后端处理提现，扣除余额
4. **前端调用 `refreshBalance()` 从后端获取最新余额**
5. 跳转到钱包页面
6. 钱包页面显示更新后的余额

### 钱包页面加载流程
1. 用户进入钱包页面（从任何页面）
2. `useEffect` 触发，调用 `refreshBalance()`
3. 从后端 API 获取最新余额
4. 更新 WalletContext 中的余额状态
5. 页面显示最新余额

## 其他页面的余额刷新

### 充值页面 ✅
`src/app/deposit/page.tsx` 已经在充值成功后调用了 `refreshBalance()`：

```typescript
// 刷新余额
await refreshBalance()

// 3秒后自动跳转到钱包页面
setTimeout(() => {
  router.push('/wallet')
}, 3000)
```

### 游戏页面 ✅
`src/contexts/GameContext.tsx` 在下注成功后会调用 `refreshBalance()`：

```typescript
// 下单成功后刷新余额
await refreshBalance();
```

## 测试步骤

### 测试1：提现后余额刷新
1. 进入钱包页面，记录当前余额（如 268.00）
2. 点击"提现"按钮
3. 输入提现金额（如 10.00）
4. 选择提现地址
5. 点击"确认提现"
6. 等待提现成功提示
7. 自动跳转到钱包页面
8. **验证：余额应该自动更新为 258.00（268 - 10）**

### 测试2：钱包页面自动刷新
1. 在游戏页面进行下注
2. 点击底部导航的"钱包"按钮
3. **验证：进入钱包页面时，余额应该自动刷新显示最新值**
4. 检查控制台日志，应该看到：
   ```
   💰 钱包页面加载，刷新余额...
   余额刷新成功: { cash: "258.00", ... }
   ```

### 测试3：充值后余额刷新（已有功能）
1. 进入钱包页面
2. 点击"充值"按钮
3. 完成充值流程
4. **验证：充值成功后余额自动更新**

## 预期结果

✅ 提现成功后，余额立即刷新
✅ 返回钱包页面时，显示最新余额
✅ 不需要手动点击刷新按钮
✅ 控制台显示清晰的刷新日志

## 技术细节

### WalletContext 的 refreshBalance 实现

```typescript
const refreshBalance = useCallback(async () => {
  if (!user) {
    console.error('用户未登录');
    return;
  }

  if (isFetchingRef.current) return; // 防止重复请求
  isFetchingRef.current = true;

  try {
    const response = await apiService.queryAccount(String(user.id));
    if (response.success && response.data) {
      const account = response.data;
      setAccountInfo(account);

      // 将字符串金额转换为数字
      setBalance(parseFloat(account.cash) || 0);
      setFrozenBalance(parseFloat(account.frozen) || 0);
      setBonusBalance(parseFloat(account.redPack) || 0);
      setDepositAmount(parseFloat(account.deposit) || 0);

      console.log('余额刷新成功:', account);
    }
  } catch (error) {
    console.error('刷新余额失败:', error);
  } finally {
    isFetchingRef.current = false;
  }
}, [user]);
```

### 防止重复请求
使用 `isFetchingRef` 来防止在上一次请求还未完成时发起新的请求，避免并发问题。

## 修改文件
- `src/app/withdraw/page.tsx` - 提现成功后调用 refreshBalance
- `src/app/wallet/page.tsx` - 页面加载时自动刷新余额
