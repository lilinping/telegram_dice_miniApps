# InitData 优化说明

## 问题描述

每次 API 请求都需要使用最新的 `initData`，否则会因为过期导致认证失败（401 错误）。

## 优化方案

### 1. API 服务优化 (`src/lib/api.ts`)

**关键改进**：
- ✅ 将 `getInitData()` 调用移到 `dedupe` 函数内部
- ✅ 确保每次实际的网络请求都获取最新的 `initData`
- ✅ 添加详细的日志输出，便于调试

**实现细节**：

```typescript
// ❌ 错误做法：在 dedupe 外部获取 initData
const initData = this.getInitData();
await apiCache.dedupe(endpoint, async () => {
  // 使用外部的 initData（可能已过期）
});

// ✅ 正确做法：在 dedupe 内部获取 initData
await apiCache.dedupe(endpoint, async () => {
  // 每次请求都获取最新的 initData
  const initData = this.getInitData();
  // 使用最新的 initData
});
```

### 2. API 代理路由优化 (`src/app/api/backend/[...path]/route.ts`)

**改进**：
- ✅ 添加 initData 存在性检查
- ✅ 添加详细的日志输出
- ✅ 正确转发 initData 到后端

**日志示例**：
```
[API Proxy] GET http://46.250.168.177:8079/api/backend/dice/display - initData present: query_id=AAHdF6...
```

### 3. 测试页面 (`src/app/test-initdata/page.tsx`)

创建了专门的测试页面，用于验证 initData 的更新机制：

**功能**：
- 检查当前 initData
- 测试单次 API 请求
- 测试多次连续 API 请求
- 实时日志输出

**访问地址**：`http://localhost:3000/test-initdata`

## 工作原理

### InitData 获取流程

```
1. 用户操作触发 API 请求
   ↓
2. apiService.request() 被调用
   ↓
3. 进入 dedupe 函数
   ↓
4. 调用 getInitData() 获取最新值
   ↓
5. 从 window.Telegram.WebApp.initData 读取
   ↓
6. 将 initData 添加到请求头
   ↓
7. 发送请求到后端
```

### 关键点

1. **每次请求都是最新的**：
   - `getInitData()` 每次都从 `window.Telegram.WebApp.initData` 读取
   - 不缓存 initData 值
   - 确保使用 Telegram 提供的最新认证信息

2. **请求去重不影响 initData**：
   - `dedupe` 只防止同时发起的重复请求
   - 每个实际的网络请求都会获取新的 initData
   - 不会复用旧的 initData

3. **日志输出便于调试**：
   - 前端：显示 initData 的前 50 个字符
   - 后端代理：显示 initData 是否存在
   - 便于排查认证问题

## 验证方法

### 方法 1：使用测试页面

1. 访问 `http://localhost:3000/test-initdata`
2. 点击"测试多次 API 请求"
3. 查看日志输出，确认每次请求都使用了 initData

### 方法 2：查看浏览器控制台

```javascript
// 打开浏览器控制台，查看日志
[API] Using fresh initData: query_id=AAHdF6...
[API Proxy] GET http://... - initData present: query_id=AAHdF6...
```

### 方法 3：监控网络请求

1. 打开浏览器开发者工具 → Network 标签
2. 触发 API 请求
3. 查看请求头中的 `initData` 字段
4. 确认每次请求的 initData 都是最新的

## 常见问题

### Q: 为什么还是收到 401 错误？

A: 可能的原因：
1. Telegram WebApp 未正确初始化
2. initData 本身已过期（Telegram 服务端问题）
3. 后端验证逻辑有问题

**排查步骤**：
```javascript
// 在浏览器控制台执行
console.log(window.Telegram?.WebApp?.initData)
```

### Q: 开发环境如何测试？

A: 开发环境会从 localStorage 读取 initData：
```javascript
localStorage.setItem('telegram_init_data', 'your_test_init_data')
```

### Q: 生产环境如何确保 initData 有效？

A: 
1. 确保应用在 Telegram WebApp 环境中运行
2. 不要缓存 initData
3. 每次请求都从 `window.Telegram.WebApp.initData` 读取

## 性能影响

- ✅ **最小化**：`getInitData()` 只是读取一个字符串，性能开销可忽略
- ✅ **请求去重**：`dedupe` 机制仍然有效，避免重复请求
- ✅ **缓存策略**：GET 请求的响应仍然会被缓存

## 总结

通过这次优化：
1. ✅ 确保每次 API 请求都使用最新的 initData
2. ✅ 避免因 initData 过期导致的认证失败
3. ✅ 添加了详细的日志，便于调试
4. ✅ 创建了测试页面，便于验证

**关键原则**：永远在发起实际网络请求时获取 initData，而不是提前缓存。