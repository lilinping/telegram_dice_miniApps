# 骰宝游戏专业级重新设计规范
## Professional Sic-Bo Game Redesign Specification

---

## 文档信息
- **项目名称**: 骰宝夺宝 / DiceTreasure - 专业版
- **设计版本**: V2.0 Professional Edition
- **创建日期**: 2025-11-09
- **设计理念**: 传统赌场专业级体验 + 现代3D技术 + 移动端优化
- **参考标准**: Evolution Gaming, Macau Casino Standards, Professional Sic-Bo Layout

---

## 1. 改进概述与目标

### 1.1 当前版本的主要问题

基于用户提供的专业骰宝游戏截图分析,当前V1.0版本存在以下关键问题:

**视觉设计问题**:
- ❌ 投注面板布局不符合传统赌场标准
- ❌ 缺少专业的3D骰盅和金色圆顶设计
- ❌ 色彩方案不够奢华,缺少赌场质感
- ❌ 筹码UI过于简单,缺少真实感

**功能完整性问题**:
- ❌ 投注选项布局混乱,不符合玩家习惯
- ❌ 缺少专业的筹码选择器(10/50/100/500/1K)
- ❌ 游戏历史记录展示不够专业
- ❌ 3D骰子动画规格不够专业

**用户体验问题**:
- ❌ 下注流程不够流畅
- ❌ 赔率展示不够清晰
- ❌ 缺少专业的视觉层次

### 1.2 重新设计目标

✅ **实现传统赌场级别的投注桌布局**
✅ **添加专业的3D金色骰盅动画**
✅ **设计真实的筹码系统和交互**
✅ **优化色彩方案至赌场标准(金/红/黑)**
✅ **完善所有投注选项并正确展示赔率**
✅ **提升移动端操作体验**

---

## 2. 专业赌场视觉标准

### 2.1 色彩系统升级

#### 主色调 - 赌场奢华风

```css
/* 金色系统 - 主要强调色 */
--gold-primary: #D4AF37;        /* 真黄金色 */
--gold-bright: #FFD700;         /* 亮金色 - 高光 */
--gold-dark: #B8860B;           /* 暗金色 - 阴影 */
--gold-metallic: #C9B037;       /* 金属金 - 骰盅 */

/* 红色系统 - 赌桌背景 */
--casino-red: #8B0000;          /* 深红色 - 主背景 */
--velvet-red: #A52A2A;          /* 天鹅绒红 - 绒布 */
--burgundy: #6B1414;            /* 勃艮第红 - 暗部 */

/* 黑色系统 - 边框与文字 */
--rich-black: #0D0D0D;          /* 富黑色 */
--onyx-black: #1A1A1A;          /* 玛瑙黑 */
--charcoal: #2B2B2B;            /* 炭黑色 */

/* 赔率标识色 */
--payout-gold: #FFA500;         /* 橙金色 - 高赔率 */
--payout-white: #FFFFFF;        /* 白色 - 标准赔率 */
--payout-silver: #C0C0C0;       /* 银色 - 低赔率 */
```

#### 功能色 - 赌场标准

```css
/* 投注状态色 */
--bet-placed: #FFD700;          /* 已下注 - 金色 */
--bet-win: #00FF00;             /* 中奖 - 绿色 */
--bet-lose: rgba(255,255,255,0.2); /* 未中奖 - 半透明 */

/* 筹码颜色标准 (参照真实赌场) */
--chip-10: #E53935;             /* $10 - 红色 */
--chip-50: #1E88E5;             /* $50 - 蓝色 */
--chip-100: #000000;            /* $100 - 黑色 */
--chip-500: #9C27B0;            /* $500 - 紫色 */
--chip-1000: #FFD700;           /* $1K - 金色 */
```

### 2.2 材质与纹理标准

#### 赌桌绒布材质
```
材质类型: 天鹅绒绒布纹理
颜色: 深红色 (#8B0000)
法线贴图: 细腻绒布纹理
反射率: 低反射 (0.1)
粗糙度: 高粗糙度 (0.8)
凹凸贴图: 轻微织物纹理
用途: 投注区域背景,3D赌桌表面
```

#### 金色边框与装饰
```
材质类型: 拉丝金属
颜色: 真金色 (#D4AF37)
金属度: 0.9
粗糙度: 0.3
高光: 强烈定向高光
用途: 投注格边框、骰盅、筹码边缘
```

#### 骰盅材质规格
```
外壳材质: 抛光金属
颜色: 暗金色 (#B8860B)
金属度: 1.0
粗糙度: 0.2
反射: 环境反射 + 高光反射
内衬: 天鹅绒红色 (#A52A2A)
圆顶: 半透明金色玻璃,透明度60%
```

#### 骰子材质规格
```
材质: 象牙白塑料
颜色: #FFFACD (柔和象牙白)
金属度: 0.0
粗糙度: 0.4
透明度: 不透明
点数: 黑色凹陷 (#000000)
边角: 轻微倒角,真实感
```

---

## 3. 专业投注桌布局设计

### 3.1 传统Sic-Bo投注桌标准布局

基于Macau和Evolution Gaming标准,投注桌应采用以下布局:

```
┌─────────────────────────────────────────────────────────────────┐
│                    【顶部栏】                                      │
│  局号: #123456  |  倒计时: 25s  |  余额: 1,234.56 USDT  | [充值] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                  【3D骰盅展示区 - 金色圆顶】                       │
│                     300px 高度                                  │
│                  金色骰盅 + 3颗骰子 + 物理动画                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                  【专业投注桌区域】                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            传统Sic-Bo投注布局                            │   │
│  │                                                         │   │
│  │  ┌──────┐ ┌──────┐   ┌─────────────────┐  ┌──────┐   │   │
│  │  │ 小   │ │ 双   │   │  三军(单骰号)    │  │ 单   │   │   │
│  │  │ 4-10 │ │EVEN  │   │ 1 | 2 | 3 | 4 | 5 | 6 │  │ODD   │   │   │
│  │  │ 1:1  │ │ 1:1  │   │ 每个 1:1/2:1/3:1 │  │ 1:1  │   │   │
│  │  └──────┘ └──────┘   └─────────────────┘  └──────┘   │   │
│  │                                                         │   │
│  │  ┌─────────────────────────────────────────────────┐  │   │
│  │  │        点数投注区 (4-17)                         │  │   │
│  │  │  [4]  [5]  [6]  [7]  [8]  [9] [10]              │  │   │
│  │  │ 60:1 30:1 18:1 12:1 8:1  7:1  6:1               │  │   │
│  │  │                                                  │  │   │
│  │  │ [11] [12] [13] [14] [15] [16] [17]              │  │   │
│  │  │ 6:1  7:1  8:1 12:1 18:1 30:1 60:1                │  │   │
│  │  └─────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐                  │   │
│  │  │ 任意三同号    │  │ 指定三同号    │                  │   │
│  │  │   30:1       │  │   180:1      │                  │   │
│  │  │ [任意三同]   │  │[1][2][3][4][5][6]              │   │
│  │  └──────────────┘  └──────────────┘                  │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────┐         │   │
│  │  │        两骰组合 (Domino/Pair)             │         │   │
│  │  │  [1-2][1-3][1-4][1-5][1-6]               │         │   │
│  │  │  [2-3][2-4][2-5][2-6]                    │         │   │
│  │  │  [3-4][3-5][3-6]                         │         │   │
│  │  │  [4-5][4-6]                              │         │   │
│  │  │  [5-6]        每个 6:1                   │         │   │
│  │  └──────────────────────────────────────────┘         │   │
│  │                                                         │   │
│  │  ┌──────┐ ┌──────┐                                    │   │
│  │  │  大  │ │ 单   │                                    │   │
│  │  │11-17 │ │ ODD  │                                    │   │
│  │  │ 1:1  │ │ 1:1  │                                    │   │
│  │  └──────┘ └──────┘                                    │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                  【筹码选择与操作栏】                          │
│  [10] [50] [100] [500] [1K]  |  [清空]  |  [确认下注]  | [走势]│
└─────────────────────────────────────────────────────────────┘
```

### 3.2 投注格详细设计规范

#### 大/小投注格 (最重要,应最显眼)

```
尺寸: 120×90px (移动端), 180×120px (平板/桌面)
位置: 投注桌四角最显眼位置
背景: 深红色绒布纹理
边框: 3px金色边框
圆角: 8px

布局:
┌──────────────┐
│      小       │  ← 标题 (24px Bold, 白色)
│    SMALL     │  ← 英文 (14px, 白色半透明)
│   总点数4-10  │  ← 说明 (12px, 灰色)
│   (非三同号)  │  ← 规则 (10px, 黄色)
│              │
│     1:1      │  ← 赔率 (20px Bold, 金色)
│   最低10u    │  ← 限额 (10px, 灰色)
└──────────────┘

状态:
- 默认: 深红背景,金色边框
- hover: 金色光晕 (0 0 16px rgba(255,215,0,0.6))
- 已下注: 筹码叠加显示,金额数字显示
- 中奖: 金色边框闪烁3次 + 粒子爆炸
```

