# Requirements Document

## Introduction

本文档定义了钱包充值和提币功能的增强需求。系统需要支持多地址管理、默认地址设置、充值流程优化以及提币订单追踪功能。用户可以管理最多20个钱包地址，系统将使用默认地址进行充值和提币操作，并提供完整的交易状态追踪。

## Glossary

- **System**: 骰宝游戏钱包系统
- **User**: 使用Telegram小程序的玩家
- **Wallet Address**: 加密货币钱包地址（TRC20 USDT）
- **Default Address**: 用户设置的默认钱包地址，用于充值和提币操作
- **Deposit**: 充值操作，用户向系统账户转入资金
- **Withdrawal**: 提币操作，系统向用户钱包地址转出资金
- **Withdrawal Order**: 提币订单，记录提币请求和执行状态
- **txCode**: 交易状态码（0=成功, 1=失败, -1=未确认）
- **txid**: 区块链交易ID，用于追踪链上交易

## Requirements

### Requirement 1

**User Story:** 作为用户，我想要管理多个钱包地址，以便我可以灵活选择不同的地址进行充值和提币操作。

#### Acceptance Criteria

1. WHEN a user accesses the address management interface THEN the System SHALL display all wallet addresses associated with that user
2. WHEN a user creates a new wallet address THEN the System SHALL validate the address format and add it to the user address list
3. WHEN the total number of addresses reaches 20 THEN the System SHALL prevent the user from adding more addresses
4. WHEN a user deletes a wallet address THEN the System SHALL remove the address from the user address list
5. IF a user attempts to delete the default address THEN the System SHALL prevent the deletion and display an error message

### Requirement 2

**User Story:** 作为用户，我想要设置一个默认钱包地址，以便系统可以自动使用该地址进行充值和提币操作。

#### Acceptance Criteria

1. WHEN a user has multiple wallet addresses THEN the System SHALL allow the user to designate one address as the default address
2. WHEN a user sets a new default address THEN the System SHALL update the default flag and remove the default flag from the previous default address
3. WHEN a user queries their addresses THEN the System SHALL clearly indicate which address is the default address
4. WHEN a user has no addresses THEN the System SHALL prompt the user to add an address before performing deposit or withdrawal operations

### Requirement 3

**User Story:** 作为用户，我想要通过默认地址进行充值，以便我可以快速向账户添加资金。

#### Acceptance Criteria

1. WHEN a user initiates a deposit operation THEN the System SHALL display the user default wallet address for receiving funds
2. WHEN a user completes a deposit THEN the System SHALL update the user account balance immediately
3. WHEN displaying deposit information THEN the System SHALL show the default address, deposit amount, and network type
4. IF a user has no default address THEN the System SHALL prompt the user to set a default address before depositing

### Requirement 4

**User Story:** 作为用户，我想要通过默认地址进行提币，以便我可以将资金转出到我的钱包。

#### Acceptance Criteria

1. WHEN a user initiates a withdrawal operation THEN the System SHALL use the user default address as the destination address
2. WHEN a user submits a withdrawal request THEN the System SHALL create a withdrawal order with status set to unconfirmed
3. WHEN a withdrawal is processed THEN the System SHALL deduct the withdrawal amount and fees from the user account balance
4. WHEN a withdrawal transaction is completed THEN the System SHALL update the withdrawal order with the transaction ID
5. IF a user has insufficient balance THEN the System SHALL reject the withdrawal request and display an error message

### Requirement 5

**User Story:** 作为用户，我想要查看我的提币订单状态，以便我可以追踪提币进度和确认到账情况。

#### Acceptance Criteria

1. WHEN a user queries withdrawal records THEN the System SHALL display all withdrawal orders with their current status
2. WHEN displaying a withdrawal order THEN the System SHALL show the withdrawal amount, destination address, transaction ID, and status code
3. WHEN a withdrawal order status is -1 THEN the System SHALL display the status as "pending confirmation"
4. WHEN a withdrawal order status is 0 THEN the System SHALL display the status as "successful"
5. WHEN a withdrawal order status is 1 THEN the System SHALL display the status as "failed"
6. WHEN a withdrawal transaction is confirmed on the blockchain THEN the System SHALL update the order status from -1 to 0

### Requirement 6

**User Story:** 作为用户，我想要在提币前确认交易详情，以便我可以避免错误操作。

#### Acceptance Criteria

1. WHEN a user initiates a withdrawal THEN the System SHALL display a confirmation dialog with withdrawal amount, fees, actual amount, and destination address
2. WHEN displaying the confirmation dialog THEN the System SHALL calculate and show the transaction fee based on the withdrawal amount
3. WHEN a user confirms the withdrawal THEN the System SHALL submit the withdrawal request to the backend API
4. WHEN a user cancels the withdrawal THEN the System SHALL close the confirmation dialog without processing the withdrawal

### Requirement 7

**User Story:** 作为用户，我想要看到清晰的地址验证提示，以便我可以确保输入正确的钱包地址。

#### Acceptance Criteria

1. WHEN a user inputs a wallet address THEN the System SHALL validate the address format in real-time
2. WHEN an address format is invalid THEN the System SHALL display an error message indicating the correct format
3. WHEN validating TRC20 addresses THEN the System SHALL verify that the address starts with T and has exactly 34 characters
4. WHEN a user submits an invalid address THEN the System SHALL prevent the submission and highlight the validation error

### Requirement 8

**User Story:** 作为系统管理员，我想要系统能够处理提币订单的状态更新，以便用户可以实时了解交易进度。

#### Acceptance Criteria

1. WHEN a withdrawal order is created THEN the System SHALL set the initial status to -1 (unconfirmed)
2. WHEN the blockchain transaction is confirmed THEN the System SHALL update the order status to 0 (successful)
3. WHEN a withdrawal transaction fails THEN the System SHALL update the order status to 1 (failed) and refund the user
4. WHEN querying withdrawal orders THEN the System SHALL return the transaction ID for completed transactions
