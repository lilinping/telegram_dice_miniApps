# Implementation Plan

- [x] 1. Extend API service with address and withdrawal endpoints
  - Add TypeScript interfaces for AddressEntity, WithdrawalOrder, and related types to `src/lib/types.ts`
  - Implement address management API methods in `src/lib/api.ts`
  - Implement withdrawal order API methods in `src/lib/api.ts`
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 4.2, 5.1_

- [x] 1.1 Write unit tests for API service methods
  - Test address management API calls
  - Test withdrawal API calls
  - Test error handling for failed API requests
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 4.2, 5.1_

- [x] 2. Implement address validation utility
  - Create `validateTRC20Address` function in `src/lib/utils.ts`
  - Validate address starts with 'T' and has exactly 34 characters
  - Return boolean result and error message
  - _Requirements: 1.2, 7.1, 7.2, 7.3, 7.4_

- [x] 2.1 Write property test for address validation
  - **Property 2: Address validation consistency**
  - **Validates: Requirements 1.2, 7.3**

- [x] 2.2 Write unit tests for address validation edge cases
  - Test empty string, null, undefined
  - Test addresses with wrong prefix
  - Test addresses with wrong length
  - _Requirements: 1.2, 7.3_

- [x] 3. Implement fee calculation utility
  - Create `calculateWithdrawalFee` function in `src/lib/utils.ts`
  - Return 5 USDT for amounts < 1000
  - Return 2% of amount for amounts >= 1000
  - _Requirements: 6.2_

- [x] 3.1 Write property test for fee calculation
  - **Property 14: Fee calculation correctness**
  - **Validates: Requirements 6.2**

- [x] 3.2 Write unit tests for fee calculation boundary cases
  - Test amount exactly 1000
  - Test very small amounts
  - Test very large amounts
  - _Requirements: 6.2_

- [x] 4. Update TypeScript type definitions
  - Add AddressEntity interface
  - Add WithdrawalOrder interface
  - Add WithdrawalOrderResponse interface
  - Add PageModel generic interface
  - Update existing types if needed
  - _Requirements: 1.1, 4.2, 5.1_

- [x] 5. Enhance withdraw page with address management
  - Update `src/app/withdraw/page.tsx` to load and display address list
  - Implement add address functionality with validation
  - Implement delete address functionality (prevent deleting default)
  - Implement set default address functionality
  - Enforce 20 address limit
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3_

- [x] 5.1 Write property test for address list operations
  - **Property 3: Address addition increases list size**
  - **Property 4: Address deletion decreases list size**
  - **Validates: Requirements 1.2, 1.4**

- [x] 5.2 Write property test for default address uniqueness
  - **Property 5: Default address uniqueness**
  - **Validates: Requirements 2.2**

- [x] 5.3 Write unit tests for address management UI
  - Test address list rendering
  - Test add address button disabled at 20 addresses
  - Test delete default address prevention
  - Test default address indicator display
  - _Requirements: 1.1, 1.3, 1.5, 2.3_

- [x] 6. Update withdrawal flow to use default address
  - Modify withdrawal form to automatically use default address
  - Update confirmation dialog to show default address
  - Implement withdrawal submission with order creation
  - Handle withdrawal response with orderId and txCode
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.3_

- [x] 6.1 Write property test for withdrawal uses default address
  - **Property 7: Deposit uses default address**
  - **Validates: Requirements 3.1, 4.1**

- [x] 6.2 Write property test for withdrawal balance deduction
  - **Property 11: Withdrawal balance deduction**
  - **Validates: Requirements 4.3**

- [x] 6.3 Write property test for withdrawal order initial status
  - **Property 10: Withdrawal order initial status**
  - **Validates: Requirements 4.2, 8.1**

- [x] 6.4 Write unit tests for withdrawal confirmation dialog
  - Test dialog displays all required fields
  - Test cancel button closes dialog without API call
  - Test confirm button submits withdrawal
  - _Requirements: 6.1, 6.3, 6.4_

