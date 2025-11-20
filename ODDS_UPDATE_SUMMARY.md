# 赔率动态显示更新说明

## 更新内容

已将下注面板的赔率从硬编码改为从后端接口动态获取。

## 修改的文件

### 1. `src/components/game/BetPanel.tsx`

**主要改动：**
- 添加了 `getBetChooseId` 导入，用于将前端 betId 映射到后端 chooseId
- 从 `useGame()` 中获取 `diceOptions`（包含接口返回的赔率数据）
- 新增 `getOdds()` 辅助函数，根据 betId 动态获取赔率
- 移除了所有硬编码的赔率值
- 所有下注选项现在使用 `getOdds(bet.id)` 动态获取赔率

**关键代码：**
```typescript
const { bets, placeBet, diceOptions } = useGame();

// 获取赔率的辅助函数
const getOdds = (betId: string): string => {
  const chooseId = getBetChooseId(betId);
  if (chooseId === null) return '1:1';
  
  const option = diceOptions.get(chooseId);
  if (!option || !option.multi) return '1:1';
  
  // 处理范围赔率（如 "2-4"）
  if (option.multi.includes('-')) {
    return `${option.multi}:1`;
  }
  
  // 处理普通赔率
  return `${option.multi}:1`;
};
```

## 接口数据结构

从 `/dice/display` 接口获取的数据示例：

```json
{
  "code": 200,
  "success": true,
  "data": {
    "1": {
      "id": 1,
      "multi": "61",
      "display": "4"
    },
    "15": {
      "id": 15,
      "multi": "2",
      "display": "大"
    },
    "19": {
      "id": 19,
      "multi": "31",
      "display": "任意三"
    },
    "41": {
      "id": 41,
      "multi": "181",
      "display": "1-1-1"
    },
    "47": {
      "id": 47,
      "multi": "2-4",
      "display": "单骰号1"
    }
  }
}
```

## 赔率映射关系

| 下注类型 | chooseId | multi 值 | 显示赔率 |
|---------|----------|----------|---------|
| 点数4 | 1 | "61" | 61:1 |
| 点数5 | 2 | "31" | 31:1 |
| 大 | 15 | "2" | 2:1 |
| 小 | 16 | "2" | 2:1 |
| 单 | 17 | "2" | 2:1 |
| 双 | 18 | "2" | 2:1 |
| 任意三 | 19 | "31" | 31:1 |
| 对子 | 20-40 | "6" | 6:1 |
| 豹子 | 41-46 | "181" | 181:1 |
| 单骰号 | 47-52 | "2-4" | 2-4:1 |

## 数据流程

1. **初始化**：`GameContext` 在组件挂载时调用 `loadDiceOptions()`
2. **获取数据**：调用 `apiService.getDiceDisplay()` 获取赔率数据
3. **存储数据**：将数据转换为 `Map<number, DiceChooseVO>` 存储在 context 中
4. **使用数据**：`BetPanel` 组件通过 `getOdds()` 函数查询赔率
5. **显示赔率**：`BetCell` 组件根据赔率值自动调整颜色和样式

## 赔率颜色分级

`BetCell` 组件会根据赔率自动应用不同的颜色：

- **特高赔率 (≥180)**：彩虹渐变 + 发光效果
- **高赔率 (≥30)**：金色 + 发光效果
- **中赔率 (≥6)**：黄色
- **低赔率 (<6)**：白色

## 测试验证

可以通过以下命令测试接口：

```bash
node -e "
const API_BASE_URL = 'http://46.250.168.177:8079';
async function test() {
  const response = await fetch(API_BASE_URL + '/dice/display');
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
"
```

## 优势

1. **动态更新**：后端修改赔率后，前端无需修改代码即可生效
2. **数据一致性**：确保前端显示的赔率与后端计算的赔率完全一致
3. **易于维护**：赔率配置集中在后端，便于管理和调整
4. **类型安全**：使用 TypeScript 类型定义确保数据结构正确

## 注意事项

1. 如果接口返回的 `multi` 字段为空或无效，会使用默认值 "1:1"
2. 单骰号的赔率格式为范围（如 "2-4"），表示根据出现次数不同有不同赔率
3. `diceOptions` 在 `GameContext` 初始化时加载，确保在渲染前数据已准备好
