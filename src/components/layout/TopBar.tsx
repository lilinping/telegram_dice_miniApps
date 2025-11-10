'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export interface TopBarProps {
  title?: string
  showBack?: boolean
  showMenu?: boolean
  rightAction?: React.ReactNode
  className?: string
}

const TopBar: React.FC<TopBarProps> = ({
  title,
  showBack = false,
  showMenu = false,
  rightAction,
  className,
}) => {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-40 h-14 bg-bg-dark/95 backdrop-blur-sm border-b border-primary-gold/30',
        'flex items-center justify-between px-4',
        'safe-top',
        className
      )}
    >
      {/* 左侧：返回/菜单按钮 */}
      <div className="flex items-center w-12">
        {showBack && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="p-2 -ml-2 text-white hover:text-primary-gold transition-colors"
            aria-label="返回"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        )}

        {showMenu && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 -ml-2 text-white hover:text-primary-gold transition-colors"
            aria-label="菜单"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
        )}
      </div>

      {/* 中间：标题 */}
      {title && (
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-white">
          {title}
        </h1>
      )}

      {/* 右侧：自定义操作 */}
      <div className="flex items-center justify-end w-12">
        {rightAction}
      </div>
    </header>
  )
}

export default TopBar
