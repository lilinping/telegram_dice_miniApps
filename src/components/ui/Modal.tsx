'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
}) => {
  // 尺寸样式
  const sizeStyles = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-2xl',
    full: 'max-w-full mx-4',
  }

  // ESC键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          {/* 模态框 */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={clsx(
                'bg-bg-dark rounded-xl shadow-lg pointer-events-auto w-full',
                'border-2 border-primary-gold/50',
                'max-h-[90vh] overflow-y-auto',
                sizeStyles[size],
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-border">
                  {title && (
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="ml-auto text-text-secondary hover:text-white transition-colors"
                      aria-label="关闭"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* 内容 */}
              <div className="p-6">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Modal
