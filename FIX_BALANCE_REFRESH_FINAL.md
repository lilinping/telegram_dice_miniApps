# 修复余额刷新问题 - 最终方案

## 核心问题

### 循环依赖导致 refreshBalance 不稳定

```typescript
// ❌ 问题代码
const refreshBalance = useCallback(async () => {
  // 使用 user
}, [user]); // 依赖 user

useEffect(() => {
  refreshBalance();
}, [user, isInitialized, refreshBalance]); // 依赖 refreshBalance
```

**问题链**:
1. `user` 变化 → `refreshBalance` 函数引用变化
2. `refreshBalance` 变化 → `useEffect` 触发
3. `useEffect` 触发 → 调用 `refreshBalance`
4. 可能导致无限循环或不触发

## 最终解决方案

### 1. 使用 useRef 稳定 refreshBalance

在 `src/contexts/WalletContext.tsx` 中：

```typescript
// 使用 ref 存储 user，避免 refreshBalance 依赖 user
const userRef = useRef(user);
useEffect(() => {
  userRef.current = user;
}, [user]);

// refreshBalance 不依赖 user，使用 ref 访问
const refreshBalance = useCallback(async () => {
  const currentUser = userRef.current;
  if (!currentUser) {
    console.error('用户未登录');
    return;
  }
  
  if (isFetchingRef.current) {
    console.log('⏸️ 余额刷新中，跳过重复请求');
    return;
  }
  isFetchingRef.current = true;
  
  try {
    console.log('📡 开始请求余额...', currentUser.id);
    const response = await apiService.queryAccount(String(currentUser.id));
    // ... 处理响应
    console.log('✅ 余额刷新成功:', account);
  } finally {
    isFetchingRef.current = false;
  }
}, []); // ✅ 空依赖数组，函数引用永远不变
```

### 2. 移除 useEffect 中的 refreshBalance 依赖

```typescript
useEffect(() => {
  if (user && isInitialized) {
    console.log('🔄 WalletContext: 用户已初始化，开始刷新余额...', user.id);
    refreshBalance();
  }
}, [user, isInitialized]); // ✅ 不依赖 refreshBalance
```

### 3. 游戏页面只依赖 pathname

在 `src/app/game/page.tsx` 中：

```typescript
useEffect(() => {
  console.log('🎮 游戏页面: pathname变化', { pathname, user: !!user, isInitialized, balance });
  
  if (pathname === '/game') {
    // 延迟确保页面已完全切换
    const timer = setTimeout(() => {
      if (user && isInitialized) {
        console.log('🎮 游戏页面: 开始刷新余额...', { userId: user.id, currentBalance: balance });
        refreshBalance();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }
}, [pathname]); // ✅ 只依赖 pathname
```

## 工作原理

### 数据流

```
1. 用户切换到游戏页面
   ↓
2. pathname 从 '/wallet' 变为 '/game'
   ↓
3. useEffect 检测到 pathname 变化
   ↓
4. 延迟 100ms 后调用 refreshBalance()
   ↓
5. refreshBalance 使用 userRef.current 获取用户
   ↓
6. 调用 API 获取最新余额
   ↓
7. 更新 balance 状态
   ↓
8. 页面显示最新余额
```

### 为什么使用 useRef

**useRef 的特点**:
- 值变化不会触发重新渲染
- 在组件的整个生命周期中保持同一个引用
- 可以在 useCallback 中访问最新值，而不需要将其加入依赖数组

**对比**:
```typescript
// ❌ 使用 state/props - 会导致依赖变化
const refreshBalance = useCallback(async () => {
  // 使用 user
}, [user]); // user 变化 → 函数引用变化

// ✅ 使用 ref - 不会导致依赖变化
const refreshBalance = useCallback(async () => {
  const currentUser = userRef.current; // 访问最新值
}, []); // 空依赖 → 函数引用永远不变
```

## 调试日志

### 正常流程的日志输出

```
🔄 WalletContext: 用户已初始化，开始刷新余额... 6784471903
📡 开始请求余额... 6784471903
✅ 余额刷新成功: { cash: "268.00", frozen: "0.00", redPack: "0.00", deposit: "0.00" }
💰 余额状态更新: { balance: 268, frozenBalance: 0, bonusBalance: 0 }

[用户切换到钱包页面]
💰 钱包页面加载，刷新余额...
📡 开始请求余额... 6784471903
✅ 余额刷新成功: { cash: "268.00", ... }

[用户提现 10 USDT]
💰 刷新余额...
📡 开始请求余额... 6784471903
✅ 余额刷新成功: { cash: "258.00", ... }
💰 余额状态更新: { balance: 258, frozenBalance: 0, bonusBalance: 0 }

[用户切换回游戏页面]
🎮 游戏页面: pathname变化 { pathname: '/game', user: true, isInitialized: true, balance: 258 }
🎮 游戏页面: 开始刷新余额... { userId: 6784471903, currentBalance: 258 }
📡 开始请求余额... 6784471903
✅ 余额刷新成功: { cash: "258.00", ... }
💰 余额状态更新: { balance: 258, frozenBalance: 0, bonusBalance: 0 }
```