- [x] 7. Implement withdrawal history component
  - Create `src/components/wallet/WithdrawalHistory.tsx` component
  - Load withdrawal orders with pagination
  - Display order details (amount, address, txid, status)
  - Implement status display mapping (txCode to text)
  - Add refresh functionality
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7.1 Write property test for completed orders have txid
  - **Property 12: Completed orders have transaction ID**
  - **Validates: Requirements 4.4, 8.4**

- [x] 7.2 Write unit tests for status display mapping
  - Test txCode -1 displays "待确认"
  - Test txCode 0 displays "成功"
  - Test txCode 1 displays "失败"
  - _Requirements: 5.3, 5.4, 5.5_

- [x] 7.3 Write unit tests for withdrawal history rendering
  - Test order list displays correctly
  - Test pagination works
  - Test refresh updates order list
  - _Requirements: 5.1, 5.2_

- [x] 8. Update deposit page to use default address
  - Modify `src/app/deposit/page.tsx` to load default address
  - Display default address in deposit information
  - Show network type (TRC20)
  - Handle case when no default address exists
  - _Requirements: 3.1, 3.3, 3.4_

- [x] 8.1 Write property test for deposit information completeness
  - **Property 9: Deposit information completeness**
  - **Validates: Requirements 3.3**

- [x] 8.2 Write unit tests for deposit page
  - Test default address display
  - Test no default address prompt
  - Test deposit amount validation
  - _Requirements: 3.1, 3.3, 3.4_

- [x] 9. Integrate withdrawal history into history page
  - Update `src/app/history/page.tsx` to include withdrawal history tab
  - Add tab navigation between game history and withdrawal history
  - Integrate WithdrawalHistory component
  - _Requirements: 5.1_

- [x] 9.1 Write unit tests for history page tabs
  - Test tab switching works correctly
  - Test withdrawal history tab displays orders
  - _Requirements: 5.1_

- [x] 10. Implement error handling and user feedback
  - Add error state management to all components
  - Display user-friendly error messages
  - Implement retry logic for failed API calls
  - Add loading states for async operations
  - _Requirements: 1.2, 1.3, 1.5, 4.5, 7.2, 7.4_

- [x] 10.1 Write unit tests for error handling
  - Test insufficient balance error
  - Test invalid address error
  - Test API failure error handling
  - Test delete default address error
  - _Requirements: 1.5, 4.5, 7.2, 7.4_

- [x] 11. Add form validation and real-time feedback
  - Implement real-time address validation on input
  - Add visual feedback for validation errors
  - Prevent form submission with invalid data
  - Add debouncing for validation during typing
  - _Requirements: 7.1, 7.2, 7.4_

- [x] 11.1 Write property test for real-time validation
  - **Property 18: Real-time validation feedback**
  - **Validates: Requirements 7.1**

- [x] 11.2 Write property test for invalid address prevention
  - **Property 17: Invalid address submission prevention**
  - **Validates: Requirements 7.2, 7.4**

- [x] 12. Update WalletContext for balance management
  - Ensure balance updates after deposits
  - Ensure balance updates after withdrawals
  - Add method to refresh balance from API
  - _Requirements: 3.2, 4.3_

- [x] 12.1 Write property test for deposit balance update
  - **Property 8: Deposit balance update**
  - **Validates: Requirements 3.2**

- [x] 13. Add UI polish and responsive design
  - Ensure all components are mobile-friendly
  - Add loading spinners for async operations
  - Add success animations for completed actions
  - Improve accessibility (ARIA labels, keyboard navigation)
  - _Requirements: All_

- [x] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Integration testing and bug fixes
  - Test complete address management flow
  - Test complete deposit flow
  - Test complete withdrawal flow
  - Fix any bugs discovered during testing
  - _Requirements: All_

- [x] 15.1 Write integration tests for complete flows
  - Test add address → set default → withdraw flow
  - Test deposit → balance update flow
  - Test withdrawal → order creation → status check flow
  - _Requirements: All_

- [x] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
