'use client'

import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'text'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className,
  onClick,
  ...props
}) => {
  // 尺寸样式
  const sizeStyles = {
    small: 'h-10 px-4 text-sm',
    medium: 'h-12 px-6 text-base',
    large: 'h-14 px-8 text-lg',
  }

  // 变体样式
  const variantStyles = {
    primary: 'bg-gold-gradient text-bg-darkest shadow-md hover:shadow-gold',
    secondary: 'bg-transparent border-2 border-primary-gold text-primary-gold hover:bg-primary-gold hover:text-bg-darkest',
    success: 'bg-success text-white shadow-md hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)]',
    warning: 'bg-warning text-white shadow-md hover:shadow-[0_4px_12px_rgba(249,115,22,0.3)]',
    text: 'bg-transparent text-primary-gold hover:underline',
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return

    // 触觉反馈（仅移动端）
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }

    onClick?.(e)
  }

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:brightness-90',
        'ripple', // 波纹效果
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <motion.div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span>加载中...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  )
}

export default Button
