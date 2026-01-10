'use client'

import { useEffect, useState } from 'react'

export default function InitDataExpiredHandler() {
  const [showExpiredMessage, setShowExpiredMessage] = useState(false)

  useEffect(() => {
    const handleInitDataExpired = (event: CustomEvent) => {
      console.error('[InitDataExpiredHandler] InitData expired:', event.detail)
      setShowExpiredMessage(true)
    }

    window.addEventListener('initdata-expired', handleInitDataExpired as EventListener)

    return () => {
      window.removeEventListener('initdata-expired', handleInitDataExpired as EventListener)
    }
  }, [])

  const handleReload = () => {
    // 尝试通过 Telegram WebApp API 重新加载
    if (window.Telegram?.WebApp?.close) {
      // 关闭 WebApp，用户需要重新打开
      window.Telegram.WebApp.close()
    } else {
      // 如果不在 Telegram 环境，直接刷新页面
      window.location.reload()
    }
  }

  if (!showExpiredMessage) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-bg-dark border-2 border-primary-gold rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
        <div className="text-center">
          {/* 图标 */}
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-red-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>

          {/* 标题 */}
          <h2 className="text-xl font-bold text-primary-gold mb-2">
            会话已过期
          </h2>

          {/* 说明 */}
          <p className="text-text-secondary mb-6">
            您的登录会话已过期，请重新加载应用以继续使用。
          </p>

          {/* 按钮 */}
          <button
            onClick={handleReload}
            className="w-full px-6 py-3 bg-primary-gold text-bg-darkest font-bold rounded-lg hover:bg-primary-gold/90 transition-colors"
          >
            重新加载应用
          </button>

          {/* 提示 */}
          <p className="text-xs text-text-tertiary mt-4">
            如果问题持续，请关闭应用后重新打开
          </p>
        </div>
      </div>
    </div>
  )
}