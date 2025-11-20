# 游戏规则页面赔率动态化更新

## 更新内容

将游戏规则页面的所有硬编码赔率改为从后端接口动态获取。

## 修改的文件

### `src/app/rules/page.tsx`

**主要改动：**

1. **添加依赖导入**
   ```typescript
   import { useEffect, useState } from 'react';
   import { useGame } from '@/contexts/GameContext';
   import { getBetChooseId } from '@/lib/betMapping';
   ```

2. **重构数据结构**
   - 将 `betTypeDetails` 改为 `betTypeDetailsTemplate`
   - 移除硬编码的 `odds` 和 `example` 字段
   - 添加 `betId`、`exampleAmount`、`exampleResult` 字段

3. **添加辅助函数**
   ```typescript
   // 获取赔率
   const getOdds = (betId: string): string => {
     const chooseId = getBetChooseId(betId);
     if (chooseId === null) return '1:1';
     
     const option = diceOptions.get(chooseId);
     if (!option || !option.multi) return '1:1';
     
     return `${option.multi}:1`;
   };

   // 计算示例收益
   const calculateWinAmount = (betId: string, betAmount: number): number => {
     const chooseId = getBetChooseId(betId);
     if (chooseId === null) return betAmount * 2;
     
     const option = diceOptions.get(chooseId);
     if (!option || !option.multi) return betAmount * 2;
     
     // 处理范围赔率（如 "2-4"）
     if (option.multi.includes('-')) {
       const [min, max] = option.multi.split('-').map(Number);
       const avgMulti = (min + max) / 2;
       return betAmount * (avgMulti + 1);
     }
     
     const multi = parseFloat(option.multi);
     return betAmount * (multi + 1);
   };
   ```

4. **动态生成数据**
   ```typescript
   const betTypeDetails = betTypeDetailsTemplate.map(category => ({
     ...category,
     types: category.types.map(type => ({
       ...type,
       odds: getOdds(type.betId),
       example: `下注${type.exampleAmount} USDT，开出${type.exampleResult}，获得${calculateWinAmount(type.betId, type.exampleAmount).toFixed(0)} USDT`,
     })),
   }));
   ```

5. **更新赔率表格**
   - 所有表格中的赔率现在使用 `getOdds()` 函数动态获取

## 更新前后对比

### 更新前（硬编码）
```typescript
{
  name: '大',
  desc: '总点数11-17（三同号除外）',
  odds: '1:1',  // 硬编码
  example: '下注100 USDT，开出15点（大），获得200 USDT',  // 硬编码
}
```

### 更新后（动态获取）
```typescript
{
  name: '大',
  betId: 'big',  // 用于查询赔率
  desc: '总点数11-17（三同号除外）',
  exampleAmount: 100,
  exampleResult: '15点（大）',
}

// 在组件中动态生成
odds: getOdds('big'),  // 从接口获取
example: `下注100 USDT，开出15点（大），获得${calculateWinAmount('big', 100)} USDT`,
```

## 数据映射关系

| 投注类型 | betId | chooseId | 接口返回的 multi |
|---------|-------|----------|-----------------|
| 大 | big | 15 | "2" |
| 小 | small | 16 | "2" |
| 单 | odd | 17 | "2" |
| 双 | even | 18 | "2" |
| 点数4 | num-4 | 1 | "61" |
| 点数5 | num-5 | 2 | "31" |
| 任意三同号 | any-triple | 19 | "31" |
| 指定三同号 | triple-6 | 46 | "181" |
| 两骰组合 | pair-1-2 | 21 | "6" |
| 单骰号 | single-4 | 50 | "2-4" |

## 示例收益计算逻辑

### 普通赔率
```typescript
// 例如：大/小/单/双，赔率 2:1
下注金额: 100 USDT
赔率: 2:1
收益: 100 × (2 + 1) = 300 USDT
```

### 范围赔率（单骰号）
```typescript
// 例如：单骰号，赔率 2-4:1
下注金额: 100 USDT
赔率范围: 2-4:1
平均赔率: (2 + 4) / 2 = 3
示例收益: 100 × (3 + 1) = 400 USDT
```

## 页面更新的部分

### 1. 投注类型详解区域
- ✅ 基础投注（大/小/单/双）
- ✅ 点数投注（4-17点）
- ✅ 特殊投注（任意三同号、指定三同号）
- ✅ 两骰组合
- ✅ 单骰号

### 2. 完整赔率表
- ✅ 大/小/单/双赔率
- ✅ 点数4/17赔率
- ✅ 点数5/16赔率
- ✅ 任意三同号赔率
- ✅ 指定三同号赔率
- ✅ 两骰组合赔率
- ✅ 单骰号赔率

## 优势

1. **数据一致性**：规则页面显示的赔率与实际游戏中的赔率完全一致
2. **易于维护**：后端修改赔率后，规则页面自动更新，无需修改前端代码
3. **动态示例**：示例收益根据实际赔率动态计算，更加准确
4. **类型安全**：使用 TypeScript 确保数据结构正确

## 测试建议

1. 访问规则页面，检查所有赔率是否正确显示
2. 对比游戏页面和规则页面的赔率，确保一致
3. 检查示例收益计算是否正确
4. 测试在接口数据未加载时的降级处理（默认显示 1:1）

## 注意事项

1. 规则页面依赖 `GameContext`，确保在 `GameProvider` 包裹下使用
2. 如果 `diceOptions` 为空或未加载，会使用默认赔率 "1:1"
3. 单骰号的赔率为范围（如 "2-4:1"），示例中使用平均值计算
