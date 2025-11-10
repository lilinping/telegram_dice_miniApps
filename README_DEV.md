# 骰宝夺宝 (DiceTreasure) - 前端代码文档

## 项目概述

这是基于 **Telegram WebApp** 的移动优先骰宝游戏前端项目，采用现代前端技术栈实现了完整的游戏体验，包括3D动画、实时游戏状态管理、钱包功能等。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Context API
- **3D渲染**: CSS3动画（可扩展Three.js）
- **字体**: Inter, Roboto Mono, Cinzel
- **Telegram集成**: Telegram WebApp SDK

## 项目结构

```
src/
├── app/                      # Next.js App Router页面
│   ├── page.tsx              # 启动欢迎页
│   ├── layout.tsx            # 根布局（包含全局Provider和底部导航）
│   ├── globals.css           # 全局样式和动画
│   ├── game/page.tsx         # 游戏大厅（最核心页面）
│   ├── wallet/page.tsx       # 钱包页面
│   ├── deposit/page.tsx      # 充值页面
│   ├── withdraw/page.tsx     # 提现页面
│   ├── history/page.tsx      # 历史记录页面
│   └── rules/page.tsx        # 规则说明页面
├── components/
│   ├── layout/
│   │   └── BottomNavigation.tsx  # 底部导航栏
│   ├── game/
│   │   ├── DiceAnimation.tsx     # 3D骰子动画组件
│   │   ├── BetPanel.tsx          # 投注面板（23种投注类型）
│   │   ├── BetCell.tsx           # 投注格组件
│   │   ├── ChipSelector.tsx      # 筹码选择器
│   │   └── CountdownTimer.tsx    # 倒计时组件
│   └── wallet/
│       ├── BalanceCard.tsx       # 余额卡片
│       └── TransactionList.tsx   # 交易记录列表
├── contexts/
│   ├── TelegramContext.tsx   # Telegram WebApp集成
│   ├── GameContext.tsx       # 游戏状态管理
│   └── WalletContext.tsx     # 钱包状态管理
├── lib/
│   └── utils.ts              # 工具函数
└── types/
    └── telegram.d.ts         # Telegram类型定义
```

## 核心页面说明

### 1. 启动欢迎页 (`app/page.tsx`)
- **功能**: 品牌展示、加载进度、Telegram授权
- **特点**:
  - 漂浮骰子背景动画
  - 2-3秒加载后自动跳转游戏大厅
  - 显示用户信息

### 2. 游戏大厅 (`app/game/page.tsx`) ⭐ 最重要
- **功能**: 完整的骰宝游戏体验
- **包含**:
  - 顶部栏（局号、倒计时、余额、充值）
  - 实时消息滚动条
  - 3D骰盅展示区（300px高）
  - 投注面板（23种投注类型）
  - 底部操作栏（筹码选择、确认下注、清空、走势）
- **游戏流程**: 下注阶段 → 封盘 → 开奖动画 → 结果展示 → 结算

### 3. 投注面板布局 (`components/game/BetPanel.tsx`)
严格按照DESIGN_SPEC.md实现：
- **第一排**: 大/小/单/双（4格，每格95×70px）
- **第二排**: 点数4-10（7格，每格55×60px）
- **第三排**: 点数11-17（7格，每格55×60px）
- **第四排**: 任意三同号、指定三同号（2格，每格125×70px）
- **第五排**: 两骰组合（15格，3行5列，每格50×50px）
- **第六排**: 单骰号1-6（6格，每格60×80px）

### 4. 钱包页面 (`app/wallet/page.tsx`)
- 余额总览卡片（可用/冻结/赠送）
- 充值/提现入口
- 交易记录列表（支持筛选）

### 5. 充值页面 (`app/deposit/page.tsx`)
- 快捷金额选择 + ���定义输入
- 支付方式选择（USDT TRC20/ERC20, TON）
- 充值地址二维码显示
- 优惠活动展示

### 6. 提现页面 (`app/withdraw/page.tsx`)
- 提现金额输入
- 钱包地址管理
- 手续费计算
- 提现规则说明

### 7. 历史记录页面 (`app/history/page.tsx`)
- 三个标签页：我的投注、开奖历史、走势分析
- 走势图（大小柱状图、单双统计、热号冷号）

### 8. 规则说明页面 (`app/rules/page.tsx`)
- 游戏介绍
- 投注类型详解
- 完整赔率表
- 常见问题解答

## 颜色方案

严格按照DESIGN_SPEC.md：

### 主色调
- **深红色**: `#8B0000` - 主要背景、重要区域
- **金色**: `#FFD700` - 强调元素、按钮、余额

### 辅助色
- **绿色**: `#10B981` - 成功/充值
- **橙色**: `#F97316` - 警告/提现
- **蓝色**: `#3B82F6` - 信息/链接
- **红色**: `#EF4444` - 错误

