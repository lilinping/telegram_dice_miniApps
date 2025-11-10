# 骰宝夺宝 / DiceTreasure

> Telegram生态内首款移动优先、高沉浸感的实时骰宝游戏

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

## 📖 项目简介

骰宝夺宝是一款基于Telegram WebApp的在线骰宝游戏，融合即时动画、社交互动与加密货币支付，为用户提供沉浸式、便捷、可信的游戏体验。

**核心特性：**
- 🎲 **3D骰子动画** - 基于Three.js的真实物理模拟
- 💰 **加密货币支付** - 支持USDT (TRC20/ERC20)、TON快速充值提现
- 📱 **移动优先** - 专为移动端优化的交互体验
- 🏆 **社交竞技** - 排行榜、邀请好友、VIP等级系统
- ⚡ **即时反馈** - 实时开奖、秒速结算

---

## 🚀 技术栈

### 前端技术
- **框架**: [Next.js 14](https://nextjs.org/) (App Router)
- **语言**: [TypeScript 5.0](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
- **3D渲染**: [Three.js](https://threejs.org/) + [Cannon.js](https://github.com/schteppe/cannon.js)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **图表**: [Recharts](https://recharts.org/)

### Telegram集成
- **SDK**: [Telegram WebApp API](https://core.telegram.org/bots/webapps)
- **钱包**: [TON Connect v2](https://github.com/ton-connect/sdk)

### 开发工具
- **包管理**: npm / yarn / pnpm
- **代码规范**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged

---

## 📁 目录结构

```
telegram_dice_prd/
├── src/
│   ├── app/                      # Next.js App Router页面
│   │   ├── page.tsx             # 启动欢迎页
│   │   ├── game/                # 游戏大厅
│   │   ├── wallet/              # 钱包页面
│   │   ├── deposit/             # 充值页面
│   │   ├── withdraw/            # 提现页面
│   │   ├── history/             # 历史记录
│   │   ├── rules/               # 规则说明
│   │   ├── leaderboard/         # 排行榜
│   │   ├── profile/             # 个人中心
│   │   ├── invite/              # 邀请好友
│   │   ├── vip/                 # VIP中心
│   │   └── layout.tsx           # 全局布局
│   │
│   ├── components/              # 组件库
│   │   ├── ui/                  # UI基础组件
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/              # 布局组件
│   │   │   ├── TopBar.tsx
│   │   │   └── BottomNav.tsx
│   │   └── game/                # 游戏组件
│   │       ├── DiceCup.tsx      # 3D骰盅
│   │       ├── BetPanel.tsx     # 投注面板
│   │       └── Countdown.tsx    # 倒计时
│   │
│   ├── contexts/                # Context状态管理
│   │   ├── TelegramContext.tsx  # Telegram数据
│   │   ├── GameContext.tsx      # 游戏状态
│   │   └── WalletContext.tsx    # 钱包状态
│   │
│   ├── lib/                     # 工具函数和配置
│   │   ├── utils.ts             # 通用工具
│   │   ├── types.ts             # TypeScript类型定义
│   │   ├── store.ts             # Zustand状态管理
│   │   └── constants.ts         # 常量配置
│   │
│   └── styles/                  # 样式文件
│       └── globals.css          # 全局样式
│
├── public/                      # 静态资源
│   ├── icons/                   # 图标
│   ├── images/                  # 图片
│   └── models/                  # 3D模型
│
├── docs/                        # 文档
│   ├── PRD.md                   # 产品需求文档
│   ├── DESIGN_SPEC.md           # 设计规范文档
│   └── DEPLOYMENT.md            # 部署指南
│
├── .env.example                 # 环境变量示例
├── .gitignore                   # Git忽略规则
├── next.config.js               # Next.js配置
├── tailwind.config.ts           # Tailwind配置
├── tsconfig.json                # TypeScript配置
├── package.json                 # 项目依赖
└── README.md                    # 项目说明（本文件）
```

---

## 🎯 功能特性

### 核心功能（P0）
- ✅ **启动欢迎页** - 品牌展示、快速加载、Telegram授权
- ✅ **游戏大厅** - 投注面板、3D开奖动画、实时结算
- ✅ **钱包管理** - 余额查看、交易记录、充值提现入口
- ✅ **充值功能** - USDT (TRC20/ERC20)、TON支付
- ✅ **提现功能** - 安全提现、KYC验证
- ✅ **历史记录** - 投注历史、开奖历史、走势分析
- ✅ **规则说明** - 图文规则、赔率表、常见问题

### 次要功能（P1）
- ✅ **排行榜** - 日榜/周榜/总榜、我的排名
- ✅ **个人中心** - 用户信息、统计数据、功能入口
- ✅ **邀请好友** - 专属链接、奖励规则、邀请记录
- ✅ **VIP中心** - 等级体系、权益对比、升级引导

### 远期规划（P2）
- 🔜 **实时聊天** - 玩家互动、表情、举报
- 🔜 **任务系统** - 每日任务、成就勋章
- 🔜 **真人直播** - Live Dealer骰宝
- 🔜 **多语言** - 英语、中文、俄语等
- 🔜 **皮肤商城** - 骰子皮肤、赌桌主题

---

## 🛠️ 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0 (或 yarn / pnpm)

### 1. 克隆项目
```bash
git clone https://github.com/your-username/telegram_dice_prd.git
cd telegram_dice_prd
```

### 2. 安装依赖
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 3. 配置环境变量
复制 `.env.example` 为 `.env.local` 并填写配置：
```bash
cp .env.example .env.local
```

编辑 `.env.local`：
```env
# Telegram Bot配置
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token_here

# API地址
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# 支付配置
NEXT_PUBLIC_USDT_TRC20_ADDRESS=your_wallet_address
NEXT_PUBLIC_USDT_ERC20_ADDRESS=your_wallet_address
NEXT_PUBLIC_TON_ADDRESS=your_ton_address
```

### 4. 运行开发服务器
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 5. 构建生产版本
```bash
npm run build
npm run start
```

---

## 🔧 环境变量配置

| 变量名 | 说明 | 示例值 | 必填 |
|--------|------|--------|------|
| `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` | Telegram Bot Token | `123456:ABC-DEF...` | ✅ |
| `NEXT_PUBLIC_API_URL` | 后端API地址 | `https://api.example.com` | ✅ |
| `NEXT_PUBLIC_USDT_TRC20_ADDRESS` | USDT TRC20钱包地址 | `TXs7n...k3Lm` | ✅ |
| `NEXT_PUBLIC_USDT_ERC20_ADDRESS` | USDT ERC20钱包地址 | `0x123...` | ❌ |
| `NEXT_PUBLIC_TON_ADDRESS` | TON钱包地址 | `EQ...` | ❌ |
| `NEXT_PUBLIC_ENABLE_3D` | 是否启用3D动画 | `true` / `false` | ❌ |

---

## 📱 Telegram WebApp集成

### 1. 创建Telegram Bot
1. 在Telegram中找到 [@BotFather](https://t.me/BotFather)
2. 发送 `/newbot` 创建新Bot
3. 获取Bot Token

### 2. 配置WebApp
1. 发送 `/mybots` 选择你的Bot
2. 选择 `Bot Settings` → `Menu Button` → `Configure Menu Button`
3. 设置WebApp URL: `https://your-domain.com`

### 3. 测试WebApp
1. 在Telegram中打开你的Bot
2. 点击底部菜单按钮即可启动WebApp

---

## 🎨 开发指南

### 组件开发规范
```tsx
// 使用TypeScript定义Props类型
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

// 使用函数组件 + 箭头函数
export default function Button({ variant = 'primary', size = 'md', children, onClick }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### 样式规范
- 使用Tailwind CSS工具类
- 颜色使用设计规范中定义的变量
- 间距使用8px基准系统

### 状态管理
```tsx
import { useGameStore } from '@/lib/store';

function GameComponent() {
  const { balance, updateBalance } = useGameStore();

  return <div>余额: {balance} USDT</div>;
}
```

---

## 🚀 部署指南

详细部署步骤请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

### Vercel部署（推荐）
1. 将代码推送到GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 自动部署完成

### 自建服务器部署
```bash
# 构建
npm run build

# 使用PM2运行
pm2 start npm --name "dice-treasure" -- start

# 配置Nginx反向代理
# 详见 DEPLOYMENT.md
```

---

## 📊 项目截图

### 游戏大厅
![游戏大厅](docs/screenshots/game-hall.png)

### 3D开奖动画
![开奖动画](docs/screenshots/dice-animation.png)

### VIP中心
![VIP中心](docs/screenshots/vip-center.png)

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 提交Issue
- Bug报告
- 功能建议
- 文档改进

### 提交Pull Request
1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 📞 联系方式

- **项目主页**: [https://github.com/your-username/telegram_dice_prd](https://github.com/your-username/telegram_dice_prd)
- **问题反馈**: [GitHub Issues](https://github.com/your-username/telegram_dice_prd/issues)
- **Telegram群组**: [https://t.me/DiceTreasureGroup](https://t.me/DiceTreasureGroup)
- **官方网站**: [https://dicetreasure.io](https://dicetreasure.io)

---

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Three.js](https://threejs.org/) - 3D渲染库
- [Framer Motion](https://www.framer.com/motion/) - 动画库
- [Telegram](https://telegram.org/) - 即时通讯平台

---

## 📝 更新日志

### V1.0.0 (2025-11-09)
- ✨ 初始版本发布
- ✅ 完成核心游戏功能（P0）
- ✅ 完成次要功能（P1）
- ✅ Telegram WebApp集成
- ✅ 加密货币支付集成

---

**Happy Gaming! 🎲🎉**
