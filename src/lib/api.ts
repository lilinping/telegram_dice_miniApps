import { BackendUser, BackendResponse, DiceEntity, DiceStatisticEntity, AccountModel, DiceChooseVO, PageModelDiceEntity } from '@/lib/types'

// 使用Next.js代理避免跨域问题
// 开发环境使用代理路径，生产环境可能需要直接访问或使用环境变量
const API_BASE_URL = typeof window !== 'undefined' 
  ? '/api/backend'  // 客户端使用代理
  : 'http://46.250.168.177:8079'  // 服务端直接访问

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<BackendResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // 在浏览器环境中使用cors模式
      ...(typeof window !== 'undefined' && { mode: 'cors' as RequestMode }),
    }

    try {
      const response = await fetch(url, { ...defaultOptions, ...options })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // ==================== 用户相关接口 ====================

  /**
   * 初始化用户信息
   * @param user Telegram用户信息
   * @returns BackendResponse<boolean>
   */
  async initUser(user: BackendUser): Promise<BackendResponse<boolean>> {
    return this.request<boolean>('/user/init/', {
      method: 'POST',
      body: JSON.stringify(user),
    })
  }

  // ==================== 骰宝游戏相关接口 ====================

  /**
   * 开始骰宝游戏
   * @param userId 用户ID
   * @returns BackendResponse<string> - 返回gameId
   */
  async startGame(userId: string): Promise<BackendResponse<string>> {
    return this.request<string>(`/dice/start/${userId}`)
  }

  /**
   * 下注
   * @param gameId 游戏ID
   * @param chooseId 选项ID
   * @param bet 下注金额
   * @returns BackendResponse<boolean>
   */
  async placeBet(gameId: string, chooseId: number, bet: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/dice/bet/${gameId}/${chooseId}/${bet}`)
  }

  /**
   * 查询游戏信息
   * @param gameId 游戏ID
   * @returns BackendResponse<DiceEntity>
   */
  async queryGame(gameId: string): Promise<BackendResponse<DiceEntity>> {
    return this.request<DiceEntity>(`/dice/query/${gameId}`)
  }

  /**
   * 结束游戏
   * @param gameId 游戏ID
   * @returns BackendResponse<boolean>
   */
  async endGame(gameId: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/dice/end/${gameId}`)
  }

  /**
   * 查询游戏历史记录
   * @param userId 用户ID
   * @param pageIndex 页码
   * @param pageSize 每页大小
   * @returns BackendResponse<PageModelDiceEntity>
   */
  async getGameHistory(
    userId: string,
    pageIndex: number = 1,
    pageSize: number = 10
  ): Promise<BackendResponse<PageModelDiceEntity>> {
    return this.request<PageModelDiceEntity>(`/dice/history/${userId}/${pageIndex}/${pageSize}`)
  }

  /**
   * 查询用户统计信息
   * @param userId 用户ID
   * @returns BackendResponse<DiceStatisticEntity>
   */
  async getUserStatistics(userId: string): Promise<BackendResponse<DiceStatisticEntity>> {
    return this.request<DiceStatisticEntity>(`/dice/statistics/${userId}`)
  }

  /**
   * 查看骰宝选项对照表
   * @returns BackendResponse<Map<number, DiceChooseVO>>
   */
  async getDiceDisplay(): Promise<BackendResponse<Map<number, DiceChooseVO>>> {
    return this.request<Map<number, DiceChooseVO>>('/dice/display')
  }

  /**
   * 撤回单个下注选项
   * @param gameId 游戏ID
   * @param chooseId 选项ID
   * @returns BackendResponse<boolean>
   */
  async revertBet(gameId: string, chooseId: number): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/dice/revert/${gameId}/${chooseId}`)
  }

  /**
   * 撤回所有下注选项
   * @param gameId 游戏ID
   * @returns BackendResponse<boolean>
   */
  async revertAllBets(gameId: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/dice/revertAll/${gameId}`)
  }

  // ==================== 账户相关接口 ====================

  /**
   * 查询账户余额
   * @param userId 用户ID
   * @returns BackendResponse<AccountModel>
   */
  async queryAccount(userId: string): Promise<BackendResponse<AccountModel>> {
    return this.request<AccountModel>(`/account/query/${userId}`)
  }

  /**
   * 账户充值
   * @param userId 用户ID
   * @param money 充值金额
   * @returns BackendResponse<boolean>
   */
  async rechargeAccount(userId: string, money: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/account/recharge/${userId}/${money}`)
  }
}

// 导出单例实例
export const apiService = new ApiService()

// 导出类以支持多实例（如果需要）
export { ApiService }