# Design Document

## Overview

本设计文档描述了钱包充值和提币功能增强的技术实现方案。系统将支持多地址管理（最多20个）、默认地址设置、优化的充值流程以及完整的提币订单追踪功能。

核心功能包括：
- 钱包地址CRUD操作和默认地址管理
- 基于默认地址的充值流程
- 基于默认地址的提币流程和订单创建
- 提币订单状态追踪（未确认、成功、失败）
- 交易历史记录查询

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Deposit Page │  │Withdraw Page │  │ History Page │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  API Service    │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼──────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Backend API   │
                    │  (Port 8079)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
      ┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
      │   Address    │ │ Account  │ │ Withdrawal │
      │  Management  │ │ Service  │ │  Service   │
      └──────────────┘ └──────────┘ └────────────┘
```

### Data Flow

**Deposit Flow:**
```
User → Select Amount → Display Default Address → Complete Payment → Update Balance
```

**Withdrawal Flow:**
```
User → Enter Amount → Confirm Details → Create Order (status=-1) → 
Process Transaction → Update Order (txid, status=0/1)
```

**Address Management Flow:**
```
User → Add/Delete/Set Default → Validate → Update Database → Refresh UI
```

## Components and Interfaces

### 1. Address Management Component

**Location:** `src/app/withdraw/page.tsx` (existing), new component `src/components/wallet/AddressManager.tsx`

**Responsibilities:**
- Display list of user wallet addresses
- Add new wallet addresses with validation
- Delete existing addresses (except default)
- Set/change default address
- Enforce 20 address limit

**Key Functions:**
```typescript
loadAddresses(): Promise<void>
handleAddAddress(address: string): Promise<void>
handleDeleteAddress(addressId: number): Promise<void>
handleSetDefault(addressId: number): Promise<void>
validateAddress(address: string): boolean
```

### 2. Deposit Component

**Location:** `src/app/deposit/page.tsx`

**Responsibilities:**
- Display default address for deposits
- Show deposit amount and network information
- Handle deposit confirmation
- Update balance after successful deposit

**Key Functions:**
```typescript
loadDefaultAddress(): Promise<void>
handleDeposit(amount: number): Promise<void>
displayDepositInfo(): void
```

### 3. Withdrawal Component

**Location:** `src/app/withdraw/page.tsx`

**Responsibilities:**
- Display withdrawal form with default address
- Calculate fees and actual amount
- Create withdrawal confirmation dialog
- Submit withdrawal request
- Create withdrawal order

**Key Functions:**
```typescript
handleWithdraw(amount: number): Promise<void>
calculateFee(amount: number): number
showConfirmation(): void
submitWithdrawal(): Promise<void>
```

### 4. Withdrawal History Component

**Location:** `src/app/history/page.tsx` or new `src/components/wallet/WithdrawalHistory.tsx`

**Responsibilities:**
- Display list of withdrawal orders
- Show order status (pending/success/failed)
- Display transaction ID for completed orders
- Refresh order status

**Key Functions:**
```typescript
loadWithdrawalOrders(): Promise<void>
getStatusDisplay(txCode: number): string
refreshOrderStatus(orderId: string): Promise<void>
```

### 5. API Service Extension

**Location:** `src/lib/api.ts`

**New Methods:**
```typescript
// Address Management
getAddressList(userId: string): Promise<BackendResponse<AddressEntity[]>>
createAddress(userId: string, address: string): Promise<BackendResponse<boolean>>
deleteAddress(addressId: number, userId: string): Promise<BackendResponse<boolean>>
setDefaultAddress(addressId: number, userId: string): Promise<BackendResponse<boolean>>

