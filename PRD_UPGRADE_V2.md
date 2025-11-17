# 骰宝游戏产品需求升级文档（PRD Upgrade V2.0）

版本：V2.0
作者：产品升级团队
日期：2025-11-13
基于：骰宝前端_PRD_V2.md + 现有项目分析

---

## 一、产品升级概述

本次升级基于现有骰宝 Telegram Mini App 项目，结合 PRD V2.0 文档要求，在**保持现有投注区布局不变**的前提下，补充和完善缺失功能，提升用户体验和游戏完整性。

### 升级原则
1. **保留现有投注布局**：不修改 BetPanel 组件的视觉和交互设计
2. **补充缺失功能**：增强动画、音效、倍投等核心体验
3. **优化性能**：实现 GPU 加速和流畅动画
4. **符合 PRD V2.0**：达到 95% 以上的 UI 还原度

---

## 二、现有功能清单

### ✅ 已实现功能
1. **游戏主界面** (`src/app/game/page.tsx`)
   - 顶部栏：局号、倒计时、余额显示、充值按钮
   - 3D 骰盅展示区（280px）
   - 投注面板（自适应缩放）
   - 筹码选择器（固定底部）
   - 底部操作栏：清空、确认下注、走势按钮

2. **投注面板** (`src/components/game/BetPanel.tsx`)
   - 完整骰宝投注类型布局
   - 大/小/单/双（1:1 赔率）
   - 点数 4-17（6:1~60:1 赔率）
   - 两骰组合 15 种（6:1 赔率，带骰子图案）
   - 单骰号 1-6（1/2/3:1 赔率，带骰子图案）
   - 视觉展示：对子、三同号骰子图案
   - 下注金额实时显示

3. **组件库**
   - DiceIcon：骰子点阵渲染（纯 CSS）
   - ChipSelector：筹码选择器
   - CountdownTimer：倒计时组件
   - BetCell：投注格组件

4. **其他页面**
   - 钱包页面、充值/提现、历史记录、规则说明
   - VIP、邀请、排行榜、个人资料

### ❌ 缺失/待完善功能（基于 PRD V2.0）

---

## 三、待补充功能详细需求

### 🎯 P0 优先级（核心体验，必须实现）

#### 1. 骰子滚动动画增强
**当前状态**：有 DiceAnimation 组件但未完全实现 3D 滚动效果

**升级需求**：
- **3D 骰子模型**：使用 CSS 3D Transform 或 Canvas/WebGL 实现
- **滚动时长**：1.5 秒流畅旋转
- **落地效果**：骰子停止时有弹跳缓动效果
- **触发时机**：
  - 倒计时结束后自动触发
  - 显示全屏遮罩（已有，需确保联动）
  - 滚动结束后闪现结果

**技术实现**：
```typescript
// 参考 PRD 中 CSS 骰子实现
// 使用 transform: rotateX() rotateY() 实现 3D 旋转
// 使用 requestAnimationFrame 控制动画节奏
// GPU 加速：transform 和 opacity 属性
```

**验收标准**：
- 连续滚动流畅，无明显卡顿（60fps）
- 3D 视觉效果逼真
- 动画结束后准确显示开奖结果

---

#### 2. 音效系统集成
**当前状态**：无音效

**升级需求**：
- **开盘提示音**：倒计时结束/开始滚动时播放"叮咚"声
- **骰子滚动声**：1.5 秒滚动期间循环播放骰子碰撞声
- **骰子落地音**：动画结束时播放"咚"声
- **中奖音效**：
  - 小额中奖：清脆钱币声
  - 大额中奖：欢快庆祝音效 + 粒子特效
- **点击音效**：
  - 投注格点击：清脆"啵"声
  - 筹码选择：金属碰撞声
  - 按钮点击：轻盈反馈音

**技术实现**：
```typescript
// 使用 Web Audio API (AudioContext)
// 按需加载音效文件（避免首屏卡顿）
// 支持音效开关设置（用户偏好）
```

**文件组织**：
```
public/sounds/
├── dice-roll.mp3      # 骰子滚动声
├── dice-land.mp3      # 落地声
├── bet-click.mp3      # 下注点击
├── chip-select.mp3    # 筹码选择
├── win-small.mp3      # 小额中奖
├── win-big.mp3        # 大额中奖
└── round-start.mp3    # 开盘提示
```

