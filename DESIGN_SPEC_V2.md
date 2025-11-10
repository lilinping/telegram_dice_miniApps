# 骰宝游戏专业UI设计规范 V2.0
## Professional Sic-Bo Game UI Design Specification

---

## 文档信息
- **项目名称**: 骰宝夺宝 / DiceTreasure Professional
- **设计版本**: V2.0 Professional Edition
- **创建日期**: 2025-11-09
- **基于文档**: PROFESSIONAL_REDESIGN_SPEC.md
- **设计目标**: 打造赌场级专业骰宝游戏体验

---

## 目录

1. [设计系统](#1-设计系统)
2. [页面布局设计](#2-页面布局设计)
3. [组件设计规范](#3-组件设计规范)
4. [交互动画设计](#4-交互动画设计)
5. [响应式设计](#5-响应式设计)
6. [开发实现指南](#6-开发实现指南)

---

## 1. 设计系统

### 1.1 色彩系统

#### 主色调
```css
/* 金色系统 - 主要强调色 */
:root {
  --gold-primary: #D4AF37;      /* 真黄金色 */
  --gold-bright: #FFD700;       /* 亮金色 */
  --gold-dark: #B8860B;         /* 暗金色 */
  --gold-metallic: #C9B037;     /* 金属金 */

  /* 红色系统 - 赌桌背景 */
  --casino-red: #8B0000;        /* 深红色 */
  --velvet-red: #A52A2A;        /* 天鹅绒红 */
  --burgundy: #6B1414;          /* 勃艮第红 */

  /* 黑色系统 - 边框与文字 */
  --rich-black: #0D0D0D;        /* 富黑色 */
  --onyx-black: #1A1A1A;        /* 玛瑙黑 */
  --charcoal: #2B2B2B;          /* 炭黑色 */

  /* 功能色 */
  --success: #10B981;           /* 成功/中奖 */
  --error: #EF4444;             /* 错误/失败 */
  --warning: #F59E0B;           /* 警告 */
  --info: #3B82F6;              /* 信息 */
}
```

#### 筹码颜色标准
```css
:root {
  --chip-10: #E53935;           /* $10 - 红色 */
  --chip-50: #1E88E5;           /* $50 - 蓝色 */
  --chip-100: #000000;          /* $100 - 黑色 */
  --chip-500: #9C27B0;          /* $500 - 紫色 */
  --chip-1000: #FFD700;         /* $1K - 金色 */
}
```

### 1.2 字体系统

```css
/* 字体族 */
--font-display: 'Cinzel', serif;           /* 装饰性标题 */
--font-body: 'SF Pro Display', sans-serif; /* 正文 */
--font-mono: 'Roboto Mono', monospace;     /* 数字/代码 */

/* 字体大小 */
--text-display: 48px;         /* 超大标题 */
--text-h1: 32px;              /* 一级标题 */
--text-h2: 24px;              /* 二级标题 */
--text-h3: 20px;              /* 三级标题 */
--text-body: 16px;            /* 正文 */
--text-small: 14px;           /* 小字 */
--text-tiny: 12px;            /* 极小字 */

/* 字体粗细 */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-black: 900;
```

### 1.3 间距系统

```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
  --spacing-xxxl: 64px;
}
```

### 1.4 圆角系统

```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-xxl: 24px;
  --radius-full: 9999px;
}
```

### 1.5 阴影系统

```css
:root {
  /* 基础阴影 */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.15);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.25);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 12px 48px rgba(0, 0, 0, 0.5);

  /* 金色光晕 */
  --shadow-gold: 0 0 24px rgba(255, 215, 0, 0.6);
  --shadow-gold-lg: 0 0 40px rgba(255, 215, 0, 0.9);

  /* 内阴影 */
  --shadow-inset: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}
```

---

## 2. 页面布局设计

### 2.1 游戏主页面整体布局

```
┌─────────────────────────────────────────────────────────┐
│  顶部栏 (56px)                                           │
│  局号 #123456 | 倒计时 25s | 余额 1,234 USDT | [充值]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  3D骰盅展示区 (240-300px)                                │
│  - 金色圆顶骰盅                                          │
│  - 三颗骰子3D动画                                        │
│  - 物理引擎模拟                                          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  投注面板区域 (可滚动)                                    │
│  ┌───────────────────────────────────────────────┐     │
│  │  大/小  单/双  三军(1-6)                       │     │
│  ├───────────────────────────────────────────────┤     │
│  │  点数投注(4-17)                                │     │
│  ├───────────────────────────────────────────────┤     │
│  │  三同号  两骰组合                              │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  筹码选择器 (90px, 固定)                                 │
│  [10] [50] [100] [500] [1K]                             │
├─────────────────────────────────────────────────────────┤
│  底部操作栏 (64px, 固定)                                 │
│  [清空] [确认下注] [走势]                                │
└─────────────────────────────────────────────────────────┘
```

### 2.2 顶部栏设计

```html
<div class="top-bar">
  <div class="round-info">
    <span class="round-label">局号</span>
    <span class="round-number">#123456</span>
  </div>

  <div class="countdown-timer" data-seconds="25">
    <svg class="timer-ring">
      <circle class="timer-track"/>
      <circle class="timer-progress"/>
    </svg>
    <span class="timer-text">25s</span>
  </div>

  <div class="balance-display">
    <span class="balance-label">余额</span>
    <span class="balance-amount">1,234.56 USDT</span>
  </div>

  <button class="deposit-button">
    <svg><!-- 充值图标 --></svg>
    充值
  </button>
</div>
```

```css
.top-bar {
  height: 56px;
  background: linear-gradient(180deg, var(--rich-black) 0%, var(--onyx-black) 100%);
  border-bottom: 2px solid var(--gold-primary);
  padding: 0 var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.round-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.round-label {
  font-size: var(--text-tiny);
  color: rgba(255, 255, 255, 0.6);
}

.round-number {
  font-family: var(--font-mono);
  font-size: var(--text-small);
  font-weight: var(--font-bold);
  color: var(--gold-bright);
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.countdown-timer {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.timer-track {
  stroke: var(--charcoal);
  stroke-width: 4;
  fill: none;
}

.timer-progress {
  stroke: var(--gold-bright);
  stroke-width: 4;
  fill: none;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
  filter: drop-shadow(0 0 6px var(--gold-bright));
}

.timer-text {
  font-family: var(--font-mono);
  font-size: var(--text-body);
  font-weight: var(--font-bold);
  color: var(--gold-bright);
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
}

.balance-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.balance-label {
  font-size: var(--text-tiny);
  color: rgba(255, 255, 255, 0.6);
}

.balance-amount {
  font-family: var(--font-mono);
  font-size: var(--text-small);
  font-weight: var(--font-bold);
  color: #FFFFFF;
}

.deposit-button {
  padding: var(--spacing-sm) var(--spacing-md);
  background: linear-gradient(135deg, var(--gold-primary) 0%, var(--gold-dark) 100%);
  border: none;
  border-radius: var(--radius-lg);
  color: var(--rich-black);
  font-size: var(--text-small);
  font-weight: var(--font-bold);
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-gold);
}

.deposit-button:active {
  transform: scale(0.95);
}
```

### 2.3 3D骰盅展示区

```html
<div class="dice-area">
  <!-- Three.js Canvas -->
  <canvas id="dice-canvas"></canvas>

  <!-- 2D叠加UI -->
  <div class="dice-overlay">
    <!-- 骰子结果显示 -->
    <div class="dice-result" data-visible="false">
      <div class="result-title">点数结果</div>
      <div class="result-number">15</div>
      <div class="result-badges">
        <span class="badge big">大</span>
        <span class="badge odd">单</span>
      </div>
    </div>
  </div>
</div>
```

```css
.dice-area {
  height: 300px;
  background: linear-gradient(180deg, var(--onyx-black) 0%, var(--rich-black) 100%);
  position: relative;
  overflow: hidden;
}

#dice-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.dice-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dice-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dice-result[data-visible="true"] {
  opacity: 1;
  transform: scale(1);
}

.result-title {
  font-size: var(--text-body);
  color: var(--gold-bright);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.result-number {
  font-family: var(--font-mono);
  font-size: 72px;
  font-weight: var(--font-black);
  color: #FFFFFF;
  text-shadow:
    0 0 20px rgba(255, 215, 0, 1),
    0 0 40px rgba(255, 215, 0, 0.6);
  animation: numberPulse 1s ease-out;
}

@keyframes numberPulse {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.result-badges {
  display: flex;
  gap: var(--spacing-sm);
}

.badge {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  font-size: var(--text-small);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: var(--shadow-md);
}

.badge.big {
  background: #FF4444;
  color: #FFFFFF;
}

.badge.small {
  background: #4444FF;
  color: #FFFFFF;
}

.badge.odd {
  background: #FFA500;
  color: #FFFFFF;
}

.badge.even {
  background: #00FF00;
  color: #000000;
}
```

---

## 3. 组件设计规范

### 3.1 投注格组件

#### 大/小投注格

```html
<div class="bet-cell primary big" data-bet-type="big">
  <div class="cell-header">
    <h3 class="cell-title-zh">大</h3>
    <p class="cell-title-en">BIG</p>
  </div>

  <div class="cell-body">
    <p class="cell-range">11-17点</p>
    <p class="cell-rule">(非三同号)</p>
  </div>

  <div class="cell-footer">
    <span class="payout-ratio">1:1</span>
    <span class="bet-limit">最低10u</span>
  </div>

  <!-- 下注筹码容器 -->
  <div class="bet-chips"></div>

  <!-- 下注金额显示 -->
  <div class="bet-amount-display" data-visible="false">
    <span class="amount">$100</span>
  </div>
</div>
```

```css
.bet-cell {
  position: relative;
  background: linear-gradient(135deg, var(--burgundy) 0%, var(--casino-red) 100%);
  border: 3px solid var(--gold-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;

  /* 绒布纹理 */
  background-image: url('/textures/velvet.png');
  background-blend-mode: overlay;

  /* 内凹效果 */
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    var(--shadow-sm);
}

.bet-cell.primary {
  min-width: 140px;
  min-height: 110px;
}

/* Hover状态 */
.bet-cell:hover {
  border-color: var(--gold-bright);
  transform: translateY(-2px);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    var(--shadow-gold);
}

/* 已下注状态 */
.bet-cell[data-has-bet="true"] {
  border-color: var(--gold-bright);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(255, 215, 0, 0.6);
}

/* 中奖状态 */
.bet-cell[data-win="true"] {
  animation: winFlash 0.5s ease-in-out 3;
  border-color: #FF0000;
  border-width: 4px;
}

@keyframes winFlash {
  0%, 100% {
    box-shadow: 0 0 40px rgba(255, 215, 0, 1);
    opacity: 1;
  }
  50% {
    box-shadow: 0 0 80px rgba(255, 165, 0, 1);
    opacity: 0.7;
  }
}

/* 封盘状态 */
.bet-cell[data-closed="true"] {
  opacity: 0.5;
  filter: grayscale(1);
  cursor: not-allowed;
  pointer-events: none;
}

.cell-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: var(--spacing-sm);
}

.cell-title-zh {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: var(--font-black);
  color: #FFFFFF;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin: 0;
}

.cell-title-en {
  font-size: var(--text-tiny);
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
}

.cell-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: var(--spacing-sm);
}

.cell-range {
  font-size: var(--text-small);
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin: 0;
}

.cell-rule {
  font-size: var(--text-tiny);
  color: var(--gold-bright);
  text-align: center;
  margin: 0;
}

.cell-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payout-ratio {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: var(--font-black);
  color: var(--gold-bright);
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}

.bet-limit {
  font-size: var(--text-tiny);
  color: rgba(255, 255, 255, 0.5);
}

.bet-chips {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.bet-amount-display {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-sm);
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid var(--gold-bright);
  border-radius: var(--radius-sm);
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s;
}

.bet-amount-display[data-visible="true"] {
  opacity: 1;
  transform: scale(1);
}

.bet-amount-display .amount {
  font-family: var(--font-mono);
  font-size: var(--text-small);
  font-weight: var(--font-bold);
  color: var(--gold-bright);
}
```

#### 点数投注格

```html
<div class="bet-cell points" data-bet-type="point-7">
  <div class="point-number">7</div>
  <div class="point-payout">12:1</div>

  <!-- 骰子组合示意(可选) -->
  <div class="dice-combination">
    <span class="dice-dot">●●</span>
    <span class="dice-dot">●●●</span>
  </div>
</div>
```

```css
.bet-cell.points {
  min-width: 65px;
  min-height: 80px;
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xs);
}

.point-number {
  font-family: var(--font-mono);
  font-size: 32px;
  font-weight: var(--font-black);
  color: #FFFFFF;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.point-payout {
  font-family: var(--font-mono);
  font-size: var(--text-body);
  font-weight: var(--font-bold);
  color: var(--gold-bright);
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

/* 高赔率点数高亮 */
.bet-cell.points[data-point="4"],
.bet-cell.points[data-point="17"] {
  border-color: #FFA500;
}

.bet-cell.points[data-point="4"] .point-payout,
.bet-cell.points[data-point="17"] .point-payout {
  color: #FFA500;
  font-size: 18px;
}

.dice-combination {
  display: flex;
  gap: 2px;
  font-size: 8px;
  color: rgba(255, 255, 255, 0.4);
}
```

### 3.2 筹码选择器组件

```html
<div class="chip-selector">
  <div class="chip-list">
    <div class="chip-item" data-value="10" data-selected="false">
      <div class="chip-visual chip-10">
        <div class="chip-center">
          <span class="chip-value">$10</span>
        </div>
        <div class="chip-edge"></div>
      </div>
      <span class="chip-label">10</span>
    </div>

    <div class="chip-item" data-value="50" data-selected="false">
      <div class="chip-visual chip-50">
        <div class="chip-center">
          <span class="chip-value">$50</span>
        </div>
        <div class="chip-edge"></div>
      </div>
      <span class="chip-label">50</span>
    </div>

    <div class="chip-item" data-value="100" data-selected="true">
      <div class="chip-visual chip-100">
        <div class="chip-center">
          <span class="chip-value">$100</span>
        </div>
        <div class="chip-edge"></div>
        <div class="chip-selection-ring"></div>
      </div>
      <span class="chip-label">100</span>
    </div>

    <div class="chip-item" data-value="500" data-selected="false">
      <div class="chip-visual chip-500">
        <div class="chip-center">
          <span class="chip-value">$500</span>
        </div>
        <div class="chip-edge"></div>
      </div>
      <span class="chip-label">500</span>
    </div>

    <div class="chip-item" data-value="1000" data-selected="false">
      <div class="chip-visual chip-1000">
        <div class="chip-center">
          <span class="chip-value">$1K</span>
        </div>
        <div class="chip-edge"></div>
        <div class="chip-glow"></div>
      </div>
      <span class="chip-label">1K</span>
    </div>
  </div>
</div>
```

```css
.chip-selector {
  position: fixed;
  bottom: 80px;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to top, var(--rich-black) 70%, transparent 100%);
  padding: var(--spacing-md) var(--spacing-md);
  z-index: 900;
}

.chip-list {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  align-items: center;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: var(--spacing-sm);

  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.chip-list::-webkit-scrollbar {
  display: none;
}

.chip-item {
  flex-shrink: 0;
  scroll-snap-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  transition: transform 0.2s;
}

.chip-item:active {
  transform: scale(0.95);
}

.chip-visual {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  /* 3D效果 */
  box-shadow:
    inset 0 3px 6px rgba(255, 255, 255, 0.3),
    inset 0 -3px 6px rgba(0, 0, 0, 0.3),
    0 6px 12px rgba(0, 0, 0, 0.4);
}

/* 选中状态 */
.chip-item[data-selected="true"] .chip-visual {
  transform: scale(1.25);
  z-index: 10;
  box-shadow:
    inset 0 3px 6px rgba(255, 255, 255, 0.5),
    inset 0 -3px 6px rgba(0, 0, 0, 0.5),
    0 0 0 4px var(--gold-bright),
    0 10px 20px rgba(255, 215, 0, 0.6);
  animation: chipPulse 1.5s infinite;
}

@keyframes chipPulse {
  0%, 100% {
    box-shadow:
      inset 0 3px 6px rgba(255, 255, 255, 0.5),
      inset 0 -3px 6px rgba(0, 0, 0, 0.5),
      0 0 0 4px var(--gold-bright),
      0 10px 20px rgba(255, 215, 0, 0.6);
  }
  50% {
    box-shadow:
      inset 0 3px 6px rgba(255, 255, 255, 0.5),
      inset 0 -3px 6px rgba(0, 0, 0, 0.5),
      0 0 0 6px var(--gold-bright),
      0 15px 30px rgba(255, 215, 0, 0.9);
  }
}

.chip-center {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-value {
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: var(--font-black);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.chip-edge {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 4px solid;
  border-image: repeating-conic-gradient(
    from 0deg,
    currentColor 0deg 22.5deg,
    transparent 22.5deg 45deg
  ) 4;
  opacity: 0.6;
  z-index: 1;
}

.chip-label {
  font-size: var(--text-small);
  color: rgba(255, 255, 255, 0.6);
  font-weight: var(--font-semibold);
}

/* 各面值筹码颜色 */
.chip-10 {
  background: radial-gradient(circle, #E53935 0%, #C62828 100%);
  color: #FFFFFF;
  border-color: #FFFFFF;
}

.chip-50 {
  background: radial-gradient(circle, #1E88E5 0%, #1565C0 100%);
  color: #FFFFFF;
  border-color: #FFFFFF;
}

.chip-100 {
  background: radial-gradient(circle, #1A1A1A 0%, #000000 100%);
  color: var(--gold-bright);
  border-color: var(--gold-bright);
}

.chip-500 {
  background: radial-gradient(circle, #9C27B0 0%, #7B1FA2 100%);
  color: #FFFFFF;
  border-color: #FFFFFF;

  /* 闪光效果 */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 70%
    );
    animation: shimmer 2s infinite;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) rotate(0deg);
  }
  100% {
    transform: translateX(100%) rotate(360deg);
  }
}

.chip-1000 {
  background: radial-gradient(circle, #FFD700 0%, #FFA500 100%);
  color: #000000;
  border-color: #000000;

  /* 金色光晕 */
  &::before {
    content: '';
    position: absolute;
    inset: -10px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(255, 215, 0, 0.4) 0%,
      transparent 70%
    );
    animation: glowPulse 2s infinite;
    z-index: -1;
  }
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

.chip-glow {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 215, 0, 0.6) 0%,
    transparent 60%
  );
  z-index: -1;
  animation: glowPulse 2s infinite;
}
```

### 3.3 底部操作栏组件

```html
<div class="bottom-bar">
  <button class="action-button clear-bet">
    <svg><!-- 清空图标 --></svg>
    <span>清空</span>
  </button>

  <button class="action-button confirm-bet">
    <svg><!-- 确认图标 --></svg>
    <span>确认下注</span>
    <span class="bet-total">$250</span>
  </button>

  <button class="action-button show-trend">
    <svg><!-- 走势图标 --></svg>
    <span>走势</span>
  </button>
</div>
```

```css
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(180deg, transparent 0%, var(--rich-black) 30%, var(--onyx-black) 100%);
  border-top: 2px solid var(--gold-primary);
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) + env(safe-area-inset-bottom));
  display: flex;
  gap: var(--spacing-sm);
  z-index: 1000;
}

.action-button {
  flex: 1;
  height: 56px;
  border-radius: var(--radius-lg);
  border: none;
  font-size: var(--text-body);
  font-weight: var(--font-bold);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.action-button:active {
  transform: scale(0.95);
}

.action-button svg {
  width: 20px;
  height: 20px;
}

.action-button.clear-bet {
  background: transparent;
  border: 2px solid var(--gold-primary);
  color: var(--gold-primary);
}

.action-button.clear-bet:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--gold-bright);
  color: var(--gold-bright);
}

.action-button.confirm-bet {
  flex: 2;
  background: linear-gradient(135deg, var(--gold-bright) 0%, var(--gold-dark) 100%);
  color: var(--rich-black);
  box-shadow: var(--shadow-gold);
  animation: betPulse 2s infinite;
  position: relative;
}

@keyframes betPulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.5);
  }
  50% {
    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.8);
  }
}

.action-button.confirm-bet:hover {
  background: linear-gradient(135deg, #FFE135 0%, #C9B037 100%);
}

.bet-total {
  font-family: var(--font-mono);
  font-size: var(--text-small);
  font-weight: var(--font-black);
}

.action-button.show-trend {
  background: transparent;
  border: 2px solid var(--gold-primary);
  color: var(--gold-primary);
}

.action-button.show-trend:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--gold-bright);
  color: var(--gold-bright);
}

/* 禁用状态 */
.action-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}
```

---

## 4. 交互动画设计

### 4.1 筹码下注动画

```css
@keyframes chipFlyIn {
  0% {
    transform: translate(var(--start-x), var(--start-y)) scale(1) rotateZ(0deg);
    opacity: 1;
  }
  30% {
    transform: translate(
      calc((var(--start-x) + var(--end-x)) / 2),
      calc(var(--start-y) - 100px)
    ) scale(0.8) rotateZ(180deg);
    opacity: 1;
  }
  100% {
    transform: translate(var(--end-x), var(--end-y)) scale(1) rotateZ(360deg);
    opacity: 1;
  }
}

.chip-flying {
  animation: chipFlyIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
```

### 4.2 骰子滚动动画

Three.js实现,详见PROFESSIONAL_REDESIGN_SPEC.md第4章

### 4.3 中奖庆祝动画

```css
@keyframes winCelebration {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  25% {
    transform: scale(1.1);
    filter: brightness(1.5);
  }
  50% {
    transform: scale(0.95);
    filter: brightness(1.2);
  }
  75% {
    transform: scale(1.05);
    filter: brightness(1.4);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}

.bet-cell[data-win="true"] {
  animation: winCelebration 0.5s ease-in-out 3;
}

/* 金币粒子效果 */
@keyframes coinBurst {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(0);
    opacity: 0;
  }
}

.coin-particle {
  position: absolute;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #FFD700 0%, #FFA500 100%);
  border-radius: 50%;
  pointer-events: none;
  animation: coinBurst 1s ease-out forwards;
}
```

---

## 5. 响应式设计

### 5.1 移动端 (320px - 479px)

```css
@media (max-width: 479px) {
  :root {
    --text-display: 36px;
    --text-h1: 24px;
    --text-h2: 20px;
    --text-h3: 18px;
    --text-body: 14px;
    --text-small: 12px;
    --text-tiny: 10px;
  }

  .top-bar {
    height: 56px;
    padding: 0 var(--spacing-sm);
  }

  .dice-area {
    height: 240px;
  }

  .bet-cell.primary {
    min-width: calc((100vw - 56px) / 4);
    min-height: 85px;
    padding: var(--spacing-sm);
  }

  .bet-cell.points {
    min-width: calc((100vw - 64px) / 7);
    min-height: 70px;
    padding: 6px;
  }

  .chip-selector {
    bottom: 64px;
    height: 90px;
  }

  .chip-visual {
    width: 56px;
    height: 56px;
  }

  .bottom-bar {
    height: 64px;
  }

  .action-button {
    height: 48px;
    font-size: var(--text-small);
  }
}
```

### 5.2 平板 (480px - 767px)

```css
@media (min-width: 480px) and (max-width: 767px) {
  .dice-area {
    height: 320px;
  }

  .bet-cell.primary {
    min-width: 160px;
    min-height: 120px;
  }

  .bet-cell.points {
    min-width: 75px;
    min-height: 90px;
  }

  .chip-visual {
    width: 72px;
    height: 72px;
  }
}
```

### 5.3 桌面 (768px+)

```css
@media (min-width: 768px) {
  .game-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .dice-area {
    height: 400px;
  }

  .betting-panel {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
  }

  .bet-cell.primary {
    min-width: 180px;
    min-height: 140px;
  }

  .chip-visual {
    width: 80px;
    height: 80px;
  }
}
```

---

## 6. 开发实现指南

### 6.1 技术栈

- **框架**: Next.js 14 (App Router)
- **3D渲染**: Three.js + @react-three/fiber + @react-three/drei
- **物理引擎**: cannon-es
- **动画**: Framer Motion + Lottie
- **状态管理**: Zustand
- **样式**: Tailwind CSS + CSS Modules

### 6.2 组件结构

```
src/
├── app/
│   ├── page.tsx (欢迎页)
│   └── game/
│       └── page.tsx (游戏主页)
├── components/
│   ├── game/
│   │   ├── DiceArea/ (3D骰盅区域)
│   │   ├── BettingPanel/ (投注面板)
│   │   ├── BetCell/ (投注格)
│   │   ├── ChipSelector/ (筹码选择器)
│   │   └── BottomBar/ (底部操作栏)
│   ├── ui/
│   │   ├── Button/
│   │   ├── Badge/
│   │   └── Timer/
│   └── layout/
│       ├── TopBar/
│       └── BottomNav/
├── lib/
│   ├── three/ (3D相关)
│   ├── physics/ (物理引擎)
│   └── animations/ (动画)
└── styles/
    ├── globals.css
    └── components/
```

### 6.3 性能优化清单

- [ ] 3D模型使用GLTF格式并压缩
- [ ] 纹理图片使用WebP格式
- [ ] 实现降级方案 (3D → 2D → 静态)
- [ ] 使用React.memo优化组件渲染
- [ ] 骰子物理计算使用Web Worker
- [ ] 图片懒加载
- [ ] 音频预加载并复用
- [ ] 使用IntersectionObserver优化滚动性能

### 6.4 无障碍设计

- [ ] 所有交互元素最小尺寸44×44px
- [ ] 色彩对比度符合WCAG AA标准
- [ ] 提供键盘导航支持
- [ ] 添加ARIA标签
- [ ] 提供屏幕阅读器支持
- [ ] 动画提供禁用选项

---

## 交付说明

本设计规范基于 `PROFESSIONAL_REDESIGN_SPEC.md` 产品文档创建,提供了完整的UI/UX实现细节。开发团队可以直接基于本规范进行开发,所有颜色、尺寸、动画参数都已标准化。

**下一步**:
1. 前端开发团队review此设计规范
2. 3D设计师准备骰盅和骰子模型
3. UI设计师准备筹码图标和其他图形资源
4. 开始第一阶段开发 (投注面板 + 筹码系统)

---

**文档版本**: V2.0
**最后更新**: 2025-11-09
**维护者**: UI/UX Team
