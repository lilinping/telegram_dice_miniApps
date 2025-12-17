# 押注信息持久化优化

## 问题描述
在全局模式下，用户押注后点击确认投注，然后切换页面或退出应用，再次进入时之前的押注信息会丢失。

## 原因分析
押注信息（筹码选择、倍数、下注区域）只保存在内存中的 React state，当用户切换页面或退出应用后，这些状态会丢失。

## 解决方案
将用户的押注选择持久化到 `localStorage`，包括：
1. **筹码金额** (`rememberedChip`)
2. **倍投倍数** (`rememberedMultiplier`)
3. **下注区域** (`rememberedBets`)

### 修改文件

#### 1. `src/contexts/GameContext.tsx` (普通模式)
- 初始化时从 localStorage 恢复状态
- 确认下注成功后保存到 localStorage
- 清空下注时同时清除 localStorage

#### 2. `src/app/global-game/page.tsx` (全局模式)
- 初始化时从 localStorage 恢复状态
- 确认下注成功后保存到 localStorage
- 清空下注时同时清除 localStorage

### localStorage 键名
- 普通模式：
  - `dice_remembered_chip`
  - `dice_remembered_multiplier`
  - `dice_remembered_bets`
  
- 全局模式：
  - `global_dice_remembered_chip`
  - `global_dice_remembered_multiplier`
  - `global_dice_remembered_bets`

## 功能特性
1. ✅ 用户确认下注后，自动保存筹码、倍数和下注区域
2. ✅ 切换页面或退出应用后，再次进入时自动恢复之前的选择
3. ✅ 点击"清空"或"重置"按钮时，清除保存的记忆
4. ✅ 新一期开始时，自动恢复上一期的下注配置
5. ✅ 普通模式和全局模式分别独立保存

## 用户体验提升
- 用户不需要重复选择筹码和倍数
- 下注区域会自动恢复，方便用户继续相同的投注策略
- 即使误关闭应用，也不会丢失投注配置

## 测试建议
1. 在全局模式下选择筹码、倍数并下注
2. 确认下注成功后，切换到其他页面（如钱包、历史记录）
3. 返回全局模式页面，验证筹码、倍数和下注区域是否恢复
4. 退出应用后重新进入，验证配置是否仍然保留
5. 点击"重置"按钮，验证配置是否被清除