**验收标准**：
- 音效触发时机正确
- 不卡音、不重叠
- 支持静音切换

---

#### 3. 中奖动画与反馈
**当前状态**：有中奖弹窗但缺少动态效果

**升级需求**：
- **中奖格闪烁**：
  - 金色高亮边框闪烁（0.5 秒 × 3 次）
  - 使用 `@keyframes flash` 动画
- **数字翻转显示**：
  - 奖金金额从 0 滚动到实际数值
  - 使用 CountUp 动画效果
- **粒子特效**（大额中奖 ≥1000 USDT）：
  - 金币/星星粒子从中奖格飞出
  - 使用 Canvas 或 CSS Animation
- **震动反馈**（移动端）：
  - Telegram WebApp 震动 API
  - 中奖时短震动（200ms）

**技术实现**：
```css
/* 中奖闪烁动画 */
@keyframes flash {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  }
  50% {
    opacity: 0.3;
    box-shadow: 0 0 40px rgba(255, 215, 0, 1);
  }
}

/* 数字滚动 */
@keyframes number-roll {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

**验收标准**：
- 中奖格准确闪烁 3 次
- 奖金数字滚动流畅
- 大额中奖有粒子特效
- 移动端震动反馈正常

---

#### 4. 筹码飞入动画
**当前状态**：筹码选择器存在，但投注时缺少飞入动画

**升级需求**：
- **点击投注格**：
  - 筹码图标从底部筹码选择器"飞"到投注格
  - 使用 `transform: translate` + `opacity` 过渡
  - 动画时长：300ms
  - 缓动函数：`cubic-bezier(0.34, 1.56, 0.64, 1)` (弹性效果)
- **筹码叠加显示**：
  - 重复点击同一格，筹码图标堆叠
  - 最多显示 3 个筹码图标（避免拥挤）
  - 超过 3 个时只显示数字金额

**技术实现**：
```typescript
// 在 BetCell 组件中添加动画状态
const [isAnimating, setIsAnimating] = useState(false);

const handleBetClick = () => {
  setIsAnimating(true);
  placeBet(id);
  setTimeout(() => setIsAnimating(false), 300);
};
```

**验收标准**：
- 筹码飞入动画流畅
- 叠加显示清晰
- 触摸反馈灵敏

---

#### 5. 倍投功能
**当前状态**：无倍投功能

**升级需求**：
- **倍投选择器**（在筹码选择器上方）：
  - 选项：1x（默认）、2x、5x、10x、20x
  - 金色标签样式 + 动态浮动效果
  - 选中时高亮显示
- **倍投逻辑**：
  - 选择倍投后，所有下注金额自动乘以倍数
  - 下注金额实时更新显示
  - 倍投标签显示当前倍数（例如：10x）
- **倍投历史**：
  - 记录上一局的倍投设置
  - 支持"重复上局下注"按钮

**界面位置**：
```
┌─────────────────────────┐
│   倍投: [1x] 2x 5x 10x  │ ← 新增倍投选择器
├─────────────────────────┤
│  筹码: 1 5 10 50 100    │ ← 现有筹码选择器
└─────────────────────────┘
```

**技术实现**：
```typescript
// GameContext 中添加倍投状态
const [multiplier, setMultiplier] = useState(1);
const [lastBets, setLastBets] = useState<Record<string, number>>({});

// 计算实际下注金额
const actualBetAmount = selectedChip * multiplier;
```

**验收标准**：
- 倍投选择器界面清晰
- 金额计算准确
- 支持重复上局下注

---

### 🎯 P1 优先级（体验优化，重要功能）

#### 6. 撤销上一步功能
**当前状态**：只有"清空全部"按钮

**升级需求**：
- **撤销按钮**（在底部操作栏）：
  - 图标：↶ 回退箭头
  - 功能：撤销最后一次下注操作
  - 支持连续撤销（记录下注历史栈）
  - 禁用状态：无下注时置灰
- **下注历史栈**：
  - 记录每次下注的 `betId` 和 `amount`
  - 撤销时从栈顶弹出并恢复状态

**界面布局**：
```
┌──────────┬──────────────────┬──────────┬──────────┐
│   清空   │    确认下注      │   撤销   │   走势   │
│          │   $125.00        │    ↶    │          │
└──────────┴──────────────────┴──────────┴──────────┘
```

**技术实现**：
```typescript
// 下注历史栈
const [betHistory, setBetHistory] = useState<Array<{id: string, amount: number}>>([]);

