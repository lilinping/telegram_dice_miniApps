import { create } from 'zustand'

// 投注类型定义
export interface Bet {
  id: string
  type: string
  amount: number
  odds: number
  timestamp: number
}

// 用户信息
export interface UserInfo {
  id: string
  username: string
  avatar?: string
  balance: number
  frozenBalance: number
  bonusBalance: number
  vipLevel: number
}

// 游戏状态
export type GamePhase = 'betting' | 'locked' | 'rolling' | 'result'

export interface GameState {
  roundId: string
  phase: GamePhase
  countdown: number
  result: number[] | null // [dice1, dice2, dice3]
  totalPoints: number | null
}

// 历史记录
export interface HistoryRecord {
  roundId: string
  bets: Bet[]
  result: number[]
  totalPoints: number
  winAmount: number
  timestamp: number
}

// ==================== 用户状态 ====================
interface UserState {
  user: UserInfo | null
  setUser: (user: UserInfo) => void
  updateBalance: (balance: number) => void
  updateFrozenBalance: (frozenBalance: number) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateBalance: (balance) => set((state) => ({
    user: state.user ? { ...state.user, balance } : null
  })),
  updateFrozenBalance: (frozenBalance) => set((state) => ({
    user: state.user ? { ...state.user, frozenBalance } : null
  })),
}))

// ==================== 游戏状态 ====================
interface GameStore {
  game: GameState
  currentBets: Bet[]
  selectedChip: number

  setGamePhase: (phase: GamePhase) => void
  setCountdown: (countdown: number) => void
  setResult: (result: number[], totalPoints: number) => void
  resetGame: () => void

  addBet: (bet: Omit<Bet, 'id' | 'timestamp'>) => void
  removeBet: (betId: string) => void
  clearBets: () => void

  selectChip: (amount: number) => void
}

export const useGameStore = create<GameStore>((set) => ({
  game: {
    roundId: '',
    phase: 'betting',
    countdown: 30,
    result: null,
    totalPoints: null,
  },
  currentBets: [],
  selectedChip: 10,

  setGamePhase: (phase) => set((state) => ({
    game: { ...state.game, phase }
  })),

  setCountdown: (countdown) => set((state) => ({
    game: { ...state.game, countdown }
  })),

  setResult: (result, totalPoints) => set((state) => ({
    game: { ...state.game, result, totalPoints, phase: 'result' }
  })),

  resetGame: () => set((state) => ({
    game: {
      ...state.game,
      phase: 'betting',
      countdown: 30,
      result: null,
      totalPoints: null,
    },
    currentBets: [],
  })),

  addBet: (bet) => set((state) => {
    const newBet: Bet = {
      ...bet,
      id: `bet-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    }
    return { currentBets: [...state.currentBets, newBet] }
  }),

  removeBet: (betId) => set((state) => ({
    currentBets: state.currentBets.filter(bet => bet.id !== betId)
  })),

  clearBets: () => set({ currentBets: [] }),

  selectChip: (amount) => set({ selectedChip: amount }),
}))

// ==================== 历史记录状态 ====================
interface HistoryStore {
  history: HistoryRecord[]
  addHistory: (record: HistoryRecord) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryStore>((set) => ({
  history: [],
  addHistory: (record) => set((state) => ({
    history: [record, ...state.history].slice(0, 100) // 保留最近100条
  })),
  clearHistory: () => set({ history: [] }),
}))

// ==================== UI状态 ====================
interface UIStore {
  showRulesModal: boolean
  showWinModal: boolean
  winAmount: number
  toast: { message: string; type: 'success' | 'error' | 'info' | 'warning' } | null

  setShowRulesModal: (show: boolean) => void
  setShowWinModal: (show: boolean, amount?: number) => void
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
  hideToast: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  showRulesModal: false,
  showWinModal: false,
  winAmount: 0,
  toast: null,

  setShowRulesModal: (show) => set({ showRulesModal: show }),

  setShowWinModal: (show, amount = 0) => set({
    showWinModal: show,
    winAmount: amount
  }),

  showToast: (message, type) => set({
    toast: { message, type }
  }),

  hideToast: () => set({ toast: null }),
}))
