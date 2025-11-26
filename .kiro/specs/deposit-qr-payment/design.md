# Design Document

## Overview

本设计文档描述了充值功能二维码支付的技术实现方案。系统将对接支付订单API，生成USDT充值二维码，用户扫码支付后系统自动更新余额。

核心功能包括：
- 充值金额选择（快捷金额和自定义金额）
- 调用支付订单API生成二维码
- 显示二维码和订单信息
- 支付状态追踪
- 支付完成后自动更新余额
- 充值优惠活动展示

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
├─────────────────────────────────────────────────────────────┤
│                    ┌──────────────┐                          │
│                    │ Deposit Page │                          │
│                    └──────┬───────┘                          │
│                           │                                  │
│              ┌────────────┼────────────┐                     │
│              │            │            │                     │
│      ┌───────▼──────┐ ┌──▼────────┐ ┌▼──────────┐          │
│      │ Amount       │ │ QR Code   │ │ Payment   │          │
│      │ Selection    │ │ Display   │ │ Status    │          │
│      └───────┬──────┘ └──┬────────┘ └┬──────────┘          │
│              │            │            │                     │
│              └────────────┼────────────┘                     │
│                           │                                  │
│                   ┌───────▼────────┐                         │
│                   │  API Service   │                         │
│                   └───────┬────────┘                         │
└───────────────────────────┼──────────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   Backend API   │
                   │  (Port 8079)    │
                   └────────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
      ┌───────▼──────┐ ┌───▼────────┐ ┌─▼──────────┐
      │   Payment    │ │  Account   │ │  Balance   │
      │   Order      │ │  Service   │ │  Update    │
      │   Service    │ │            │ │            │
      └──────────────┘ └────────────┘ └────────────┘
```

### Data Flow

**Deposit Flow:**
```
User → Select Amount → Create Payment Order → Display QR Code → 
User Scans & Pays → Backend Confirms Payment → Update Balance → Show Success
```

**Payment Order Creation Flow:**
```
Frontend → API Service → POST /payment/order/{userId}/{amount} → 
Backend → Generate QR Code → Return Order Info + QR URL → 
Frontend → Display QR Code
```

## Components and Interfaces

### 1. Deposit Page Component

**Location:** `src/app/deposit/page.tsx`

**Responsibilities:**
- Display amount selection interface (quick amounts + custom input)
- Validate deposit amount (minimum 10 USDT)
- Create payment order via API
- Display QR code and order information
- Track payment status
- Update balance after successful payment
- Show promotional offers

**Key Functions:**
```typescript
handleQuickAmount(value: number): void
handleCustomAmountChange(value: string): void
validateAmount(amount: number): boolean
createPaymentOrder(): Promise<void>
displayQRCode(qrCodeUrl: string, orderId: string): void
checkPaymentStatus(orderId: string): Promise<void>
handlePaymentSuccess(): Promise<void>
cancelPayment(): void
```

**State Management:**
```typescript
const [amount, setAmount] = useState<number>(100)
const [customAmount, setCustomAmount] = useState<string>('')
const [loading, setLoading] = useState<boolean>(false)
const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null)
const [showQRCode, setShowQRCode] = useState<boolean>(false)
const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending')
const [error, setError] = useState<string>('')
```

### 2. QR Code Display Component

**Location:** `src/components/wallet/QRCodeDisplay.tsx` (new component)

**Responsibilities:**
- Display QR code image
- Show order information (order ID, amount, payment method)
- Provide copy button for order ID
- Show payment instructions
- Display payment status
- Provide cancel button

**Props:**
```typescript
interface QRCodeDisplayProps {
  qrCodeUrl: string
  orderId: string
  amount: number
  paymentStatus: 'pending' | 'success' | 'failed'
  onCancel: () => void
  onCopyOrderId: () => void
}
```

**Key Functions:**
```typescript
copyOrderId(): void
handleImageError(): void
```

### 3. API Service Extension

**Location:** `src/lib/api.ts`

**New Methods:**
```typescript
/**
 * 创建支付订单
 * @param userId 用户ID
 * @param amount 充值金额
 * @returns BackendResponse<PaymentOrder>
 */
async createPaymentOrder(userId: string, amount: string): Promise<BackendResponse<PaymentOrder>>

