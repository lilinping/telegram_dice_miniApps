# 提币功能测试指南

## 已完成的功能

### 1. 地址管理
- ✅ 获取地址列表 (`GET /address/list/{userId}`)
- ✅ 添加新地址 (`POST /address/create/{userId}/{address}`)
- ✅ 删除地址 (`DELETE /address/delete/{id}/{userId}`)
- ✅ 设置默认地址 (`POST /address/set/default/{id}/{userId}`)
- ✅ 自动选择默认地址

### 2. 提币功能
- ✅ 查询账户余额（从 WalletContext）
- ✅ 提币金额输入和验证
- ✅ 手续费计算（小额 5 USDT，大额 2%）
- ✅ 提币申请提交 (`POST /account/take/usdt/{userId}/{money}`)
- ✅ 错误处理和加载状态

### 3. UI 功能
- ✅ 地址列表展示
- ✅ 地址选择（单选）
- ✅ 添加地址弹窗
- ✅ 提币确认弹窗
- ✅ 错误提示
- ✅ 加载状态

## 测试步骤

### 测试地址
使用提供的测试钱包地址：
```
TMj29MnfCF8zjpjEnbUfiXwVW5onRFoXjR
```

### 1. 测试添加地址

```bash
# 使用 curl 测试添加地址
curl -X POST "http://46.250.168.177:8079/address/create/{你的userId}/TMj29MnfCF8zjpjEnbUfiXwVW5onRFoXjR"
```

### 2. 测试获取地址列表

```bash
# 获取地址列表
curl "http://46.250.168.177:8079/address/list/{你的userId}"
```

### 3. 测试提币

```bash
# 提币 100 USDT
curl -X POST "http://46.250.168.177:8079/account/take/usdt/{你的userId}/100"
```

### 4. 测试查看提币记录

```bash
# 查看提币历史（第1页，每页10条）
curl "http://46.250.168.177:8079/account/take/history/usdt/{你的userId}/1/10"
```

## 页面测试流程

1. **打开提币页面**
   - 访问 `/withdraw`
   - 检查是否正确显示余额

2. **添加提币地址**
   - 点击"添加新地址"
   - 输入测试地址：`TMj29MnfCF8zjpjEnbUfiXwVW5onRFoXjR`
   - 点击"确认添加"
   - 验证地址是否添加成功

3. **选择地址**
   - 点击地址卡片选择
   - 验证选中状态

4. **输入提币金额**
   - 输入金额（最小 50 USDT）
   - 检查手续费计算是否正确
   - 检查实际到账金额

5. **提交提币**
   - 点击"确认提现"
   - 检查确认弹窗信息
   - 点击"确认提现"提交
   - 验证是否成功

6. **测试地址管理**
   - 测试设置默认地址
   - 测试删除地址

## 手续费规则

- 小额（< 1000 USDT）：固定 5 USDT
- 大额（≥ 1000 USDT）：2%

## 提币限制

- 最小提币金额：50 USDT
- 每日提币次数：3次
- 小额自动审核：2小时内到账
- 大额人工审核：24小时内到账

## 环境变量

确保在 `.env.local` 中配置：

```env
NEXT_PUBLIC_API_BASE_URL=http://46.250.168.177:8079
```

## 注意事项

1. **地址验证**：系统会验证 TRON 地址格式（T开头，34位）
2. **余额检查**：提币金额不能超过可用余额
3. **网络类型**：目前仅支持 TRC20 网络
4. **错误处理**：所有 API 错误都会显示在页面顶部

## API 响应格式

所有接口返回格式：
```json
{
  "code": 200,
  "success": true,
  "message": "操作成功",
  "data": { ... }
}
```

## 下一步优化建议

1. 添加地址备注功能
2. 添加提币记录页面
3. 添加提币状态查询
4. 添加二次确认（短信/邮箱验证）
5. 添加提币限额提示
6. 优化错误提示文案
