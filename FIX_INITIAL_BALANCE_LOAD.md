# 修复首页初次加载余额为0的问题

## 问题描述
用户首次进入游戏页面（首页）时，余额显示为0，需要手动刷新页面才能看到正确的余额。

## 根本原因分析

### 时序问题
应用的初始化流程存在时序问题：

1. **TelegramContext 初始化**
   - 设置 `user` 对象
   - 异步调用 `initializeBackendUser()`
   - 设置 `isInitialized = true`

2. **WalletContext 初始化**
   - 监听 `user` 变化
   - 当 `user` 存在时调用 `refreshBalance()`
   - **问题：此时后端用户可能还未初始化完成**

3. **结果**
   - `refreshBalance()` 可能在后端用户初始化之前被调用
   - API 请求可能失败或返回空数据
   - 余额显示为 0

### 依赖链问题
```
TelegramContext.user 变化
  ↓
WalletContext.useEffect 触发
  ↓
refreshBalance() 被调用
  ↓
但此时 isInitialized 可能还是 false
  ↓
后端 API 可能还没准备好
```

## 修复方案

### 1. WalletContext 等待初始化完成

修改 `src/contexts/WalletContext.tsx`：

```typescript
export function WalletProvider({ children }: { children: ReactNode }) {
  const { user, isInitialized } = useTelegram(); // 添加 isInitialized
  // ...
}
```

```typescript
// 初始化时加载余额 - 等待用户初始化完成
useEffect(() => {
  if (user && isInitialized) {
    console.log('🔄 WalletContext: 用户已初始化，开始刷新余额...', user.id);
    refreshBalance();
  } else if (user && !isInitialized) {
    console.log('⏳ WalletContext: 用户已登录但后端未初始化，等待中...', user.id);
  }
}, [user, isInitialized, refreshBalance]);
```

### 2. 游戏页面添加兜底刷新

修改 `src/app/game/page.tsx`：

```typescript
import { useEffect } from 'react';

export default function GamePage() {
  const { user, isInitialized } = useTelegram();
  const { balance, refreshBalance } = useWallet();
  
  // 页面加载时确保余额已刷新
  useEffect(() => {
    if (user && isInitialized && balance === 0) {
      console.log('🎮 游戏页面: 余额为0，尝试刷新...');
      refreshBalance();
    }
  }, [user, isInitialized, balance, refreshBalance]);
  
  // ...
}
```

### 3. 添加详细的调试日志

在关键位置添加日志，方便追踪初始化流程：

- TelegramContext: 用户登录和初始化状态
- WalletContext: 余额刷新时机和结果
- GamePage: 页面加载和余额状态

## 初始化流程（修复后）

```
1. TelegramContext 初始化
   ├─ setUser(userObj)
   ├─ await initializeBackendUser(userObj)
   └─ setIsInitialized(true)
   
2. WalletContext 监听
   ├─ user 存在 ✓
   ├─ isInitialized = true ✓
   └─ 调用 refreshBalance()
   
3. API 请求
   ├─ queryAccount(userId)
   ├─ 返回账户数据
   └─ 更新余额状态
   
4. 游戏页面显示
   ├─ 余额正确显示
   └─ 如果余额为0，触发兜底刷新
```

## 测试步骤

### 测试1：首次加载
1. 清除浏览器缓存和 localStorage
2. 打开应用（游戏页面）
3. 观察控制台日志：
   ```
   🔄 WalletContext: 用户已初始化，开始刷新余额... 6784471903
   余额刷新成功: { cash: "268.00", ... }
   💰 余额状态更新: { balance: 268, frozenBalance: 0, bonusBalance: 0 }
   ```
4. **验证：余额应该立即显示正确的值，不需要刷新页面**

### 测试2：页面刷新
1. 在游戏页面按 F5 刷新
2. **验证：余额应该立即显示，不会出现短暂的0**

### 测试3：页面切换
1. 从游戏页面切换到钱包页面
2. 再切换回游戏页面
3. **验证：余额始终显示正确**

### 测试4：网络延迟
1. 打开浏览器开发者工具
2. Network 标签 → Throttling → Slow 3G
3. 刷新页面
4. **验证：即使网络慢，余额也会在加载完成后正确显示**

## 预期日志输出

### 正常流程
```
[TelegramContext] 用户初始化成功
⏳ WalletContext: 用户已登录但后端未初始化，等待中... 6784471903
🔄 WalletContext: 用户已初始化，开始刷新余额... 6784471903
余额刷新成功: { cash: "268.00", frozen: "0.00", redPack: "0.00", deposit: "0.00" }
💰 余额状态更新: { balance: 268, frozenBalance: 0, bonusBalance: 0 }
```

### 兜底刷新（如果需要）
```
🎮 游戏页面: 余额为0，尝试刷新...
余额刷新成功: { cash: "268.00", ... }
💰 余额状态更新: { balance: 268, frozenBalance: 0, bonusBalance: 0 }
```

## 技术细节

### isInitialized 的作用
- 标记后端用户是否已初始化完成
- 确保 API 调用在用户准备好之后进行
- 避免过早的 API 请求导致失败

### 双重保障机制
1. **WalletContext 层面**：等待 `isInitialized` 后才刷新
2. **GamePage 层面**：如果余额为0，再次尝试刷新（兜底）

### 防止重复请求
使用 `isFetchingRef` 防止并发请求：
```typescript
if (isFetchingRef.current) return;
isFetchingRef.current = true;
// ... API 请求
isFetchingRef.current = false;
```

## 相关问题修复

这次修复同时解决了以下相关问题：
- ✅ 首页余额初次加载为0
- ✅ 页面刷新后余额短暂显示0
- ✅ 快速切换页面时余额不更新
- ✅ 网络延迟时余额加载失败

## 修改文件
- `src/contexts/WalletContext.tsx` - 等待用户初始化完成后刷新余额
- `src/app/game/page.tsx` - 添加兜底刷新逻辑