/**
 * 查询支付订单状态
 * @param orderId 订单ID
 * @returns BackendResponse<PaymentOrderStatus>
 */
async getPaymentOrderStatus(orderId: string): Promise<BackendResponse<PaymentOrderStatus>>
```

## Data Models

### PaymentOrder

```typescript
interface PaymentOrder {
  orderId: string          // 订单ID
  userId: number           // 用户ID
  amount: string           // 充值金额
  currency: string         // 币种 (USDT)
  qrCodeUrl: string        // 二维码图片URL
  status: number           // 订单状态：0=待支付, 1=已支付, 2=已取消, 3=已过期
  createTime: number       // 创建时间
  expireTime?: number      // 过期时间
}
```

### PaymentOrderStatus

```typescript
interface PaymentOrderStatus {
  orderId: string
  status: number           // 订单状态：0=待支付, 1=已支付, 2=已取消, 3=已过期
  paidAmount?: string      // 实际支付金额
  paidTime?: number        // 支付时间
}
```

### PaymentOrderRequest

```typescript
interface PaymentOrderRequest {
  userId: string
  amount: string
  currency: 'USDT'
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework:

1.1 WHEN a user selects a deposit amount THEN the System SHALL call the payment order API to generate a payment order
  Thoughts: This is about the system behavior when a user performs an action. We can test that when the confirm button is clicked with a valid amount, the API is called with the correct parameters.
  Testable: yes - property

1.2 WHEN the payment order is created successfully THEN the System SHALL receive a QR code image URL from the API response
  Thoughts: This is about parsing the API response correctly. We can test that the response contains a qrCodeUrl field and it's extracted properly.
  Testable: yes - property

1.3 WHEN the QR code URL is received THEN the System SHALL display the QR code image to the user
  Thoughts: This is about UI rendering. We can test that when a QR code URL is set, the image element is rendered with that URL.
  Testable: yes - property

1.4 WHEN displaying the QR code THEN the System SHALL show the deposit amount and payment instructions
  Thoughts: This is about UI completeness. We can test that the rendered QR code display contains the amount and instructions.
  Testable: yes - property

1.5 WHEN a user completes the payment THEN the System SHALL update the user account balance automatically
  Thoughts: This is about balance update after payment. We can test that after payment success, the balance refresh function is called.
  Testable: yes - property

2.1 WHEN a user accesses the deposit page THEN the System SHALL display quick amount options (10, 50, 100, 500, 1000 USDT)
  Thoughts: This is about initial UI state. This is a specific example of what should be displayed.
  Testable: yes - example

2.2 WHEN a user selects a quick amount THEN the System SHALL set that amount as the deposit amount
  Thoughts: This is about state update. We can test that clicking a quick amount button updates the amount state.
  Testable: yes - property

2.3 WHEN a user inputs a custom amount THEN the System SHALL validate the amount is at least 10 USDT
  Thoughts: This is about input validation. We can test that amounts less than 10 are rejected.
  Testable: yes - property

2.4 WHEN the deposit amount is less than 10 USDT THEN the System SHALL display an error message and prevent order creation
  Thoughts: This is about error handling for invalid amounts. We can test that the error message appears and the button is disabled.
  Testable: yes - property

2.5 WHEN the deposit amount is valid THEN the System SHALL enable the confirm button
  Thoughts: This is about button state. We can test that valid amounts enable the button.
  Testable: yes - property

3.1 WHEN a user clicks confirm deposit THEN the System SHALL display a loading indicator while creating the payment order
  Thoughts: This is about loading state. We can test that clicking confirm sets loading to true.
  Testable: yes - property

3.2 WHEN the payment order is being created THEN the System SHALL disable the confirm button to prevent duplicate submissions
  Thoughts: This is about preventing duplicate submissions. We can test that the button is disabled during loading.
  Testable: yes - property

3.3 WHEN the payment order creation fails THEN the System SHALL display an error message with the failure reason
  Thoughts: This is about error handling. We can test that API errors result in error messages being displayed.
  Testable: yes - property

3.4 WHEN the QR code is displayed THEN the System SHALL show payment status as "waiting for payment"
  Thoughts: This is about initial payment status. We can test that the status is set to pending when QR code is shown.
  Testable: yes - example

3.5 WHEN the payment is completed THEN the System SHALL show payment status as "payment successful"
  Thoughts: This is about payment success status. We can test that successful payment updates status to success.
  Testable: yes - example

4.1 WHEN a payment is completed THEN the System SHALL refresh the user account balance from the backend
  Thoughts: This is about balance refresh. We can test that the refresh balance function is called after payment success.
  Testable: yes - property

4.2 WHEN the balance is updated THEN the System SHALL display the new balance to the user
  Thoughts: This is about UI update after balance refresh. This is more about the WalletContext behavior.
  Testable: no

4.3 WHEN the balance update is successful THEN the System SHALL show a success message with the deposited amount
  Thoughts: This is about success message display. We can test that the success message contains the correct amount.
  Testable: yes - property

4.4 WHEN displaying the success message THEN the System SHALL provide an option to return to the wallet page
  Thoughts: This is about UI completeness. We can test that the success dialog has a button to navigate to wallet.
  Testable: yes - example

4.5 WHEN the user views the success message THEN the System SHALL automatically redirect to the wallet page after 3 seconds
  Thoughts: This is about auto-redirect behavior. We can test that a timer is set for 3 seconds.
  Testable: yes - property

5.1 WHEN displaying the QR code THEN the System SHALL show the order ID
  Thoughts: This is about UI completeness. We can test that the order ID is displayed.
  Testable: yes - property

5.2 WHEN displaying the QR code THEN the System SHALL show the deposit amount
  Thoughts: This is about UI completeness. We can test that the amount is displayed.
  Testable: yes - property

5.3 WHEN displaying the QR code THEN the System SHALL show the payment method (USDT)
  Thoughts: This is about UI completeness. We can test that USDT is displayed.
  Testable: yes - example

5.4 WHEN displaying the QR code THEN the System SHALL show payment instructions
  Thoughts: This is about UI completeness. We can test that instructions are displayed.
  Testable: yes - example

5.5 WHEN displaying the QR code THEN the System SHALL provide a copy button for the order ID
  Thoughts: This is about UI completeness. We can test that a copy button exists.
  Testable: yes - example

6.1 WHEN viewing the QR code payment page THEN the System SHALL provide a cancel button
  Thoughts: This is about UI completeness. We can test that a cancel button exists.
  Testable: yes - example

6.2 WHEN a user clicks the cancel button THEN the System SHALL close the payment dialog
  Thoughts: This is about cancel behavior. We can test that clicking cancel closes the dialog.
  Testable: yes - property

6.3 WHEN the payment dialog is closed THEN the System SHALL return the user to the deposit amount selection page
  Thoughts: This is about state reset. We can test that closing the dialog resets the showQRCode state.
  Testable: yes - property

6.4 WHEN a user cancels the payment THEN the System SHALL not affect the user account balance
  Thoughts: This is about ensuring no side effects. We can test that cancel doesn't call any balance update functions.
  Testable: yes - property

7.1 WHEN calling the payment order API THEN the System SHALL send the user ID and deposit amount as parameters
  Thoughts: This is about API call parameters. We can test that the API is called with correct parameters.
  Testable: yes - property

7.2 WHEN the API returns a successful response THEN the System SHALL extract the QR code image URL from the response
  Thoughts: This is about response parsing. We can test that the qrCodeUrl is extracted from the response.
  Testable: yes - property

7.3 WHEN the API returns an error response THEN the System SHALL display the error message to the user
  Thoughts: This is about error handling. We can test that API errors result in error messages.
  Testable: yes - property

7.4 WHEN the API request times out THEN the System SHALL display a timeout error message
  Thoughts: This is about timeout handling. This is an edge case that property testing can help with.
  Testable: edge-case

7.5 WHEN the QR code image URL is invalid THEN the System SHALL display an error message indicating the image cannot be loaded
  Thoughts: This is about image loading error handling. We can test that image errors are handled.
  Testable: yes - property

8.1 WHEN a user accesses the deposit page THEN the System SHALL display current promotional offers
  Thoughts: This is about initial UI state. This is a specific example.
  Testable: yes - example

8.2 WHEN displaying promotional offers THEN the System SHALL show first deposit bonus information
  Thoughts: This is about UI content. This is a specific example.
  Testable: yes - example

8.3 WHEN displaying promotional offers THEN the System SHALL show deposit amount tier bonuses
  Thoughts: This is about UI content. This is a specific example.
  Testable: yes - example

8.4 WHEN a user qualifies for a bonus THEN the System SHALL highlight the applicable bonus
  Thoughts: This is about conditional UI highlighting. This is more about business logic that's hard to test in isolation.
  Testable: no

9.1 WHEN a user accesses the deposit page THEN the System SHALL only display USDT as the payment method
  Thoughts: This is about UI state. This is a specific example.
  Testable: yes - example

9.2 WHEN creating a payment order THEN the System SHALL specify USDT as the payment currency
  Thoughts: This is about API call parameters. We can test that the currency parameter is always USDT.
  Testable: yes - property

9.3 WHEN displaying payment information THEN the System SHALL clearly indicate USDT as the payment method
  Thoughts: This is about UI content. This is a specific example.
  Testable: yes - example

9.4 WHEN a user attempts to select other payment methods THEN the System SHALL not provide such options
  Thoughts: This is about UI constraints. This is a specific example.
  Testable: yes - example

### Property 1: API call on confirm
*For any* valid deposit amount, when the user clicks confirm, the payment order API should be called with the user ID and amount
**Validates: Requirements 1.1, 7.1**

### Property 2: QR code URL extraction
*For any* successful API response containing a qrCodeUrl field, the system should extract and store the QR code URL
**Validates: Requirements 1.2, 7.2**

### Property 3: QR code display
*For any* non-empty QR code URL, the system should render an image element with that URL as the source
**Validates: Requirements 1.3**

### Property 4: QR code information completeness
*For any* displayed QR code, the UI should show the deposit amount and payment instructions
**Validates: Requirements 1.4**

### Property 5: Balance refresh on payment success
*For any* successful payment, the system should call the balance refresh function
**Validates: Requirements 1.5, 4.1**

### Property 6: Quick amount selection
*For any* quick amount button clicked, the amount state should be updated to that value
**Validates: Requirements 2.2**

### Property 7: Minimum amount validation
*For any* deposit amount less than 10 USDT, the validation should fail and display an error message
**Validates: Requirements 2.3, 2.4**

### Property 8: Valid amount enables button
*For any* deposit amount greater than or equal to 10 USDT, the confirm button should be enabled
**Validates: Requirements 2.5**

### Property 9: Loading state on confirm
*For any* confirm button click, the loading state should be set to true immediately
**Validates: Requirements 3.1**

### Property 10: Button disabled during loading
*For any* loading state being true, the confirm button should be disabled
**Validates: Requirements 3.2**

### Property 11: Error message on API failure
*For any* API error response, the system should display an error message
**Validates: Requirements 3.3, 7.3**

### Property 12: Success message contains amount
*For any* successful payment, the success message should display the deposited amount
**Validates: Requirements 4.3**

### Property 13: Auto-redirect timer
*For any* successful payment, a redirect timer should be set for 3 seconds
**Validates: Requirements 4.5**

### Property 14: Order information display
*For any* displayed QR code, the UI should show the order ID and deposit amount
**Validates: Requirements 5.1, 5.2**

### Property 15: Cancel closes dialog
*For any* cancel button click, the QR code dialog should be closed
**Validates: Requirements 6.2, 6.3**

### Property 16: Cancel has no side effects
*For any* cancel action, no balance update or API calls should be made
**Validates: Requirements 6.4**

### Property 17: Image error handling
*For any* QR code image that fails to load, an error message should be displayed
**Validates: Requirements 7.5**

### Property 18: USDT currency parameter
*For any* payment order creation, the currency parameter should be set to "USDT"
**Validates: Requirements 9.2**

## Error Handling

### Amount Validation Errors

1. **Below Minimum**: When deposit amount is less than 10 USDT
   - Display error: "最小充值金额为 10 USDT"
   - Disable confirm button
   - Highlight amount input

2. **Invalid Input**: When user inputs non-numeric or negative values
   - Display error: "请输入有效的充值金额"
   - Clear invalid input
   - Reset to last valid amount

### Payment Order Creation Errors

1. **API Failure**: When payment order API call fails
   - Display error: "创建支付订单失败，请稍后重试"
   - Log error details for debugging
   - Provide retry button
   - Reset loading state

2. **Network Error**: When network connection fails
   - Display error: "网络连接失败，请检查网络后重试"
   - Provide retry button
   - Preserve amount selection

3. **Timeout Error**: When API request times out
   - Display error: "请求超时，请稍后重试"
   - Set timeout to 30 seconds
   - Provide retry button

4. **Invalid Response**: When API returns unexpected response format
   - Display error: "服务器响应异常，请联系客服"
   - Log response for debugging
   - Provide return button

### QR Code Display Errors

1. **Missing QR Code URL**: When API response doesn't contain qrCodeUrl
   - Display error: "二维码生成失败，请重试"
   - Provide retry button
   - Log error details

2. **Image Load Failure**: When QR code image fails to load
   - Display error: "二维码加载失败，请刷新页面"
   - Show placeholder image
   - Provide refresh button
   - Display order ID as fallback

3. **Invalid Image URL**: When qrCodeUrl is malformed
   - Display error: "二维码地址无效"
   - Log URL for debugging
   - Provide retry button

### Payment Status Errors

1. **Status Check Failure**: When payment status query fails
   - Display warning: "支付状态查询失败，请稍后刷新"
   - Provide manual refresh button
   - Continue showing QR code

2. **Payment Expired**: When payment order expires
   - Display error: "支付订单已过期，请重新创建"
   - Provide button to create new order
   - Clear current QR code

3. **Payment Failed**: When payment fails on backend
   - Display error: "支付失败，请重试或联系客服"
   - Show failure reason if available
   - Provide retry button

### Balance Update Errors

1. **Balance Refresh Failure**: When balance update fails after payment
   - Display warning: "余额更新失败，请手动刷新"
   - Show payment success message
   - Provide manual refresh button
   - Don't block user from continuing

## Testing Strategy

### Unit Testing

We will use **Jest** and **React Testing Library** for unit testing React components and utility functions.

**Unit Test Coverage:**

1. **Amount Validation Function**
   - Test valid amounts (>= 10 USDT)
   - Test invalid amounts (< 10 USDT)
   - Test edge cases (exactly 10, negative, zero, non-numeric)

2. **Quick Amount Selection**
   - Test clicking quick amount buttons updates state
   - Test custom amount input updates state
   - Test custom amount clears quick selection

3. **Payment Order Creation**
   - Test API is called with correct parameters
   - Test loading state is set during API call
   - Test button is disabled during loading
   - Test error handling for failed API calls

4. **QR Code Display**
   - Test QR code image is rendered with correct URL
   - Test order information is displayed
   - Test payment instructions are shown
   - Test copy button functionality

5. **Payment Success Flow**
   - Test success message displays correct amount
   - Test balance refresh is called
   - Test auto-redirect timer is set
   - Test manual navigation button works

6. **Cancel Functionality**
   - Test cancel button closes dialog
   - Test cancel resets state
   - Test cancel doesn't call API or update balance

7. **Error Handling**
   - Test amount validation errors
   - Test API error messages
   - Test image load error handling
   - Test network error handling

### Property-Based Testing

We will use **fast-check** for property-based testing in TypeScript/JavaScript.

**Configuration:**
- Minimum 100 iterations per property test
- Each property test must reference its corresponding correctness property using the format: `**Feature: deposit-qr-payment, Property {number}: {property_text}**`

**Property Test Coverage:**

1. **Amount Validation (Property 7)**
   - Generate random amounts
   - Verify amounts < 10 fail validation
   - Verify amounts >= 10 pass validation

2. **API Call Parameters (Property 1, 18)**
   - Generate random valid amounts
   - Verify API is called with correct userId and amount
   - Verify currency is always "USDT"

3. **State Updates (Property 6, 9, 10)**
   - Generate random quick amounts
   - Verify state updates correctly
   - Verify loading state behavior

4. **Error Handling (Property 11)**
   - Generate random API error responses
   - Verify error messages are displayed

5. **UI Completeness (Property 4, 14)**
   - Generate random order data
   - Verify all required information is displayed

### Integration Testing

1. **Complete Deposit Flow**
   - Select amount → Create order → Display QR code → Simulate payment → Verify balance update

2. **Error Recovery Flow**
   - Trigger API error → Display error → Retry → Verify success

3. **Cancel Flow**
   - Create order → Display QR code → Cancel → Verify state reset

4. **Amount Validation Flow**
   - Input invalid amount → See error → Input valid amount → Proceed

### API Endpoint Testing

Test the payment order API endpoint:

1. **Create Payment Order**
   - Endpoint: `POST /payment/order/{userId}/{amount}` (需要确认实际端点)
   - Test with various amounts
   - Test with invalid parameters
   - Verify response contains qrCodeUrl
   - Verify response contains orderId

2. **Query Payment Status** (如果API提供)
   - Endpoint: `GET /payment/order/status/{orderId}`
   - Test with valid order ID
   - Test with invalid order ID
   - Verify status updates correctly

## Implementation Notes

### API Integration

Based on the Swagger documentation at `http://46.250.168.177:8079/swagger-ui/index.html#/`, we need to integrate the payment order endpoint. The exact endpoint path needs to be confirmed from the Swagger documentation.

**Expected API Endpoint:**
- Method: `POST`
- Path: `/payment/order/{userId}/{amount}` (待确认)
- Parameters:
  - `userId`: string - User ID
  - `amount`: string - Deposit amount
- Response:
  ```json
  {
    "success": true,
    "data": {
      "orderId": "string",
      "qrCodeUrl": "string",
      "amount": "string",
      "currency": "USDT",
      "status": 0,
      "createTime": 1234567890,
      "expireTime": 1234567890
    },
    "message": "success"
  }
  ```

### State Management

Use React hooks for local state management:
- `useState` for component state (amount, loading, error, paymentOrder, showQRCode)
- `useEffect` for side effects (auto-redirect timer)
- `useContext` for shared state (WalletContext for balance)

### UI/UX Considerations

1. **Loading States**: Show loading spinner during API calls
2. **Error Recovery**: Provide clear error messages and retry options
3. **QR Code Display**: Large, clear QR code with good contrast
4. **Mobile Optimization**: Ensure QR code is easily scannable on mobile devices
5. **Payment Instructions**: Clear step-by-step instructions for users
6. **Order Information**: Prominent display of order ID and amount
7. **Copy Functionality**: Easy copy button for order ID
8. **Auto-Redirect**: Smooth transition after successful payment
9. **Cancel Option**: Always provide a way to go back

### Security Considerations

1. **Amount Validation**: Always validate on both client and server
2. **Order Verification**: Verify order belongs to user before displaying
3. **HTTPS**: Ensure all API calls use HTTPS in production
4. **QR Code Security**: Validate QR code URL is from trusted domain
5. **No Sensitive Data**: Never log or expose sensitive payment details

### Performance Optimization

1. **Image Loading**: Preload QR code image for faster display
2. **Debouncing**: Debounce custom amount input validation
3. **Caching**: Cache promotional offers to reduce API calls
4. **Lazy Loading**: Load QR code component only when needed
5. **Error Boundaries**: Wrap components in error boundaries for graceful failure

### Payment Status Polling (Optional)

If the backend doesn't provide webhooks for payment status updates, implement polling:

```typescript
useEffect(() => {
  if (!paymentOrder || paymentStatus !== 'pending') return;
  
  const pollInterval = setInterval(async () => {
    try {
      const status = await apiService.getPaymentOrderStatus(paymentOrder.orderId);
      if (status.data?.status === 1) { // Paid
        setPaymentStatus('success');
        await handlePaymentSuccess();
        clearInterval(pollInterval);
      }
    } catch (error) {
      console.error('Failed to poll payment status:', error);
    }
  }, 5000); // Poll every 5 seconds
  
  return () => clearInterval(pollInterval);
}, [paymentOrder, paymentStatus]);
```

### Accessibility

1. **Alt Text**: Provide descriptive alt text for QR code image
2. **ARIA Labels**: Add ARIA labels for buttons and interactive elements
3. **Keyboard Navigation**: Ensure all functionality is keyboard accessible
4. **Screen Reader**: Announce payment status changes
5. **Focus Management**: Manage focus when dialogs open/close

### Internationalization (Future)

Prepare for multi-language support:
- Extract all text strings to constants
- Use i18n library for translations
- Support different currency formats
- Handle RTL languages if needed