#### 点数投注格 (4-17)

```
尺寸: 55×70px (移动端), 75×90px (桌面)
布局: 两行排列,4-10一行,11-17一行
背景: 暗红色 (#6B1414)
边框: 2px金色边框

内容结构:
┌─────────┐
│    7    │  ← 点数 (28px Bold)
│  ●●●●  │  ← 骰子组合示意 (可选)
│         │
│  12:1   │  ← 赔率 (16px Bold, 金色)
└─────────┘

赔率标准 (Macau标准):
4点:  60:1 (橙金色标识)
5点:  30:1
6点:  18:1
7点:  12:1
8点:  8:1
9点:  7:1
10点: 6:1
11点: 6:1
12点: 7:1
13点: 8:1
14点: 12:1
15点: 18:1
16点: 30:1
17点: 60:1 (橙金色标识)
```

#### 三军投注格 (单骰号 1-6)

```
尺寸: 65×85px
布局: 横向一排,6个格子
位置: 投注桌顶部中央

内容结构:
┌───────────┐
│   ┌───┐   │
│   │ ● │   │  ← 骰子图标 (32×32px)
│   │ 1 │   │
│   └───┘   │
│           │
│ 1:1/2:1/3:1 │ ← 赔率说明
│  出现1/2/3次 │ ← 规则说明
└───────────┘

交互规则:
- 根据出现次数不同赔率:
  - 出现1次: 1:1
  - 出现2次: 2:1
  - 出现3次: 3:1
```

#### 两骰组合格 (15种组合)

```
尺寸: 50×60px
布局: 金字塔形排列
1-2, 1-3, 1-4, 1-5, 1-6
    2-3, 2-4, 2-5, 2-6
        3-4, 3-5, 3-6
            4-5, 4-6
                5-6

内容:
┌────────┐
│ ●   ● │  ← 两个骰子点数
│ 1   2 │
│       │
│  6:1  │  ← 赔率 (固定6:1)
└────────┘
```

#### 三同号投注格

**任意三同号**:
```
尺寸: 110×80px
┌──────────────┐
│ 任意三同号     │
│              │
│  ●●●         │  ← 三个相同骰子示意
│ ALL TRIPLES  │
│              │
│    30:1      │  ← 赔率
└──────────────┘
```

**指定三同号** (1-1-1 到 6-6-6):
```
尺寸: 每个 60×70px
布局: 横向6个格子

┌─────────┐
│  ● ● ●  │  ← 三个1
│  1-1-1  │
│         │
│  180:1  │  ← 赔率 (最高赔率,橙金色)
└─────────┘
```

### 3.3 投注格交互状态详细设计

#### 状态1: 默认状态
```css
background: #6B1414 (暗红色绒布);
border: 2px solid #D4AF37 (金色边框);
box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); /* 内凹陷效果 */
```

#### 状态2: Hover状态 (桌面端)
```css
background: #8B1414 (稍亮红色);
border: 2px solid #FFD700 (亮金色);
box-shadow: 0 0 16px rgba(255,215,0,0.6); /* 金色光晕 */
transform: translateY(-2px); /* 轻微上浮 */
cursor: pointer;
transition: all 0.2s ease;
```

#### 状态3: 点击/选中状态
```css
background: radial-gradient(circle, #FFD700 0%, #D4AF37 100%); /* 金色渐变 */
border: 3px solid #FFA500 (橙金色);
box-shadow: 0 0 24px rgba(255,215,0,0.9), /* 强烈外发光 */
            0 4px 12px rgba(0,0,0,0.5); /* 立体阴影 */
animation: pulse 1.5s infinite; /* 脉冲动画 */

/* 筹码叠加显示 */
&::after {
  content: ""; /* 筹码图标 */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background-image: url('/chips/chip-stack.png');
  animation: chipDrop 0.5s ease-out; /* 筹码掉落动画 */
}

/* 下注金额显示 */
&::before {
  content: "$" attr(data-bet-amount); /* 动态显示金额 */
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 14px;
  font-weight: bold;
  color: #0D0D0D;
  background: rgba(255,255,255,0.9);
  padding: 2px 6px;
  border-radius: 4px;
}
```

#### 状态4: 封盘状态 (下注结束)
```css
background: #3A3A3A (灰化);
border: 2px solid #666666;
opacity: 0.5;
cursor: not-allowed;
pointer-events: none;
filter: grayscale(1); /* 完全灰度 */
```

#### 状态5: 开奖中奖状态
```css
background: radial-gradient(circle, #FFD700 0%, #FFA500 100%);
border: 4px solid #FF0000;
box-shadow: 0 0 40px rgba(255,215,0,1),
            0 0 80px rgba(255,165,0,0.8);
animation: winFlash 0.5s ease-in-out 3; /* 闪烁3次 */

/* 粒子爆炸效果 */
&::after {
  content: "";
  position: absolute;
  inset: 0;
  background: url('/effects/particles-gold.png');
  animation: particleExplode 1s ease-out forwards;
}

/* 中奖金额弹出 */
.win-amount {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255,215,0,1),
               0 2px 4px rgba(0,0,0,0.8);
  animation: numberPopUp 1.5s ease-out forwards;
}

@keyframes winFlash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes particleExplode {
  0% {
    opacity: 1;
    transform: scale(0.5);
  }
  100% {
    opacity: 0;
    transform: scale(2);
  }
}

@keyframes numberPopUp {
  0% {
    transform: translateX(-50%) translateY(0) scale(0.5);
    opacity: 0;
  }
  50% {
    transform: translateX(-50%) translateY(-20px) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) translateY(-40px) scale(1);
    opacity: 0;
  }
}
```

#### 状态6: 未中奖状态
```css
background: rgba(107,20,20,0.3); /* 半透明暗红 */
border: 2px solid rgba(212,175,55,0.3); /* 半透明金边 */
opacity: 0.4;
filter: grayscale(0.7);
transition: all 0.5s ease;
```

---

## 4. 3D骰盅与骰子专业规格

### 4.1 金色圆顶骰盅设计

#### 骰盅外观规格

```javascript
// Three.js 骰盅模型配置
const diceCupSpecs = {
  // 底座
  base: {
    geometry: 'CylinderGeometry',
    radius: 3.5,
    height: 0.5,
    segments: 64,
    material: {
      type: 'MeshStandardMaterial',
      color: 0xD4AF37, // 真金色
      metalness: 0.9,
      roughness: 0.2,
      envMapIntensity: 1.5,
      normalMap: '/textures/brushed-gold.jpg', // 拉丝金纹理
    }
  },

  // 圆顶盖 (半球形)
  dome: {
    geometry: 'SphereGeometry',
    radius: 4,
    widthSegments: 64,
    heightSegments: 32,
    phiStart: 0,
    phiLength: Math.PI * 2,
    thetaStart: 0,
    thetaLength: Math.PI / 2, // 半球
    material: {
      type: 'MeshPhysicalMaterial',
      color: 0xFFD700, // 亮金色
      metalness: 1.0,
      roughness: 0.15,
      clearcoat: 1.0, // 清漆层
      clearcoatRoughness: 0.1,
      envMapIntensity: 2.0,
      transmission: 0.3, // 30%透明度
      thickness: 0.5,
      ior: 1.5, // 折射率
    }
  },

  // 内衬 (天鹅绒红)
  lining: {
    geometry: 'CylinderGeometry',
    radiusTop: 3.3,
    radiusBottom: 3.3,
    height: 2.5,
    material: {
      type: 'MeshStandardMaterial',
      color: 0xA52A2A, // 天鹅绒红
      roughness: 0.95,
      metalness: 0.0,
      normalMap: '/textures/velvet.jpg', // 绒布纹理
      bumpMap: '/textures/velvet-bump.jpg',
      bumpScale: 0.3,
    }
  },

  // 金色装饰条纹
  decorativeRings: {
    count: 3, // 3道金色条纹
    geometry: 'TorusGeometry',
    radius: 3.6,
    tube: 0.1,
    material: {
      type: 'MeshStandardMaterial',
      color: 0xFFD700,
      metalness: 1.0,
      roughness: 0.1,
      emissive: 0xFFD700,
      emissiveIntensity: 0.3, // 轻微发光
    }
  }
};
```

#### 骰盅开合动画序列

