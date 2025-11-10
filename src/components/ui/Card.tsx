'use client'

import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export interface CardProps {
  variant?: 'default' | 'highlight' | 'glass'
  padding?: 'none' | 'small' | 'medium' | 'large'
  clickable?: boolean
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'medium',
  clickable = false,
  children,
  className,
  onClick,
}) => {
  // 填充样式
  const paddingStyles = {
    none: 'p-0',
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6',
  }

  // 变体样式
  const variantStyles = {
    default: 'bg-bg-dark border border-border shadow-sm',
    highlight: 'bg-radial-gold border-2 border-primary-gold shadow-gold',
    glass: 'bg-bg-dark/80 backdrop-blur-md border border-border/50 shadow-md',
  }

  const CardComponent = clickable ? motion.div : 'div'

  return (
    <CardComponent
      className={clsx(
        'rounded-lg transition-all duration-200',
        paddingStyles[padding],
        variantStyles[variant],
        clickable && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      onClick={onClick}
      {...(clickable && {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
      })}
    >
      {children}
    </CardComponent>
  )
}

export default Card
