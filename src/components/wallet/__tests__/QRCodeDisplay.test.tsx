import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import QRCodeDisplay from '../QRCodeDisplay'
import * as utils from '@/lib/utils'

// Mock the copyToClipboard function
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  copyToClipboard: jest.fn(),
}))

describe('QRCodeDisplay Component - Unit Tests', () => {
  const mockOnCancel = jest.fn()
  const mockOnCopyOrderId = jest.fn()
  const mockCopyToClipboard = utils.copyToClipboard as jest.MockedFunction<
    typeof utils.copyToClipboard
  >

  const defaultProps = {
    qrCodeUrl: 'https://example.com/qr-code.png',
    orderId: 'ORDER-123456',
    amount: 100.5,
    paymentStatus: 'pending' as const,
    onCancel: mockOnCancel,
    onCopyOrderId: mockOnCopyOrderId,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('QR code image rendering', () => {
    it('should render QR code image with correct URL', () => {
      const { container } = render(<QRCodeDisplay {...defaultProps} />)

      const qrImage = container.querySelector('img[alt="Payment QR Code"]')
      expect(qrImage).toBeInTheDocument()
      expect(qrImage).toHaveAttribute('src', defaultProps.qrCodeUrl)
    })

    it('should render QR code with different URL', () => {
      const customUrl = 'https://custom.com/qr.png'
      const { container } = render(<QRCodeDisplay {...defaultProps} qrCodeUrl={customUrl} />)

      const qrImage = container.querySelector('img[alt="Payment QR Code"]')
      expect(qrImage).toHaveAttribute('src', customUrl)
    })
  })

  describe('Order information display', () => {
    it('should display order ID correctly', () => {
      const { container } = render(<QRCodeDisplay {...defaultProps} />)

      expect(container.textContent).toContain('ORDER-123456')
      expect(container.textContent).toContain('订单号')
    })

    it('should display amount correctly formatted', () => {
      const { container } = render(<QRCodeDisplay {...defaultProps} />)

      expect(container.textContent).toContain('100.50')
      expect(container.textContent).toContain('USDT')
      expect(container.textContent).toContain('充值金额')
    })

    it('should display payment method as USDT', () => {
      const { container } = render(<QRCodeDisplay {...defaultProps} />)

      expect(container.textContent).toContain('支付方式')
      expect(container.textContent).toContain('USDT')
    })

    it('should display all order information labels', () => {
      const { container } = render(<QRCodeDisplay {...defaultProps} />)

      expect(container.textContent).toContain('订单号')
      expect(container.textContent).toContain('充值金额')
      expect(container.textContent).toContain('支付方式')
    })
  })

  describe('Copy button functionality', () => {
    it('should call copyToClipboard when copy button is clicked', async () => {
      mockCopyToClipboard.mockResolvedValue(true)

      render(<QRCodeDisplay {...defaultProps} />)

      const copyButton = screen.getByText('复制')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(mockCopyToClipboard).toHaveBeenCalledWith('ORDER-123456')
      })
    })

    it('should show "已复制" after successful copy', async () => {
      mockCopyToClipboard.mockResolvedValue(true)

      render(<QRCodeDisplay {...defaultProps} />)

      const copyButton = screen.getByText('复制')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText('已复制')).toBeInTheDocument()
      })
    })

    it('should call onCopyOrderId callback after successful copy', async () => {
      mockCopyToClipboard.mockResolvedValue(true)

      render(<QRCodeDisplay {...defaultProps} />)

      const copyButton = screen.getByText('复制')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(mockOnCopyOrderId).toHaveBeenCalled()
      })
    })

    it('should not call onCopyOrderId if copy fails', async () => {
      mockCopyToClipboard.mockResolvedValue(false)

      render(<QRCodeDisplay {...defaultProps} />)

      const copyButton = screen.getByText('复制')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(mockOnCopyOrderId).not.toHaveBeenCalled()
      })
    })

    it('should reset copy button text after 2 seconds', async () => {
      jest.useFakeTimers()
      mockCopyToClipboard.mockResolvedValue(true)

      render(<QRCodeDisplay {...defaultProps} />)

      const copyButton = screen.getByText('复制')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText('已复制')).toBeInTheDocument()
      })

      jest.advanceTimersByTime(2000)

      await waitFor(() => {
        expect(screen.getByText('复制')).toBeInTheDocument()
      })

      jest.useRealTimers()
    })
  })

  describe('Cancel button functionality', () => {
    it('should call onCancel when cancel button is clicked', () => {
      render(<QRCodeDisplay {...defaultProps} />)

      const cancelButton = screen.getByText('取消支付')
      fireEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should render cancel button', () => {
      render(<QRCodeDisplay {...defaultProps} />)

      const cancelButton = screen.getByText('取消支付')
      expect(cancelButton).toBeInTheDocument()
    })
  })

  describe('Image error handling', () => {
    it('should display error message when image fails to load', () => {
      const { container } = render(<QRCodeDisplay {...defaultProps} />)

      const qrImage = container.querySelector('img[alt="Payment QR Code"]') as HTMLImageElement
      fireEvent.error(qrImage)

      expect(container.textContent).toContain('二维码加载失败')
      expect(container.textContent).toContain('请刷新页面重试')
    })

    it('should show warning icon when image fails to load', () => {
      const { container } = render(<QRCodeDisplay {...defaultProps} />)

      const qrImage = container.querySelector('img[alt="Payment QR Code"]') as HTMLImageElement
      fireEvent.error(qrImage)

      expect(container.textContent).toContain('⚠️')
    })

    it('should not show error message initially', () => {
      render(<QRCodeDisplay {...defaultProps} />)

      expect(screen.queryByText('二维码加载失败')).not.toBeInTheDocument()
    })
  })

  describe('Payment status display', () => {
    it('should display "等待支付" for pending status', () => {
      const { container } = render(<QRCodeDisplay {...defaultProps} paymentStatus="pending" />)

      expect(container.textContent).toContain('等待支付')
      expect(container.textContent).toContain('⏳')
    })

    it('should display "支付成功" for success status', () => {
      const { container } = render(<QRCodeDisplay {...defaultProps} paymentStatus="success" />)

      expect(container.textContent).toContain('支付成功')
      expect(container.textContent).toContain('✅')
    })

    it('should display "支付失败" for failed status', () => {
      const { container } = render(<QRCodeDisplay {...defaultProps} paymentStatus="failed" />)

      expect(container.textContent).toContain('支付失败')
      expect(container.textContent).toContain('❌')
    })
  })

  describe('Payment instructions', () => {
    it('should display payment instructions section', () => {
      const { container } = render(<QRCodeDisplay {...defaultProps} />)

      expect(container.textContent).toContain('支付说明')
    })

    it('should display all payment instruction items', () => {
      const { container } = render(<QRCodeDisplay {...defaultProps} />)

      expect(container.textContent).toContain('请使用支持 USDT 的钱包扫描二维码完成支付')
      expect(container.textContent).toContain('支付完成后，余额将自动到账')
      expect(container.textContent).toContain('请确保支付金额与订单金额一致')
      expect(container.textContent).toContain('如有问题，请联系客服并提供订单号')
    })
  })

  describe('Amount formatting', () => {
    it('should format amount with 2 decimal places', () => {
      const { container } = render(<QRCodeDisplay {...defaultProps} amount={100} />)

      expect(container.textContent).toContain('100.00')
    })

    it('should format large amounts with commas', () => {
      const { container } = render(<QRCodeDisplay {...defaultProps} amount={1234.56} />)

      expect(container.textContent).toContain('1,234.56')
    })

    it('should format decimal amounts correctly', () => {
      const { container } = render(<QRCodeDisplay {...defaultProps} amount={99.99} />)

      expect(container.textContent).toContain('99.99')
    })
  })
})
