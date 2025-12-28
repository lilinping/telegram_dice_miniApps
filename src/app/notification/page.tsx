'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import { useTelegram } from '@/contexts/TelegramContext'
import { apiService } from '@/lib/api'
import { NotificationEntity, BonusEntity } from '@/lib/types'
import { useNotifications } from '@/hooks/useNotifications'
import ToastContainer, { toast } from '@/components/ui/Toast'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

export default function NotificationPage() {
  const router = useRouter()
  const { user } = useTelegram()
  const { refreshNotifications } = useNotifications()
  const [activeTab, setActiveTab] = useState<'notifications' | 'bonuses'>('bonuses')
  const [notifications, setNotifications] = useState<NotificationEntity[]>([])
  const [bonuses, setBonuses] = useState<BonusEntity[]>([])
  const [loading, setLoading] = useState(false)
  const [pageIndex, setPageIndex] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchNotifications = async (reset = false) => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const page = reset ? 1 : pageIndex
      const res = await apiService.getNotifications(user.id.toString(), page, 20)
      
      if (res.success) {
        const newList = res.data.list || []
        if (reset) {
          setNotifications(newList)
        } else {
          setNotifications(prev => [...prev, ...newList])
        }
        setHasMore(newList.length >= 20)
        setPageIndex(page + 1)
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBonuses = async (reset = false) => {
    if (!user?.id) return

    try {
      setLoading(true)
      const page = reset ? 1 : pageIndex
      const res = await apiService.getBonusList(user.id.toString(), page, 20)

      if (res.success) {
        const newList = res.data.list || []
        if (reset) {
          setBonuses(newList)
        } else {
          setBonuses(prev => [...prev, ...newList])
        }
        setHasMore(newList.length >= 20)
        setPageIndex(page + 1)
      }
    } catch (error) {
      console.error('Failed to fetch bonuses', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPageIndex(1)
    setHasMore(true)
    if (activeTab === 'notifications') {
      fetchNotifications(true)
    } else {
      fetchBonuses(true)
    }
  }, [activeTab, user?.id])

  const handleMarkRead = async (id: number) => {
    if (!user?.id) return
    try {
      await apiService.markNotificationRead(user.id.toString(), id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      // 刷新全局未读数量
      refreshNotifications()
    } catch (error) {
      console.error('Failed to mark read', error)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-bg-darkest pb-20">
      <TopBar 
        title="消息中心" 
        showBack={true} 
      />
      
      <div className="pt-16 px-4">
        <ToastContainer />
        {/* Tabs */}
        <div className="flex p-1 mb-6 rounded-xl bg-onyx-black border border-primary-gold/20">
          <button
            onClick={() => setActiveTab('bonuses')}
            className={clsx(
              "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300",
              activeTab === 'bonuses' 
                ? "bg-gradient-to-r from-primary-gold to-yellow-600 text-bg-darkest shadow-lg shadow-primary-gold/20" 
                : "text-text-secondary hover:text-primary-gold"
            )}
          >
            奖励记录
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={clsx(
              "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300",
              activeTab === 'notifications' 
                ? "bg-gradient-to-r from-primary-gold to-yellow-600 text-bg-darkest shadow-lg shadow-primary-gold/20" 
                : "text-text-secondary hover:text-primary-gold"
            )}
          >
            系统通知
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {loading && pageIndex === 1 ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-gold"></div>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {activeTab === 'bonuses' ? (
                bonuses.length > 0 ? (
                  bonuses.map((bonus) => (
                    <motion.div
                      key={bonus.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative overflow-hidden rounded-xl bg-onyx-black border border-primary-gold/30 p-4 shadow-lg"
                    >
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <span className="text-4xl">🎁</span>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-gold to-yellow-700 flex items-center justify-center text-xl shadow-md border border-yellow-300/50">
                          💰
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-primary-gold font-bold text-base mb-1">
                              {bonus.type === 'BE_INVITE_INIT' ? '新人奖励' : 
                               bonus.type === 'INVITE' ? '邀请奖励' : '系统奖励'}
                            </h3>
                            <span className="text-xs text-text-secondary">{formatDate(bonus.createTime)}</span>
                          </div>
                          <p className="text-text-primary text-sm mb-2">{bonus.reason}</p>
                          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 border border-primary-gold/30">
                            <span className="text-primary-gold font-bold">+{bonus.bonus} USDT</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 text-text-secondary">
                    <div className="text-4xl mb-4">📭</div>
                    <p>暂无奖励记录</p>
                  </div>
                )
              ) : (
                notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileTap={{ scale: 0.98 }}
                      className={clsx(
                        "rounded-xl p-4 border transition-all duration-300 cursor-pointer",
                        notification.read 
                          ? "bg-onyx-black/50 border-white/5" 
                          : "bg-onyx-black border-primary-gold/50 shadow-[0_0_15px_rgba(255,215,0,0.1)]"
                      )}
                      onClick={() => {
                        if (!notification.read) {
                          handleMarkRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          {!notification.read && (
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          )}
                          <h3 className={clsx(
                            "font-bold text-base line-clamp-1",
                            notification.read ? "text-text-secondary" : "text-white"
                          )}>
                            {notification.title || '系统通知'}
                          </h3>
                        </div>
                        <span className="text-xs text-text-secondary whitespace-nowrap">{formatDate(notification.createTime)}</span>
                      </div>
                      <p className={clsx(
                        "text-sm leading-relaxed",
                        notification.read ? "text-text-secondary/70" : "text-text-primary"
                      )}>
                        {notification.content}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 text-text-secondary">
                    <div className="text-4xl mb-4">📭</div>
                    <p>暂无通知消息</p>
                  </div>
                )
              )}
            </AnimatePresence>
          )}
          
          {!loading && hasMore && (
            <button 
              onClick={() => activeTab === 'notifications' ? fetchNotifications() : fetchBonuses()}
              className="w-full py-3 text-sm text-primary-gold/70 hover:text-primary-gold transition-colors"
            >
              加载更多...
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
