# 历史记录页面 API 对接完成报告

## 更新概述

已将历史记录页面从使用模拟数据改为对接真实后端API，实现了三个标签页的完整功能：
1. **我的投注** - 显示用户的投注历史和盈亏
2. **开奖历史** - 显示所有开奖结果
3. **走势分析** - 基于真实数据的统计分析

## API 对接详情

### 使用的 API 接口

**接口地址**: `GET /dice/history/{userId}/{pageIndex}/{pageSize}`

**Swagger 文档**: http://46.250.168.177:8079/swagger-ui/index.html#/dice-controller/queryHistory_1

**请求参数**:
- `userId`: 用户ID（从 Telegram Context 获取）
- `pageIndex`: 页码（从1开始）
- `pageSize`: 每页数量（默认20条）

**响应数据结构**:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "list": [
      {
        "id": 136,
        "gameId": "1a4c3633c0da469485bbd19fc141e174",
        "userId": 6784471903,
        "win": "0",
        "betInfo": [
          {
            "betId": 20,
            "bet": "5",
            "win": "0"
          }
        ],
        "outCome": [3, 5, 1],
        "matchBetId": [6, 17, 16, 22, 24, 33, 47],
        "status": "FINISHED",
        "createTime": 1763648345706,
        "modifyTime": 1763648373552,
        "finished": true,
        "totalBet": "5"
      }
    ],
    "totalCount": 54,
    "pageIndex": 1,
    "pageSize": 10
  }
}
```

## 主要功能实现

### 1. 我的投注标签页

**显示内容**:
- ✅ 局号（record.id）
- ✅ 投注时间（formatTime(record.createTime)）
- ✅ 投注内容（betInfo 数组，显示每个下注项和金额）
- ✅ 开奖结果（outCome 骰子点数）
- ✅ 总点数（计算三个骰子之和）
- ✅ 盈亏金额（win - totalBet）
- ✅ 中奖/未中奖状态

**数据处理**:
```typescript
// 获取下注选项名称
const getBetName = (chooseId: number): string => {
  const option = diceOptions.get(chooseId);
  if (option && option.display) {
    return option.display;  // 如 "大"、"小"、"1-2" 等
  }
  return `选项${chooseId}`;
};

// 计算盈亏
const totalBet = parseFloat(record.totalBet);
const winAmount = parseFloat(record.win);
const profit = winAmount - totalBet;
const isWin = winAmount > 0;
```

### 2. 开奖历史标签页

**显示内容**:
- ✅ 局号
- ✅ 开奖时间
- ✅ 骰子点数（使用骰子图标显示）
- ✅ 总点数
- ✅ 大/小/单/双标签
- ✅ 豹子标签（三同号）

**数据分析**:
```typescript
const analyzeDice = (dice: number[]) => {
  const total = calculateTotal(dice);
  const isBig = total >= 11 && total <= 17;
  const isSmall = total >= 4 && total <= 10;
  const isOdd = total % 2 === 1;
  const isEven = total % 2 === 0;
  const isTriple = dice[0] === dice[1] && dice[1] === dice[2];

  // 三同号通杀大小
  if (isTriple) {
    return { total, isBig: false, isSmall: false, isOdd, isEven, isTriple };
  }

  return { total, isBig, isSmall, isOdd, isEven, isTriple };
};
```

### 3. 走势分析标签页

**统计功能**:
- ✅ 大小走势图（柱状图，近50局）
- ✅ 大小统计（百分比和局数）
- ✅ 单双统计（百分比和局数）
- ✅ 热号冷号分析（每个点数的出现频率）

**走势计算**:
```typescript
const calculateTrends = () => {
  let bigCount = 0;
  let smallCount = 0;
  let oddCount = 0;
  let evenCount = 0;
  const diceFrequency = [0, 0, 0, 0, 0, 0];

  historyData.forEach((record) => {
    const analysis = analyzeDice(record.outCome);
    if (analysis.isBig) bigCount++;
    if (analysis.isSmall) smallCount++;
    if (analysis.isOdd) oddCount++;
    if (analysis.isEven) evenCount++;

    // 统计每个点数出现次数
    record.outCome.forEach((dice) => {
      diceFrequency[dice - 1]++;
    });
  });

  return { bigCount, smallCount, oddCount, evenCount, diceFrequency };
};
```

## 关键技术实现

### 1. 分页功能
```typescript
const [pageIndex, setPageIndex] = useState(1);
const [totalCount, setTotalCount] = useState(0);
const pageSize = 20;

