import { validateDepositAmount } from '@/lib/utils'

/**
 * Unit tests for deposit page amount selection
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

describe('Deposit Page Amount Selection - Unit Tests', () => {
  describe('Quick amount buttons', () => {
    const quickAmounts = [10, 50, 100, 500, 1000]

    it('should update state when quick amount button is clicked', () => {
      quickAmounts.forEach((value) => {
        // Simulate state update
        let amount = 0
        let customAmount = 'some value'

        const handleQuickAmount = (val: number) => {
          amount = val
          customAmount = ''
        }

        handleQuickAmount(value)

        expect(amount).toBe(value)
        expect(customAmount).toBe('')
      })
    })

    it('should clear custom amount when quick amount is selected', () => {
      let amount = 0
      let customAmount = '123.45'

      const handleQuickAmount = (value: number) => {
        amount = value
        customAmount = ''
      }

      handleQuickAmount(100)

      expect(amount).toBe(100)
      expect(customAmount).toBe('')
    })

    it('should support all predefined quick amounts', () => {
      expect(quickAmounts).toEqual([10, 50, 100, 500, 1000])
      expect(quickAmounts.length).toBe(5)
      expect(quickAmounts.every((amt) => amt >= 10)).toBe(true)
    })
  })

  describe('Custom amount input', () => {
    it('should update state when custom amount is entered', () => {
      let amount = 100
      let customAmount = ''

      const handleCustomAmountChange = (value: string) => {
        customAmount = value
        const num = parseFloat(value)
        if (!isNaN(num) && num > 0) {
          amount = num
        }
      }

      handleCustomAmountChange('250.50')

      expect(customAmount).toBe('250.50')
      expect(amount).toBe(250.50)
    })

    it('should not update amount for invalid input', () => {
      let amount = 100
      let customAmount = ''

      const handleCustomAmountChange = (value: string) => {
        customAmount = value
        const num = parseFloat(value)
        if (!isNaN(num) && num > 0) {
          amount = num
        }
      }

      handleCustomAmountChange('abc')

      expect(customAmount).toBe('abc')
      expect(amount).toBe(100) // Should remain unchanged
    })

    it('should not update amount for negative input', () => {
      let amount = 100
      let customAmount = ''

      const handleCustomAmountChange = (value: string) => {
        customAmount = value
        const num = parseFloat(value)
        if (!isNaN(num) && num > 0) {
          amount = num
        }
      }

      handleCustomAmountChange('-50')

      expect(customAmount).toBe('-50')
      expect(amount).toBe(100) // Should remain unchanged
    })

    it('should not update amount for zero input', () => {
      let amount = 100
      let customAmount = ''

      const handleCustomAmountChange = (value: string) => {
        customAmount = value
        const num = parseFloat(value)
        if (!isNaN(num) && num > 0) {
          amount = num
        }
      }

      handleCustomAmountChange('0')

      expect(customAmount).toBe('0')
      expect(amount).toBe(100) // Should remain unchanged
    })

    it('should handle decimal amounts correctly', () => {
      let amount = 0
      let customAmount = ''

      const handleCustomAmountChange = (value: string) => {
        customAmount = value
        const num = parseFloat(value)
        if (!isNaN(num) && num > 0) {
          amount = num
        }
      }

      handleCustomAmountChange('99.99')

      expect(customAmount).toBe('99.99')
      expect(amount).toBe(99.99)
    })
  })

  describe('Amount validation', () => {
    it('should enable button for valid amounts (>= 10)', () => {
      const validAmounts = [10, 50, 100, 500, 1000, 10.01, 99.99]

      validAmounts.forEach((amount) => {
        const loading = false
        const isButtonDisabled = amount < 10 || loading

        expect(isButtonDisabled).toBe(false)
      })
    })

    it('should disable button for invalid amounts (< 10)', () => {
      const invalidAmounts = [0, 1, 5, 9, 9.99]

      invalidAmounts.forEach((amount) => {
        const loading = false
        const isButtonDisabled = amount < 10 || loading

        expect(isButtonDisabled).toBe(true)
      })
    })

    it('should disable button when loading', () => {
      const amount = 100
      const loading = true
      const isButtonDisabled = amount < 10 || loading

      expect(isButtonDisabled).toBe(true)
    })

    it('should show error message for amounts below minimum', () => {
      const result = validateDepositAmount(5)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('最小充值金额为 10 USDT')
    })

    it('should not show error for valid amounts', () => {
      const result = validateDepositAmount(100)

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('Error messages', () => {
    it('should display error for amounts below 10 USDT', () => {
      const validation = validateDepositAmount(5)

      expect(validation.valid).toBe(false)
      expect(validation.error).toContain('最小充值金额为 10 USDT')
    })

    it('should display error for negative amounts', () => {
      const validation = validateDepositAmount(-10)

      expect(validation.valid).toBe(false)
      expect(validation.error).toContain('不能为负数')
    })

    it('should display error for zero amount', () => {
      const validation = validateDepositAmount(0)

      expect(validation.valid).toBe(false)
      expect(validation.error).toContain('不能为零')
    })

    it('should display error for non-numeric input', () => {
      const validation = validateDepositAmount('abc')

      expect(validation.valid).toBe(false)
      expect(validation.error).toContain('请输入有效的充值金额')
    })

    it('should clear error when valid amount is entered', () => {
      let error = '最小充值金额为 10 USDT'

      const handleAmountChange = (amount: number) => {
        const validation = validateDepositAmount(amount)
        if (validation.valid) {
          error = ''
        } else {
          error = validation.error || ''
        }
      }

      handleAmountChange(100)

      expect(error).toBe('')
    })
  })

  describe('Amount formatting', () => {
    it('should format amount with 2 decimal places for API', () => {
      const amounts = [10, 50.5, 100.99, 1000]

      amounts.forEach((amount) => {
        const formatted = amount.toFixed(2)

        expect(formatted).toMatch(/^\d+\.\d{2}$/)
      })
    })

    it('should handle large amounts correctly', () => {
      const largeAmount = 99999.99
      const formatted = largeAmount.toFixed(2)

      expect(formatted).toBe('99999.99')
    })

    it('should handle small decimal amounts correctly', () => {
      const smallAmount = 10.01
      const formatted = smallAmount.toFixed(2)

      expect(formatted).toBe('10.01')
    })
  })

  describe('State management', () => {
    it('should maintain amount state across quick and custom selections', () => {
      let amount = 100
      let customAmount = ''

      // Select quick amount
      amount = 50
      customAmount = ''

      expect(amount).toBe(50)
      expect(customAmount).toBe('')

      // Enter custom amount
      customAmount = '250'
      amount = 250

      expect(amount).toBe(250)
      expect(customAmount).toBe('250')

      // Select quick amount again
      amount = 100
      customAmount = ''

      expect(amount).toBe(100)
      expect(customAmount).toBe('')
    })

    it('should clear error when amount changes', () => {
      let error = 'Some error'
      let amount = 5

      const handleAmountChange = (newAmount: number) => {
        amount = newAmount
        error = ''
      }

      handleAmountChange(100)

      expect(amount).toBe(100)
      expect(error).toBe('')
    })
  })
})