```javascript
// 骰盅动画时间轴
const cupAnimationTimeline = {
  // 第一阶段: 剧烈晃动 (0-2秒)
  shake: {
    duration: 2000, // 2秒
    keyframes: [
      {
        time: 0,
        rotation: { x: 0, y: 0, z: 0 },
        position: { x: 0, y: 2, z: 0 }
      },
      {
        time: 0.1,
        rotation: { x: 0.3, y: 0.5, z: 0.2 },
        position: { x: 0.1, y: 2.1, z: 0 }
      },
      {
        time: 0.2,
        rotation: { x: -0.2, y: -0.4, z: -0.3 },
        position: { x: -0.1, y: 1.9, z: 0 }
      },
      // ... 循环快速晃动
    ],
    diceInside: {
      // 骰子在内部碰撞
      physics: {
        enabled: true,
        gravity: { y: -9.8 },
        bounce: 0.7,
        friction: 0.3,
      },
      sound: 'dice-rattle.mp3', // 骰子碰撞音效
      volume: 0.8
    },
    sound: 'cup-shake.mp3', // 骰盅晃动音效
    volume: 1.0
  },

  // 第二阶段: 骤停 (2-2.2秒)
  halt: {
    duration: 200, // 0.2秒
    easing: 'easeOutElastic',
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 0, y: 2, z: 0 },
    sound: 'cup-slam.mp3' // 骤停音效
  },

  // 第三阶段: 圆顶升起 (2.2-2.8秒)
  domeRise: {
    duration: 600, // 0.6秒
    easing: 'easeInOutCubic',
    dome: {
      from: { y: 2.5 }, // 初始位置
      to: { y: 6.0 },   // 升起4单位
      rotation: { y: Math.PI * 2 }, // 旋转360度
    },
    light: {
      // 金色光芒从骰盅中射出
      type: 'SpotLight',
      color: 0xFFD700,
      intensity: 2.0,
      angle: Math.PI / 4,
      penumbra: 0.5,
      position: { x: 0, y: 2.5, z: 0 },
      target: { x: 0, y: 0, z: 0 }
    },
    particles: {
      // 金色粒子向上飘散
      count: 50,
      color: 0xFFD700,
      size: 0.1,
      velocity: { y: 2.0 },
      lifetime: 1.5
    },
    sound: 'dome-rise.mp3'
  },

  // 第四阶段: 骰子弹出 (2.8-3.0秒)
  diceEject: {
    duration: 200, // 0.2秒
    dice: [
      {
        index: 0,
        velocity: { x: -1.5, y: 3.0, z: 0 },
        angularVelocity: { x: 5, y: 3, z: 4 }
      },
      {
        index: 1,
        velocity: { x: 0, y: 3.5, z: 1.0 },
        angularVelocity: { x: -4, y: 5, z: -3 }
      },
      {
        index: 2,
        velocity: { x: 1.5, y: 3.2, z: -0.5 },
        angularVelocity: { x: 3, y: -4, z: 5 }
      }
    ],
    sound: 'dice-eject.mp3'
  },

  // 第五阶段: 圆顶消失 (3.0-3.5秒)
  domeFadeOut: {
    duration: 500, // 0.5秒
    easing: 'easeInCubic',
    opacity: {
      from: 1.0,
      to: 0.0
    },
    scale: {
      from: 1.0,
      to: 1.3 // 放大同时消失
    }
  }
};
```

### 4.2 骰子物理引擎规格

#### 骰子模型详细规格

```javascript
const diceSpecs = {
  // 几何体
  geometry: {
    type: 'BoxGeometry',
    size: 1.0, // 1单位边长
    segments: 1,
    bevelEnabled: true, // 倒角
    bevelSize: 0.05,
    bevelSegments: 2
  },

  // 材质
  material: {
    type: 'MeshStandardMaterial',
    color: 0xFFFACD, // 柔和象牙白
    metalness: 0.0,
    roughness: 0.4,
    normalMap: '/textures/dice-normal.jpg',
    bumpMap: '/textures/dice-bump.jpg',
    bumpScale: 0.02,

    // 点数材质
    dots: {
      color: 0x000000, // 黑色
      depth: 0.05, // 凹陷深度
      material: 'MeshStandardMaterial',
      roughness: 0.8
    }
  },

  // UV贴图配置 (6个面)
  uvMapping: {
    face1: { // 1点
      dots: [
        { x: 0.5, y: 0.5, radius: 0.15 } // 中心1个点
      ]
    },
    face2: { // 2点
      dots: [
        { x: 0.3, y: 0.3, radius: 0.12 },
        { x: 0.7, y: 0.7, radius: 0.12 }
      ]
    },
    face3: { // 3点
      dots: [
        { x: 0.3, y: 0.3, radius: 0.12 },
        { x: 0.5, y: 0.5, radius: 0.12 },
        { x: 0.7, y: 0.7, radius: 0.12 }
      ]
    },
    face4: { // 4点
      dots: [
        { x: 0.3, y: 0.3, radius: 0.12 },
        { x: 0.3, y: 0.7, radius: 0.12 },
        { x: 0.7, y: 0.3, radius: 0.12 },
        { x: 0.7, y: 0.7, radius: 0.12 }
      ]
    },
    face5: { // 5点
      dots: [
        { x: 0.3, y: 0.3, radius: 0.10 },
        { x: 0.3, y: 0.7, radius: 0.10 },
        { x: 0.5, y: 0.5, radius: 0.10 },
        { x: 0.7, y: 0.3, radius: 0.10 },
        { x: 0.7, y: 0.7, radius: 0.10 }
      ]
    },
    face6: { // 6点
      dots: [
        { x: 0.3, y: 0.25, radius: 0.10 },
        { x: 0.3, y: 0.50, radius: 0.10 },
        { x: 0.3, y: 0.75, radius: 0.10 },
        { x: 0.7, y: 0.25, radius: 0.10 },
        { x: 0.7, y: 0.50, radius: 0.10 },
        { x: 0.7, y: 0.75, radius: 0.10 }
      ]
    }
  },

  // 物理属性 (Cannon.js)
  physics: {
    mass: 0.01, // 10克 (真实骰子重量)
    shape: 'Box',
    halfExtents: { x: 0.5, y: 0.5, z: 0.5 },

    // 物理材质
    material: {
      friction: 0.5, // 摩擦力
      restitution: 0.4, // 弹性/恢复系数
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3
    },

    // 阻尼 (减速)
    linearDamping: 0.4, // 线性阻尼
    angularDamping: 0.5, // 角阻尼

    // 碰撞组
    collisionFilterGroup: 1,
    collisionFilterMask: -1 // 与所有对象碰撞
  }
};
```

#### 骰子滚动动画序列

```javascript
const diceRollSequence = {
  // 阶段1: 初始弹出 (3.0-3.5秒)
  initialBounce: {
    duration: 500,
    physics: {
      gravity: { x: 0, y: -15, z: 0 }, // 增强重力
      initialVelocity: 'computed', // 根据后端结果反推
      initialAngularVelocity: 'random' // 随机旋转
    },
    camera: {
      // 相机跟随骰子
      target: 'dice-center',
      distance: 10,
      height: 5
    }
  },

  // 阶段2: 主要滚动 (3.5-5.5秒)
  mainRoll: {
    duration: 2000,
    physics: {
      enabled: true,
      // 骰子与桌面碰撞
      tableCollision: {
        friction: 0.6,
        restitution: 0.3
      },
      // 骰子间碰撞
      diceCollision: {
        friction: 0.4,
        restitution: 0.5
      }
    },
    sound: {
      collision: 'dice-hit-table.mp3',
      volume: 'dynamic', // 根据碰撞速度动态调整
      maxConcurrent: 5
    },
    visualEffects: {
      // 碰撞火花
      sparks: {
        enabled: true,
        count: 3,
        color: 0xFFFFFF,
        lifetime: 0.2
      },
      // 运动模糊
      motionBlur: {
        enabled: true,
        intensity: 0.3
      }
    }
  },

  // 阶段3: 减速至停止 (5.5-6.5秒)
  deceleration: {
    duration: 1000,
    easing: 'easeOutQuad',
    physics: {
      increasedDamping: {
        linear: 0.8, // 增加线性阻尼
        angular: 0.9 // 增加角阻尼
      }
    },
    resultCorrection: {
      // 确保最终朝向正确
      enabled: true,
      correctionStart: 5.8, // 5.8秒开始微调
      targetFaces: 'from-backend', // 后端指定的结果
      correctionMethod: 'subtle-force' // 施加微小力矩
    }
  },

  // 阶段4: 完全静止 (6.5-7.0秒)
  finalRest: {
    duration: 500,
    physics: {
      freeze: true, // 冻结物理
      snapToPosition: true // 对齐到网格
    },
    camera: {
      // 相机拉近特写
      animation: {
        from: { distance: 10, height: 5 },
        to: { distance: 6, height: 3 },
        easing: 'easeInOutCubic'
      }
    },
    diceHighlight: {
      // 骰子发光强调
      enabled: true,
      glowColor: 0xFFD700,
      glowIntensity: 0.5,
      pulseFrequency: 2 // 每秒2次脉冲
    }
  },

  // 阶段5: 结果展示 (7.0-8.0秒)
  resultDisplay: {
    duration: 1000,
    overlay: {
      // 2D UI叠加显示
      enabled: true,
      elements: [
        {
          type: 'text',
          content: '点数结果',
          position: { x: 0, y: 100 },
          fontSize: 48,
          color: '#FFD700',
          animation: 'fadeInScale'
        },
        {
          type: 'number',
          content: 'computed-total', // 三颗骰子点数和
          position: { x: 0, y: 0 },
          fontSize: 72,
          color: '#FFFFFF',
          fontWeight: 'bold',
          animation: 'countUp', // 数字滚动动画
          duration: 500
        },
        {
          type: 'badge',
          content: ['大/小', '单/双'],
          position: { x: 0, y: -80 },
          style: 'pill',
          colors: {
            big: '#FF0000',
            small: '#0000FF',
            odd: '#FFA500',
            even: '#00FF00'
          }
        }
      ]
    },
    sound: 'result-reveal.mp3'
  }
};
```

