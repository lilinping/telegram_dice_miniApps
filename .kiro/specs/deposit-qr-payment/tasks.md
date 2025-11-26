# Implementation Plan

- [x] 1. Extend API service with payment order endpoints
  - Add PaymentOrder, PaymentOrderStatus, and PaymentOrderRequest interfaces to `src/lib/types.ts`
  - Implement createPaymentOrder API method in `src/lib/api.ts`
  - Implement getPaymentOrderStatus API method in `src/lib/api.ts` (if backend supports)
  - _Requirements: 1.1, 7.1, 7.2_

- [x] 1.1 Write unit tests for payment order API methods
  - Test createPaymentOrder with valid parameters
  - Test createPaymentOrder with invalid parameters
  - Test error handling for failed API requests
  - Test getPaymentOrderStatus if implemented
  - _Requirements: 1.1, 7.1, 7.2_

- [x] 2. Implement amount validation utility
  - Create `validateDepositAmount` function in `src/lib/utils.ts`
  - Validate amount is at least 10 USDT
  - Return boolean result and error message
  - _Requirements: 2.3, 2.4_

- [x] 2.1 Write property test for amount validation
  - **Property 7: Minimum amount validation**
  - **Validates: Requirements 2.3, 2.4**

- [x] 2.2 Write unit tests for amount validation edge cases
  - Test exactly 10 USDT (boundary)
  - Test negative amounts
  - Test zero amount
  - Test non-numeric input
  - _Requirements: 2.3, 2.4_

- [x] 3. Update TypeScript type definitions
  - Add PaymentOrder interface
  - Add PaymentOrderStatus interface
  - Add PaymentOrderRequest interface
  - Update BackendResponse type if needed
  - _Requirements: 1.1, 1.2_

- [x] 4. Create QR Code Display component
  - Create `src/components/wallet/QRCodeDisplay.tsx`
  - Display QR code image with proper sizing
  - Show order ID, amount, and payment method
  - Add copy button for order ID
  - Show payment instructions
  - Display payment status indicator
  - Add cancel button
  - Handle image load errors
  - _Requirements: 1.3, 1.4, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 7.5_

- [x] 4.1 Write property test for QR code information completeness
  - **Property 4: QR code information completeness**
  - **Property 14: Order information display**
  - **Validates: Requirements 1.4, 5.1, 5.2**

- [x] 4.2 Write unit tests for QR Code Display component
  - Test QR code image renders with correct URL
  - Test order information displays correctly
  - Test copy button functionality
  - Test cancel button functionality
  - Test image error handling
  - _Requirements: 1.3, 5.1, 5.2, 5.5, 6.1, 7.5_

- [x] 5. Update deposit page with payment order flow
  - Modify `src/app/deposit/page.tsx` to integrate payment order API
  - Implement amount selection (quick amounts + custom input)
  - Add amount validation with error messages
  - Implement createPaymentOrder on confirm
  - Handle loading state during API call
  - Display QR code dialog when order is created
  - Handle API errors with user-friendly messages
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 7.1, 7.2, 7.3_

- [x] 5.1 Write property test for API call on confirm
  - **Property 1: API call on confirm**
  - **Validates: Requirements 1.1, 7.1**

- [x] 5.2 Write property test for QR code URL extraction
  - **Property 2: QR code URL extraction**
  - **Validates: Requirements 1.2, 7.2**

- [x] 5.3 Write property test for loading state
  - **Property 9: Loading state on confirm**
  - **Property 10: Button disabled during loading**
  - **Validates: Requirements 3.1, 3.2**

- [x] 5.4 Write property test for error handling
  - **Property 11: Error message on API failure**
  - **Validates: Requirements 3.3, 7.3**

- [x] 5.5 Write unit tests for deposit page amount selection
  - Test quick amount buttons update state
  - Test custom amount input updates state
  - Test amount validation enables/disables button
  - Test error messages for invalid amounts
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 6. Implement payment success flow
  - Add payment status tracking state
  - Implement balance refresh on payment success
  - Display success message with deposited amount
  - Add auto-redirect timer (3 seconds)
  - Provide manual navigation button to wallet page
  - _Requirements: 1.5, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6.1 Write property test for balance refresh on success
  - **Property 5: Balance refresh on payment success**
  - **Validates: Requirements 1.5, 4.1**

