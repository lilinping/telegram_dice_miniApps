# InitData 过期问题完整解决方案

## 问题描述

用户在使用应用时，会收到 "Request auth date has expired" 错误，导致所有 API 请求失败（403 Forbidden）。

## 根本原因

Telegram WebApp 的 `initData` 包含一个时间戳（`auth_date`），后端会验证这个时间戳。如果时间戳过期（通常是 1-24 小时），后端会拒绝请求。

## 完整解决方案

### 1. 每次请求都获取最新 initData

**文件**: `src/lib/api.ts`

**改进**：
```typescript
// ✅ 在每次实际网络请求时获取 initData
await apiCache.dedupe(endpoint, async () => {
  const initData = this.getInitData(); // 每次都获取最新值
  // 使用 initData 发送请求
});
```

**关键点**：
- 不在 dedupe 外部缓存 initData
- 每次网络请求都调用 `getInitData()`
- 从 `window.Telegram.WebApp.initData` 实时读取

### 2. 增强 initData 获取逻辑

**改进**：
```typescript
private getInitData(): string {
  // 1. 调用 ready() 确保 WebApp 已初始化
  if (window.Telegram?.WebApp?.ready) {
    window.Telegram.WebApp.ready();
  }
  
  // 2. 获取最新的 initData
  const initData = window.Telegram.WebApp.initData;
  
  // 3. 解析并检查时间戳
  const params = new URLSearchParams(initData);
  const authDate = params.get('auth_date');
  const ageMinutes = calculateAge(authDate);
  
  // 4. 如果超过 1 小时，发出警告
  if (ageMinutes > 60) {
    console.warn(`InitData is ${ageMinutes} minutes old`);
  }
  
  return initData;
}
```

### 3. 错误处理和用户提示

**文件**: `src/components/InitDataExpiredHandler.tsx`

**功能**：
- 监听 `initdata-expired` 事件
- 显示友好的过期提示
- 提供重新加载按钮

**触发机制**：
```typescript
// 在 API 请求失败时触发
if (response.status === 401 || response.status === 403) {
  if (errorText.includes('expired')) {
    window.dispatchEvent(new CustomEvent('initdata-expired', {
      detail: { message: 'Session expired' }
    }));
  }
}
```

### 4. 全局集成

**文件**: `src/app/layout.tsx`

```typescript
<InitDataExpiredHandler />
```

添加到根布局，全局监听过期事件。

## 工作流程

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
6. 检查 auth_date 时间戳
   ↓
7. 如果过期，记录警告
   ↓
8. 发送请求到后端
   ↓
9. 如果后端返回 401/403
   ↓
10. 触发 initdata-expired 事件
   ↓
11. 显示过期提示
   ↓
12. 用户点击重新加载
```

## 为什么 initData 会过期？

### Telegram 的安全机制

1. **时间戳验证**：
   - initData 包含 `auth_date` 字段
   - 后端验证时间戳是否在有效期内
   - 防止重放攻击

2. **有效期**：
   - 通常为 1-24 小时
   - 具体时长由后端配置决定
   - 过期后必须重新获取

3. **为什么不能刷新**：
   - initData 由 Telegram 服务器生成
   - 前端无法自行刷新
   - 必须重新打开 WebApp

## 最佳实践

### 1. 前端处理

```typescript
// ✅ 正确：每次请求都获取
const initData = this.getInitData();

// ❌ 错误：缓存 initData
private cachedInitData = '';
```

### 2. 用户体验

- ✅ 显示友好的过期提示
- ✅ 提供明确的操作指引
- ✅ 自动检测并提示用户
- ❌ 不要静默失败

### 3. 调试和监控

```typescript
// 记录 initData 年龄
console.log(`InitData age: ${ageMinutes} minutes`);

// 警告即将过期
if (ageMinutes > 60) {
  console.warn('InitData may expire soon');
}
```

## 测试方法

### 1. 使用测试页面

访问 `/test-initdata` 页面：
- 检查当前 initData
- 测试多次请求
- 查看日志输出

### 2. 模拟过期

```javascript
// 在浏览器控制台
// 1. 获取当前 initData
const initData = window.Telegram.WebApp.initData;

// 2. 解析参数
const params = new URLSearchParams(initData);

// 3. 修改 auth_date 为过去的时间
params.set('auth_date', '1000000000'); // 2001年

// 4. 存储到 localStorage（开发环境）
localStorage.setItem('telegram_init_data', params.toString());

// 5. 刷新页面测试
```

### 3. 查看日志

```
[API] Using fresh initData (length: 245)
[API] InitData age: 5 minutes
[API Proxy] GET http://... - initData present: query_id=AAHdF6...
```

## 常见问题

### Q: 为什么还是收到过期错误？

A: 可能的原因：
1. Telegram WebApp 本身的 initData 已过期
2. 用户长时间未关闭应用
3. 后端的过期时间设置太短

**解决方案**：
- 提示用户重新打开应用
- 调整后端的过期时间配置

### Q: 如何延长 initData 有效期？

A: 
- 前端无法延长
- 需要在后端配置
- 或者让用户定期重新打开应用

### Q: 开发环境如何测试？

A:
```javascript
// 使用有效的 initData
localStorage.setItem('telegram_init_data', 'your_valid_init_data');
```

## 监控和告警

### 前端监控

```typescript
// 统计过期错误
window.addEventListener('initdata-expired', () => {
  // 发送到分析服务
  analytics.track('initdata_expired');
});
```

### 后端监控

- 记录 401/403 错误率
- 监控 auth_date 分布
- 设置告警阈值

## 总结

通过这套完整的解决方案：

1. ✅ **每次请求都获取最新 initData**
2. ✅ **检测并记录 initData 年龄**
3. ✅ **友好的过期提示**
4. ✅ **全局错误处理**
5. ✅ **详细的日志输出**

**关键原则**：
- 永远不缓存 initData
- 在发起请求时实时获取
- 提供清晰的用户反馈
- 记录详细的调试信息