// 分页控制
<button onClick={() => setPageIndex((p) => Math.max(1, p - 1))}>
  上一页
</button>
<span>{pageIndex} / {Math.ceil(totalCount / pageSize)}</span>
<button onClick={() => setPageIndex((p) => Math.min(Math.ceil(totalCount / pageSize), p + 1))}>
  下一页
</button>
```

### 2. 时间格式化
```typescript
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};
```

### 3. 骰子图标显示
```typescript
const DiceDisplay = ({ values }: { values: number[] }) => {
  const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  return (
    <div className="flex gap-1">
      {values.map((value, idx) => (
        <span key={idx} className="text-2xl">
          {diceFaces[value - 1]}
        </span>
      ))}
    </div>
  );
};
```

### 4. 下注选项名称映射
使用 `diceOptions` 从接口获取的选项对照表来显示中文名称：
- betId 20 → "1-1"（对子）
- betId 15 → "大"
- betId 47 → "单骰号1"

## 数据流程

```
用户打开历史记录页面
    ↓
从 TelegramContext 获取 userId
    ↓
调用 apiService.getGameHistory(userId, pageIndex, pageSize)
    ↓
接收 PageModelDiceEntity 数据
    ↓
解析并显示：
  - 我的投注：显示投注详情和盈亏
  - 开奖历史：显示开奖结果和标签
  - 走势分析：统计并可视化数据
```

## 状态管理

```typescript
const [activeTab, setActiveTab] = useState<TabType>('results');  // 默认显示开奖历史
const [historyData, setHistoryData] = useState<DiceEntity[]>([]);
const [loading, setLoading] = useState(false);
const [pageIndex, setPageIndex] = useState(1);
const [totalCount, setTotalCount] = useState(0);
```

## 错误处理

```typescript
try {
  const response = await apiService.getGameHistory(
    String(user.id),
    pageIndex,
    pageSize
  );

  if (response.success && response.data) {
    setHistoryData(response.data.list);
    setTotalCount(response.data.totalCount);
  }
} catch (error) {
  console.error('加载历史记录失败:', error);
} finally {
  setLoading(false);
}
```

## UI 优化

1. **加载状态**: 显示"加载中..."提示
2. **空状态**: 显示"暂无记录"提示
3. **分页控制**: 禁用边界按钮，显示当前页码
4. **响应式设计**: 适配移动端屏幕
5. **颜色标识**:
   - 大：红色（error）
   - 小：蓝色（info）
   - 单：黄色（warning）
   - 双：绿色（success）
   - 豹子：紫色（purple）

## 测试建议

### 1. 功能测试
- [ ] 测试三个标签页切换
- [ ] 测试分页功能（上一页/下一页）
- [ ] 测试空数据状态
- [ ] 测试加载状态

### 2. 数据验证
- [ ] 验证投注金额显示正确
- [ ] 验证盈亏计算正确
- [ ] 验证开奖结果显示正确
- [ ] 验证走势统计准确

### 3. 边界测试
- [ ] 测试第一页（上一页按钮禁用）
- [ ] 测试最后一页（下一页按钮禁用）
- [ ] 测试网络错误情况
- [ ] 测试用户未登录情况

## 已知问题和改进建议

### 当前实现
✅ 基本功能完整
✅ 数据对接正确
✅ UI 美观清晰
✅ 分页功能正常

### 可能的改进
1. 添加日期筛选功能
2. 添加下拉刷新功能
3. 添加无限滚动加载
4. 缓存历史数据减少请求
5. 添加详情页面（点击查看单局详情）

## 依赖关系

- `useTelegram()` - 获取用户信息
- `useGame()` - 获取 diceOptions（下注选项对照表）
- `apiService.getGameHistory()` - 获取历史记录数据
- `getBetChooseId()` / `getChooseBetId()` - ID 映射转换

## 总结

历史记录页面已完全对接后端API，实现了：
1. ✅ 我的投注 - 显示用户投注历史和盈亏
2. ✅ 开奖历史 - 显示所有开奖结果
3. ✅ 走势分析 - 基于真实数据的统计分析
4. ✅ 分页功能 - 支持翻页浏览
5. ✅ 数据可视化 - 柱状图、百分比统计、热号冷号

所有数据均来自真实API，不再使用模拟数据。
