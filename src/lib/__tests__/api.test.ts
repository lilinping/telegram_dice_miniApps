import { ApiService } from '../api'
import { AddressEntity, WithdrawalOrder, WithdrawalOrderResponse, PageModel, PaymentOrder, PaymentOrderStatus } from '../types'

// Mock fetch globally
global.fetch = jest.fn()

describe('ApiService - Address Management', () => {
  let apiService: ApiService
  const mockUserId = '123456'
  const mockAddressId = 1

  beforeEach(() => {
    apiService = new ApiService('http://test-api.com')
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('getAddressList', () => {
    it('should fetch address list successfully', async () => {
      const mockAddresses: AddressEntity[] = [
        {
          id: 1,
          userId: 123456,
          address: 'TTestAddress1234567890123456789012',
          defaultAddress: true,
          createTime: Date.now(),
          modifyTime: Date.now(),
        },
        {
          id: 2,
          userId: 123456,
          address: 'TTestAddress0987654321098765432109',
          defaultAddress: false,
          createTime: Date.now(),
          modifyTime: Date.now(),
        },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          success: true,
          message: 'Success',
          data: mockAddresses,
        }),
      })

      const result = await apiService.getAddressList(mockUserId)

      expect(global.fetch).toHaveBeenCalledWith(
        `http://test-api.com/address/list/${mockUserId}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockAddresses)
      expect(result.data.length).toBe(2)
    })

    it('should handle API errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(apiService.getAddressList(mockUserId)).rejects.toThrow('Network error')
    })
  })

  describe('createAddress', () => {
    it('should create address successfully', async () => {
      const mockAddress = 'TNewAddress12345678901234567890123'

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          success: true,
          message: 'Address created',
          data: true,
        }),
      })

      const result = await apiService.createAddress(mockUserId, mockAddress)

      expect(global.fetch).toHaveBeenCalledWith(
        `http://test-api.com/address/create/${mockUserId}/${mockAddress}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
    })

    it('should handle creation failure', async () => {
      const mockAddress = 'TNewAddress12345678901234567890123'

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 400,
          success: false,
          message: 'Address already exists',
          data: false,
        }),
      })

      const result = await apiService.createAddress(mockUserId, mockAddress)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Address already exists')
    })
  })

  describe('deleteAddress', () => {
    it('should delete address successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          success: true,
          message: 'Address deleted',
          data: true,
        }),
      })

      const result = await apiService.deleteAddress(mockAddressId, mockUserId)

      expect(global.fetch).toHaveBeenCalledWith(
        `http://test-api.com/address/delete/${mockAddressId}/${mockUserId}`,
        expect.objectContaining({
          method: 'DELETE',
        })
      )
      expect(result.success).toBe(true)
    })

    it('should handle deletion of default address error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 400,
          success: false,
          message: 'Cannot delete default address',
          data: false,
        }),
      })

      const result = await apiService.deleteAddress(mockAddressId, mockUserId)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Cannot delete default address')
    })
  })

  describe('setDefaultAddress', () => {
    it('should set default address successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          success: true,
          message: 'Default address updated',
          data: true,
        }),
      })

      const result = await apiService.setDefaultAddress(mockAddressId, mockUserId)

      expect(global.fetch).toHaveBeenCalledWith(
        `http://test-api.com/address/set/default/${mockAddressId}/${mockUserId}`,
        expect.objectContaining({
          method: 'POST',
        })
      )
      expect(result.success).toBe(true)
    })
  })
})