// Withdrawal
withdrawUsdt(userId: string, amount: string): Promise<BackendResponse<WithdrawalOrderResponse>>
getWithdrawalOrders(userId: string, pageIndex: number, pageSize: number): Promise<BackendResponse<PageModel<WithdrawalOrder>>>
getWithdrawalOrderDetail(orderId: string): Promise<BackendResponse<WithdrawalOrder>>
```

## Data Models

### AddressEntity

```typescript
interface AddressEntity {
  id: number
  userId: number
  address: string
  defaultAddress: boolean
  createTime: number
  modifyTime: number
}
```

### WithdrawalOrder

```typescript
interface WithdrawalOrder {
  id: string
  userId: number
  amount: string          // 提币金额
  fee: string            // 手续费
  actualAmount: string   // 实际到账金额
  address: string        // 目标地址
  txid?: string          // 交易ID（完成后返回）
  txCode: number         // 状态码：-1=未确认, 0=成功, 1=失败
  createTime: number
  updateTime: number
  confirmTime?: number   // 确认时间
}
```

### WithdrawalOrderResponse

```typescript
interface WithdrawalOrderResponse {
  orderId: string
  txCode: number
  txid?: string
}
```

### PageModel

```typescript
interface PageModel<T> {
  list: T[]
  totalCount: number
  pageIndex: number
  pageSize: number
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Address list display completeness
*For any* user with wallet addresses, when the address management interface is loaded, all addresses returned from the API should be displayed in the UI
**Validates: Requirements 1.1**

### Property 2: Address validation consistency
*For any* address string, the validation function should return true if and only if the address starts with 'T' and has exactly 34 characters
**Validates: Requirements 1.2, 7.3**

### Property 3: Address addition increases list size
*For any* valid address that is not already in the list, adding it should increase the address list size by exactly one
**Validates: Requirements 1.2**

### Property 4: Address deletion decreases list size
*For any* non-default address in the list, deleting it should decrease the address list size by exactly one and the address should no longer appear in the list
**Validates: Requirements 1.4**

### Property 5: Default address uniqueness
*For any* address list, after setting a new default address, exactly one address should have the defaultAddress flag set to true
**Validates: Requirements 2.2**

### Property 6: Default address visibility
*For any* address list containing a default address, the UI should clearly indicate which address is the default
**Validates: Requirements 2.3**

### Property 7: Deposit uses default address
*For any* user with a default address, when initiating a deposit, the displayed receiving address should match the user's default address
**Validates: Requirements 3.1, 4.1**

### Property 8: Deposit balance update
*For any* successful deposit of amount A, the user balance after deposit should equal the balance before deposit plus A
**Validates: Requirements 3.2**

### Property 9: Deposit information completeness
*For any* deposit operation, the displayed information should include the default address, deposit amount, and network type
**Validates: Requirements 3.3**

### Property 10: Withdrawal order initial status
*For any* newly created withdrawal order, the txCode should be set to -1 (unconfirmed)
**Validates: Requirements 4.2, 8.1**

### Property 11: Withdrawal balance deduction
*For any* withdrawal of amount A with fee F, the user balance after withdrawal should equal the balance before withdrawal minus (A + F)
**Validates: Requirements 4.3**

### Property 12: Completed orders have transaction ID
*For any* withdrawal order with txCode = 0 (successful), the order should have a non-empty txid field
**Validates: Requirements 4.4, 8.4**

### Property 13: Withdrawal order display completeness
*For any* withdrawal order, the displayed information should include withdrawal amount, destination address, transaction ID (if available), and status code
**Validates: Requirements 5.2**

### Property 14: Fee calculation correctness
*For any* withdrawal amount A, the calculated fee should be 5 USDT if A < 1000, otherwise 0.02 * A
**Validates: Requirements 6.2**

### Property 15: Confirmation dialog completeness
*For any* withdrawal request, the confirmation dialog should display withdrawal amount, fees, actual amount, and destination address
**Validates: Requirements 6.1**

### Property 16: Cancel prevents API call
*For any* withdrawal confirmation dialog, clicking cancel should close the dialog without making an API call to submit the withdrawal
**Validates: Requirements 6.4**

### Property 17: Invalid address submission prevention
*For any* invalid address (not starting with 'T' or not 34 characters), the submission should be prevented and an error message should be displayed
**Validates: Requirements 7.2, 7.4**

### Property 18: Real-time validation feedback
*For any* address input change, the validation should run immediately and provide feedback before submission
**Validates: Requirements 7.1**

## Error Handling

### Address Management Errors

1. **Address Limit Exceeded**: When user attempts to add more than 20 addresses
   - Display error: "已达到地址数量上限（20个）"
   - Disable add address button

2. **Invalid Address Format**: When user inputs invalid TRC20 address
   - Display error: "请输入有效的 TRON 地址（T开头，34位字符）"
   - Highlight input field in red
   - Prevent submission

3. **Delete Default Address**: When user attempts to delete the default address
   - Display error: "无法删除默认地址，请先设置其他地址为默认"
   - Prevent deletion

4. **API Failure**: When address management API calls fail
   - Display error message from API response
   - Retry option for transient failures
   - Rollback UI state if operation fails

### Withdrawal Errors

1. **Insufficient Balance**: When withdrawal amount exceeds available balance
   - Display error: "余额不足"
   - Highlight amount input
   - Show available balance

2. **Below Minimum**: When withdrawal amount is less than minimum (50 USDT)
   - Display error: "最小提现金额为 50 USDT"
   - Suggest minimum amount

3. **No Default Address**: When user has no default address set
   - Display error: "请先设置默认提现地址"
   - Provide link to address management

4. **Network Error**: When withdrawal API call fails
   - Display error: "网络错误，请稍后重试"
   - Preserve form data
   - Provide retry button

5. **Order Creation Failed**: When backend fails to create withdrawal order
   - Display error message from API
   - Do not deduct balance
   - Log error for debugging

### Deposit Errors

1. **No Default Address**: When user has no default address for deposits
   - Display prompt: "请先添加并设置默认充值地址"
   - Provide button to navigate to address management

2. **Below Minimum**: When deposit amount is less than minimum (10 USDT)
   - Display error: "最小充值金额为 10 USDT"
   - Suggest minimum amount

3. **API Failure**: When deposit API call fails
   - Display error: "充值失败，请稍后重试"
   - Preserve amount selection
   - Provide retry option

## Testing Strategy

### Unit Testing

We will use **Jest** and **React Testing Library** for unit testing React components and utility functions.

**Unit Test Coverage:**

1. **Address Validation Function**
   - Test valid TRC20 addresses (T + 33 chars)
   - Test invalid addresses (wrong prefix, wrong length)
   - Test edge cases (empty string, null, undefined)

2. **Fee Calculation Function**
   - Test small amounts (< 1000): should return 5
   - Test large amounts (>= 1000): should return amount * 0.02
   - Test boundary: exactly 1000

3. **Status Display Mapping**
   - Test txCode = -1 → "待确认"
   - Test txCode = 0 → "成功"
   - Test txCode = 1 → "失败"

4. **Component Rendering**
   - Test AddressManager renders address list correctly
   - Test WithdrawalHistory renders orders correctly
   - Test confirmation dialog displays all required fields

5. **Error Handling**
   - Test error messages display correctly
   - Test form validation prevents invalid submissions
   - Test API error handling and user feedback

### Property-Based Testing

We will use **fast-check** for property-based testing in TypeScript/JavaScript.

**Configuration:**
- Minimum 100 iterations per property test
- Each property test must reference its corresponding correctness property using the format: `**Feature: wallet-enhancement, Property {number}: {property_text}**`

**Property Test Coverage:**

1. **Address Validation (Property 2)**
   - Generate random strings
   - Verify validation returns true only for strings starting with 'T' and length 34

2. **Address List Operations (Properties 3, 4)**
   - Generate random address lists
   - Test adding valid addresses increases list size
   - Test deleting non-default addresses decreases list size

3. **Default Address Uniqueness (Property 5)**
   - Generate random address lists with multiple defaults
   - After setting new default, verify exactly one address is default

4. **Balance Calculations (Properties 8, 11)**
   - Generate random deposit/withdrawal amounts
   - Verify balance changes match expected calculations

5. **Fee Calculation (Property 14)**
   - Generate random withdrawal amounts
   - Verify fee calculation formula for all amounts

6. **Order Status (Properties 10, 12)**
   - Generate random withdrawal orders
   - Verify new orders have txCode = -1
   - Verify successful orders (txCode = 0) have txid

### Integration Testing

1. **Address Management Flow**
   - Add address → Verify in list → Set as default → Verify default flag
   - Delete address → Verify removed from list

2. **Deposit Flow**
   - Select amount → Display default address → Confirm → Verify balance update

3. **Withdrawal Flow**
   - Enter amount → Show confirmation → Submit → Verify order created → Check status

4. **Error Scenarios**
   - Test all error conditions with actual API responses
   - Verify error messages and UI state

### API Endpoint Testing

Test all API endpoints with various inputs:

1. **Address Management APIs**
   - GET `/address/list/{userId}`
   - POST `/address/create/{userId}/{address}`
   - DELETE `/address/delete/{addressId}/{userId}`
   - POST `/address/set/default/{addressId}/{userId}`

2. **Withdrawal APIs**
   - POST `/account/take/usdt/{userId}/{amount}`
   - GET `/withdrawal/orders/{userId}/{pageIndex}/{pageSize}`
   - GET `/withdrawal/order/{orderId}`

3. **Deposit APIs**
   - POST `/account/recharge/{userId}/{money}`

## Implementation Notes

### API Integration

Based on the Swagger documentation at `http://46.250.168.177:8079/swagger-ui/index.html#/`, we need to integrate the following endpoints:

**Address Management:**
- `GET /address/list/{userId}` - Get all addresses for a user
- `POST /address/create/{userId}/{address}` - Create new address
- `DELETE /address/delete/{addressId}/{userId}` - Delete address
- `POST /address/set/default/{addressId}/{userId}` - Set default address

**Withdrawal:**
- `POST /account/take/usdt/{userId}/{amount}` - Submit withdrawal request
- Response should include: `orderId`, `txCode`, `txid` (optional)

**Withdrawal Orders:**
- `GET /withdrawal/orders/{userId}/{pageIndex}/{pageSize}` - Get withdrawal order list
- `GET /withdrawal/order/{orderId}` - Get specific order details

### State Management

Use React hooks for local state management:
- `useState` for component state (addresses, orders, form data)
- `useEffect` for data fetching and side effects
- `useContext` for shared state (WalletContext for balance)

### UI/UX Considerations

1. **Loading States**: Show loading indicators during API calls
2. **Optimistic Updates**: Update UI immediately, rollback on error
3. **Confirmation Dialogs**: Always confirm destructive actions (delete, withdraw)
4. **Error Recovery**: Provide clear error messages and retry options
5. **Responsive Design**: Ensure mobile-friendly layout
6. **Accessibility**: Proper labels, ARIA attributes, keyboard navigation

### Security Considerations

1. **Address Validation**: Always validate on both client and server
2. **Amount Validation**: Prevent negative amounts, check minimums/maximums
3. **Rate Limiting**: Handle API rate limits gracefully
4. **Sensitive Data**: Never log or expose sensitive transaction details
5. **HTTPS**: Ensure all API calls use HTTPS in production

### Performance Optimization

1. **Pagination**: Load withdrawal orders in pages (10-20 per page)
2. **Caching**: Cache address list to reduce API calls
3. **Debouncing**: Debounce address validation during input
4. **Lazy Loading**: Load withdrawal history only when needed
5. **Memoization**: Use React.memo for expensive components
