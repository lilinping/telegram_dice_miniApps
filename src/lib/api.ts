import { 
  BackendUser, 
  BackendResponse, 
  DiceEntity, 
  DiceStatisticEntity, 
  AccountModel, 
  DiceChooseVO, 
  PageModelDiceEntity,
  AddressEntity,
  WithdrawalOrder,
  WithdrawalOrderResponse,
  PageModel,
  PaymentOrder,
  PaymentOrderStatus,
  GlobalDiceResult,
  GlobalDiceQuery,
  GlobalHistoryResponse,
  GlobalUserHistoryResponse
} from '@/lib/types'

// 使用Next.js代理避免跨域问题
// 客户端和服务端都使用代理路径，由 Next.js API 路由转发到后端
const API_BASE_URL = typeof window !== 'undefined' 
  ? '/api/backend'  // 客户端使用代理
  : (process.env.NEXT_PUBLIC_API_BASE_URL || '/api/backend')  // 服务端也使用代理

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // 获取 Telegram initData
  private getInitData(): string {
    if (typeof window === 'undefined') return '';
    
    // 从 Telegram WebApp 获取 initData
    if (window.Telegram?.WebApp?.initData) {
      return window.Telegram.WebApp.initData;
    }
    
    // 开发环境：从 localStorage 获取（如果有）
    if (process.env.NODE_ENV === 'development') {
      return localStorage.getItem('telegram_init_data') || '';
    }
    
    return '';
  }

  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<BackendResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    // 获取 Telegram initData 用于认证
    const initData = this.getInitData();

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        // 添加 Telegram 认证头
        ...(initData && { 'initData': initData }),
        ...options.headers,
      },
      // 在浏览器环境中使用cors模式
      ...(typeof window !== 'undefined' && { mode: 'cors' as RequestMode }),
    }

    try {
      const response = await fetch(url, { ...defaultOptions, ...options })

      if (!response.ok) {
        // 如果是 401 错误，提供更详细的错误信息
        if (response.status === 401) {
          const errorText = await response.text();
          throw new Error(`Authentication failed: ${errorText}`);
        }
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

  // ==================== 地址管理相关接口 ====================

  /**
   * 获取用户地址列表
   * @param userId 用户ID
   * @returns BackendResponse<AddressEntity[]>
   */
  async getAddressList(userId: string): Promise<BackendResponse<AddressEntity[]>> {
    return this.request<AddressEntity[]>(`/address/list/${userId}`)
  }

  /**
   * 创建新地址
   * @param userId 用户ID
   * @param address 钱包地址
   * @returns BackendResponse<boolean>
   */
  async createAddress(userId: string, address: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/address/create/${userId}/${address}`, {
      method: 'POST'
    })
  }

  /**
   * 删除地址
   * @param addressId 地址ID
   * @param userId 用户ID
   * @returns BackendResponse<boolean>
   */
  async deleteAddress(addressId: number, userId: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/address/delete/${addressId}/${userId}`, {
      method: 'DELETE'
    })
  }

  /**
   * 设置默认地址
   * @param addressId 地址ID
   * @param userId 用户ID
   * @returns BackendResponse<boolean>
   */
  async setDefaultAddress(addressId: number, userId: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/address/set/default/${addressId}/${userId}`, {
      method: 'POST'
    })
  }

  // ==================== 提币相关接口 ====================

  /**
   * 提币
   * @param userId 用户ID
   * @param amount 提币金额
   * @returns BackendResponse<WithdrawalOrderResponse>
   */
  async withdrawUsdt(userId: string, amount: string): Promise<BackendResponse<WithdrawalOrderResponse>> {
    return this.request<WithdrawalOrderResponse>(`/account/take/usdt/${userId}/${amount}`, {
      method: 'POST'
    })
  }

  /**
   * 获取提币订单列表
   * @param userId 用户ID
   * @param pageIndex 页码
   * @param pageSize 每页大小
   * @returns BackendResponse<PageModel<WithdrawalOrder>>
   */
  async getWithdrawalOrders(
    userId: string,
    pageIndex: number = 1,
    pageSize: number = 10
  ): Promise<BackendResponse<PageModel<WithdrawalOrder>>> {
    return this.request<PageModel<WithdrawalOrder>>(`/account/take/history/usdt/${userId}/${pageIndex}/${pageSize}`)
  }

  /**
   * 获取提币订单详情
   * @param orderId 订单ID
   * @returns BackendResponse<WithdrawalOrder>
   */
  async getWithdrawalOrderDetail(orderId: string): Promise<BackendResponse<WithdrawalOrder>> {
    return this.request<WithdrawalOrder>(`/withdrawal/order/${orderId}`)
  }

  // ==================== 支付订单相关接口 ====================

  /**
   * 创建支付订单
   * @param userId 用户ID
   * @param amount 充值金额
   * @returns BackendResponse<PaymentOrder>
   */
  async createPaymentOrder(userId: string, amount: string): Promise<BackendResponse<PaymentOrder>> {
    return this.request<PaymentOrder>(`/order/create/${userId}/${amount}`, {
      method: 'POST'
    })
  }

  /**
   * 查询支付订单状态
   * @param userId 用户ID
   * @param orderNo 订单号
   * @returns BackendResponse<PaymentOrderStatus>
   */
  async getPaymentOrderStatus(userId: string, orderNo: string): Promise<BackendResponse<PaymentOrderStatus>> {
    return this.request<PaymentOrderStatus>(`/order/query/${userId}/${orderNo}`)
  }

  /**
   * 获取充值历史订单列表
   * @param userId 用户ID
   * @param pageIndex 页码
   * @param pageSize 每页大小
   * @returns BackendResponse<PageModel<PaymentOrder>>
   */
  async getDepositHistory(userId: string, pageIndex: number = 1, pageSize: number = 20): Promise<BackendResponse<PageModel<PaymentOrder>>> {
    return this.request<PageModel<PaymentOrder>>(`/order/history/${userId}/${pageIndex}/${pageSize}`)
  }

  // ==================== 全局骰宝游戏接口 ====================

  /**
   * 查看当前还未开奖的若干期结果（或最近结果用于初始化）
   */
  async getGlobalLatestResults(): Promise<BackendResponse<GlobalDiceResult[]>> {
    return this.request<GlobalDiceResult[]>('/dice/global/latest/results')
  }

  /**
   * 查看某一局全局骰宝的信息
   */
  async getGlobalGameInfo(userId: string, number: string): Promise<BackendResponse<GlobalDiceQuery>> {
    return this.request<GlobalDiceQuery>(`/dice/global/query/${userId}/${number}`)
  }

  /**
   * 选择全局骰宝的选项（下注）
   */
  async placeGlobalBet(userId: string, number: string, chooseId: number, bet: number): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/dice/global/bet/${userId}/${number}/${chooseId}/${bet}`)
  }

  /**
   * 撤回全局骰宝的选项
   */
  async revertGlobalBet(userId: string, number: string, chooseId: number): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/dice/global/revert/${userId}/${number}/${chooseId}`)
  }

  /**
   * 清空骰宝所有选项
   */
  async revertAllGlobalBets(userId: string, number: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/dice/global/revertAll/${userId}/${number}`)
  }

  /**
   * 查看玩家全局骰宝的历史信息
   */
  async getGlobalUserHistory(userId: string, pageIndex: number = 1, pageSize: number = 20): Promise<BackendResponse<GlobalUserHistoryResponse>> {
    return this.request<GlobalUserHistoryResponse>(`/dice/global/history/${userId}/${pageIndex}/${pageSize}`)
  }

  /**
   * 查看全局历史开奖结果分页列表
   */
  async getGlobalResults(pageIndex: number = 1, pageSize: number = 20): Promise<BackendResponse<GlobalHistoryResponse>> {
    return this.request<GlobalHistoryResponse>(`/dice/global/result/${pageIndex}/${pageSize}`)
  }

}

// 导出单例实例
export const apiService = new ApiService()

// 导出类以支持多实例（如果需要）
export { ApiService }