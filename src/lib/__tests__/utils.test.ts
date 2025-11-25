import { validateTRC20Address, calculateWithdrawalFee } from '../utils'

describe('validateTRC20Address - Edge Cases', () => {
  describe('Empty and null inputs', () => {
    it('should reject empty string', () => {
      const result = validateTRC20Address('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('请输入钱包地址')
    })

    it('should reject whitespace-only string', () => {
      const result = validateTRC20Address('   ')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('请输入钱包地址')
    })

    it('should reject string with only tabs and newlines', () => {
      const result = validateTRC20Address('\t\n\t')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('请输入钱包地址')
    })
  })

  describe('Wrong prefix', () => {
    it('should reject address starting with A', () => {
      const result = validateTRC20Address('A' + '1'.repeat(33))
      expect(result.valid).toBe(false)
      expect(result.error).toBe('地址必须以T开头')
    })

    it('should reject address starting with lowercase t', () => {
      const result = validateTRC20Address('t' + '1'.repeat(33))
      expect(result.valid).toBe(false)
      expect(result.error).toBe('地址必须以T开头')
    })

    it('should reject address starting with number', () => {
      const result = validateTRC20Address('1' + '1'.repeat(33))
      expect(result.valid).toBe(false)
      expect(result.error).toBe('地址必须以T开头')
    })

    it('should reject address starting with special character', () => {
      const result = validateTRC20Address('$' + '1'.repeat(33))
      expect(result.valid).toBe(false)
      expect(result.error).toBe('地址必须以T开头')
    })
  })

  describe('Wrong length', () => {
    it('should reject address with 33 characters', () => {
      const result = validateTRC20Address('T' + '1'.repeat(32))
      expect(result.valid).toBe(false)
      expect(result.error).toBe('地址长度必须为34个字符')
    })

    it('should reject address with 35 characters', () => {
      const result = validateTRC20Address('T' + '1'.repeat(34))
      expect(result.valid).toBe(false)
      expect(result.error).toBe('地址长度必须为34个字符')
    })

    it('should reject very short address', () => {
      const result = validateTRC20Address('T1')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('地址长度必须为34个字符')
    })

    it('should reject very long address', () => {
      const result = validateTRC20Address('T' + '1'.repeat(100))
      expect(result.valid).toBe(false)
      expect(result.error).toBe('地址长度必须为34个字符')
    })
  })

  describe('Invalid characters', () => {
    it('should reject address with 0 (zero)', () => {
      const result = validateTRC20Address('T' + '0'.repeat(33))
      expect(result.valid).toBe(false)
      expect(result.error).toBe('地址包含无效字符')
    })

    it('should reject address with O (capital o)', () => {
      const result = validateTRC20Address('T' + 'O'.repeat(33))
      expect(result.valid).toBe(false)
      expect(result.error).toBe('地址包含无效字符')
    })

    it('should reject address with I (capital i)', () => {
      const result = validateTRC20Address('T' + 'I'.repeat(33))
      expect(result.valid).toBe(false)
      expect(result.error).toBe('地址包含无效字符')
    })

    it('should reject address with l (lowercase L)', () => {
      const result = validateTRC20Address('T' + 'l'.repeat(33))
      expect(result.valid).toBe(false)
      expect(result.error).toBe('地址包含无效字符')
    })

    it('should reject address with special characters', () => {
      const result = validateTRC20Address('T' + '@'.repeat(33))
      expect(result.valid).toBe(false)
      expect(result.error).toBe('地址包含无效字符')
    })

    it('should reject address with spaces in the middle', () => {
      const result = validateTRC20Address('T' + '1'.repeat(16) + ' ' + '1'.repeat(16))
      expect(result.valid).toBe(false)
      expect(result.error).toBe('地址包含无效字符') // Space is invalid character
    })
  })

  describe('Valid addresses', () => {
    it('should accept valid address with all uppercase', () => {
      const result = validateTRC20Address('T' + 'A'.repeat(33))
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid address with all lowercase', () => {
      const result = validateTRC20Address('T' + 'a'.repeat(33))
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid address with mixed case', () => {
      // Use valid Base58 characters only (no 0, O, I, l) - exactly 34 chars total
      const result = validateTRC20Address('TAbCdEfGhJkMnPqRsTuVwXyZ123456789a')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid address with numbers', () => {
      const result = validateTRC20Address('T' + '123456789'.repeat(3) + '123456')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should trim and accept valid address with leading whitespace', () => {
      const result = validateTRC20Address('  T' + '1'.repeat(33))
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should trim and accept valid address with trailing whitespace', () => {
      const result = validateTRC20Address('T' + '1'.repeat(33) + '  ')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should trim and accept valid address with both leading and trailing whitespace', () => {
      const result = validateTRC20Address('  T' + '1'.repeat(33) + '  ')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('Real-world examples', () => {
    it('should accept example TRON address', () => {
      const result = validateTRC20Address('TMj29MnfCF8zjpjEnbUfiXwVW5onRFoXjR')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })
})

describe('calculateWithdrawalFee - Edge Cases', () => {
  describe('Small amounts', () => {
    it('should return 5 for amount 0.01', () => {
      expect(calculateWithdrawalFee(0.01)).toBe(5)
    })

    it('should return 5 for amount 50', () => {
      expect(calculateWithdrawalFee(50)).toBe(5)
    })

    it('should return 5 for amount 999.99', () => {
      expect(calculateWithdrawalFee(999.99)).toBe(5)
    })
  })

  describe('Boundary value', () => {
    it('should return 20 for exactly 1000', () => {
      expect(calculateWithdrawalFee(1000)).toBe(20)
    })

    it('should return 20.02 for 1001', () => {
      expect(calculateWithdrawalFee(1001)).toBeCloseTo(20.02, 2)
    })

    it('should return 19.98 for 999', () => {
      expect(calculateWithdrawalFee(999)).toBe(5)
    })
  })

  describe('Large amounts', () => {
    it('should return 200 for amount 10000', () => {
      expect(calculateWithdrawalFee(10000)).toBe(200)
    })

    it('should return 2000 for amount 100000', () => {
      expect(calculateWithdrawalFee(100000)).toBe(2000)
    })

    it('should return 20000 for amount 1000000', () => {
      expect(calculateWithdrawalFee(1000000)).toBe(20000)
    })
  })

  describe('Decimal amounts', () => {
    it('should handle decimal amounts correctly for small amounts', () => {
      expect(calculateWithdrawalFee(123.45)).toBe(5)
    })

    it('should handle decimal amounts correctly for large amounts', () => {
      expect(calculateWithdrawalFee(1234.56)).toBeCloseTo(24.6912, 2)
    })

    it('should handle very precise decimals', () => {
      expect(calculateWithdrawalFee(1000.001)).toBeCloseTo(20.00002, 4)
    })
  })

  describe('Edge cases', () => {
    it('should handle zero amount', () => {
      expect(calculateWithdrawalFee(0)).toBe(5)
    })

    it('should handle very small amount', () => {
      expect(calculateWithdrawalFee(0.001)).toBe(5)
    })

    it('should handle amount just below 1000', () => {
      expect(calculateWithdrawalFee(999.999)).toBe(5)
    })

    it('should handle amount just above 1000', () => {
      expect(calculateWithdrawalFee(1000.001)).toBeCloseTo(20.00002, 4)
    })
  })
})
