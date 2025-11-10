// ==================== 用户相关类型 ====================

export interface User {
  id: string
  username: string
  avatar?: string
  email?: string
  telegramId?: string
  createdAt: number
}

export interface UserBalance {
  available: number      // 可用余额
  frozen: number          // 冻结余额（当前下注中）
  bonus: number           // 赠送余额
  total: number           // 总余额
}

export interface VIPLevel {
  level: number
  name: string
  icon: string
  minDeposit: number      // 升级所需累计充值
  withdrawFeeDiscount: number // 提现手续费折扣
  dailyBonusMultiplier: number // 每日签到奖励倍数
  maxBetLimit: number     // 单次下注限额
  perks: string[]         // 专属权益
}

// ==================== 游戏相关类型 ====================

export type BetType =
  | 'big'
  | 'small'
  | 'odd'
  | 'even'
  | 'any-triple'
  | `specific-triple-${number}`
  | `pair-${number}-${number}`
  | `single-${number}`
  | `${number}` // 点数4-17

export interface BetOption {
  id: string
  type: BetType
  label: string
  odds: number
  minBet: number
  maxBet: number
  icon?: string
  description?: string
}

export interface PlacedBet {
  id: string
  roundId: string
  userId: string
  type: BetType
  amount: number
  odds: number
  potentialWin: number
  timestamp: number
  status: 'pending' | 'won' | 'lost'
  winAmount?: number
}

export interface GameRound {
  id: string
  roundNumber: number
  startTime: number
  endTime?: number
  status: 'betting' | 'locked' | 'rolling' | 'result'
  countdown: number
  result?: DiceResult
  totalBets: number
  totalPlayers: number
}

export interface DiceResult {
  dice1: number
  dice2: number
  dice3: number
  total: number
  isBig: boolean
  isSmall: boolean
  isOdd: boolean
  isEven: boolean
  isTriple: boolean
}

// ==================== 交易相关类型 ====================

export type TransactionType = 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus' | 'refund'

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  balanceBefore: number
  balanceAfter: number
  status: TransactionStatus
  timestamp: number
  description?: string
  metadata?: Record<string, any>
}

export interface DepositRequest {
  userId: string
  amount: number
  currency: 'USDT' | 'TON'
  network: 'TRC20' | 'ERC20' | 'TON'
  address?: string
}

export interface WithdrawRequest {
  userId: string
  amount: number
  currency: 'USDT' | 'TON'
  network: 'TRC20' | 'ERC20' | 'TON'
  address: string
  fee: number
  actualAmount: number
}

// ==================== 历史记录类型 ====================

export interface BetHistory {
  id: string
  roundId: string
  roundNumber: number
  bets: PlacedBet[]
  result: DiceResult
  totalBet: number
  totalWin: number
  profit: number
  timestamp: number
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatar?: string
  winAmount: number
  isAnonymous?: boolean
}

export type LeaderboardType = 'daily' | 'weekly' | 'all-time'

// ==================== UI相关类型 ====================

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

// ==================== API响应类型 ====================

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  timestamp: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ==================== 配置类型 ====================

export interface AppConfig {
  apiUrl: string
  wsUrl: string
  minBet: number
  maxBet: number
  roundDuration: number
  animationDuration: number
  supportedCurrencies: string[]
  vipLevels: VIPLevel[]
}

// ==================== 邀请相关类型 ====================

export interface InviteRecord {
  id: string
  inviterId: string
  inviteeId: string
  inviteeUsername: string
  registeredAt: number
  hasDeposited: boolean
  firstDepositAmount?: number
  rewardEarned: number
  status: 'pending' | 'completed'
}

export interface InviteStats {
  totalInvites: number
  activeInvites: number
  totalRewards: number
  pendingRewards: number
}

// ==================== Telegram WebApp类型 ====================

export interface TelegramWebAppUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramWebAppUser
    chat?: any
    start_param?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: any
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  ready: () => void
  expand: () => void
  close: () => void
  BackButton: {
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    show: () => void
    hide: () => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  showPopup: (params: any) => void
  showAlert: (message: string) => void
  showConfirm: (message: string) => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export {}
