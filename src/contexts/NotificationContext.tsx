'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiService } from '@/lib/api'
import { useTelegram } from '@/contexts/TelegramContext'

interface NotificationContextType {
  unreadCount: number
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useTelegram()
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await apiService.getUnreadNotificationCount(user.id.toString())
      if (res.success) {
        setUnreadCount(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch unread count', error)
    }
  }, [user?.id])

  useEffect(() => {
    fetchUnreadCount()
    // Poll every 30 seconds for better responsiveness
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshNotifications: fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}
