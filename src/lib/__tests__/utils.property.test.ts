import * as fc from 'fast-check'
import { validateTRC20Address, calculateWithdrawalFee, validateDepositAmount } from '../utils'

/**
 * Feature: wallet-enhancement, Property 2: Address validation consistency
 * Validates: Requirements 1.2, 7.3
 * 
 * For any address string, the validation function should return true 
 * if and only if the address starts with 'T' and has exactly 34 characters
 */
describe('Property Test: Address Validation Consistency', () => {
  it('should validate addresses that start with T and have 34 characters', () => {
    fc.assert(
      fc.property(
        // Generate valid TRC20 addresses: T + 33 Base58 characters
        fc.tuple(
          fc.constant('T'),
          fc.array(
            fc.constantFrom(
              ...'123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('')
            ),
            { minLength: 33, maxLength: 33 }
          ).map(arr => arr.join(''))
        ).map(([prefix, rest]) => prefix + rest),
        (address) => {
          const result = validateTRC20Address(address)
          // All addresses starting with T and having 34 chars should be valid
          expect(result.valid).toBe(true)
          expect(result.error).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should reject addresses that do not start with T', () => {
    fc.assert(
      fc.property(
        // Generate addresses that don't start with T
        fc.tuple(
          fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSUVWXYZ0123456789'.split('')),
          fc.array(
            fc.constantFrom(
              ...'123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('')
            ),
            { minLength: 33, maxLength: 33 }
          ).map(arr => arr.join(''))
        ).map(([prefix, rest]) => prefix + rest),
        (address) => {
          const result = validateTRC20Address(address)
          // Addresses not starting with T should be invalid
          expect(result.valid).toBe(false)
          expect(result.error).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should reject addresses with incorrect length', () => {
    fc.assert(
      fc.property(
        // Generate addresses starting with T but with wrong length
        fc.tuple(
          fc.constant('T'),
          fc.array(
            fc.constantFrom(
              ...'123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('')
            ),
            { minLength: 1, maxLength: 50 }
          ).filter(arr => arr.length !== 33) // Exclude correct length
          .map(arr => arr.join(''))
        ).map(([prefix, rest]) => prefix + rest),
        (address) => {
          const result = validateTRC20Address(address)
          // Addresses with wrong length should be invalid
          expect(result.valid).toBe(false)
          expect(result.error).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should reject addresses with invalid characters', () => {
    fc.assert(
      fc.property(
        // Generate addresses with invalid Base58 characters (0, O, I, l)
        fc.tuple(
          fc.constant('T'),
          fc.array(
            fc.constantFrom(...'0OIl'.split('')),
            { minLength: 33, maxLength: 33 }
          ).map(arr => arr.join(''))
        ).map(([prefix, rest]) => prefix + rest),
        (address) => {
          const result = validateTRC20Address(address)
          // Addresses with invalid Base58 characters should be invalid
          expect(result.valid).toBe(false)
          expect(result.error).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle whitespace correctly', () => {
    fc.assert(
      fc.property(
        // Generate valid addresses with leading/trailing whitespace
        fc.tuple(
          fc.array(fc.constantFrom(' ', '\t', '\n'), { minLength: 0, maxLength: 5 }).map(arr => arr.join('')),
          fc.constant('T'),
          fc.array(
            fc.constantFrom(
              ...'123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('')
            ),
            { minLength: 33, maxLength: 33 }
          ).map(arr => arr.join('')),
          fc.array(fc.constantFrom(' ', '\t', '\n'), { minLength: 0, maxLength: 5 }).map(arr => arr.join(''))
        ).map(([leading, prefix, rest, trailing]) => leading + prefix + rest + trailing),
        (address) => {
          const result = validateTRC20Address(address)
          // Should trim and validate correctly
          expect(result.valid).toBe(true)
          expect(result.error).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: wallet-enhancement, Property 14: Fee calculation correctness
 * Validates: Requirements 6.2
 * 
 * For any withdrawal amount, the calculated fee should be 2 USDT (unified rate)
 */
describe('Property Test: Fee Calculation Correctness', () => {
  it('should always return 2 USDT for any amount', () => {
    fc.assert(
      fc.property(
        // Generate any positive amount
        fc.double({ min: 0.01, max: 1000000, noNaN: true }),
        (amount) => {
          const fee = calculateWithdrawalFee(amount)
          expect(fee).toBe(2)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return constant fee regardless of amount', () => {
    fc.assert(
      fc.property(
        // Generate two different amounts
        fc.tuple(
          fc.double({ min: 10, max: 100000, noNaN: true }),
          fc.double({ min: 10, max: 100000, noNaN: true })
        ),
        ([amount1, amount2]) => {
          const fee1 = calculateWithdrawalFee(amount1)
          const fee2 = calculateWithdrawalFee(amount2)
          
          // Fee should be the same regardless of amount
          expect(fee1).toBe(fee2)
          expect(fee1).toBe(2)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should always return non-negative fee', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1000000, noNaN: true }),
        (amount) => {
          const fee = calculateWithdrawalFee(amount)
          expect(fee).toBeGreaterThanOrEqual(0)
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: deposit-qr-payment, Property 7: Minimum amount validation
 * Validates: Requirements 2.3, 2.4
 * 
 * For any deposit amount less than 10 USDT, the validation should fail
 * For any deposit amount greater than or equal to 10 USDT, the validation should pass
 */
describe('Property Test: Minimum Amount Validation', () => {
  it('should reject amounts less than 10 USDT', () => {
    fc.assert(
      fc.property(
        // Generate amounts less than 10
        fc.double({ min: 0.01, max: 9.99, noNaN: true }),
        (amount) => {
          const result = validateDepositAmount(amount)
          expect(result.valid).toBe(false)
          expect(result.error).toBeDefined()
          expect(result.error).toContain('最小充值金额为 10 USDT')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should accept amounts greater than or equal to 10 USDT', () => {
    fc.assert(
      fc.property(
        // Generate amounts >= 10
        fc.double({ min: 10, max: 1000000, noNaN: true }),
        (amount) => {
          const result = validateDepositAmount(amount)
          expect(result.valid).toBe(true)
          expect(result.error).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should reject negative amounts', () => {
    fc.assert(
      fc.property(
        // Generate negative amounts
        fc.double({ min: -1000000, max: -0.01, noNaN: true }),
        (amount) => {
          const result = validateDepositAmount(amount)
          expect(result.valid).toBe(false)
          expect(result.error).toBeDefined()
          expect(result.error).toContain('不能为负数')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should reject zero amount', () => {
    const result = validateDepositAmount(0)
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.error).toContain('不能为零')
  })

  it('should handle string inputs correctly', () => {
    fc.assert(
      fc.property(
        // Generate valid numeric strings >= 10
        fc.double({ min: 10, max: 1000000, noNaN: true }).map(n => n.toString()),
        (amountStr) => {
          const result = validateDepositAmount(amountStr)
          expect(result.valid).toBe(true)
          expect(result.error).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should reject invalid string inputs', () => {
    fc.assert(
      fc.property(
        // Generate non-numeric strings
        fc.string().filter(s => isNaN(parseFloat(s))),
        (invalidStr) => {
          const result = validateDepositAmount(invalidStr)
          expect(result.valid).toBe(false)
          expect(result.error).toBeDefined()
          expect(result.error).toContain('请输入有效的充值金额')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate boundary value (exactly 10 USDT)', () => {
    const result = validateDepositAmount(10)
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should validate just below boundary (9.99 USDT)', () => {
    const result = validateDepositAmount(9.99)
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.error).toContain('最小充值金额为 10 USDT')
  })
})
