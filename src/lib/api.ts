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
  GlobalUserHistoryResponse,
  RebateAmount,
  RebateTurnover,
  PageModelRebateHistory,
  PageModelNotification,
  PageModelBonus
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

    // 确保默认使用 GET 方法（除非明确指定其他方法）
    const method = options.method || 'GET';

    const defaultOptions: RequestInit = {
      method, // 明确指定方法
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
      // 合并选项，确保方法正确传递
      const finalOptions = { ...defaultOptions, ...options, method };
      const response = await fetch(url, finalOptions)

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
   * 查询是否免手续费提现
   * @param userId 用户ID
   * @returns BackendResponse<boolean> - true: 免手续费, false: 不免手续费
   */
  async checkFreeWithdrawal(userId: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/account/take/free/usdt/${userId}`, {
      method: 'POST'
    })
  }

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

  // ==================== 账户密码相关接口 ====================

  /**
   * 检测是否设置了密码
   * @param userId 用户ID
   * @returns BackendResponse<boolean>
   */
  async hasSetPassword(userId: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/account/hasSetPassword/${userId}`)
  }

  /**
   * 检测是否设置了邮箱
   * @param userId 用户ID
   * @returns BackendResponse<boolean>
   */
  async hasSetEmail(userId: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/account/hasSetEmail/${userId}`)
  }

  /**
   * 发送验证码(用于创建邮箱地址)
   * @param userId 用户ID
   * @param email 邮箱地址
   * @returns BackendResponse<boolean>
   */
  async sendCodeForCreateEmail(userId: string, email: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/account/sendCode/createEmail/${userId}/${email}`)
  }

  /**
   * 发送验证码(用于修改邮箱地址)
   * @param userId 用户ID
   * @returns BackendResponse<boolean>
   */
  async sendCodeForUpdateEmail(userId: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/account/sendCode/updateEmail/${userId}`)
  }

  /**
   * 创建邮箱地址
   * @param userId 用户ID
   * @param email 邮箱地址
   * @param code 验证码
   * @returns BackendResponse<boolean>
   */
  async createEmail(userId: string, email: string, code: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/account/mail/createEmail/${userId}/${email}/${code}`)
  }

  /**
   * 更新邮箱地址
   * @param userId 用户ID
   * @param newEmail 新邮箱地址
   * @param code 验证码
   * @returns BackendResponse<boolean>
   */
  async updateEmail(userId: string, newEmail: string, code: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/account/mail/updateEmail/${userId}/${newEmail}/${code}`)
  }

  /**
   * 设置初始密码
   * @param userId 用户ID
   * @param password 密码（原样传递，不进行编码）
   * @returns BackendResponse<boolean>
   */
  async setPassword(userId: string, password: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/account/setpassword/${userId}/${password}`)
  }

  /**
   * 发送验证码(用于修改用户密码)
   * @param userId 用户ID
   * @param email 邮箱地址
   * @returns BackendResponse<boolean>
   */
  async sendCodeForUpdatePassword(userId: string, email: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/account/sendCode/updatePassword/${userId}/${email}`)
  }

  /**
   * 重置用户密码（使用旧密码）
   * @param userId 用户ID
   * @param newPassword 新密码（原样传递，不进行编码）
   * @param oldPassword 旧密码（原样传递，不进行编码）
   * @returns BackendResponse<boolean>
   */
  async resetPassword(userId: string, newPassword: string, oldPassword: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/account/resetPassword/${userId}/${newPassword}/${oldPassword}`)
  }

  /**
   * 更新账号密码（使用验证码）
   * @param userId 用户ID
   * @param newPassword 新密码（原样传递，不进行编码）
   * @param code 验证码
   * @returns BackendResponse<boolean>
   */
  async updatePasswordWithCode(userId: string, newPassword: string, code: string): Promise<BackendResponse<boolean>> {
    if (!userId || !newPassword || !code) {
      throw new Error('缺少必要参数');
    }
    // 根据Swagger文档，这是GET请求，参数在URL路径中
    // 但密码中的特殊字符（如 # / ?）必须编码，否则会被浏览器解释为URL片段或路径分隔符
    // 只编码必要的特殊字符，确保验证码能正确传递
    const encodedPassword = encodeURIComponent(newPassword);
    const endpoint = `/account/mail/updatePassword/${userId}/${encodedPassword}/${code}`;
    return this.request<boolean>(endpoint)
  }

  /**
   * 恢复账号信息（通过原始的用户ID和密码）
   * @param userId 当前用户ID
   * @param lastUserId 原始用户ID
   * @param password 原始密码
   * @returns BackendResponse<boolean>
   */
  async recoverAccount(userId: string, lastUserId: string, password: string): Promise<BackendResponse<boolean>> {
    if (!userId || !lastUserId || !password) {
      throw new Error('缺少必要参数');
    }
    // 根据Swagger文档，这是GET请求，参数在URL路径中
    // 密码需要编码以确保特殊字符正确传递
    const encodedPassword = encodeURIComponent(password);
    return this.request<boolean>(`/account/recoverAccount/${userId}/${lastUserId}/${encodedPassword}`)
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

  /**
   * 查看某一期的开奖结果
   * @param number 期号
   */
  async getGlobalSingleResult(number: string | number): Promise<BackendResponse<GlobalDiceResult>> {
    return this.request<GlobalDiceResult>(`/dice/global/single/result/${number}`)
  }

  // ==================== 反水相关接口 ====================

  /**
   * 查看当前的反水额度
   * @param userId 用户ID
   * @returns BackendResponse<RebateAmount>
   */
  async queryRebateAmount(userId: string): Promise<BackendResponse<RebateAmount>> {
    return this.request<RebateAmount>(`/account/rebate/query/${userId}`)
  }

  /**
   * 执行反水操作（将流水转换为反水余额）
   * 注意：虽然使用GET方法，但这是执行操作，不是查询
   * @param userId 用户ID
   * @returns BackendResponse<boolean>
   */
  async convertTurnoverToRebate(userId: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>(`/account/rebate/money/${userId}`, {
      method: 'GET'
    })
  }

  /**
   * 查看历史的反水记录信息
   * @param userId 用户ID
   * @param pageIndex 页码
   * @param pageSize 每页大小
   * @returns BackendResponse<PageModelRebateHistory>
   */
  async getRebateHistory(
    userId: string,
    pageIndex: number = 1,
    pageSize: number = 10
  ): Promise<BackendResponse<PageModelRebateHistory>> {
    return this.request<PageModelRebateHistory>(`/account/rebate/history/${userId}/${pageIndex}/${pageSize}`)
  }

  // ==================== 消息通知相关接口 ====================

  /**
   * 查看用户未读消息数量
   * @param userId 用户ID
   * @returns BackendResponse<number>
   */
  async getUnreadNotificationCount(userId: string): Promise<BackendResponse<number>> {
    return this.request<number>(`/user/notification/unreads/${userId}`)
  }

  /**
   * 分页查询用户的通知信息
   * @param userId 用户ID
   * @param pageIndex 页码
   * @param pageSize 每页大小
   * @returns BackendResponse<PageModelNotification>
   */
  async getNotifications(
    userId: string,
    pageIndex: number = 1,
    pageSize: number = 10
  ): Promise<BackendResponse<PageModelNotification>> {
    return this.request<PageModelNotification>(`/user/notification/query/${userId}/${pageIndex}/${pageSize}`)
  }

  /**
   * 标记为已读
   * @param userId 用户ID
   * @param id 通知ID
   * @returns BackendResponse<boolean>
   */
  async markNotificationRead(userId: string, id: number): Promise<BackendResponse<boolean>> {
    try {
      // 文档标注为 GET，优先按规范调用
      return await this.request<boolean>(`/user/notification/mark/read/${userId}/${id}`)
    } catch (error) {
      // 某些环境可能要求写操作使用 POST，这里做兼容
      return await this.request<boolean>(`/user/notification/mark/read/${userId}/${id}`, {
        method: 'POST'
      })
    }
  }

  /**
   * 分页查询用户的奖励列表信息
   * @param userId 用户ID
   * @param pageIndex 页码
   * @param pageSize 每页大小
   * @returns BackendResponse<PageModelBonus>
   */
  async getBonusList(
    userId: string,
    pageIndex: number = 1,
    pageSize: number = 10
  ): Promise<BackendResponse<PageModelBonus>> {
    return this.request<PageModelBonus>(`/user/bonus/query/${userId}/${pageIndex}/${pageSize}`)
  }

}

// 导出单例实例
export const apiService = new ApiService()

// 导出类以支持多实例（如果需要）
export { ApiService }