### 4.3 降级方案规格

对于低端设备或不支持WebGL的环境:

```javascript
const fallbackOptions = {
  // 性能检测
  detection: {
    webglSupported: true,
    fps: 60,
    deviceMemory: 4096, // MB
    performanceScore: 'auto-detect'
  },

  // 降级策略
  strategy: [
    {
      // 高端设备 (默认)
      condition: 'score >= 80',
      renderer: '3D-Full',
      features: {
        dice: 'Three.js + Cannon.js',
        shadows: true,
        reflections: true,
        particles: true,
        postProcessing: true,
        antialiasing: 'FXAA'
      }
    },
    {
      // 中端设备
      condition: '50 <= score < 80',
      renderer: '3D-Optimized',
      features: {
        dice: 'Three.js + Cannon.js',
        shadows: false,
        reflections: false,
        particles: 'reduced',
        postProcessing: false,
        antialiasing: false,
        resolution: 0.75 // 75%渲染分辨率
      }
    },
    {
      // 低端设备
      condition: '30 <= score < 50',
      renderer: '2D-Animation',
      features: {
        dice: 'Lottie JSON Animation',
        file: '/animations/dice-roll-{result}.json', // 预制动画
        duration: 3000,
        quality: 'medium'
      }
    },
    {
      // 极低端设备
      condition: 'score < 30',
      renderer: 'Static-Images',
      features: {
        dice: 'Image Sequence',
        frames: 60,
        folder: '/images/dice-roll/',
        format: 'webp',
        compression: 'high'
      }
    }
  ]
};
```

---

## 5. 专业筹码系统设计

### 5.1 筹码视觉设计规范

#### 筹码外观规格 (基于真实赌场筹码)

```javascript
const chipDesign = {
  // $10 筹码 - 红色
  chip10: {
    diameter: 56, // px
    colors: {
      primary: '#E53935', // 深红
      secondary: '#FFFFFF', // 白色边缘
      accent: '#C62828' // 暗红装饰
    },
    pattern: {
      center: {
        backgroundColor: '#E53935',
        text: '$10',
        textColor: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold'
      },
      edge: {
        stripes: 8, // 8道条纹
        stripeColors: ['#FFFFFF', '#E53935'],
        stripeWidth: 4
      },
      overlay: {
        texture: '/textures/chip-pattern.png',
        opacity: 0.2
      }
    },
    shadows: {
      default: '0 4px 8px rgba(229,57,53,0.4)',
      hover: '0 6px 12px rgba(229,57,53,0.6)',
      selected: '0 8px 16px rgba(229,57,53,0.8)'
    }
  },

  // $50 筹码 - 蓝色
  chip50: {
    diameter: 56,
    colors: {
      primary: '#1E88E5',
      secondary: '#FFFFFF',
      accent: '#1565C0'
    },
    pattern: {
      center: {
        backgroundColor: '#1E88E5',
        text: '$50',
        textColor: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold'
      },
      edge: {
        stripes: 8,
        stripeColors: ['#FFFFFF', '#1E88E5'],
        stripeWidth: 4
      }
    },
    shadows: {
      default: '0 4px 8px rgba(30,136,229,0.4)',
      hover: '0 6px 12px rgba(30,136,229,0.6)',
      selected: '0 8px 16px rgba(30,136,229,0.8)'
    }
  },

  // $100 筹码 - 黑色
  chip100: {
    diameter: 56,
    colors: {
      primary: '#000000',
      secondary: '#FFD700', // 金色边缘
      accent: '#1A1A1A'
    },
    pattern: {
      center: {
        backgroundColor: '#000000',
        text: '$100',
        textColor: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold'
      },
      edge: {
        stripes: 12, // 更多条纹显示高价值
        stripeColors: ['#FFD700', '#000000'],
        stripeWidth: 3
      },
      overlay: {
        gradient: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)'
      }
    },
    shadows: {
      default: '0 4px 8px rgba(0,0,0,0.6)',
      hover: '0 6px 12px rgba(255,215,0,0.5)',
      selected: '0 8px 16px rgba(255,215,0,0.7)'
    }
  },

  // $500 筹码 - 紫色
  chip500: {
    diameter: 60, // 稍大以示高价值
    colors: {
      primary: '#9C27B0',
      secondary: '#FFFFFF',
      accent: '#7B1FA2'
    },
    pattern: {
      center: {
        backgroundColor: '#9C27B0',
        text: '$500',
        textColor: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        icon: '★' // 星标装饰
      },
      edge: {
        stripes: 16,
        stripeColors: ['#FFFFFF', '#9C27B0', '#7B1FA2'],
        stripeWidth: 2
      },
      overlay: {
        shimmer: true, // 闪光效果
        shimmerColor: 'rgba(255,255,255,0.3)'
      }
    },
    shadows: {
      default: '0 5px 10px rgba(156,39,176,0.5)',
      hover: '0 7px 14px rgba(156,39,176,0.7)',
      selected: '0 10px 20px rgba(156,39,176,0.9)'
    }
  },

  // $1000 筹码 - 金色 (最高价值)
  chip1000: {
    diameter: 64, // 最大尺寸
    colors: {
      primary: '#FFD700',
      secondary: '#000000',
      accent: '#FFA500'
    },
    pattern: {
      center: {
        backgroundColor: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        text: '$1K',
        textColor: '#000000',
        fontSize: 20,
        fontWeight: 'bold',
        icon: '♦' // 钻石图标
      },
      edge: {
        stripes: 20, // 最多条纹
        stripeColors: ['#000000', '#FFD700', '#FFA500'],
        stripeWidth: 2,
        pattern: 'diamond' // 菱形图案
      },
      overlay: {
        glitter: true, // 闪闪发光
        glitterDensity: 'high',
        animation: 'sparkle'
      }
    },
    shadows: {
      default: '0 6px 12px rgba(255,215,0,0.6)',
      hover: '0 8px 16px rgba(255,215,0,0.8)',
      selected: '0 12px 24px rgba(255,215,0,1)'
    },
    special: {
      glow: true,
      glowColor: 'rgba(255,215,0,0.5)',
      glowRadius: 20,
      pulseAnimation: true
    }
  }
};
```

### 5.2 筹码选择器UI设计

```html
<!-- 筹码选择器布局 -->
<div class="chip-selector">
  <!-- 筹码列表 (横向滚动) -->
  <div class="chip-list">
    <div class="chip-item" data-value="10" data-selected="false">
      <div class="chip-visual chip-10">
        <div class="chip-center">$10</div>
        <div class="chip-edge"></div>
      </div>
      <div class="chip-label">10</div>
    </div>

    <div class="chip-item" data-value="50" data-selected="false">
      <div class="chip-visual chip-50">
        <div class="chip-center">$50</div>
        <div class="chip-edge"></div>
      </div>
      <div class="chip-label">50</div>
    </div>

    <div class="chip-item" data-value="100" data-selected="true">
      <div class="chip-visual chip-100">
        <div class="chip-center">$100</div>
        <div class="chip-edge"></div>
        <div class="chip-selection-ring"></div> <!-- 选中环 -->
      </div>
      <div class="chip-label">100</div>
    </div>

    <div class="chip-item" data-value="500" data-selected="false">
      <div class="chip-visual chip-500">
        <div class="chip-center">$500</div>
        <div class="chip-edge"></div>
      </div>
      <div class="chip-label">500</div>
    </div>

    <div class="chip-item" data-value="1000" data-selected="false">
      <div class="chip-visual chip-1000">
        <div class="chip-center">$1K</div>
        <div class="chip-edge"></div>
        <div class="chip-glow"></div> <!-- 金色光晕 -->
      </div>
      <div class="chip-label">1K</div>
    </div>
  </div>
</div>
```