- [x] 6.2 Write property test for success message
  - **Property 12: Success message contains amount**
  - **Validates: Requirements 4.3**

- [x] 6.3 Write property test for auto-redirect
  - **Property 13: Auto-redirect timer**
  - **Validates: Requirements 4.5**

- [x] 6.4 Write unit tests for payment success flow
  - Test success message displays correct amount
  - Test balance refresh is called
  - Test auto-redirect timer is set
  - Test manual navigation button works
  - _Requirements: 4.1, 4.3, 4.4, 4.5_

- [x] 7. Implement cancel payment functionality
  - Add cancel button to QR code dialog
  - Implement cancel handler to close dialog
  - Reset state when payment is cancelled
  - Ensure no API calls or balance updates on cancel
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7.1 Write property test for cancel functionality
  - **Property 15: Cancel closes dialog**
  - **Property 16: Cancel has no side effects**
  - **Validates: Requirements 6.2, 6.3, 6.4**

- [x] 7.2 Write unit tests for cancel functionality
  - Test cancel button closes dialog
  - Test cancel resets showQRCode state
  - Test cancel doesn't call API
  - Test cancel doesn't update balance
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 8. Add USDT-only payment method constraint
  - Remove other payment method options from UI
  - Set currency to "USDT" in all payment order requests
  - Display USDT prominently in payment information
  - Update promotional offers to mention USDT
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 8.1 Write property test for USDT currency parameter
  - **Property 18: USDT currency parameter**
  - **Validates: Requirements 9.2**

- [x] 8.2 Write unit tests for USDT constraint
  - Test only USDT is displayed as payment method
  - Test payment order uses USDT currency
  - Test UI shows USDT in payment info
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 9. Implement payment status polling (optional)
  - Add polling mechanism to check payment status
  - Poll every 5 seconds while payment is pending
  - Update payment status when payment is confirmed
  - Stop polling when payment succeeds or user cancels
  - Handle polling errors gracefully
  - _Requirements: 3.4, 3.5_

- [ ] 9.1 Write unit tests for payment status polling
  - Test polling starts when QR code is displayed
  - Test polling interval is 5 seconds
  - Test polling stops on payment success
  - Test polling stops on cancel
  - Test polling error handling
  - _Requirements: 3.4, 3.5_

- [x] 10. Add comprehensive error handling
  - Handle amount validation errors
  - Handle payment order creation errors
  - Handle network errors with retry option
  - Handle timeout errors
  - Handle QR code image load errors
  - Handle payment status check errors
  - Display user-friendly error messages
  - _Requirements: 2.4, 3.3, 7.3, 7.4, 7.5_

- [x] 10.1 Write property test for image error handling
  - **Property 17: Image error handling**
  - **Validates: Requirements 7.5**

- [x] 10.2 Write unit tests for error handling
  - Test amount validation error messages
  - Test API error messages
  - Test network error messages
  - Test timeout error messages
  - Test image load error handling
  - _Requirements: 2.4, 3.3, 7.3, 7.4, 7.5_

- [x] 11. Update promotional offers section
  - Display first deposit bonus information
  - Display deposit amount tier bonuses
  - Highlight applicable bonuses based on amount
  - Update offers to mention USDT only
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 11.1 Write unit tests for promotional offers
  - Test promotional offers are displayed
  - Test first deposit bonus is shown
  - Test tier bonuses are shown
  - Test USDT is mentioned in offers
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 12. Add loading indicators and UI polish
  - Add loading spinner during payment order creation
  - Add skeleton loader for QR code
  - Add smooth transitions for dialog open/close
  - Add success animation for payment completion
  - Ensure mobile-responsive design
  - Add proper ARIA labels for accessibility
  - _Requirements: 3.1_

- [x] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Integration testing
  - Test complete deposit flow: select amount → create order → display QR → simulate payment → verify balance
  - Test error recovery flow: trigger error → display error → retry → verify success
  - Test cancel flow: create order → display QR → cancel → verify state reset
  - Test amount validation flow: invalid amount → error → valid amount → proceed
  - _Requirements: All_

- [ ] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