describe('ApiService - Withdrawal', () => {
  let apiService: ApiService
  const mockUserId = '123456'
  const mockOrderId = 'order-123'

  beforeEach(() => {
    apiService = new ApiService('http://test-api.com')
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('withdrawUsdt', () => {
    it('should submit withdrawal successfully', async () => {
      const mockAmount = '100.00'
      const mockResponse: WithdrawalOrderResponse = {
        orderId: mockOrderId,
        txCode: -1,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          success: true,
          message: 'Withdrawal submitted',
          data: mockResponse,
        }),
      })

      const result = await apiService.withdrawUsdt(mockUserId, mockAmount)

      expect(global.fetch).toHaveBeenCalledWith(
        `http://test-api.com/account/take/usdt/${mockUserId}/${mockAmount}`,
        expect.objectContaining({
          method: 'POST',
        })
      )
      expect(result.success).toBe(true)
      expect(result.data.orderId).toBe(mockOrderId)
      expect(result.data.txCode).toBe(-1)
    })

    it('should handle insufficient balance error', async () => {
      const mockAmount = '10000.00'

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 400,
          success: false,
          message: 'Insufficient balance',
          data: null,
        }),
      })

      const result = await apiService.withdrawUsdt(mockUserId, mockAmount)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Insufficient balance')
    })
  })

  describe('getWithdrawalOrders', () => {
    it('should fetch withdrawal orders successfully', async () => {
      const mockOrders: WithdrawalOrder[] = [
        {
          id: 'order-1',
          userId: 123456,
          amount: '100.00',
          fee: '5.00',
          actualAmount: '95.00',
          address: 'TTestAddress1234567890123456789012',
          txCode: 0,
          txid: 'tx123456',
          createTime: Date.now(),
          updateTime: Date.now(),
          confirmTime: Date.now(),
        },
      ]

      const mockPageModel: PageModel<WithdrawalOrder> = {
        list: mockOrders,
        totalCount: 1,
        pageIndex: 1,
        pageSize: 10,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          success: true,
          message: 'Success',
          data: mockPageModel,
        }),
      })

      const result = await apiService.getWithdrawalOrders(mockUserId, 1, 10)

      expect(global.fetch).toHaveBeenCalledWith(
        `http://test-api.com/account/take/history/usdt/${mockUserId}/1/10`,
        expect.any(Object)
      )
      expect(result.success).toBe(true)
      expect(result.data.list.length).toBe(1)
      expect(result.data.list[0].txCode).toBe(0)
      expect(result.data.list[0].txid).toBe('tx123456')
    })

    it('should handle empty orders list', async () => {
      const mockPageModel: PageModel<WithdrawalOrder> = {
        list: [],
        totalCount: 0,
        pageIndex: 1,
        pageSize: 10,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          success: true,
          message: 'Success',
          data: mockPageModel,
        }),
      })

      const result = await apiService.getWithdrawalOrders(mockUserId)

      expect(result.success).toBe(true)
      expect(result.data.list.length).toBe(0)
    })
  })

  describe('getWithdrawalOrderDetail', () => {
    it('should fetch order detail successfully', async () => {
      const mockOrder: WithdrawalOrder = {
        id: mockOrderId,
        userId: 123456,
        amount: '100.00',
        fee: '5.00',
        actualAmount: '95.00',
        address: 'TTestAddress1234567890123456789012',
        txCode: 0,
        txid: 'tx123456',
        createTime: Date.now(),
        updateTime: Date.now(),
        confirmTime: Date.now(),
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          success: true,
          message: 'Success',
          data: mockOrder,
        }),
      })

      const result = await apiService.getWithdrawalOrderDetail(mockOrderId)

      expect(global.fetch).toHaveBeenCalledWith(
        `http://test-api.com/withdrawal/order/${mockOrderId}`,
        expect.any(Object)
      )
      expect(result.success).toBe(true)
      expect(result.data.id).toBe(mockOrderId)
      expect(result.data.txid).toBe('tx123456')
    })
  })
})

