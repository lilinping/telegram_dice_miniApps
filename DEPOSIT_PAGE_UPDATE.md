# 充值页面优化和API对接

## 更新内容

1. **优化选中效果** - 快捷金额按钮选中时更加明显
2. **对接充值API** - 使用真实后端接口进行充值
3. **优化用户体验** - 充值成功后显示友好提示

## 主要改进

### 1. 选中效果优化

**之前的问题**:
- 选中的按钮不够明显
- 用户难以区分哪个金额被选中

**现在的实现**:
```typescript
className={cn(
  'h-14 rounded-lg text-base font-semibold transition-all relative',
  amount === value && !customAmount
    ? 'bg-gradient-to-br from-primary-gold to-primary-dark-gold text-bg-darkest border-2 border-primary-gold shadow-gold'
    : 'bg-bg-medium text-text-primary border-2 border-border hover:border-primary-gold/50'
)}

{/* 选中指示器 */}
{amount === value && !customAmount && (
  <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center border-2 border-bg-darkest">
    <span className="text-white text-xs">✓</span>
  </div>
)}
```

**视觉效果**:
- ✅ 金色渐变背景
- ✅ 金色边框
- ✅ 金色阴影
- ✅ 右上角绿色勾选标记

### 2. API对接

#### 使用的接口
```typescript
apiService.rechargeAccount(userId: string, money: string)
```

**接口地址**: `GET /account/recharge/{userId}/{money}`

**请求示例**:
```
GET /account/recharge/6784471903/100.00
```

**响应示例**:
```json
{
  "code": 200,
  "success": true,
  "message": null,
  "data": true
}
```

#### 实现代码
```typescript
const handleDeposit = async () => {
  if (amount < 10) {
    alert('最小充值金额为 10 USDT');
    return;
  }

  if (!user) {
    alert('请先登录');
    return;
  }

  setLoading(true);
  try {
    // 调用充值API
    const response = await apiService.rechargeAccount(
      String(user.id),
      amount.toFixed(2)
    );

    if (response.success) {
      setDepositSuccess(true);
      setShowQR(true);
      
      // 刷新余额
      await refreshBalance();
      
      // 3秒后自动跳转到钱包页面
      setTimeout(() => {
        router.push('/wallet');
      }, 3000);
    } else {
      alert('充值失败: ' + (response.message || '未知错误'));
    }
  } catch (error) {
    console.error('充值失败:', error);
    alert('充值失败，请稍后重试');
  } finally {
    setLoading(false);
  }
};
```

### 3. 充值成功提示

**新增功能**:
- ✅ 显示成功图标（绿色勾选）
- ✅ 显示充值金额
- ✅ 自动刷新余额
- ✅ 3秒后自动跳转到钱包页面
- ✅ 提供"立即查看余额"按钮

**UI设计**:
```
┌─────────────────────────────┐
│          ✓ (绿色圆圈)        │
│                             │
│        充值成功！            │
│    您的账户已成功充值         │
│                             │
│  ┌───────────────────────┐  │
│  │   充值金额              │  │
│  │   +100.00 USDT        │  │
│  └───────────────────────┘  │
│                             │
│  余额已更新，3秒后自动跳转... │
│                             │
│  [立即查看余额]              │
└─────────────────────────────┘
```

## 数据流程

```
用户选择金额
    ↓
点击"确认充值"
    ↓
验证金额（≥10 USDT）
    ↓
验证用户登录状态
    ↓
调用 apiService.rechargeAccount()
    ↓
充值成功
    ↓
刷新余额（refreshBalance）
    ↓
显示成功弹窗
    ↓
3秒后自动跳转到钱包页面
```

## 状态管理

```typescript
const [amount, setAmount] = useState<number>(100);           // 充值金额
const [customAmount, setCustomAmount] = useState<string>(''); // 自定义金额
const [selectedMethod, setSelectedMethod] = useState<string>('usdt-trc20'); // 支付方式
const [showQR, setShowQR] = useState(false);                 // 显示弹窗
const [loading, setLoading] = useState(false);               // 加载状态
const [depositSuccess, setDepositSuccess] = useState(false); // 充值成功
```

## 错误处理

### 1. 金额验证
```typescript
if (amount < 10) {
  alert('最小充值金额为 10 USDT');
  return;
}
```

### 2. 用户验证
```typescript
if (!user) {
  alert('请先登录');
  return;
}
```

### 3. API错误
```typescript
if (response.success) {
  // 成功处理
} else {
  alert('充值失败: ' + (response.message || '未知错误'));
}
```

### 4. 网络错误
```typescript
catch (error) {
  console.error('充值失败:', error);
  alert('充值失败，请稍后重试');
}
```

## 用户体验优化

### 1. 按钮状态
- **正常**: 金色渐变背景
- **加载中**: 显示"充值中..."，按钮禁用
- **禁用**: 金额<10时，按钮半透明

### 2. 视觉反馈
- **选中金额**: 金色背景 + 边框 + 阴影 + 勾选标记
- **悬停效果**: 边框变为金色半透明
- **点击效果**: 按钮缩放动画

### 3. 自动化流程
- ✅ 充值成功后自动刷新余额
- ✅ 3秒后自动跳转到钱包页面
- ✅ 提供手动跳转按钮

## 依赖关系

- `useTelegram()` - 获取用户信息
- `useWallet()` - 刷新余额
- `apiService.rechargeAccount()` - 充值接口
- `useRouter()` - 页面跳转

## 测试建议

### 功能测试
- [ ] 测试快捷金额选择
- [ ] 测试自定义金额输入
- [ ] 测试最小金额验证（<10 USDT）
- [ ] 测试充值API调用
- [ ] 测试充值成功流程
- [ ] 测试余额刷新
- [ ] 测试自动跳转

### UI测试
- [ ] 验证选中效果是否明显
- [ ] 验证勾选标记显示正确
- [ ] 验证加载状态显示
- [ ] 验证成功弹窗样式
- [ ] 验证按钮禁用状态

### 错误测试
- [ ] 测试金额<10的提示
- [ ] 测试未登录的提示
- [ ] 测试API失败的处理
- [ ] 测试网络错误的处理

## 对比

### 更新前
- ❌ 选中效果不明显
- ❌ 使用模拟数据
- ❌ 没有真实充值功能
- ❌ 显示假的二维码和地址

### 更新后
- ✅ 选中效果明显（金色背景+勾选标记）
- ✅ 对接真实API
- ✅ 真实充值功能
- ✅ 充值成功提示
- ✅ 自动刷新余额
- ✅ 自动跳转到钱包

## 注意事项

1. **充值金额格式**: 保留两位小数（`amount.toFixed(2)`）
2. **用户ID类型**: 转换为字符串（`String(user.id)`）
3. **余额刷新**: 充值成功后立即调用 `refreshBalance()`
4. **自动跳转**: 使用 `setTimeout` 延迟3秒跳转
5. **错误提示**: 使用 `alert` 显示错误信息（可以后续改为 Toast）

## 总结

充值页面现在已经：
1. ✅ 优化了选中效果，用户体验更好
2. ✅ 对接了真实充值API
3. ✅ 实现了完整的充值流程
4. ✅ 充值成功后自动刷新余额
5. ✅ 提供友好的成功提示和自动跳转

用户现在可以真正进行充值操作，充值后余额会立即更新。
