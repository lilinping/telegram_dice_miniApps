# 调试余额刷新问题

## 当前问题
切换到首页时，余额显示为 0.00 USDT，没有自动刷新。

## 调试步骤

### 1. 打开浏览器控制台
按 F12 打开开发者工具，切换到 Console 标签。

### 2. 清除所有日志
点击控制台的清除按钮（🚫图标）。

### 3. 执行测试操作
1. 从钱包页面切换到首页
2. 观察控制台输出

### 4. 检查关键日志

应该看到以下日志序列：

```
🎮 游戏页面: pathname变化 { pathname: '/game', user: true, isInitialized: true, balance: 0 }
🎮 游戏页面: 开始刷新余额... { userId: 6784471903, currentBalance: 0 }
余额刷新成功: { cash: "268.00", frozen: "0.00", redPack: "0.00", deposit: "0.00" }
💰 余额状态更新: { balance: 268, frozenBalance: 0, bonusBalance: 0 }
```

### 5. 可能的问题和解决方案

#### 问题1：没有看到 "pathname变化" 日志
**原因**: useEffect 没有触发
**解决**: 检查 pathname 是否正确

#### 问题2：看到 "用户未初始化，跳过刷新"
**原因**: user 或 isInitialized 为 false
**解决**: 
```javascript
// 在控制台执行
console.log('User:', window.Telegram?.WebApp?.initDataUnsafe?.user);
```

#### 问题3：看到 "开始刷新余额" 但没有 "余额刷新成功"
**原因**: API 请求失败
**解决**: 
1. 检查 Network 标签
2. 查找 `/api/backend/account/query/` 请求
3. 查看响应状态和内容

#### 问题4：看到 "余额刷新成功" 但余额仍为 0
**原因**: API 返回的 cash 字段为 "0.00"
**解决**: 
1. 检查后端账户数据
2. 确认用户ID正确
3. 检查是否有余额数据

## 手动测试命令

在控制台执行以下命令来手动测试：

### 测试1：检查用户信息
```javascript
// 检查 Telegram 用户
console.log('Telegram User:', window.Telegram?.WebApp?.initDataUnsafe?.user);

// 检查 Context 中的用户（需要 React DevTools）
// 在 Components 标签中找到 TelegramProvider，查看 user 和 isInitialized
```

### 测试2：手动刷新余额
```javascript
// 在控制台执行（需要先获取 refreshBalance 函数）
// 这个需要通过 React DevTools 访问
```

### 测试3：检查 API 请求
1. 打开 Network 标签
2. 过滤: `account/query`
3. 切换到首页
4. 查看是否有新的请求
5. 检查请求的响应

### 测试4：检查 localStorage
```javascript
// 检查是否有缓存的用户数据
console.log('localStorage:', {
  telegram_init_data: localStorage.getItem('telegram_init_data'),
  // 其他可能的缓存
});
```

## 临时解决方案

如果问题持续存在，可以添加一个手动刷新按钮：

### 方案1：添加刷新按钮
在游戏页面顶部添加一个刷新图标按钮，用户可以手动点击刷新余额。

### 方案2：定时刷新
每30秒自动刷新一次余额（不推荐，会增加服务器负担）。

### 方案3：WebSocket
使用 WebSocket 实时推送余额变化（需要后端支持）。

## 代码修改建议

### 当前代码问题
```typescript
// 问题：refreshBalance 在依赖数组中会导致无限循环
useEffect(() => {
  if (user && isInitialized && pathname === '/game') {
    refreshBalance();
  }
}, [pathname, user, isInitialized, refreshBalance]); // ❌ refreshBalance 会变化
```

### 修复方案1：移除 refreshBalance 依赖
```typescript
useEffect(() => {
  if (pathname === '/game') {
    const timer = setTimeout(() => {
      if (user && isInitialized) {
        refreshBalance();
      }
    }, 100);
    return () => clearTimeout(timer);
  }
}, [pathname]); // ✅ 只依赖 pathname
```

### 修复方案2：使用 useCallback 稳定 refreshBalance
在 WalletContext 中：
```typescript
const refreshBalance = useCallback(async () => {
  // ... 实现
}, []); // ✅ 空依赖数组，使用 ref 访问 user
```

### 修复方案3：使用自定义 Hook
```typescript
function useBalanceRefresh() {
  const { user, isInitialized } = useTelegram();
  const { refreshBalance } = useWallet();
  const pathname = usePathname();
  
  useEffect(() => {
    if (pathname === '/game' && user && isInitialized) {
      refreshBalance();
    }
  }, [pathname]); // 只依赖 pathname
}
```

## 检查清单

- [ ] 控制台是否有 "pathname变化" 日志？
- [ ] user 和 isInitialized 是否为 true？
- [ ] 是否有 "开始刷新余额" 日志？
- [ ] Network 标签是否有 API 请求？
- [ ] API 请求是否成功（状态码 200）？
- [ ] API 响应的 cash 字段是否有值？
- [ ] 是否有 "余额刷新成功" 日志？
- [ ] 是否有 "余额状态更新" 日志？
- [ ] 页面上的余额是否更新？

## 下一步

如果以上步骤都检查过了，问题仍然存在，请提供：
1. 完整的控制台日志
2. Network 标签中的 API 请求和响应
3. React DevTools 中的 Context 状态
