# 修复页面切换时余额不更新的问题

## 问题描述
用户在不同页面间切换（如从钱包切换到首页）时，余额不会自动更新，需要手动刷新页面才能看到最新余额。

## 根本原因

### Next.js 客户端路由缓存
Next.js 使用客户端路由（Client-Side Navigation），页面组件在路由切换时可能不会重新挂载：

1. **首次访问** `/game` → 组件挂载 → useEffect 执行 ✓
2. **切换到** `/wallet` → 组件可能被缓存
3. **切换回** `/game` → 组件从缓存恢复 → useEffect 不执行 ✗

### 之前的错误逻辑
```typescript
// ❌ 只在 balance === 0 时刷新
useEffect(() => {
  if (user && isInitialized && balance === 0) {
    refreshBalance();
  }
}, [user, isInitialized, balance, refreshBalance]);
```

问题：
- 如果余额不是0（如268），切换回来时不会刷新
- 无法检测到用户在其他页面的操作（提现、下注等）

## 修复方案

### 1. 监听路由变化

使用 `usePathname()` hook 监听路由变化：

```typescript
import { usePathname } from 'next/navigation';

export default function GamePage() {
  const pathname = usePathname();
  const { user, isInitialized } = useTelegram();
  const { balance, refreshBalance } = useWallet();
  
  // 每次路由到游戏页面时刷新余额
  useEffect(() => {
    if (user && isInitialized && pathname === '/game') {
      console.log('🎮 游戏页面: 路由切换到游戏页面，刷新余额...');
      refreshBalance();
    }
  }, [pathname, user, isInitialized, refreshBalance]);
}
```

### 2. 监听页面可见性

处理标签页切换的情况：

```typescript
// 监听页面可见性变化（处理标签页切换）
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden && user && isInitialized && pathname === '/game') {
      console.log('🎮 游戏页面: 页面变为可见，刷新余额...');
      refreshBalance();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [user, isInitialized, pathname, refreshBalance]);
```

## 工作原理

### 路由切换流程

```
用户在钱包页面提现 10 USDT
  ↓
余额从 268 变为 258
  ↓
点击底部导航"首页"
  ↓
pathname 从 '/wallet' 变为 '/game'
  ↓
useEffect 检测到 pathname 变化
  ↓
调用 refreshBalance()
  ↓
从后端获取最新余额 258
  ↓
页面显示更新后的余额
```

### 标签页切换流程

```
用户切换到其他标签页
  ↓
document.hidden = true
  ↓
用户切换回来
  ↓
document.hidden = false
  ↓
触发 visibilitychange 事件
  ↓
调用 refreshBalance()
  ↓
显示最新余额
```

## 测试场景

### 场景1：钱包 → 首页
1. 进入钱包页面，余额显示 268.00
2. 点击"提现"，提现 10 USDT
3. 提现成功后返回钱包，余额显示 258.00
4. 点击底部导航"首页"
5. **验证：首页余额应该显示 258.00（不是 268.00）**
6. 检查控制台：
   ```
   🎮 游戏页面: 路由切换到游戏页面，刷新余额...
   余额刷新成功: { cash: "258.00", ... }
   ```

### 场景2：首页 → 钱包 → 首页
1. 在首页下注 20 USDT
2. 点击底部导航"钱包"
3. 钱包页面余额显示 238.00
4. 点击底部导航"首页"
5. **验证：首页余额应该显示 238.00**

### 场景3：标签页切换
1. 在首页，余额显示 268.00
2. 切换到其他浏览器标签页
3. 在另一个设备或标签页进行操作（如提现）
4. 切换回游戏标签页
5. **验证：余额应该自动刷新显示最新值**

### 场景4：快速切换
1. 快速在首页、钱包、历史记录之间切换
2. **验证：每次切换到首页或钱包，余额都应该是最新的**
3. **验证：不会出现旧的余额数据**

## 性能优化

### 防止重复请求
WalletContext 中使用 `isFetchingRef` 防止并发请求：

```typescript
const isFetchingRef = useRef(false);

const refreshBalance = useCallback(async () => {
  if (isFetchingRef.current) return; // 如果正在请求，直接返回
  isFetchingRef.current = true;
  
  try {
    // ... API 请求
  } finally {
    isFetchingRef.current = false;
  }
}, [user]);
```

### 避免不必要的刷新
只在必要条件满足时才刷新：
- ✅ user 存在
- ✅ isInitialized = true
- ✅ pathname 匹配当前页面
- ✅ 页面可见（visibilitychange）

## 预期日志输出

### 正常页面切换
```
💰 钱包页面加载，刷新余额...
余额刷新成功: { cash: "258.00", ... }
🎮 游戏页面: 路由切换到游戏页面，刷新余额...
余额刷新成功: { cash: "258.00", ... }
💰 余额状态更新: { balance: 258, frozenBalance: 0, bonusBalance: 0 }
```

### 标签页切换
```
🎮 游戏页面: 页面变为可见，刷新余额...
余额刷新成功: { cash: "258.00", ... }
```

## 其他页面的余额刷新

### 钱包页面 ✅
已在 `src/app/wallet/page.tsx` 中添加：
```typescript
useEffect(() => {
  console.log('💰 钱包页面加载，刷新余额...');
  refreshBalance();
}, [refreshBalance]);
```

### 游戏页面 ✅
已在 `src/app/game/page.tsx` 中添加：
- 路由切换时刷新
- 页面可见性变化时刷新

### 其他页面
- 历史记录页面：不显示余额，无需刷新
- 排行榜页面：不显示余额，无需刷新
- 个人页面：如果显示余额，需要添加类似逻辑

## 技术细节

### usePathname vs useRouter
- `usePathname()`: 返回当前路径字符串，更轻量
- `useRouter()`: 返回路由对象，包含更多方法

我们使用 `usePathname()` 因为只需要监听路径变化。

### visibilitychange 事件
- 标准的 Web API
- 支持所有现代浏览器
- 可以检测标签页切换、最小化等

### 依赖数组的选择
```typescript
[pathname, user, isInitialized, refreshBalance]
```
- `pathname`: 路由变化时触发
- `user`: 用户登录状态变化时触发
- `isInitialized`: 初始化完成时触发
- `refreshBalance`: 函数引用变化时触发（通常不变）

## 已知限制

1. **网络延迟**
   - 余额刷新需要网络请求
   - 在慢速网络下可能有短暂延迟
   - 可以考虑添加加载指示器

2. **频繁切换**
   - 快速切换页面会触发多次刷新
   - 已通过 `isFetchingRef` 防止并发请求
   - 但仍会有多个串行请求

3. **离线状态**
   - 如果用户离线，刷新会失败
   - 需要添加错误处理和重试机制

## 后续优化建议

1. **添加加载状态**
   ```typescript
   const [isRefreshing, setIsRefreshing] = useState(false);
   ```

2. **添加错误提示**
   ```typescript
   if (!response.success) {
     toast.error('余额刷新失败，请稍后重试');
   }
   ```

3. **使用 SWR 或 React Query**
   - 自动缓存和重新验证
   - 更好的性能和用户体验

4. **WebSocket 实时更新**
   - 后端推送余额变化
   - 无需轮询或手动刷新

## 修改文件
- `src/app/game/page.tsx` - 添加路由和可见性监听
- `src/app/wallet/page.tsx` - 页面加载时刷新（已完成）