### 如果看到重复请求

```
📡 开始请求余额... 6784471903
⏸️ 余额刷新中，跳过重复请求
⏸️ 余额刷新中，跳过重复请求
✅ 余额刷新成功: { cash: "268.00", ... }
```

这是正常的，`isFetchingRef` 会防止并发请求。

## 测试步骤

### 测试1：初次加载
1. 清除浏览器缓存
2. 打开应用
3. **验证**: 余额应该正确显示
4. **日志**: 应该看到 "WalletContext: 用户已初始化" 和 "余额刷新成功"

### 测试2：页面切换
1. 在游戏页面，记录当前余额（如 268）
2. 切换到钱包页面
3. 点击提现，提现 10 USDT
4. 提现成功后，钱包显示 258
5. 切换回游戏页面
6. **验证**: 游戏页面余额应该显示 258（不是 268）
7. **日志**: 应该看到 "pathname变化" 和 "开始刷新余额"

### 测试3：快速切换
1. 快速在游戏、钱包、历史记录之间切换
2. **验证**: 不应该出现错误
3. **验证**: 余额应该始终是最新的
4. **日志**: 可能看到 "跳过重复请求"（正常）

### 测试4：网络延迟
1. 打开开发者工具 → Network → Throttling → Slow 3G
2. 切换页面
3. **验证**: 余额会在加载完成后更新
4. **验证**: 不会出现错误或卡死

## 性能优化

### 1. 防止重复请求
```typescript
if (isFetchingRef.current) {
  console.log('⏸️ 余额刷新中，跳过重复请求');
  return;
}
```

### 2. 延迟执行
```typescript
const timer = setTimeout(() => {
  refreshBalance();
}, 100); // 100ms 延迟，确保页面切换完成
```

### 3. 条件检查
```typescript
if (user && isInitialized && pathname === '/game') {
  // 只在条件满足时刷新
}
```

## 已知限制

1. **100ms 延迟**
   - 页面切换后有 100ms 延迟才刷新
   - 这是为了确保页面完全切换
   - 可以调整为 50ms 或 0ms

2. **网络请求**
   - 每次切换都会发起 API 请求
   - 可以考虑添加缓存机制
   - 或使用 SWR/React Query

3. **离线状态**
   - 如果用户离线，刷新会失败
   - 需要添加错误处理和重试

## 后续优化建议

### 1. 使用 SWR 或 React Query
```typescript
import useSWR from 'swr';

function useBalance() {
  const { user } = useTelegram();
  const { data, mutate } = useSWR(
    user ? `/account/query/${user.id}` : null,
    fetcher,
    {
      refreshInterval: 30000, // 30秒自动刷新
      revalidateOnFocus: true, // 页面获得焦点时刷新
    }
  );
  
  return { balance: data?.cash, refresh: mutate };
}
```

### 2. WebSocket 实时更新
```typescript
useEffect(() => {
  const ws = new WebSocket('wss://api.example.com/balance');
  
  ws.onmessage = (event) => {
    const newBalance = JSON.parse(event.data);
    setBalance(newBalance.cash);
  };
  
  return () => ws.close();
}, [user]);
```

### 3. 乐观更新
```typescript
// 提现时立即更新 UI，不等待 API 响应
const optimisticWithdraw = (amount: number) => {
  setBalance(prev => prev - amount); // 立即更新
  
  withdrawApi(amount)
    .then(() => {
      // 成功，保持更新
    })
    .catch(() => {
      setBalance(prev => prev + amount); // 失败，回滚
    });
};
```

## 修改文件总结

- ✅ `src/contexts/WalletContext.tsx` - 使用 useRef 稳定 refreshBalance
- ✅ `src/app/game/page.tsx` - 只依赖 pathname 触发刷新
- ✅ `src/app/wallet/page.tsx` - 页面加载时刷新（已完成）

## 关键改进

1. **消除循环依赖** - refreshBalance 不再依赖 user
2. **稳定的函数引用** - refreshBalance 引用永远不变
3. **简化依赖数组** - useEffect 只依赖必要的值
4. **详细的日志** - 方便调试和追踪问题
5. **防止重复请求** - 使用 isFetchingRef 保护