describe('ApiService - Payment Order', () => {
  let apiService: ApiService
  const mockUserId = '123456'
  const mockOrderId = 'payment-order-123'

  beforeEach(() => {
    apiService = new ApiService('http://test-api.com')
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('createPaymentOrder', () => {
    it('should create payment order successfully with valid parameters', async () => {
      const mockAmount = '100.00'
      const mockPaymentOrder: PaymentOrder = {
        orderId: mockOrderId,
        userId: 123456,
        amount: mockAmount,
        currency: 'USDT',
        qrCodeUrl: 'https://example.com/qr/payment-order-123.png',
        status: 0,
        createTime: Date.now(),
        expireTime: Date.now() + 3600000,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          success: true,
          message: 'Payment order created',
          data: mockPaymentOrder,
        }),
      })

      const result = await apiService.createPaymentOrder(mockUserId, mockAmount)

      expect(global.fetch).toHaveBeenCalledWith(
        `http://test-api.com/payment/order/${mockUserId}/${mockAmount}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result.success).toBe(true)
      expect(result.data.orderId).toBe(mockOrderId)
      expect(result.data.amount).toBe(mockAmount)
      expect(result.data.currency).toBe('USDT')
      expect(result.data.qrCodeUrl).toBeTruthy()
      expect(result.data.status).toBe(0)
    })

    it('should handle invalid parameters (amount below minimum)', async () => {
      const mockAmount = '5.00'

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 400,
          success: false,
          message: 'Amount below minimum (10 USDT)',
          data: null,
        }),
      })

      const result = await apiService.createPaymentOrder(mockUserId, mockAmount)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Amount below minimum (10 USDT)')
    })

    it('should handle invalid parameters (invalid user ID)', async () => {
      const mockAmount = '100.00'
      const invalidUserId = ''

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 400,
          success: false,
          message: 'Invalid user ID',
          data: null,
        }),
      })

      const result = await apiService.createPaymentOrder(invalidUserId, mockAmount)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Invalid user ID')
    })

    it('should handle failed API requests (network error)', async () => {
      const mockAmount = '100.00'

      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(apiService.createPaymentOrder(mockUserId, mockAmount)).rejects.toThrow('Network error')
    })

    it('should handle failed API requests (HTTP error)', async () => {
      const mockAmount = '100.00'

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await expect(apiService.createPaymentOrder(mockUserId, mockAmount)).rejects.toThrow('HTTP error! status: 500')
    })

    it('should handle failed API requests (timeout)', async () => {
      const mockAmount = '100.00'

      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Request timeout'))

      await expect(apiService.createPaymentOrder(mockUserId, mockAmount)).rejects.toThrow('Request timeout')
    })
  })

  describe('getPaymentOrderStatus', () => {
    it('should get payment order status successfully', async () => {
      const mockStatus: PaymentOrderStatus = {
        orderId: mockOrderId,
        status: 1,
        paidAmount: '100.00',
        paidTime: Date.now(),
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          success: true,
          message: 'Success',
          data: mockStatus,
        }),
      })

      const result = await apiService.getPaymentOrderStatus(mockOrderId)

      expect(global.fetch).toHaveBeenCalledWith(
        `http://test-api.com/payment/order/status/${mockOrderId}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result.success).toBe(true)
      expect(result.data.orderId).toBe(mockOrderId)
      expect(result.data.status).toBe(1)
      expect(result.data.paidAmount).toBe('100.00')
    })

    it('should handle pending payment status', async () => {
      const mockStatus: PaymentOrderStatus = {
        orderId: mockOrderId,
        status: 0,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          success: true,
          message: 'Success',
          data: mockStatus,
        }),
      })

      const result = await apiService.getPaymentOrderStatus(mockOrderId)

      expect(result.success).toBe(true)
      expect(result.data.status).toBe(0)
      expect(result.data.paidAmount).toBeUndefined()
      expect(result.data.paidTime).toBeUndefined()
    })

    it('should handle invalid order ID', async () => {
      const invalidOrderId = 'invalid-order'

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 404,
          success: false,
          message: 'Order not found',
          data: null,
        }),
      })

      const result = await apiService.getPaymentOrderStatus(invalidOrderId)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Order not found')
    })

    it('should handle failed API requests', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(apiService.getPaymentOrderStatus(mockOrderId)).rejects.toThrow('Network error')
    })
  })
})

describe('ApiService - Error Handling', () => {
  let apiService: ApiService

  beforeEach(() => {
    apiService = new ApiService('http://test-api.com')
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('should handle HTTP errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    await expect(apiService.getAddressList('123')).rejects.toThrow('HTTP error! status: 500')
  })

  it('should handle network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'))

    await expect(apiService.getAddressList('123')).rejects.toThrow('Network failure')
  })

  it('should handle malformed JSON response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON')
      },
    })

    await expect(apiService.getAddressList('123')).rejects.toThrow('Invalid JSON')
  })
})
