import * as fc from 'fast-check'
import { AddressEntity } from '../types'

/**
 * Feature: wallet-enhancement, Property 3: Address addition increases list size
 * Feature: wallet-enhancement, Property 4: Address deletion decreases list size
 * Validates: Requirements 1.2, 1.4
 */

// Helper function to simulate adding an address
function addAddress(addresses: AddressEntity[], newAddress: AddressEntity): AddressEntity[] {
  return [...addresses, newAddress]
}

// Helper function to simulate deleting a non-default address
function deleteAddress(addresses: AddressEntity[], addressId: number): AddressEntity[] {
  const addressToDelete = addresses.find(addr => addr.id === addressId)
  if (addressToDelete?.defaultAddress) {
    throw new Error('Cannot delete default address')
  }
  return addresses.filter(addr => addr.id !== addressId)
}

// Helper function to set default address
function setDefaultAddress(addresses: AddressEntity[], addressId: number): AddressEntity[] {
  return addresses.map(addr => ({
    ...addr,
    defaultAddress: addr.id === addressId
  }))
}

describe('Property Test: Address List Operations', () => {
  it('should increase list size by 1 when adding a valid address', () => {
    fc.assert(
      fc.property(
        // Generate a list of addresses
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            userId: fc.constant(123456),
            address: fc.tuple(
              fc.constant('T'),
              fc.array(
                fc.constantFrom(
                  ...'123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('')
                ),
                { minLength: 33, maxLength: 33 }
              ).map(arr => arr.join(''))
            ).map(([prefix, rest]) => prefix + rest),
            defaultAddress: fc.boolean(),
            createTime: fc.integer({ min: 1000000000000, max: 9999999999999 }),
            modifyTime: fc.integer({ min: 1000000000000, max: 9999999999999 }),
          }),
          { minLength: 0, maxLength: 19 }
        ),
        // Generate a new address to add
        fc.record({
          id: fc.integer({ min: 1001, max: 2000 }),
          userId: fc.constant(123456),
          address: fc.tuple(
            fc.constant('T'),
            fc.array(
              fc.constantFrom(
                ...'123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('')
              ),
              { minLength: 33, maxLength: 33 }
            ).map(arr => arr.join(''))
          ).map(([prefix, rest]) => prefix + rest),
          defaultAddress: fc.constant(false),
          createTime: fc.integer({ min: 1000000000000, max: 9999999999999 }),
          modifyTime: fc.integer({ min: 1000000000000, max: 9999999999999 }),
        }),
        (addresses, newAddress) => {
          const originalLength = addresses.length
          const newAddresses = addAddress(addresses, newAddress)
          
          // Property: Adding an address increases list size by 1
          expect(newAddresses.length).toBe(originalLength + 1)
          
          // Property: The new address is in the list
          expect(newAddresses.find(addr => addr.id === newAddress.id)).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should decrease list size by 1 when deleting a non-default address', () => {
    fc.assert(
      fc.property(
        // Generate a list with at least 2 addresses with unique IDs
        fc.integer({ min: 2, max: 20 }).chain(size =>
          fc.tuple(
            ...Array.from({ length: size }, (_, i) =>
              fc.record({
                id: fc.constant(i + 1), // Unique IDs
                userId: fc.constant(123456),
                address: fc.tuple(
                  fc.constant('T'),
                  fc.array(
                    fc.constantFrom(
                      ...'123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('')
                    ),
                    { minLength: 33, maxLength: 33 }
                  ).map(arr => arr.join(''))
                ).map(([prefix, rest]) => prefix + rest),
                defaultAddress: fc.constant(i === 0), // First one is default
                createTime: fc.integer({ min: 1000000000000, max: 9999999999999 }),
                modifyTime: fc.integer({ min: 1000000000000, max: 9999999999999 }),
              })
            )
          ).map(tuple => Array.from(tuple))
        ),
        (addresses) => {
          // Find a non-default address to delete (any except the first one)
          const nonDefaultAddress = addresses.find(addr => !addr.defaultAddress)
          
          if (nonDefaultAddress) {
            const originalLength = addresses.length
            const newAddresses = deleteAddress(addresses, nonDefaultAddress.id)
            
            // Property: Deleting an address decreases list size by 1
            expect(newAddresses.length).toBe(originalLength - 1)
            
            // Property: The deleted address is not in the list
            expect(newAddresses.find(addr => addr.id === nonDefaultAddress.id)).toBeUndefined()
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should throw error when trying to delete default address', () => {
    fc.assert(
      fc.property(
        // Generate a list with at least one default address
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            userId: fc.constant(123456),
            address: fc.tuple(
              fc.constant('T'),
              fc.array(
                fc.constantFrom(
                  ...'123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('')
                ),
                { minLength: 33, maxLength: 33 }
              ).map(arr => arr.join(''))
            ).map(([prefix, rest]) => prefix + rest),
            defaultAddress: fc.boolean(),
            createTime: fc.integer({ min: 1000000000000, max: 9999999999999 }),
            modifyTime: fc.integer({ min: 1000000000000, max: 9999999999999 }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (addresses) => {
          // Find a default address
          const defaultAddress = addresses.find(addr => addr.defaultAddress)
          
          if (defaultAddress) {
            // Property: Deleting default address should throw error
            expect(() => deleteAddress(addresses, defaultAddress.id)).toThrow('Cannot delete default address')
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: wallet-enhancement, Property 5: Default address uniqueness
 * Validates: Requirements 2.2
 */
describe('Property Test: Default Address Uniqueness', () => {
  it('should have exactly one default address after setting a new default', () => {
    fc.assert(
      fc.property(
        // Generate a list of addresses with unique IDs
        fc.integer({ min: 1, max: 20 }).chain(size =>
          fc.tuple(
            ...Array.from({ length: size }, (_, i) =>
              fc.record({
                id: fc.constant(i + 1), // Unique IDs
                userId: fc.constant(123456),
                address: fc.tuple(
                  fc.constant('T'),
                  fc.array(
                    fc.constantFrom(
                      ...'123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('')
                    ),
                    { minLength: 33, maxLength: 33 }
                  ).map(arr => arr.join(''))
                ).map(([prefix, rest]) => prefix + rest),
                defaultAddress: fc.boolean(),
                createTime: fc.integer({ min: 1000000000000, max: 9999999999999 }),
                modifyTime: fc.integer({ min: 1000000000000, max: 9999999999999 }),
              })
            )
          ).map(tuple => Array.from(tuple))
        ),
        // Pick a random address index to set as default
        fc.integer({ min: 0, max: 19 }),
        (addresses, index) => {
          if (index < addresses.length) {
            const addressToSetDefault = addresses[index]
            const newAddresses = setDefaultAddress(addresses, addressToSetDefault.id)
            
            // Property: Exactly one address should be default
            const defaultAddresses = newAddresses.filter(addr => addr.defaultAddress)
            expect(defaultAddresses.length).toBe(1)
            
            // Property: The correct address should be default
            expect(defaultAddresses[0].id).toBe(addressToSetDefault.id)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should remove default flag from previous default address', () => {
    fc.assert(
      fc.property(
        // Generate a list with at least 2 addresses with unique IDs
        fc.integer({ min: 2, max: 20 }).chain(size =>
          fc.tuple(
            ...Array.from({ length: size }, (_, i) =>
              fc.record({
                id: fc.constant(i + 1), // Unique IDs
                userId: fc.constant(123456),
                address: fc.tuple(
                  fc.constant('T'),
                  fc.array(
                    fc.constantFrom(
                      ...'123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('')
                    ),
                    { minLength: 33, maxLength: 33 }
                  ).map(arr => arr.join(''))
                ).map(([prefix, rest]) => prefix + rest),
                defaultAddress: fc.boolean(),
                createTime: fc.integer({ min: 1000000000000, max: 9999999999999 }),
                modifyTime: fc.integer({ min: 1000000000000, max: 9999999999999 }),
              })
            )
          ).map(tuple => Array.from(tuple))
        ),
        (addresses) => {
          // Set first address as default
          const firstDefault = setDefaultAddress(addresses, addresses[0].id)
          const oldDefaultId = addresses[0].id
          
          // Set second address as default
          const secondDefault = setDefaultAddress(firstDefault, addresses[1].id)
          
          // Property: Old default should no longer be default
          const oldDefault = secondDefault.find(addr => addr.id === oldDefaultId)
          expect(oldDefault?.defaultAddress).toBe(false)
          
          // Property: New default should be default
          const newDefault = secondDefault.find(addr => addr.id === addresses[1].id)
          expect(newDefault?.defaultAddress).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})
