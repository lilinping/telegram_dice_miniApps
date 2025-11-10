'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface TelegramUser {
  id: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  photoUrl?: string;
}

interface TelegramContextType {
  user: TelegramUser | null;
  isLoading: boolean;
  webApp: any;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  isLoading: true,
  webApp: null,
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [webApp, setWebApp] = useState<any>(null);

  useEffect(() => {
    // 检查Telegram WebApp是否可用
    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      setWebApp(tg);

      // 初始化Telegram WebApp
      tg.ready();
      tg.expand();

      // 获取用户信息
      const telegramUser = tg.initDataUnsafe?.user;
      if (telegramUser) {
        setUser({
          id: telegramUser.id,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          username: telegramUser.username,
          languageCode: telegramUser.language_code,
          photoUrl: telegramUser.photo_url,
        });
      } else {
        // 开发环境模拟用户
        setUser({
          id: 123456,
          firstName: '测试',
          username: 'testuser',
          languageCode: 'zh',
        });
      }
    } else {
      // 开发环境模拟用户
      setUser({
        id: 123456,
        firstName: '测试',
        username: 'testuser',
        languageCode: 'zh',
      });
    }

    setIsLoading(false);
  }, []);

  return (
    <TelegramContext.Provider value={{ user, isLoading, webApp }}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
}
