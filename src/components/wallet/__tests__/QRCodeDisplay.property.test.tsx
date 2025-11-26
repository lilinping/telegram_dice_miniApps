import * as fc from 'fast-check'
import { render, screen } from '@testing-library/react'
import QRCodeDisplay from '../QRCodeDisplay'

/**
 * Feature: deposit-qr-payment, Property 4: QR code information completeness
 * Feature: deposit-qr-payment, Property 14: Order information display
 * Validates: Requirements 1.4, 5.1, 5.2
 *
 * For any displayed QR code, the UI should show the deposit amount and payment instructions
 * For any displayed QR code, the UI should show the order ID and deposit amount
 */
describe('Property Test: QR Code Information Completeness', () => {
  const mockOnCancel = jest.fn()
  const mockOnCopyOrderId = jest.fn()

  beforeEach(() => {
    mockOnCancel.mockClear()
    mockOnCopyOrderId.mockClear()
  })

  it('should display all required information for any valid order data', () => {
    fc.assert(
      fc.property(
        // Generate random order data
        fc.record({
          qrCodeUrl: fc.webUrl(),
          orderId: fc.uuid(),
          amount: fc.double({ min: 10, max: 100000, noNaN: true }),
          paymentStatus: fc.constantFrom('pending', 'success', 'failed') as fc.Arbitrary<
            'pending' | 'success' | 'failed'
          >,
        }),
        (orderData) => {
          const { container } = render(
            <QRCodeDisplay
              qrCodeUrl={orderData.qrCodeUrl}
              orderId={orderData.orderId}
              amount={orderData.amount}
              paymentStatus={orderData.paymentStatus}
              onCancel={mockOnCancel}
              onCopyOrderId={mockOnCopyOrderId}
            />
          )

          // Property 14: Order ID should be displayed
          expect(container.textContent).toContain(orderData.orderId)

          // Property 14: Amount should be displayed
          const formattedAmount = orderData.amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          expect(container.textContent).toContain(formattedAmount)

          // Property 4: Payment method (USDT) should be displayed
          expect(container.textContent).toContain('USDT')

          // Property 4: Payment instructions should be displayed
          expect(container.textContent).toContain('支付说明')
          expect(container.textContent).toContain('请使用支持 USDT 的钱包扫描二维码完成支付')

          // QR code image should be present
          const qrImage = container.querySelector('img[alt="Payment QR Code"]')
          expect(qrImage).toBeInTheDocument()
          expect(qrImage).toHaveAttribute('src', orderData.qrCodeUrl)

          // Cancel button should be present
          expect(container.textContent).toContain('取消支付')

          // Copy button should be present
          expect(container.textContent).toContain('复制')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should display correct payment status for any status value', () => {
    fc.assert(
      fc.property(
        fc.record({
          qrCodeUrl: fc.webUrl(),
          orderId: fc.uuid(),
          amount: fc.double({ min: 10, max: 100000, noNaN: true }),
          paymentStatus: fc.constantFrom('pending', 'success', 'failed') as fc.Arbitrary<
            'pending' | 'success' | 'failed'
          >,
        }),
        (orderData) => {
          const { container } = render(
            <QRCodeDisplay
              qrCodeUrl={orderData.qrCodeUrl}
              orderId={orderData.orderId}
              amount={orderData.amount}
              paymentStatus={orderData.paymentStatus}
              onCancel={mockOnCancel}
              onCopyOrderId={mockOnCopyOrderId}
            />
          )

          // Check that the correct status text is displayed
          const statusTextMap = {
            pending: '等待支付',
            success: '支付成功',
            failed: '支付失败',
          }

          expect(container.textContent).toContain(statusTextMap[orderData.paymentStatus])
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should always display order information section', () => {
    fc.assert(
      fc.property(
        fc.record({
          qrCodeUrl: fc.webUrl(),
          orderId: fc.uuid(),
          amount: fc.double({ min: 10, max: 100000, noNaN: true }),
          paymentStatus: fc.constantFrom('pending', 'success', 'failed') as fc.Arbitrary<
            'pending' | 'success' | 'failed'
          >,
        }),
        (orderData) => {
          const { container } = render(
            <QRCodeDisplay
              qrCodeUrl={orderData.qrCodeUrl}
              orderId={orderData.orderId}
              amount={orderData.amount}
              paymentStatus={orderData.paymentStatus}
              onCancel={mockOnCancel}
              onCopyOrderId={mockOnCopyOrderId}
            />
          )

          // Order information labels should be present
          expect(container.textContent).toContain('订单号')
          expect(container.textContent).toContain('充值金额')
          expect(container.textContent).toContain('支付方式')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should format amount consistently for any valid amount', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 10, max: 100000, noNaN: true }),
        (amount) => {
          const { container } = render(
            <QRCodeDisplay
              qrCodeUrl="https://example.com/qr.png"
              orderId="test-order-123"
              amount={amount}
              paymentStatus="pending"
              onCancel={mockOnCancel}
              onCopyOrderId={mockOnCopyOrderId}
            />
          )

          // Amount should be formatted with 2 decimal places
          const formattedAmount = amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })

          // Check that the formatted amount appears in the document
          const amountText = `${formattedAmount} USDT`
          expect(container.textContent).toContain(formattedAmount)
        }
      ),
      { numRuns: 100 }
    )
  })
})