```css
.chip-selector {
  position: fixed;
  bottom: 144px; /* 在底栏上方 */
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to top, #0D0D0D 0%, transparent 100%);
  padding: 16px 20px;
  z-index: 100;
}

.chip-list {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 8px;

  /* 隐藏滚动条但保持可滚动 */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.chip-item {
  flex-shrink: 0;
  scroll-snap-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.95);
  }
}

.chip-visual {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  /* 3D立体效果 */
  box-shadow:
    inset 0 2px 4px rgba(255,255,255,0.3), /* 顶部高光 */
    inset 0 -2px 4px rgba(0,0,0,0.3), /* 底部阴影 */
    0 4px 8px rgba(0,0,0,0.4); /* 外阴影 */
}

.chip-item[data-selected="true"] .chip-visual {
  transform: scale(1.2);
  z-index: 10;

  /* 强化阴影 */
  box-shadow:
    inset 0 2px 4px rgba(255,255,255,0.5),
    inset 0 -2px 4px rgba(0,0,0,0.5),
    0 0 0 4px #FFD700, /* 金色选中环 */
    0 8px 16px rgba(255,215,0,0.6);

  /* 脉冲动画 */
  animation: chipPulse 1.5s infinite;
}

@keyframes chipPulse {
  0%, 100% {
    box-shadow:
      inset 0 2px 4px rgba(255,255,255,0.5),
      inset 0 -2px 4px rgba(0,0,0,0.5),
      0 0 0 4px #FFD700,
      0 8px 16px rgba(255,215,0,0.6);
  }
  50% {
    box-shadow:
      inset 0 2px 4px rgba(255,255,255,0.5),
      inset 0 -2px 4px rgba(0,0,0,0.5),
      0 0 0 6px #FFD700,
      0 12px 24px rgba(255,215,0,0.9);
  }
}

.chip-center {
  font-size: 18px;
  font-weight: bold;
  font-family: 'Roboto Mono', monospace;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
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
}

.chip-label {
  font-size: 12px;
  color: #A0A0A0;
  font-weight: 600;
}

/* 各筹码颜色 */
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
  color: #FFD700;
  border-color: #FFD700;
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
    background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
    animation: shimmer 2s infinite;
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%) rotate(0deg); }
  100% { transform: translateX(100%) rotate(360deg); }
}

.chip-1000 {
  background: radial-gradient(circle, #FFD700 0%, #FFA500 100%);
  color: #000000;
  border-color: #000000;

  /* 金色光晕 */
  &::before {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%);
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
    transform: scale(1.1);
  }
}
```

### 5.3 筹码下注动画

```javascript
// 筹码下注动画序列
const chipBettingAnimation = {
  // 点击投注格时触发
  onBetCellClick: (cellElement, chipValue) => {
    // 1. 创建筹码元素
    const chip = createChipElement(chipValue);

    // 2. 获取起点和终点坐标
    const startPos = getChipSelectorPosition(chipValue);
    const endPos = cellElement.getBoundingClientRect();

    // 3. 动画配置
    const animation = {
      keyframes: [
        {
          offset: 0,
          transform: `translate(${startPos.x}px, ${startPos.y}px) scale(1) rotateZ(0deg)`,
          opacity: 1
        },
        {
          offset: 0.3,
          transform: `translate(${(startPos.x + endPos.x) / 2}px, ${startPos.y - 100}px) scale(0.8) rotateZ(180deg)`,
          opacity: 1
        },
        {
          offset: 1,
          transform: `translate(${endPos.x}px, ${endPos.y}px) scale(1) rotateZ(360deg)`,
          opacity: 1
        }
      ],
      options: {
        duration: 600,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // 回弹效果
        fill: 'forwards'
      }
    };

    // 4. 播放动画
    chip.animate(animation.keyframes, animation.options);

    // 5. 播放音效
    playSound('chip-drop.mp3', { volume: 0.7 });

    // 6. 震动反馈
    if (navigator.vibrate) {
      navigator.vibrate(50); // 50ms震动
    }

    // 7. 动画结束后
    animation.onfinish = () => {
      // 将筹码添加到投注格
      cellElement.appendChild(chip);

      // 播放筹码碰撞音效
      playSound('chip-clink.mp3', { volume: 0.5 });

      // 更新投注金额显示
      updateBetAmount(cellElement, chipValue);

      // 筹码堆叠效果
      stackChips(cellElement);
    };
  },

  // 筹码堆叠逻辑
  stackChips: (cellElement) => {
    const chips = cellElement.querySelectorAll('.bet-chip');
    const maxVisible = 5; // 最多显示5个筹码

    chips.forEach((chip, index) => {
      if (index < maxVisible) {
        // 堆叠偏移
        chip.style.transform = `translateY(-${index * 4}px) translateZ(${index * 10}px)`;
        chip.style.zIndex = index;
        chip.style.opacity = 1;
      } else {
        // 超过5个的筹码隐藏,只显示数量
        chip.style.display = 'none';
      }
    });

    // 如果超过5个,显示数量指示器
    if (chips.length > maxVisible) {
      const counter = document.createElement('div');
      counter.className = 'chip-counter';
      counter.textContent = `×${chips.length}`;
      cellElement.appendChild(counter);
    }
  },

  // 清空筹码动画
  clearChips: (cellElement) => {
    const chips = cellElement.querySelectorAll('.bet-chip');

    chips.forEach((chip, index) => {
      // 延迟依次飞回
      setTimeout(() => {
        const animation = chip.animate([
          {
            transform: chip.style.transform,
            opacity: 1
          },
          {
            transform: `translateY(-50px) scale(0)`,
            opacity: 0
          }
        ], {
          duration: 400,
          easing: 'ease-in',
          fill: 'forwards'
        });

        animation.onfinish = () => {
          chip.remove();
        };
      }, index * 50); // 每个筹码间隔50ms
    });

    // 播放清空音效
    playSound('chips-clear.mp3', { volume: 0.6 });
  },

  // 中奖筹码闪烁动画
  winAnimation: (cellElement, winAmount) => {
    const chips = cellElement.querySelectorAll('.bet-chip');

    // 筹码闪烁
    chips.forEach(chip => {
      chip.style.animation = 'chipWinFlash 0.5s ease-in-out 3';
    });

    // 显示中奖金额
    const winLabel = document.createElement('div');
    winLabel.className = 'win-amount-label';
    winLabel.textContent = `+$${winAmount.toFixed(2)}`;
    cellElement.appendChild(winLabel);

    // 中奖金额弹出动画
    winLabel.animate([
      {
        transform: 'translateY(0) scale(0.5)',
        opacity: 0
      },
      {
        transform: 'translateY(-30px) scale(1.2)',
        opacity: 1,
        offset: 0.5
      },
      {
        transform: 'translateY(-60px) scale(1)',
        opacity: 0
      }
    ], {
      duration: 2000,
      easing: 'ease-out',
      fill: 'forwards'
    }).onfinish = () => {
      winLabel.remove();
    };

    // 播放中奖音效
    playSound('win-celebration.mp3', { volume: 0.8 });
  }
};
```

---

## 6. 游戏历史与统计界面

### 6.1 历史记录专业布局