### 中性色
- 背景: `#0A0A0A` / `#1A1A1A` / `#2A2A2A`
- 文字: `#FFFFFF` / `#A0A0A0` / `#505050`

## 动画效果

### 全局动画
- `animate-float` - 漂浮效果
- `animate-fade-in` - 淡入
- `animate-slide-up/down` - 上下滑入
- `animate-scale-in` - 缩放进入
- `animate-bounce-in` - 弹跳进入
- `animate-pulse-slow/fast` - 慢/快脉冲
- `animate-shake` - 晃动（骰盅）
- `animate-dice-roll` - 骰子旋转
- `animate-scroll-left` - 左滚动（消息条）

### 游戏特定动画
- 倒计时脉冲（每秒缩放）
- 最后5秒红色闪烁
- 开奖动画序列（晃动→滚动→定格）
- 中奖金色边框闪烁
- 筹码掉落弹跳

## 响应式设计

### 移动端优先（430px基准 - iPhone 15 Pro Max）
- 所有元素严格控制在430px宽度内
- 不溢出屏幕边界
- 触摸目标最小44×44px
- 底部导航栏固定64px
- 游戏大厅底部操作栏80px

### 断点
- 移动端: 320px - 767px
- 平板: 768px - 1023px
- 桌面: 1024px+

## 安装和运行

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 类型检查
npm run type-check

# 代码检查
npm run lint
```

## 开发环境要求

- Node.js 18+
- npm 或 yarn
- 现代浏览器（Chrome/Safari/Firefox最新版）

## Telegram WebApp集成

### 初始化
在 `contexts/TelegramContext.tsx` 中：
```typescript
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();
```

### 获取用户信息
```typescript
const user = tg?.initDataUnsafe?.user;
// user.id, user.first_name, user.username
```

### 主题适配
```typescript
const themeParams = tg?.themeParams;
// 可根据Telegram主题动态调整颜色
```

## 状态管理

### GameContext - 游戏状态
- `gameState`: 'betting' | 'rolling' | 'revealing' | 'settled'
- `countdown`: 倒计时秒数
- `currentRound`: 当前局号
- `selectedChip`: 选中的筹码面额
- `bets`: 当前下注记录 { betId: amount }
- `diceResults`: 开奖结果 [dice1, dice2, dice3]

### WalletContext - 钱包状态
- `balance`: 可用余额
- `frozenBalance`: 冻结余额
- `bonusBalance`: 赠送余额
- `refreshBalance()`: 刷新余额

### TelegramContext - Telegram集成
- `user`: Telegram用户信息
- `isLoading`: 加载状态

## 图片资源

所有图片使用优质免费图片源：
- Unsplash: `https://source.unsplash.com/`
- Pixabay: `https://pixabay.com/`
- Pexels: `https://images.pexels.com/`

在生产环境中，建议替换为自己的图片服务器。

## 性能优化

### 已实现
- CSS动画代替重JavaScript动画
- 组件懒加载（按路由）
- 图片懒加载
- 虚拟滚动（长列表，待实现）

### 待优化
- 3D骰子动画（可选Three.js）
- Service Worker缓存
- 图片CDN加速
- 代码分割优化

## 移动端特殊处理

```html
<!-- 视口设置 -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

<!-- 触摸优化 -->
<style>
  * {
    user-select: none;
    touch-action: manipulation;
  }
</style>
```

## 部署

### Vercel（推荐）
```bash
npm install -g vercel
vercel
```

### 其他平台
- Netlify
- Railway
- 自托管服务器

## 安全注意事项

1. **前端仅展示** - 所有余额计算、开奖结果必须由后端控制
2. **数据验证** - 前端输入需后端二次验证
3. **敏感信息** - 不在前端存储私钥、密码等
4. **HTTPS** - 生产环境必须使用HTTPS
5. **CSP** - 配置Content Security Policy

## 待实现功能（V2.0）

- [ ] 真实3D骰子动画（Three.js + Cannon.js）
- [ ] 排行榜页面
- [ ] 个人中心页面
- [ ] 邀请好友页面
- [ ] VIP中心页面
- [ ] 聊天室功能
- [ ] 任务系统
- [ ] 多语言支持
- [ ] WebSocket实时通信
- [ ] PWA离线支持

## 常见问题

### 1. Telegram WebApp SDK未加载
确保在public/index.html或layout.tsx中引入：
```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

### 2. 字体未正确加载
检查next.config.js中的字体配置，确保Google Fonts正常访问。

### 3. 动画卡顿
降低动画复杂度，或在低端设备上禁用3D动画。

### 4. 样式不生效
确保Tailwind CSS配置正确，运行 `npm run dev` 重新编译。

## 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 许可证

本项目仅供学习参考，请勿用于非法用途。

## 联系方式

- 项目地址: [GitHub](https://github.com/yourusername/dice-treasure)
- 问题反馈: [Issues](https://github.com/yourusername/dice-treasure/issues)

---

**祝您开发愉快！🎲✨**