const undoLastBet = () => {
  if (betHistory.length === 0) return;
  const lastBet = betHistory.pop();
  // 恢复状态...
};
```

**验收标准**：
- 撤销功能正常工作
- 支持连续撤销
- 界面反馈清晰

---

#### 7. 下注限额提示
**当前状态**：无限额提示

**升级需求**：
- **最小/最大限额显示**：
  - 在投注面板底部显示
  - 文案："单注限额: $1 - $10,000"
  - 样式：小字体、半透明
- **超限提示**：
  - 下注金额 < 最小限额：弹出 Toast "下注金额不足最小限额 $1"
  - 下注金额 > 最大限额：弹出 Toast "超过单注最大限额 $10,000"
  - 总下注 > 余额：弹出 Toast "余额不足，请充值"
- **VIP 用户特权**：
  - VIP 用户限额更高（在 VIP 页面说明）

**技术实现**：
```typescript
const BET_LIMITS = {
  min: 1,
  max: 10000,
  vipMax: 50000,
};

const validateBet = (amount: number) => {
  if (amount < BET_LIMITS.min) {
    showToast(`下注金额不足最小限额 $${BET_LIMITS.min}`);
    return false;
  }
  // ...
};
```

**验收标准**：
- 限额显示清晰
- 超限提示准确
- VIP 特权生效

---

#### 8. 骰子点数组合赔率优化显示
**当前状态**：赔率以文本形式显示（如 "6:1"）

**升级需求**：
- **赔率颜色分级**：
  - 低赔率（1:1）：白色
  - 中赔率（6:1~18:1）：黄色
  - 高赔率（30:1~60:1）：金色 + 发光效果
  - 特高赔率（180:1）：彩虹渐变 + 闪烁
- **Hover 提示**：
  - 鼠标悬停/长按显示赔率说明
  - 例如："点数 4：赔率 60:1，中奖可得 $6000"
- **动态赔率**（未来扩展）：
  - 预留接口支持后端动态调整赔率

**技术实现**：
```typescript
const getOddsColor = (odds: string) => {
  const ratio = parseFloat(odds.split(':')[0]);
  if (ratio >= 180) return 'rainbow-gradient';
  if (ratio >= 30) return 'gold-glow';
  if (ratio >= 6) return 'yellow';
  return 'white';
};
```

**验收标准**：
- 赔率颜色正确
- Hover 提示显示
- 视觉层次分明

---

### 🎯 P2 优先级（锦上添花，可选功能）

#### 9. 局号二维码分享
**当前状态**：有分享按钮但未实现

**升级需求**：
- **分享功能**：
  - 生成当前局号的分享链接
  - 调用 Telegram WebApp 分享 API
  - 分享内容："我在玩骰宝夺宝，快来一起玩！局号 #123456"
- **二维码生成**：
  - 在中奖弹窗中显示二维码
  - 扫码可直接打开 Mini App

**技术实现**：
```typescript
// 使用 Telegram WebApp API
window.Telegram.WebApp.openTelegramLink(
  `https://t.me/share/url?url=${shareUrl}&text=${shareText}`
);
```

**验收标准**：
- 分享链接正确
- 二维码可扫描
- 分享文案友好

---

#### 10. 开奖历史趋势图
**当前状态**：有历史页面但无趋势图

**升级需求**：
- **走势图表**：
  - 显示最近 50 局的大/小/单/双趋势
  - 使用 Canvas 绘制简单条形图
  - 支持滑动查看更多历史
- **热点分析**：
  - 标注最近 10 局最热门的投注项
  - 显示出现频率

**技术实现**：
```typescript
// 使用 Recharts 或 Canvas API
import { LineChart, Line } from 'recharts';

