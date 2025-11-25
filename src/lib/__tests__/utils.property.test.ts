import * as fc from 'fast-check'
import { validateTRC20Address, calculateWithdrawalFee } from '../utils'

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
 * For any withdrawal amount A, the calculated fee should be 5 USDT if A < 1000,
 * otherwise 0.02 * A
 */
describe('Property Test: Fee Calculation Correctness', () => {
  it('should return 5 for amounts less than 1000', () => {
    fc.assert(
      fc.property(
        // Generate amounts less than 1000
        fc.double({ min: 0.01, max: 999.99, noNaN: true }),
        (amount) => {
          const fee = calculateWithdrawalFee(amount)
          expect(fee).toBe(5)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return 2% of amount for amounts >= 1000', () => {
    fc.assert(
      fc.property(
        // Generate amounts >= 1000
        fc.double({ min: 1000, max: 1000000, noNaN: true }),
        (amount) => {
          const fee = calculateWithdrawalFee(amount)
          const expected = amount * 0.02
          // Use approximate equality for floating point
          expect(Math.abs(fee - expected)).toBeLessThan(0.0001)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle boundary value of 1000 correctly', () => {
    const fee = calculateWithdrawalFee(1000)
    expect(fee).toBe(20) // 1000 * 0.02 = 20
  })

  it('should always return non-negative fees', () => {
    fc.assert(
      fc.property(
        // Generate any positive amount
        fc.double({ min: 0.01, max: 1000000, noNaN: true }),
        (amount) => {
          const fee = calculateWithdrawalFee(amount)
          expect(fee).toBeGreaterThanOrEqual(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have fee proportional to amount for large amounts', () => {
    fc.assert(
      fc.property(
        // Generate two amounts >= 1000
        fc.tuple(
          fc.double({ min: 1000, max: 100000, noNaN: true }),
          fc.double({ min: 1000, max: 100000, noNaN: true })
        ),
        ([amount1, amount2]) => {
          const fee1 = calculateWithdrawalFee(amount1)
          const fee2 = calculateWithdrawalFee(amount2)
          
          // Fee ratio should equal amount ratio (both use 2%)
          const feeRatio = fee1 / fee2
          const amountRatio = amount1 / amount2
          
          // Use approximate equality for floating point
          expect(Math.abs(feeRatio - amountRatio)).toBeLessThan(0.0001)
        }
      ),
      { numRuns: 100 }
    )
  })
})
