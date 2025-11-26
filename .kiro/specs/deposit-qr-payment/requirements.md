# Requirements Document

## Introduction

本文档定义了充值功能的二维码支付需求。系统需要对接支付订单接口，生成USDT充值二维码，用户扫码支付后系统自动更新余额。充值流程简化为：选择金额 → 生成二维码 → 扫码支付 → 自动到账。

## Glossary

- **System**: 骰宝游戏钱包系统
- **User**: 使用Telegram小程序的玩家
- **Payment Order**: 支付订单，包含订单ID、金额、二维码等信息
- **QR Code**: 二维码，用于用户扫码支付
- **USDT**: 泰达币，系统唯一支持的充值币种
- **Payment Order API**: 支付订单接口，位于 http://46.250.168.177:8079/swagger-ui/index.html#/

## Requirements

### Requirement 1

**User Story:** 作为用户，我想要通过扫描二维码进行USDT充值，以便我可以快速向账户添加资金。

#### Acceptance Criteria

1. WHEN a user selects a deposit amount THEN the System SHALL call the payment order API to generate a payment order
2. WHEN the payment order is created successfully THEN the System SHALL receive a QR code image URL from the API response
3. WHEN the QR code URL is received THEN the System SHALL display the QR code image to the user
4. WHEN displaying the QR code THEN the System SHALL show the deposit amount and payment instructions
5. WHEN a user completes the payment THEN the System SHALL update the user account balance automatically

### Requirement 2

**User Story:** 作为用户，我想要选择不同的充值金额，以便我可以根据需要灵活充值。

#### Acceptance Criteria

1. WHEN a user accesses the deposit page THEN the System SHALL display quick amount options (10, 50, 100, 500, 1000 USDT)
2. WHEN a user selects a quick amount THEN the System SHALL set that amount as the deposit amount
3. WHEN a user inputs a custom amount THEN the System SHALL validate the amount is at least 10 USDT
4. WHEN the deposit amount is less than 10 USDT THEN the System SHALL display an error message and prevent order creation
5. WHEN the deposit amount is valid THEN the System SHALL enable the confirm button

### Requirement 3

**User Story:** 作为用户，我想要看到清晰的支付状态，以便我可以了解支付进度和结果。

#### Acceptance Criteria

1. WHEN a user clicks confirm deposit THEN the System SHALL display a loading indicator while creating the payment order
2. WHEN the payment order is being created THEN the System SHALL disable the confirm button to prevent duplicate submissions
3. WHEN the payment order creation fails THEN the System SHALL display an error message with the failure reason
4. WHEN the QR code is displayed THEN the System SHALL show payment status as "waiting for payment"
5. WHEN the payment is completed THEN the System SHALL show payment status as "payment successful"

### Requirement 4

**User Story:** 作为用户，我想要在支付完成后自动更新余额，以便我可以立即使用充值的资金。

#### Acceptance Criteria

1. WHEN a payment is completed THEN the System SHALL refresh the user account balance from the backend
2. WHEN the balance is updated THEN the System SHALL display the new balance to the user
3. WHEN the balance update is successful THEN the System SHALL show a success message with the deposited amount
4. WHEN displaying the success message THEN the System SHALL provide an option to return to the wallet page
5. WHEN the user views the success message THEN the System SHALL automatically redirect to the wallet page after 3 seconds

### Requirement 5

**User Story:** 作为用户，我想要看到支付订单的详细信息，以便我可以确认支付金额和订单号。

#### Acceptance Criteria

1. WHEN displaying the QR code THEN the System SHALL show the order ID
2. WHEN displaying the QR code THEN the System SHALL show the deposit amount
3. WHEN displaying the QR code THEN the System SHALL show the payment method (USDT)
4. WHEN displaying the QR code THEN the System SHALL show payment instructions
5. WHEN displaying the QR code THEN the System SHALL provide a copy button for the order ID

### Requirement 6

**User Story:** 作为用户，我想要能够取消支付订单，以便我可以在不想继续支付时返回。

#### Acceptance Criteria

1. WHEN viewing the QR code payment page THEN the System SHALL provide a cancel button
2. WHEN a user clicks the cancel button THEN the System SHALL close the payment dialog
3. WHEN the payment dialog is closed THEN the System SHALL return the user to the deposit amount selection page
4. WHEN a user cancels the payment THEN the System SHALL not affect the user account balance

### Requirement 7

**User Story:** 作为系统管理员，我想要系统能够正确处理支付订单API的响应，以便用户可以顺利完成充值。

#### Acceptance Criteria

1. WHEN calling the payment order API THEN the System SHALL send the user ID and deposit amount as parameters
2. WHEN the API returns a successful response THEN the System SHALL extract the QR code image URL from the response
3. WHEN the API returns an error response THEN the System SHALL display the error message to the user
4. WHEN the API request times out THEN the System SHALL display a timeout error message
5. WHEN the QR code image URL is invalid THEN the System SHALL display an error message indicating the image cannot be loaded

### Requirement 8

**User Story:** 作为用户，我想要看到充值优惠活动信息，以便我可以了解充值奖励。

#### Acceptance Criteria

1. WHEN a user accesses the deposit page THEN the System SHALL display current promotional offers
2. WHEN displaying promotional offers THEN the System SHALL show first deposit bonus information
3. WHEN displaying promotional offers THEN the System SHALL show deposit amount tier bonuses
4. WHEN a user qualifies for a bonus THEN the System SHALL highlight the applicable bonus

### Requirement 9

**User Story:** 作为用户，我想要只使用USDT进行充值，以便我可以使用统一的支付方式。

#### Acceptance Criteria

1. WHEN a user accesses the deposit page THEN the System SHALL only display USDT as the payment method
2. WHEN creating a payment order THEN the System SHALL specify USDT as the payment currency
3. WHEN displaying payment information THEN the System SHALL clearly indicate USDT as the payment method
4. WHEN a user attempts to select other payment methods THEN the System SHALL not provide such options