const TrendChart = ({ data }) => (
  <LineChart data={data}>
    <Line type="monotone" dataKey="big" stroke="#FFD700" />
    <Line type="monotone" dataKey="small" stroke="#C0C0C0" />
  </LineChart>
);
```

**验收标准**：
- 趋势图显示正确
- 滑动流畅
- 数据实时更新

---

#### 11. 震动反馈增强（Telegram WebApp API）
**当前状态**：无震动反馈

**升级需求**：
- **触觉反馈场景**：
  - 下注点击：轻微震动（50ms）
  - 确认下注：中等震动（100ms）
  - 中奖：强烈震动（200ms，3 次）
  - 开奖滚动：节奏震动（随骰子滚动）
- **用户设置**：
  - 支持关闭震动反馈

**技术实现**：
```typescript
// Telegram WebApp Haptic Feedback
window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
```

**验收标准**：
- 震动时机准确
- 强度适中
- 支持关闭

---

#### 12. 粒子特效系统
**当前状态**：无粒子特效

**升级需求**：
- **中奖粒子**：
  - 金币粒子从中奖格飞向余额区
  - 大额中奖（≥1000 USDT）触发
  - 粒子数量：20-50 个
- **筹码飞入粒子**：
  - 下注时筹码带光尾粒子
- **开奖礼花**：
  - 特高赔率中奖时（≥180:1）全屏礼花

**技术实现**：
```typescript
// 使用 Canvas 或 CSS Animation
import Particles from 'react-tsparticles';

const WinParticles = () => (
  <Particles
    options={{
      particles: {
        number: { value: 50 },
        color: { value: '#FFD700' },
        move: { enable: true, speed: 6 },
      }
    }}
  />
);
```

**验收标准**：
- 粒子效果流畅
- 不影响性能
- 视觉效果华丽

---

## 四、性能优化要求

### GPU 加速
- ✅ **使用 CSS Transform**：代替 `top/left` 定位
- ✅ **使用 Opacity**：代替 `visibility/display` 切换
- ✅ **启用硬件加速**：`transform: translateZ(0)` 或 `will-change: transform`

### 动画优化
- ✅ **requestAnimationFrame**：控制骰子滚动节奏
- ✅ **CSS Animations**：使用 GPU 加速的 `@keyframes`
- ✅ **防抖/节流**：快速点击时避免重复触发

### 资源加载
- ✅ **按需加载音效**：首屏不加载音频文件
- ✅ **图片懒加载**：历史记录页面的骰子图标
- ✅ **代码分割**：使用 Next.js 动态导入 `dynamic()`

---

## 五、测试与验收标准

### 功能测试
| 模块 | 验收要点 | 优先级 |
|------|---------|-------|
| 骰子动画 | 连续滚动流畅，无明显卡顿（60fps） | P0 |
| 音效系统 | 触发时机正确，不卡音 | P0 |
| 中奖动画 | 闪烁 3 次、数字滚动、粒子特效 | P0 |
| 筹码飞入 | 动画流畅、叠加显示清晰 | P0 |
| 倍投功能 | 金额计算准确、界面清晰 | P0 |
| 撤销功能 | 连续撤销正常、禁用状态正确 | P1 |
| 限额提示 | 超限提示准确、VIP 特权生效 | P1 |
| 赔率显示 | 颜色分级正确、Hover 提示显示 | P1 |
| 分享功能 | 链接正确、二维码可扫描 | P2 |
| 趋势图 | 数据准确、滑动流畅 | P2 |
| 震动反馈 | 时机准确、强度适中 | P2 |
| 粒子特效 | 效果流畅、不影响性能 | P2 |

### 性能测试
- **首屏加载时间**：< 2 秒
- **动画帧率**：≥ 60fps（Chrome DevTools Performance）
- **内存占用**：< 100MB（长时间游戏无内存泄漏）
- **网络请求**：音效文件总大小 < 500KB

### UI 还原度测试
- **对比 PRD V2.0 图片**：≥ 95% 还原度
- **投注区布局**：与现有设计一致（不修改）
- **色彩方案**：深红 (#6b1b1b)、金色 (#f5d76e)、米白 (#faf3e0)
- **字体**：Noto Sans SC（已使用 font-sans）

---

## 六、技术实现建议

### 目录结构（新增文件）
```
src/
├── components/
│   └── game/
│       ├── MultiplierSelector.tsx     # 倍投选择器（新增）
│       ├── ParticleEffect.tsx         # 粒子特效（新增）
│       └── WinAnimation.tsx           # 中奖动画（新增）
├── hooks/
│   ├── useSound.ts                    # 音效管理 Hook（新增）
│   ├── useHaptic.ts                   # 震动反馈 Hook（新增）
│   └── useParticles.ts                # 粒子效果 Hook（新增）
└── utils/
    ├── soundManager.ts                # 音效管理工具（新增）
    └── animation.ts                   # 动画工具函数（新增）

