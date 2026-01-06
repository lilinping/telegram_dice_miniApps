# 🚀 快速参考指南

## 📦 最新版本信息

- **版本**: v2.0.0 (性能优化版)
- **静态包**: `static-optimized-20260106-155803.tar.gz` (1.3MB)
- **API 基础地址**: `http://46.250.168.177:8079`
- **API 路径前缀**: `/api/backend`

---

## 🔧 常用命令

### 开发
```bash
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm run lint             # 代码检查
npm run type-check       # 类型检查
```

### 部署
```bash
# 构建静态包
npm run build
tar -czf static-$(date +%Y%m%d-%H%M%S).tar.gz out/

# 部署到服务器
tar -xzf static-*.tar.gz
cp -r out/* /var/www/html/
```

---

## 📁 项目结构

```
telegram_dice_miniApps/
├── src/
│   ├── app/                    # Next.js 页面
│   ├── components/             # React 组件
│   ├── contexts/               # React Context
│   ├── hooks/                  # 自定义 Hooks
│   ├── lib/
│   │   ├── api.ts             # API 服务（带缓存）
│   │   ├── apiCache.ts        # API 缓存管理
│   │   ├── performance.ts     # 性能优化工具
│   │   └── types.ts           # TypeScript 类型
│   └── utils/                  # 工具函数
├── public/                     # 静态资源
├── out/                        # 构建输出
├── next.config.js              # Next.js 配置
├── DEPLOYMENT.md               # 部署文档
├── PERFORMANCE_OPTIMIZATION.md # 性能优化文档
└── OPTIMIZATION_SUMMARY.md     # 优化总结
```

---

## 🎯 核心功能

### 1. API 调用（带缓存）
```typescript
import { apiService } from '@/lib/api';

// 查询账户（自动缓存 30 秒）
const account = await apiService.queryAccount(userId);

// 强制刷新（跳过缓存）
const account = await apiService.queryAccount(userId, true);

// 清除用户缓存
apiService.clearUserCache(userId);
```

### 2. 性能优化工具
```typescript
import { 
  debounce, 
  throttle, 
  getDevicePerformance,
  preloadResources 
} from '@/lib/performance';

// 防抖（搜索输入）
const handleSearch = debounce((query) => {
  // 搜索逻辑
}, 300);

// 节流（滚动事件）
const handleScroll = throttle(() => {
  // 滚动逻辑
}, 200);

// 设备性能检测
const performance = getDevicePerformance(); // 'high' | 'medium' | 'low'

// 预加载资源
await preloadResources([
  '/sounds/dice-roll.mp3',
  '/images/dice.webp'
]);
```

### 3. 缓存管理
```typescript
import { apiCache, CACHE_TTL } from '@/lib/apiCache';

// 手动设置缓存
apiCache.set('/api/backend/user/info', userData, CACHE_TTL.USER);

// 获取缓存
const cached = apiCache.get('/api/backend/user/info');

// 删除缓存
apiCache.delete('/api/backend/user/info');

// 清空所有缓存
apiCache.clear();

// 清空特定前缀的缓存
apiCache.clearByPrefix('/api/backend/user');
```

---

## 🔑 API 端点示例

### 用户相关
```typescript
// 初始化用户
await apiService.initUser(telegramUser);

// 查询账户
await apiService.queryAccount(userId);

// 检查密码
await apiService.hasSetPassword(userId);
```

### 游戏相关
```typescript
// 开始游戏
await apiService.startGame(userId);

// 下注
await apiService.placeBet(gameId, chooseId, amount);

// 结束游戏
await apiService.endGame(gameId);

// 查询历史
await apiService.getGameHistory(userId, pageIndex, pageSize);
```

### 钱包相关
```typescript
// 创建支付订单
await apiService.createPaymentOrder(userId, amount);

// 提币
await apiService.withdrawUsdt(userId, amount);

// 查询反水
await apiService.queryRebateAmount(userId);
```

---

## 🎨 UI 组件

### 常用组件
```typescript
import TopBar from '@/components/layout/TopBar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

// TopBar
<TopBar title="标题" showBack />

// Input
<Input
  type="text"
  label="标签"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="请输入"
  error="错误信息"
/>

// Toast
toast.success('操作成功');
toast.error('操作失败');
toast.info('提示信息');
```

---

## 🔍 调试技巧

### 1. 查看缓存统计
```typescript
import { apiCache } from '@/lib/apiCache';

console.log(apiCache.getStats());
// { size: 15, maxSize: 100, pendingRequests: 2 }
```

### 2. 性能监控
```typescript
import { measurePerformance } from '@/lib/performance';

measurePerformance('loadData', () => {
  // 执行耗时操作
});
// 输出: ⚡ loadData: 123.45ms
```

### 3. 设备信息
```typescript
import { getDevicePerformance } from '@/lib/performance';

const perf = getDevicePerformance();
console.log('设备性能:', perf);
// 根据性能调整渲染质量
```

---

## ⚠️ 常见问题

### 1. API 请求失败
```typescript
// 检查 API 基础地址
console.log(process.env.NEXT_PUBLIC_API_BASE_URL);

// 检查完整 URL
// 应该是: http://46.250.168.177:8079/api/backend/...
```

### 2. 缓存不生效
```typescript
// 确保使用 GET 请求
// POST/PUT/DELETE 请求不会被缓存

// 强制跳过缓存
await apiService.queryAccount(userId, true);
```

### 3. 性能问题
```typescript
// 检查设备性能
const perf = getDevicePerformance();
if (perf === 'low') {
  // 降低动画质量
  // 减少渲染复杂度
}
```

---

## 📚 相关文档

- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署说明
- [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md) - 性能优化详解
- [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md) - 优化总结
- [README.md](./README.md) - 项目说明

---

## 🆘 获取帮助

如果遇到问题：
1. 查看相关文档
2. 检查浏览器控制台
3. 查看 Network 面板
4. 检查 API 响应

---

**最后更新**: 2026-01-06  
**版本**: v2.0.0
