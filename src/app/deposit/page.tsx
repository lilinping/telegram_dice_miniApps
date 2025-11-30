'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn, validateDepositAmount } from '@/lib/utils'
import { useTelegram } from '@/contexts/TelegramContext'
import { useWallet } from '@/contexts/WalletContext'
import { apiService } from '@/lib/api'
import { PaymentOrder, PaymentOrderStatus } from '@/lib/types'
import QRCodeDisplay from '@/components/wallet/QRCodeDisplay'
import Modal from '@/components/ui/Modal'

/**
 * 充值页面
 *
 * 功能：
 * 1. 充值金额选择（快捷金额+自定义）
 * 2. 支付方式选择（USDT TRC20/ERC20, TON）
 * 3. 支付流程引导与状态追踪
 * 4. 充值优惠活动展示
 * 5. 对接充值API
 */

const quickAmounts = [10, 50, 100, 500, 1000]

export default function DepositPage() {
  const router = useRouter()
  const { user } = useTelegram()
  const { refreshBalance } = useWallet()
  const userId = user?.id

  const [amount, setAmount] = useState<number>(100)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [showQRCode, setShowQRCode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [showOrderInfo, setShowOrderInfo] = useState(false)
  const [orderInfo, setOrderInfo] = useState<PaymentOrderStatus | null>(null)



  // 处理快捷金额选择
  const handleQuickAmount = (value: number) => {
    setAmount(value)
    setCustomAmount('')
    setError('')
  }

  // 处理自定义金额输入
  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setError('')
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0) {
      setAmount(num)
    }
  }

  // 验证金额
  const validateAmount = (): boolean => {
    const validation = validateDepositAmount(amount)
    if (!validation.valid) {
      setError(validation.error || '金额无效')
      return false
    }
    return true
  }

  // 处理充值确认
  const handleDeposit = async () => {
    // 验证金额
    if (!validateAmount()) {
      return
    }

    if (!user) {
      setError('请先登录')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 调用支付订单API
      const response = await apiService.createPaymentOrder(String(user.id), amount.toFixed(2))

      if (response.success && response.data) {
        setPaymentOrder(response.data)
        setShowQRCode(true)
        setPaymentStatus('pending')
      } else {
        setError(response.message || '创建支付订单失败，请稍后重试')
      }
    } catch (error) {
      console.error('创建支付订单失败:', error)
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 处理取消支付
  const handleCancelPayment = () => {
    setShowQRCode(false)
    setPaymentOrder(null)
    setPaymentStatus('pending')
  }

  // 处理支付成功
  const handlePaymentSuccess = async () => {
    setPaymentStatus('success')

    // 刷新余额
    await refreshBalance()

    // 3秒后自动跳转到钱包页面
    setTimeout(() => {
      router.push('/wallet')
    }, 3000)
  }

  // 查询支付状态
  const handleCheckPayment = async () => {
    if (!user || !paymentOrder) return

    try {
      const response = await apiService.getPaymentOrderStatus(
        String(user.id),
        paymentOrder.orderId
      )

      if (response.success && response.data) {
        const orderData = response.data
        
        // 检查订单状态
        if (orderData.state === 'SUCCESS' || orderData.state === '成功') {
          // 支付成功
          await handlePaymentSuccess()
        } else {
          // 显示订单状态信息弹框
          setOrderInfo(orderData)
          setShowOrderInfo(true)
        }
      } else {
        setError(response.message || '查询订单状态失败')
      }
    } catch (error) {
      console.error('查询支付状态失败:', error)
      setError('查询失败，请稍后重试')
    }
  }

  // 检查按钮是否应该禁用
  const isButtonDisabled = amount < 10 || loading

  return (
    <div className="min-h-screen bg-bg-darkest pb-20">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-30 h-14 bg-bg-dark border-b border-border flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 -ml-2 flex items-center justify-center text-primary-gold hover:bg-bg-medium rounded-lg transition-colors"
        >
          <span className="text-xl">←</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-text-primary">充值</h1>
        <div className="w-10" />
      </header>

      <div className="p-5 space-y-6">
        {/* 步骤1：选择金额 */}
        <section>
          <h2 className="text-base font-semibold text-text-primary mb-4">选择充值金额</h2>

          {/* 快捷金额按钮 */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {quickAmounts.map((value) => (
              <button
                key={value}
                onClick={() => handleQuickAmount(value)}
                className={cn(
                  'h-14 rounded-lg text-base font-semibold transition-all relative',
                  amount === value && !customAmount
                    ? 'bg-gradient-to-br from-primary-gold to-primary-dark-gold text-bg-darkest border-2 border-primary-gold shadow-gold'
                    : 'bg-bg-medium text-text-primary border-2 border-border hover:border-primary-gold/50'
                )}
              >
                {value >= 1000 ? `${value / 1000}K` : value}
                {/* 选中指示器 */}
                {amount === value && !customAmount && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center border-2 border-bg-darkest">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* 自定义金额输入 */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">自定义金额</label>
            <div className="relative">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder="输入充值金额"
                className="w-full h-12 bg-gray-800 border-2 border-gray-700 rounded-lg px-4 pr-16 text-base text-white placeholder:text-gray-500 focus:border-gold-primary focus:outline-none focus:ring-2 focus:ring-gold-primary/20 transition-all"
                min="10"
                step="0.01"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                USDT
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              最小充值金额: 10 USDT
            </p>
          </div>
        </section>

        {/* 支付方式说明 */}
        <section className="bg-bg-dark rounded-xl p-4 border border-border">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💵</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary mb-1">支付方式</p>
              <p className="text-xs text-text-secondary">
                仅支持 USDT 充值，扫描二维码即可完成支付
              </p>
            </div>
          </div>
        </section>

        {/* 优惠活动 */}
        <section className="bg-gradient-to-r from-primary-darkest/30 to-transparent border border-primary-gold/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎁</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary-gold mb-1">充值优惠（USDT）</p>
              <p className="text-xs text-text-secondary">• 首充送20%奖励</p>
              <p className="text-xs text-text-secondary">• 充值≥500 USDT 送50 USDT</p>
            </div>
          </div>
        </section>

        {/* 错误提示 */}
        {error && (
          <div className="bg-error/10 border border-error/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-sm text-error flex-1">{error}</p>
            </div>
          </div>
        )}

        {/* 预计到账 */}
        <section className="bg-bg-dark rounded-xl p-4 border border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-secondary">充值金额</span>
            <span className="text-base font-mono font-semibold text-text-primary">
              {amount.toFixed(2)} USDT
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-secondary">手续费</span>
            <span className="text-base font-mono font-semibold text-success">
              0.00 USDT
            </span>
          </div>
          <div className="h-px bg-border my-3" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-text-primary">预计到账</span>
            <span className="text-lg font-mono font-bold text-primary-gold">
              {amount.toFixed(2)} USDT
            </span>
          </div>
        </section>

        {/* 确认充值按钮 */}
        <button
          onClick={handleDeposit}
          disabled={isButtonDisabled}
          className="w-full h-14 bg-gradient-to-r from-primary-gold to-primary-dark-gold text-bg-darkest text-lg font-bold rounded-xl shadow-gold hover:shadow-gold-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? '创建订单中...' : '确认充值'}
        </button>
      </div>

      {/* QR Code 支付弹窗 */}
      {showQRCode && paymentOrder && (
        <Modal isOpen={showQRCode} onClose={handleCancelPayment} title="">
          <QRCodeDisplay
            qrCodeUrl={paymentOrder.payImageUrl}
            orderId={paymentOrder.orderId}
            amount={parseFloat(paymentOrder.money)}
            paymentStatus={paymentStatus}
            onCancel={handleCancelPayment}
            onCheckPayment={handleCheckPayment}
            userId={user ? String(user.id) : undefined}
            onCopyOrderId={() => {
              // 可选：显示复制成功提示
            }}
          />
        </Modal>
      )}

      {/* 支付成功弹窗 */}
      {paymentStatus === 'success' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in">
          <div className="bg-bg-dark border-2 border-success rounded-2xl p-6 max-w-md w-full animate-scale-in">
            <div className="text-center">
              {/* 成功图标 */}
              <div className="w-20 h-20 mx-auto mb-4 bg-success rounded-full flex items-center justify-center">
                <span className="text-4xl text-white">✓</span>
              </div>

              <h3 className="text-xl font-bold text-success mb-2">支付成功！</h3>
              <p className="text-sm text-text-secondary mb-6">您的账户已成功充值</p>

              {/* 充值金额 */}
              <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-lg">
                <p className="text-sm text-text-secondary mb-2">充值金额</p>
                <p className="text-3xl font-mono font-bold text-success">
                  +{amount.toFixed(2)} USDT
                </p>
              </div>

              {/* 提示信息 */}
              <div className="mb-6 p-4 bg-bg-medium rounded-lg">
                <p className="text-sm text-text-primary">
                  余额已更新，3秒后自动跳转到钱包页面...
                </p>
              </div>

              {/* 立即查看按钮 */}
              <button
                onClick={() => router.push('/wallet')}
                className="w-full py-3 bg-gradient-to-r from-success to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                立即查看余额
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 订单信息弹框 */}
      {showOrderInfo && orderInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in">
          <div className="bg-bg-dark border-2 border-primary-gold rounded-2xl p-6 max-w-md w-full animate-scale-in">
            <h3 className="text-xl font-bold text-primary-gold mb-6 text-center">充值订单信息</h3>

            {/* 订单状态 */}
            <div className="bg-bg-darkest rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">订单状态</span>
                <span className={cn(
                  'text-sm font-semibold',
                  orderInfo.state === '成功' || orderInfo.state === 'SUCCESS' ? 'text-success' :
                  orderInfo.state === '超时' || orderInfo.state === '失败' ? 'text-error' :
                  'text-warning'
                )}>
                  {orderInfo.state}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">订单号</span>
                <span className="text-sm font-mono text-text-primary">{orderInfo.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">充值金额</span>
                <span className="text-base font-mono font-bold text-primary-gold">
                  {orderInfo.money} USDT
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">创建时间</span>
                <span className="text-sm text-text-primary">
                  {new Date(orderInfo.createTime).toLocaleString('zh-CN')}
                </span>
              </div>
              {orderInfo.modifyTime && orderInfo.modifyTime !== orderInfo.createTime && (
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">更新时间</span>
                  <span className="text-sm text-text-primary">
                    {new Date(orderInfo.modifyTime).toLocaleString('zh-CN')}
                  </span>
                </div>
              )}
            </div>

            {/* 提示信息 */}
            <div className={cn(
              'rounded-lg p-3 mb-6',
              orderInfo.state === 'WAIT' || orderInfo.state === '未完成' 
                ? 'bg-warning/10 border border-warning/30' 
                : 'bg-info/10 border border-info/30'
            )}>
              <p className={cn(
                'text-xs',
                orderInfo.state === 'WAIT' || orderInfo.state === '未完成' 
                  ? 'text-warning' 
                  : 'text-info'
              )}>
                {orderInfo.state === 'WAIT' || orderInfo.state === '未完成' 
                  ? '⏳ 订单尚未支付，请完成支付后再次点击"我已充值"按钮' 
                  : orderInfo.state === '超时' 
                  ? '⚠️ 订单已超时，如有疑问请联系客服' 
                  : 'ℹ️ 如有疑问，请联系客服并提供订单号'}
              </p>
            </div>

            {/* 关闭按钮 */}
            <button
              onClick={() => setShowOrderInfo(false)}
              className="w-full py-3 bg-bg-medium hover:bg-bg-dark text-text-primary rounded-lg transition-all font-medium"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
