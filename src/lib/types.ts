// ==================== 用户相关类型 ====================

// 后端用户类型（基于Swagger文档）
export interface BackendUser {
  id: number
  first_name?: string
  is_bot?: boolean
  last_name?: string
  username?: string
  language_code?: string
  can_join_groups?: boolean
  can_read_all_group_messages?: boolean
  supports_inline_queries?: boolean
  is_premium?: boolean
  added_to_attachment_menu?: boolean
}

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

// 后端账户模型（基于Swagger文档）
export interface AccountModel {
  id: number
  userId: number
  cash: string            // 现金余额（字符串格式）
  deposit: string         // 充值金额（字符串格式）
  frozen: string          // 冻结金额（字符串格式）
  redPack: string         // 红包金额（字符串格式）
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

// 后端骰宝相关类型（基于Swagger文档）
export interface DiceChooseVO {
  id: number
  multi: string          // 赔率（字符串格式）
  display: string        // 显示名称
}

export interface DiceBetEntity {
  betId: number
  bet: string            // 下注金额（字符串格式）
  win: string            // 赢得金额（字符串格式）
}

export interface DiceEntity {
  id: number
  gameId: string
  userId: number
  win: string            // 赢得金额（字符串格式）
  betInfo: DiceBetEntity[]
  outCome: number[]      // 骰子结果数组
  matchBetId: number[]   // 匹配的下注ID数组
  status: 'RUNNING' | 'FINISHED'
  createTime: string
}

// ==================== 全局骰宝相关类型 ====================

// 全局开奖结果
export interface GlobalDiceResult {
  number: string | number // 期数
  outCome?: number[]      // 开奖结果 [1, 2, 3] (兼容旧字段)
  result?: number[]       // 开奖结果 [1, 2, 3] (新字段)
  resultDisplay?: string  // 格式化的结果显示，如 "5 + 4 + 3 = 12"
  dualRet?: string        // 双面结果，如 "大双"、"小单" 等
  format?: string         // 形态，如 "杂六"、"对子"、"顺子"
  limitValue?: string    // 极值，如 "无"、"极大"、"极小"
  createTime: string      // 开奖时间
  status: 'RUNNING' | 'FINISHED' | 'SEALED' // 状态
}

// 全局下注记录（用于实时查询）
export interface GlobalDiceBet {
  chooseId: number
  amount: number
  winAmount?: number
  createTime?: string
}

// 全局投注历史中的单个投注信息
export interface GlobalBetInfo {
  betId: number      // 押注对象ID
  bet: string        // 押注额度（字符串格式）
  win: string        // 这个押注赢了多少（字符串格式）
}

// 全局游戏详情（查询某一局）
export interface GlobalDiceQuery {
  number: string | number
  status: string
  outCome: number[] | null
  myBets?: GlobalDiceBet[] // 我的下注情况（实时查询用）
  betInfo?: GlobalBetInfo[] // 投注历史信息（历史查询用）
  totalBets?: Record<string, number> // 全局总下注（如果有）
  winAmount?: number
  win?: string // 用户押注赢钱的总和（字符串格式）
}

// 全局游戏历史（分页）- 开奖结果
export interface GlobalHistoryResponse {
  list: GlobalDiceResult[]
  total: number
}

// 全局游戏历史（分页）- 用户投注
export interface GlobalUserHistoryResponse {
  list: GlobalDiceQuery[]
  total: number
}

export interface DiceStatisticEntity {
  userId: number
  totalCount: number
  winCount: number
  totalBet: string       // 总下注金额（字符串格式）
  winBet: string         // 总赢得金额（字符串格式）
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

// ==================== 地址管理类型 ====================

export interface AddressEntity {
  id: number
  userId: number
  address: string
  defaultAddress: boolean
  createTime: number
  modifyTime: number
}

// ==================== 提币订单类型 ====================

export interface WithdrawalOrder {
  id: number
  userId: number
  money: string          // 提币金额
  txId: string           // 交易ID
  txCode: number         // 状态码：-1=未确认, 0=成功, 1=失败
  fromAddress: string    // 来源地址
  toAddress: string      // 目标地址
  createTime: number
  modifyTime: number
  
  // 计算属性（前端使用）
  amount?: string        // 等同于 money
  fee?: string          // 手续费（需要计算）
  actualAmount?: string // 实际到账金额（需要计算）
  address?: string      // 等同于 toAddress
  txid?: string         // 等同于 txId
  confirmTime?: number  // 确认时间（等同于 modifyTime）
}

export interface WithdrawalOrderResponse {
  orderId: string
  txCode: number
  txid?: string
}

// ==================== 支付订单类型 ====================

export interface PaymentOrder {
  orderId: string          // 订单ID
  userId: number           // 用户ID
  money: string            // 充值金额
  state: string            // 订单状态
  payImageUrl: string      // 支付二维码图片URL
  payAddress: string       // 支付地址
  createTime: number       // 创建时间
  modifyTime: number       // 修改时间
}

export interface PaymentOrderStatus {
  orderId: string
  userId: number
  money: string
  state: string            // 订单状态：WAIT=待支付, SUCCESS=已支付, CANCEL=已取消
  payImageUrl: string
  payAddress: string
  createTime: number
  modifyTime: number
}

export interface PaymentOrderRequest {
  userId: string
  amount: string
  currency: 'USDT'
}

// ==================== 分页模型 ====================

export interface PageModel<T> {
  list: T[]
  totalCount: number
  pageIndex: number
  pageSize: number
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

// 后端API响应格式（基于Swagger文档）
export interface BackendResponse<T = any> {
  code: number
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// 后端分页响应格式（基于Swagger文档）
export interface PageModelDiceEntity {
  list: DiceEntity[]
  totalCount: number
  pageIndex: number
  pageSize: number
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