public/
└── sounds/                            # 音效文件（新增目录）
    ├── dice-roll.mp3
    ├── dice-land.mp3
    ├── bet-click.mp3
    ├── chip-select.mp3
    ├── win-small.mp3
    ├── win-big.mp3
    └── round-start.mp3
```

### 依赖库建议
```json
{
  "dependencies": {
    "react-spring": "^9.7.0",           // 弹性动画
    "react-use-sound": "^2.0.1",        // 音效管理
    "canvas-confetti": "^1.9.0",        // 粒子特效
    "react-countup": "^6.5.0"           // 数字滚动
  }
}
```

---

## 七、开发排期建议

### Sprint 1（3 天）- P0 核心功能
- Day 1：骰子 3D 动画 + 音效系统集成
- Day 2：中奖动画 + 筹码飞入动画
- Day 3：倍投功能 + 测试修复

### Sprint 2（2 天）- P1 体验优化
- Day 4：撤销功能 + 限额提示 + 赔率优化
- Day 5：集成测试 + 性能优化

### Sprint 3（1 天）- P2 可选功能
- Day 6：分享功能 + 趋势图 + 震动反馈 + 粒子特效

---

## 八、附录：设计规范

### 颜色规范（保持一致）
- **背景主色**：深红 `#6b1b1b` (var(--burgundy))
- **辅助色**：金色 `#f5d76e` (var(--gold-primary))
- **高亮色**：亮金 `#FFD700` (var(--gold-bright))
- **文字色**：米白 `#faf3e0`

### 动画时长规范
- **快速反馈**：100-200ms（点击、Hover）
- **标准动画**：300-500ms（筹码飞入、弹窗）
- **慢速展示**：1000-1500ms（骰子滚动、数字滚动）

### 字体规范
- **中文**：Noto Sans SC（font-sans）
- **数字**：等宽字体（font-mono）
- **大小**：
  - 超大标题：32px+（奖金金额）
  - 标题：24px（页面标题）
  - 正文：16px（说明文字）
  - 小字：12px（限额提示）

---

## 九、竞品分析参考

根据 2025 年在线骰宝最佳实践（搜索结果）：

1. **速度骰宝（Speed Sic Bo）**：
   - 更快的下注回合（30 秒倒计时）
   - 适合快节奏玩家
   - 建议：支持设置"快速模式"

2. **多机位骰宝（Multi-Camera Sic Bo）**：
   - 多角度观看骰子滚动
   - 沉浸式体验
   - 建议：未来可考虑 3D 视角切换

3. **真人骰宝（Live Sic Bo）**：
   - 真人荷官主持
   - 社交互动
   - 建议：V2 版本可加入聊天功能

---

## 十、风险与依赖

### 技术风险
- **音效文件大小**：需控制在 500KB 内
- **3D 动画性能**：低端设备可能卡顿 → 提供"简化动画"选项
- **Telegram WebApp API 兼容性**：需测试不同版本 Telegram

### 法律合规
- **赌博法规**：需确认目标地区法律
- **KYC 要求**：大额充值/提现需身份验证
- **随机数公平性**：使用可审计的 RNG（Random Number Generator）

---

## 十一、总结

本次升级将在**保持现有投注区布局不变**的前提下，全面提升骰宝游戏的视觉效果、音效反馈和交互体验，实现 PRD V2.0 的 95% 还原度目标。

**核心升级点**：
1. 3D 骰子动画（1.5 秒流畅滚动）
2. 完整音效系统（7 种音效）
3. 中奖动画（闪烁 + 数字滚动 + 粒子特效）
4. 筹码飞入动画（300ms 弹性效果）
5. 倍投功能（支持 1x~20x）
6. 撤销功能（下注历史栈）

**下一步**：
1. UI Designer Agent 基于本 PRD 生成设计规范（DESIGN_SPEC.md）
2. Frontend Developer Agent 实现所有功能
3. QA Testing Agent 验收测试

---

**文档状态**：✅ 已完成
**下一步操作**：调用 UI Designer Agent（输入 `/UI`）