```html
<!-- 游戏历史界面 -->
<div class="history-panel">
  <!-- 顶部标签页 -->
  <div class="history-tabs">
    <button class="tab active" data-tab="recent">最近开奖</button>
    <button class="tab" data-tab="statistics">统计分析</button>
    <button class="tab" data-tab="my-bets">我的投注</button>
  </div>

  <!-- 最近开奖 -->
  <div class="tab-content active" id="recent-results">
    <!-- 路单显示 (Bead Road) -->
    <div class="bead-road">
      <div class="road-header">
        <h3>路单</h3>
        <div class="legend">
          <span class="legend-item"><span class="dot big"></span>大</span>
          <span class="legend-item"><span class="dot small"></span>小</span>
          <span class="legend-item"><span class="dot odd"></span>单</span>
          <span class="legend-item"><span class="dot even"></span>双</span>
        </div>
      </div>

      <!-- 路单网格 (最近50局) -->
      <div class="road-grid">
        <!-- 每一格代表一局结果 -->
        <div class="road-cell" data-result="big-odd">
          <div class="cell-dots">
            <span class="dot big"></span>
            <span class="dot odd"></span>
          </div>
          <div class="cell-number">15</div>
        </div>

        <div class="road-cell" data-result="small-even">
          <div class="cell-dots">
            <span class="dot small"></span>
            <span class="dot even"></span>
          </div>
          <div class="cell-number">6</div>
        </div>

        <!-- ... 更多格子 ... -->
      </div>
    </div>

    <!-- 详细历史列表 -->
    <div class="detailed-history">
      <div class="history-item">
        <div class="round-info">
          <span class="round-number">#123456</span>
          <span class="round-time">2分钟前</span>
        </div>

        <div class="dice-result">
          <!-- 三颗骰子展示 -->
          <div class="dice-face">
            <img src="/dice/dice-4.svg" alt="4">
          </div>
          <div class="dice-face">
            <img src="/dice/dice-5.svg" alt="5">
          </div>
          <div class="dice-face">
            <img src="/dice/dice-6.svg" alt="6">
          </div>

          <div class="total-points">
            <span class="number">15</span>
            <span class="labels">
              <span class="badge big">大</span>
              <span class="badge odd">单</span>
            </span>
          </div>
        </div>

        <div class="winning-bets">
          <span class="win-item">大(1:1)</span>
          <span class="win-item">单(1:1)</span>
          <span class="win-item">15点(18:1)</span>
        </div>
      </div>

      <!-- 更多历史记录... -->
    </div>
  </div>

  <!-- 统计分析 -->
  <div class="tab-content" id="statistics">
    <!-- 大小单双统计 -->
    <div class="stats-section">
      <h3>大小单双分布 (近100局)</h3>

      <div class="distribution-chart">
        <!-- 大小饼图 -->
        <div class="pie-chart">
          <canvas id="big-small-pie"></canvas>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="color-box big"></span>
              <span>大: 52%</span>
            </div>
            <div class="legend-item">
              <span class="color-box small"></span>
              <span>小: 48%</span>
            </div>
          </div>
        </div>

        <!-- 单双饼图 -->
        <div class="pie-chart">
          <canvas id="odd-even-pie"></canvas>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="color-box odd"></span>
              <span>单: 49%</span>
            </div>
            <div class="legend-item">
              <span class="color-box even"></span>
              <span>双: 51%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 点数分布柱状图 -->
    <div class="stats-section">
      <h3>点数分布 (4-17)</h3>
      <div class="bar-chart">
        <canvas id="points-distribution"></canvas>
      </div>
    </div>

    <!-- 热号冷号 -->
    <div class="stats-section">
      <h3>单骰号热度 (1-6)</h3>
      <div class="hot-cold-grid">
        <div class="dice-stat hot" data-number="1">
          <div class="dice-icon">1</div>
          <div class="stat-info">
            <span class="frequency">34次</span>
            <span class="percentage">22.7%</span>
          </div>
          <div class="stat-bar">
            <div class="bar-fill" style="width: 22.7%"></div>
          </div>
        </div>

        <!-- 2-6 类似结构 -->
      </div>
    </div>
  </div>

  <!-- 我的投注 -->
  <div class="tab-content" id="my-bets">
    <!-- 统计卡片 -->
    <div class="my-stats-cards">
      <div class="stat-card">
        <div class="stat-value">$1,234.56</div>
        <div class="stat-label">总投注额</div>
      </div>

      <div class="stat-card win">
        <div class="stat-value">$1,567.89</div>
        <div class="stat-label">总赢取</div>
      </div>

      <div class="stat-card profit">
        <div class="stat-value">+$333.33</div>
        <div class="stat-label">净盈利</div>
        <div class="stat-trend up">+26.97%</div>
      </div>

      <div class="stat-card">
        <div class="stat-value">58.3%</div>
        <div class="stat-label">胜率</div>
      </div>
    </div>

    <!-- 投注记录列表 -->
    <div class="my-bets-list">
      <div class="bet-record win">
        <div class="record-header">
          <span class="round-number">#123456</span>
          <span class="round-time">5分钟前</span>
          <span class="result-badge win">中奖</span>
        </div>

        <div class="record-body">
          <div class="bet-details">
            <div class="bet-item">
              <span class="bet-type">大(1:1)</span>
              <span class="bet-amount">$100.00</span>
            </div>
            <div class="bet-item">
              <span class="bet-type">15点(18:1)</span>
              <span class="bet-amount">$50.00</span>
            </div>
          </div>

          <div class="dice-result-mini">
            <span class="dice">4</span>
            <span class="dice">5</span>
            <span class="dice">6</span>
            <span class="total">= 15</span>
          </div>
        </div>

        <div class="record-footer">
          <div class="total-bet">总下注: $150.00</div>
          <div class="total-win">赢取: $1,000.00</div>
          <div class="profit win">+$850.00</div>
        </div>
      </div>

      <!-- 更多投注记录... -->
    </div>
  </div>
</div>
```

### 6.2 历史记录样式规范

```css
/* 路单显示 */
.bead-road {
  background: #1A1A1A;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.road-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 40px);
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.road-cell {
  width: 40px;
  height: 40px;
  background: #2A2A2A;
  border: 1px solid #3A3A3A;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #3A3A3A;
    transform: scale(1.1);
  }
}

.cell-dots {
  display: flex;
  gap: 2px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.big {
    background: #FF4444;
    box-shadow: 0 0 4px #FF4444;
  }

  &.small {
    background: #4444FF;
    box-shadow: 0 0 4px #4444FF;
  }

  &.odd {
    background: #FFA500;
    box-shadow: 0 0 4px #FFA500;
  }

  &.even {
    background: #00FF00;
    box-shadow: 0 0 4px #00FF00;
  }
}

.cell-number {
  font-size: 10px;
  font-weight: bold;
  color: #FFD700;
  margin-top: 2px;
}

/* 详细历史列表 */
.history-item {
  background: #1A1A1A;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #3A3A3A;
  transition: all 0.2s;

  &:hover {
    border-color: #FFD700;
    box-shadow: 0 4px 12px rgba(255,215,0,0.2);
  }
}

.round-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.round-number {
  font-family: 'Roboto Mono', monospace;
  font-weight: bold;
  color: #FFD700;
  font-size: 14px;
}

.round-time {
  color: #A0A0A0;
  font-size: 12px;
}

.dice-result {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.dice-face {
  width: 48px;
  height: 48px;
  background: #FFFFFF;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);

  img {
    width: 100%;
    height: 100%;
  }
}

.total-points {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding-left: 12px;
  border-left: 2px solid #FFD700;

  .number {
    font-size: 32px;
    font-weight: bold;
    font-family: 'Roboto Mono', monospace;
    color: #FFD700;
    text-shadow: 0 0 10px rgba(255,215,0,0.6);
  }

  .labels {
    display: flex;
    gap: 4px;
  }

  .badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: bold;

    &.big {
      background: #FF4444;
      color: #FFFFFF;
    }

    &.small {
      background: #4444FF;
      color: #FFFFFF;
    }

    &.odd {
      background: #FFA500;
      color: #FFFFFF;
    }

    &.even {
      background: #00FF00;
      color: #000000;
    }
  }
}

.winning-bets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.win-item {
  background: rgba(255,215,0,0.1);
  border: 1px solid #FFD700;
  color: #FFD700;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

/* 统计图表 */
.stats-section {
  background: #1A1A1A;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;

  h3 {
    color: #FFD700;
    font-size: 18px;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #3A3A3A;
  }
}

.distribution-chart {
  display: flex;
  gap: 24px;
  justify-content: space-around;
}

.pie-chart {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  canvas {
    max-width: 150px;
    max-height: 150px;
  }
}

.chart-legend {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;

  .color-box {
    width: 16px;
    height: 16px;
    border-radius: 3px;

    &.big {
      background: #FF4444;
    }
    &.small {
      background: #4444FF;
    }
    &.odd {
      background: #FFA500;
    }
    &.even {
      background: #00FF00;
    }
  }
}

/* 热号冷号 */
.hot-cold-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.dice-stat {
  background: #2A2A2A;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  border: 2px solid #3A3A3A;
  transition: all 0.3s;

  &.hot {
    border-color: #FF4444;
    background: linear-gradient(135deg, rgba(255,68,68,0.1) 0%, #2A2A2A 100%);
  }

  &.cold {
    border-color: #4444FF;
    background: linear-gradient(135deg, rgba(68,68,255,0.1) 0%, #2A2A2A 100%);
  }
}

.dice-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 12px;
  background: #FFFFFF;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  color: #000000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;

  .frequency {
    font-size: 18px;
    font-weight: bold;
    color: #FFFFFF;
  }

  .percentage {
    font-size: 14px;
    color: #FFD700;
  }
}

.stat-bar {
  height: 6px;
  background: #1A1A1A;
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
  transition: width 0.5s ease;
}

/* 我的投注统计卡片 */
.my-stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%);
  border-radius: 12px;
  padding: 16px;
  border: 2px solid #3A3A3A;
  text-align: center;

  &.win {
    border-color: #10B981;
    background: linear-gradient(135deg, rgba(16,185,129,0.1) 0%, #1A1A1A 100%);
  }

  &.profit {
    border-color: #FFD700;
    background: linear-gradient(135deg, rgba(255,215,0,0.1) 0%, #1A1A1A 100%);
  }
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  font-family: 'Roboto Mono', monospace;
  color: #FFD700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #A0A0A0;
}

.stat-trend {
  margin-top: 4px;
  font-size: 14px;
  font-weight: 600;

  &.up {
    color: #10B981;
  }

  &.down {
    color: #EF4444;
  }
}

/* 投注记录 */
.bet-record {
  background: #1A1A1A;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 2px solid #3A3A3A;

  &.win {
    border-color: #10B981;
    background: linear-gradient(135deg, rgba(16,185,129,0.05) 0%, #1A1A1A 100%);
  }

  &.lose {
    border-color: #EF4444;
    background: linear-gradient(135deg, rgba(239,68,68,0.05) 0%, #1A1A1A 100%);
  }
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.result-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;

  &.win {
    background: #10B981;
    color: #FFFFFF;
  }

  &.lose {
    background: #EF4444;
    color: #FFFFFF;
  }

  &.pending {
    background: #F59E0B;
    color: #FFFFFF;
  }
}

.record-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.bet-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bet-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;

  .bet-type {
    color: #FFFFFF;
  }

  .bet-amount {
    color: #FFD700;
    font-weight: bold;
    font-family: 'Roboto Mono', monospace;
  }
}

.dice-result-mini {
  display: flex;
  gap: 4px;
  align-items: center;

  .dice {
    width: 32px;
    height: 32px;
    background: #FFFFFF;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #000000;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .total {
    margin-left: 4px;
    font-size: 16px;
    font-weight: bold;
    color: #FFD700;
  }
}

.record-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #3A3A3A;
  font-size: 13px;
  font-family: 'Roboto Mono', monospace;
}

.total-bet {
  color: #A0A0A0;
}

.total-win {
  color: #10B981;
}

.profit {
  font-size: 16px;
  font-weight: bold;

  &.win {
    color: #10B981;
  }

  &.lose {
    color: #EF4444;
  }
}
```

