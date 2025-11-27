'use client'

import { useState } from 'react'
import { cn, copyToClipboard } from '@/lib/utils'

/**
 * QR Code Display 组件
 *
 * 显示支付订单的二维码和相关信息：
 * 1. 二维码图片
 * 2. 订单ID（带复制按钮）
 * 3. 充值金额
 * 4. 支付方式（USDT）
 * 5. 支付说明
 * 6. 支付状态指示器
 * 7. 已充值按钮（查询支付状态）
 * 8. 取消按钮
 */

interface QRCodeDisplayProps {
  qrCodeUrl: string
  orderId: string
  amount: number
  paymentStatus: 'pending' | 'success' | 'failed'
  onCancel: () => void
  onCopyOrderId?: () => void
  onCheckPayment?: () => void
  userId?: string
}

export default function QRCodeDisplay({
  qrCodeUrl,
  orderId,
  amount,
  paymentStatus,
  onCancel,
  onCopyOrderId,
  onCheckPayment,
  userId,
}: QRCodeDisplayProps) {
  const [imageError, setImageError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [checking, setChecking] = useState(false)

  const handleCopyOrderId = async () => {
    const success = await copyToClipboard(orderId)
    if (success) {
      setCopied(true)
      onCopyOrderId?.()
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const getStatusConfig = () => {
    switch (paymentStatus) {
      case 'pending':
        return {
          text: '等待支付',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          icon: '⏳',
        }
      case 'success':
        return {
          text: '支付成功',
          color: 'text-success',
          bgColor: 'bg-success/10',
          icon: '✅',
        }
      case 'failed':
        return {
          text: '支付失败',
          color: 'text-error',
          bgColor: 'bg-error/10',
          icon: '❌',
        }
    }
  }

  const statusConfig = getStatusConfig()

  const handleCheckPayment = async () => {
    if (onCheckPayment) {
      setChecking(true)
      try {
        await onCheckPayment()
      } finally {
        setChecking(false)
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto overflow-y-auto max-h-[85vh] px-1">
      {/* 支付状态指示器 */}
      <div
        className={cn(
          'flex items-center justify-center gap-2 px-4 py-2 rounded-lg mb-6',
          statusConfig.bgColor
        )}
      >
        <span className="text-xl">{statusConfig.icon}</span>
        <span className={cn('font-medium', statusConfig.color)}>
          {statusConfig.text}
        </span>
      </div>

      {/* 二维码容器 */}
      <div className="relative bg-white rounded-2xl p-6 mb-6">
        {/* 二维码图片 */}
        <div className="flex items-center justify-center mb-4">
          {imageError ? (
            <div className="w-64 h-64 flex flex-col items-center justify-center bg-bg-medium rounded-lg">
              <span className="text-4xl mb-2">⚠️</span>
              <p className="text-sm text-text-secondary text-center px-4">
                二维码加载失败
                <br />
                请刷新页面重试
              </p>
            </div>
          ) : (
            <img
              src={qrCodeUrl}
              alt="Payment QR Code"
              className="w-64 h-64 object-contain"
              onError={handleImageError}
            />
          )}
        </div>

        {/* 订单信息 */}
        <div className="space-y-3">
          {/* 订单ID */}
          <div className="flex items-center justify-between p-3 bg-bg-dark rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-secondary mb-1">订单号</p>
              <p className="text-sm font-mono text-text-primary truncate">
                {orderId}
              </p>
            </div>
            <button
              onClick={handleCopyOrderId}
              className={cn(
                'ml-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                copied
                  ? 'bg-success/20 text-success'
                  : 'bg-primary-gold/20 text-primary-gold hover:bg-primary-gold/30'
              )}
            >
              {copied ? '已复制' : '复制'}
            </button>
          </div>

          {/* 充值金额 */}
          <div className="flex items-center justify-between p-3 bg-bg-dark rounded-lg">
            <p className="text-xs text-text-secondary">充值金额</p>
            <p className="text-lg font-bold font-mono text-primary-gold">
              {amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              USDT
            </p>
          </div>

          {/* 支付方式 */}
          <div className="flex items-center justify-between p-3 bg-bg-dark rounded-lg">
            <p className="text-xs text-text-secondary">支付方式</p>
            <div className="flex items-center gap-2">
              <span className="text-sm">💰</span>
              <p className="text-sm font-medium text-text-primary">USDT</p>
            </div>
          </div>
        </div>
      </div>

      {/* 支付说明 */}
      <div className="bg-bg-medium/50 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
          <span>ℹ️</span>
          <span>支付说明</span>
        </h3>
        <ul className="space-y-2 text-xs text-text-secondary">
          <li className="flex items-start gap-2">
            <span className="text-primary-gold mt-0.5">•</span>
            <span>请使用支持 USDT 的钱包扫描二维码完成支付</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-gold mt-0.5">•</span>
            <span>支付完成后，余额将自动到账，通常在 1-5 分钟内</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-gold mt-0.5">•</span>
            <span>请确保支付金额与订单金额一致</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-gold mt-0.5">•</span>
            <span>如有问题，请联系客服并提供订单号</span>
          </li>
        </ul>
      </div>

      {/* 按钮组 */}
      <div className="space-y-3">
        {/* 已充值按钮 */}
        {paymentStatus === 'pending' && onCheckPayment && (
          <button
            onClick={handleCheckPayment}
            disabled={checking}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-gold to-primary-light-gold text-bg-darkest font-bold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {checking ? '查询中...' : '我已充值'}
          </button>
        )}
        
        {/* 取消按钮 */}
        <button
          onClick={onCancel}
          className="w-full py-3 rounded-xl bg-bg-medium hover:bg-bg-dark text-text-secondary hover:text-text-primary transition-all font-medium"
        >
          取消支付
        </button>
      </div>
    </div>
  )
}
