'use client';

import { useEffect } from 'react';
import { setupDevTelegram } from '@/lib/dev-telegram';

/**
 * 开发环境 Telegram 初始化组件
 * 仅在开发环境中运行，用于模拟 Telegram WebApp
 */
export default function DevTelegramInit() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setupDevTelegram();
    }
  }, []);

  return null;
}