---

## 7. 移动端优化与响应式设计

### 7.1 移动端布局优化

基于用户提供的专业骰宝游戏截图,针对Telegram移动端进行以下优化:

```css
/* 移动端优先设计 */
@media (max-width: 480px) {
  /* 游戏大厅布局 */
  .game-hall {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  /* 顶栏 */
  .top-bar {
    position: sticky;
    top: 0;
    z-index: 1000;
    height: 56px;
    background: #0D0D0D;
    border-bottom: 2px solid #FFD700;
    padding: 8px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* 骰盅展示区 - 压缩高度 */
  .dice-area {
    height: 240px; /* 从300px压缩到240px */
    background: linear-gradient(180deg, #1A1A1A 0%, #0D0D0D 100%);
    position: relative;
    overflow: hidden;
  }

  /* 投注面板 - 可滚动 */
  .betting-panel {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px 120px; /* 底部预留筹码栏+底栏空间 */
    background: #0D0D0D;

    /* 优化滚动 */
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }

  /* 投注格适配小屏 */
  .bet-cell {
    /* 大小单双格 */
    &.primary {
      min-width: calc((100vw - 56px) / 4); /* 4列,减去边距 */
      height: 70px;
    }

    /* 点数格 */
    &.points {
      width: calc((100vw - 64px) / 7); /* 7列 */
      height: 60px;
      font-size: 12px;
    }

    /* 两骰组合格 */
    &.combination {
      width: calc((100vw - 72px) / 5); /* 5列 */
      height: 55px;
      font-size: 11px;
    }
  }

  /* 筹码选择栏 - 固定底部上方 */
  .chip-selector {
    position: fixed;
    bottom: 64px; /* 底栏上方 */
    left: 0;
    right: 0;
    height: 90px;
    background: linear-gradient(to top, #0D0D0D 70%, transparent 100%);
    padding: 8px 12px;
    z-index: 900;
  }

  /* 底部操作栏 - 固定最底部 */
  .bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: #1A1A1A;
    border-top: 2px solid #FFD700;
    padding: 8px 16px;
    display: flex;
    gap: 8px;
    z-index: 1000;

    /* 确保不被安全区域遮挡 */
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
  }

  /* 按钮适配 */
  .action-button {
    flex: 1;
    height: 48px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: bold;
    border: none;
    cursor: pointer;
    transition: all 0.2s;

    /* 触摸优化 */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;

    &:active {
      transform: scale(0.95);
    }

    /* 确认下注按钮 */
    &.confirm-bet {
      flex: 2; /* 占2倍宽度 */
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      color: #000000;
      box-shadow: 0 4px 12px rgba(255,215,0,0.5);

      /* 脉冲动画 */
      animation: betPulse 2s infinite;
    }

    /* 清空按钮 */
    &.clear-bet {
      background: transparent;
      border: 2px solid #FFD700;
      color: #FFD700;
    }
  }
}

@keyframes betPulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(255,215,0,0.5);
  }
  50% {
    box-shadow: 0 6px 20px rgba(255,215,0,0.8);
  }
}

/* iPhone刘海屏适配 */
@supports (padding-top: env(safe-area-inset-top)) {
  .top-bar {
    padding-top: calc(8px + env(safe-area-inset-top));
    height: calc(56px + env(safe-area-inset-top));
  }

  .game-hall {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* 横屏适配 */
@media (max-width: 920px) and (orientation: landscape) {
  .dice-area {
    height: 180px; /* 横屏压缩骰盅区 */
  }

  .betting-panel {
    padding-bottom: 90px; /* 减少底部空间 */
  }

  .chip-selector {
    height: 70px;
    bottom: 56px;
  }

  .bottom-bar {
    height: 56px;
  }
}
```

### 7.2 触摸交互优化

```javascript
// 触摸交互增强
const touchInteractionEnhancements = {
  // 防止误触
  preventAccidentalTouch: {
    // 最小按钮尺寸
    minButtonSize: 44, // px (iOS标准)

    // 按钮间距
    buttonSpacing: 8, // px

    // 双击确认 (重要操作)
    doubleClickConfirm: {
      enabled: true,
      interval: 300, // ms
      targets: ['.confirm-bet-button']
    }
  },

  // 触觉反馈
  hapticFeedback: {
    // 轻触反馈 (选择筹码)
    light: {
      duration: 10, // ms
      intensity: 0.3
    },

    // 中等反馈 (点击投注格)
    medium: {
      duration: 30, // ms
      intensity: 0.6
    },

    // 强烈反馈 (确认下注)
    heavy: {
      duration: 50, // ms
      intensity: 1.0
    },

    // 成功反馈 (中奖)
    success: {
      pattern: [0, 50, 100, 50], // [delay, vibrate, delay, vibrate]
      intensity: 1.0
    },

    // 错误反馈 (余额不足)
    error: {
      pattern: [0, 100, 50, 100], // 更长更急促
      intensity: 0.8
    }
  },

  // 手势支持
  gestures: {
    // 长按投注格 - 快速重复下注
    longPress: {
      duration: 500, // ms
      action: 'repeat-bet',
      feedback: 'vibrate'
    },

    // 双指缩放 - 查看历史记录
    pinchZoom: {
      enabled: false // 禁用,避免误触
    },

    // 下拉刷新 - 刷新余额
    pullRefresh: {
      enabled: true,
      threshold: 80, // px
      action: 'refresh-balance'
    },

    // 侧滑 - 打开走势图
    swipe: {
      left: {
        enabled: true,
        threshold: 100, // px
        action: 'open-trend-panel'
      },
      right: {
        enabled: true,
        action: 'close-trend-panel'
      }
    }
  },

  // 性能优化
  performance: {
    // 防抖动 (多次点击)
    debounce: {
      delay: 200, // ms
      targets: ['.bet-cell', '.chip-button']
    },

    // 节流 (滚动事件)
    throttle: {
      delay: 100, // ms
      targets: ['scroll', 'resize']
    },

    // 延迟加载
    lazyLoad: {
      images: true,
      threshold: 0.1 // 10%可见时加载
    }
  }
};

// 实现示例
class TouchEnhancer {
  constructor(element) {
    this.element = element;
    this.setupTouchHandlers();
  }

  setupTouchHandlers() {
    // 点击投注格
    this.element.addEventListener('touchstart', (e) => {
      // 轻触觉反馈
      this.vibrate(30);

      // 视觉反馈
      e.target.classList.add('touching');
    });

    this.element.addEventListener('touchend', (e) => {
      e.target.classList.remove('touching');
    });

    // 长按
    let longPressTimer;
    this.element.addEventListener('touchstart', (e) => {
      longPressTimer = setTimeout(() => {
        this.onLongPress(e.target);
      }, 500);
    });

    this.element.addEventListener('touchend', () => {
      clearTimeout(longPressTimer);
    });
  }

  vibrate(duration, intensity = 1.0) {
    if (navigator.vibrate) {
      navigator.vibrate(duration * intensity);
    }
  }

  onLongPress(target) {
    // 长按快速重复下注
    this.vibrate(50, 1.0);
    target.classList.add('long-press-active');

    // 显示快速重复下注菜单
    showQuickRepeatMenu(target);
  }
}
```

### 7.3 适配不同屏幕尺寸

```javascript
// 响应式断点管理
const responsiveBreakpoints = {
  // 小屏手机 (iPhone SE, iPhone 8)
  small: {
    maxWidth: 374,
    config: {
      diceCupSize: 'small',
      betCellSize: 'compact',
      fontSize: 'small',
      chipsVisible: 5,
      historyItemsPerPage: 15
    }
  },

  // 标准手机 (iPhone 13, iPhone 14)
  medium: {
    minWidth: 375,
    maxWidth: 429,
    config: {
      diceCupSize: 'medium',
      betCellSize: 'normal',
      fontSize: 'medium',
      chipsVisible: 5,
      historyItemsPerPage: 20
    }
  },

  // 大屏手机 (iPhone 15 Pro Max, Samsung S24 Ultra)
  large: {
    minWidth: 430,
    maxWidth: 479,
    config: {
      diceCupSize: 'large',
      betCellSize: 'comfortable',
      fontSize: 'large',
      chipsVisible: 5,
      historyItemsPerPage: 25
    }
  },

  // 平板 (iPad Mini)
  tablet: {
    minWidth: 480,
    maxWidth: 767,
    config: {
      diceCupSize: 'xlarge',
      betCellSize: 'spacious',
      fontSize: 'xlarge',
      chipsVisible: 5,
      historyItemsPerPage: 30,
      layout: 'two-column' // 两列布局
    }
  },

  // 桌面 (Telegram Desktop)
  desktop: {
    minWidth: 768,
    config: {
      diceCupSize: 'xxlarge',
      betCellSize: 'spacious',
      fontSize: 'xxlarge',
      chipsVisible: 5,
      historyItemsPerPage: 50,
      layout: 'three-column', // 三列布局
      showSidePanel: true // 显示侧边栏
    }
  }
};

// 动态适配函数
function applyResponsiveConfig() {
  const width = window.innerWidth;
  let config;

  if (width <= 374) {
    config = responsiveBreakpoints.small.config;
  } else if (width <= 429) {
    config = responsiveBreakpoints.medium.config;
  } else if (width <= 479) {
    config = responsiveBreakpoints.large.config;
  } else if (width <= 767) {
    config = responsiveBreakpoints.tablet.config;
  } else {
    config = responsiveBreakpoints.desktop.config;
  }

  // 应用配置
  document.documentElement.style.setProperty('--dice-cup-size', config.diceCupSize);
  document.documentElement.style.setProperty('--bet-cell-size', config.betCellSize);
  document.documentElement.style.setProperty('--font-size-base', config.fontSize);

  // 更新布局
  document.body.dataset.layout = config.layout || 'single-column';

  // 更新其他配置
  updateChipsDisplay(config.chipsVisible);
  updateHistoryPagination(config.historyItemsPerPage);

  if (config.showSidePanel) {
    showSidePanel();
  }
}

// 监听屏幕变化
window.addEventListener('resize', debounce(applyResponsiveConfig, 250));
window.addEventListener('orientationchange', applyResponsiveConfig);

// 初始化
document.addEventListener('DOMContentLoaded', applyResponsiveConfig);
```

---

## 8. 开发交付清单

### 8.1 设计资产清单

#### 必需的图形资源

**3D模型文件**:
- [ ] 骰盅底座模型 (GLTF/GLB格式)
- [ ] 骰盅圆顶模型 (GLTF/GLB格式,带透明度)
- [ ] 骰子模型×3 (GLTF/GLB格式,含6面贴图)
- [ ] 赌桌模型 (可选,或使用平面+纹理)

**纹理贴图**:
- [ ] 拉丝金纹理 (2048×2048, PNG)
- [ ] 天鹅绒绒布纹理 (2048×2048, PNG)
- [ ] 骰子法线贴图 (1024×1024, PNG)
- [ ] 赌桌绒布纹理 (2048×2048, PNG)
- [ ] 筹码图案纹理 (512×512, PNG, 5种面值)

**2D图形资源**:
- [ ] 筹码图标 (SVG + PNG, 5种面值,多种尺寸)
- [ ] 骰子点数图标 (SVG, 1-6点,用于降级方案)
- [ ] 导航图标 (SVG, 20×20px)
- [ ] 功能图标 (SVG, 24×24px)
- [ ] Logo (SVG + PNG, 多种尺寸)

**动画资源**:
- [ ] 骰子滚动Lottie动画 (JSON, 多种结果)
- [ ] 加载动画 (Lottie JSON)
- [ ] 中奖庆祝动画 (Lottie JSON)
- [ ] 粒子特效动画 (Sprite Sheet)

**音频资源**:
- [ ] 骰盅晃动音效 (MP3/OGG, 2s)
- [ ] 骰盅打开音效 (MP3/OGG, 0.5s)
- [ ] 骰子滚动碰撞音效 (MP3/OGG, 多个变体)
- [ ] 筹码掉落音效 (MP3/OGG, 0.3s)
- [ ] 中奖庆祝音效 (MP3/OGG, 3s)
- [ ] 按钮点击音效 (MP3/OGG, 0.1s)
- [ ] 背景音乐 (MP3, 循环,可选)

### 8.2 技术实现要点

#### 关键技术依赖

```json
{
  "dependencies": {
    "three": "^0.160.0",
    "cannon-es": "^0.20.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.90.0",
    "lottie-react": "^2.4.0",
    "recharts": "^2.10.0",
    "framer-motion": "^10.16.0"
  }
}
```

#### 性能优化要求

```javascript
const performanceTargets = {
  // 首屏加载
  firstContentfulPaint: {
    target: 1500, // ms
    critical: 2500
  },

  // 交互响应
  timeToInteractive: {
    target: 3000, // ms
    critical: 5000
  },

  // 运行时性能
  frameRate: {
    target: 60, // fps
    acceptable: 30
  },

  // 内存使用
  memoryUsage: {
    target: 150, // MB
    maximum: 300
  },

  // 网络请求
  apiResponseTime: {
    target: 500, // ms
    maximum: 2000
  }
};
```

### 8.3 测试清单

#### 功能测试
- [ ] 所有投注选项可正常下注
- [ ] 筹码选择和叠加正确显示
- [ ] 3D骰子动画正常播放
- [ ] 开奖结果计算准确
- [ ] 中奖金额正确结算
- [ ] 余额实时更新
- [ ] 历史记录正确保存和显示
- [ ] 统计数据准确计算

#### 兼容性测试
- [ ] iPhone 12/13/14/15 (iOS 15-17)
- [ ] iPhone SE (小屏)
- [ ] Samsung Galaxy S22/S23/S24 (Android 12-14)
- [ ] iPad Pro (平板)
- [ ] Telegram Desktop (macOS/Windows)
- [ ] 低端Android设备 (降级方案)

#### 性能测试
- [ ] 首屏加载时间 <3s (4G网络)
- [ ] 3D动画帧率 >30fps (中端设备)
- [ ] 内存使用 <200MB
- [ ] 无内存泄漏
- [ ] 长时间运行稳定性 (1小时+)

#### 用户体验测试
- [ ] 触摸目标 ≥44px
- [ ] 触觉反馈正常工作
- [ ] 无误触问题
- [ ] 滚动流畅
- [ ] 动画流畅不卡顿
- [ ] 音效清晰不刺耳

---

## 9. 与V1.0的对比总结

| 方面 | V1.0 (当前版本) | V2.0 Professional (本设计) |
|:----:|:---------------:|:-------------------------:|
| **投注桌布局** | 自定义布局,不符合赌场标准 | 传统Macau/Evolution标准布局 |
| **3D骰盅** | 简单3D模型 | 专业金色圆顶骰盅,带透明效果 |
| **骰子动画** | 基础物理模拟 | 高级物理引擎 + 真实材质 |
| **筹码系统** | 简单颜色区分 | 真实赌场筹码设计,5种面值 |
| **色彩方案** | 暗红+金色 | 赌场级配色 (金/红/黑) |
| **投注格设计** | 基础格子 | 专业赌场格子,含绒布纹理 |
| **交互反馈** | 基础点击反馈 | 触觉+视觉+听觉三重反馈 |
| **历史记录** | 简单列表 | 专业路单 + 统计图表 |
| **赔率展示** | 基础文字 | 专业排版,多级高亮 |
| **移动端优化** | 基础响应式 | 深度触摸优化,防误触 |
| **降级方案** | 无 | 完整降级策略 (3D→2D→图片) |
| **音效系统** | 简单音效 | 分层次音效系统 |

---

## 10. 分阶段实施建议

### 第一阶段 (P0 - 2周)
✅ 重新设计投注桌布局 (符合赌场标准)
✅ 实现专业筹码UI和交互
✅ 优化移动端触摸体验
✅ 更新色彩系统为赌场级标准

### 第二阶段 (P1 - 2周)
✅ 开发专业3D金色骰盅
✅ 实现高级物理骰子动画
✅ 添加真实材质和纹理
✅ 完善音效系统

### 第三阶段 (P1 - 1周)
✅ 实现专业历史记录和路单
✅ 添加统计图表功能
✅ 优化游戏历史UI

### 第四阶段 (P2 - 1周)
✅ 实现降级方案
✅ 性能优化
✅ 多设备兼容性测试
✅ 最终打磨和调优

---

## 文档状态

**版本**: V2.0 Professional Edition
**状态**: ✅ 已完成
**下一步行动**:
1. UI/UX设计师根据本规范创建高保真设计稿
2. 3D设计师制作骰盅和骰子模型
3. 前端工程师按阶段实施开发
4. 与产品经理确认关键功能优先级

---

*本文档基于专业Sic-Bo游戏市场调研,参考Evolution Gaming和Macau赌场标准,为骰宝夺宝项目提供专业级重新设计方案*
