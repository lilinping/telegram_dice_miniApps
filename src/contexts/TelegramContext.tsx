'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { apiService } from '@/lib/api';
import { BackendUser } from '@/lib/types';

interface TelegramUser {
  id: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  photoUrl?: string;
  isPremium?: boolean; // Telegram Premium 用户
}

interface TelegramContextType {
  user: TelegramUser | null;
  isLoading: boolean;
  webApp: any;
  isInitialized: boolean;
  initError: string | null;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  isLoading: true,
  webApp: null,
  isInitialized: false,
  initError: null,
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [webApp, setWebApp] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const initializationRef = useRef(false);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;
    initializeTelegram();
  }, []);

  const initializeTelegram = async () => {
    try {
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
          const userObj: TelegramUser = {
            id: telegramUser.id,
            firstName: telegramUser.first_name,
            lastName: telegramUser.last_name,
            username: telegramUser.username,
            languageCode: telegramUser.language_code,
            photoUrl: telegramUser.photo_url,
            isPremium: telegramUser.is_premium || false,
          };

          console.log('👤 Telegram用户信息:', { ...userObj, isPremium: userObj.isPremium });
          setUser(userObj);

          // 调用后端初始化接口
          await initializeBackendUser(userObj);
        } else {
          // 开发环境模拟用户 - 使用环境变量配置的测试ID
          const mockUser: TelegramUser = {
            id: parseInt(process.env.NEXT_PUBLIC_TEST_USER_ID || '6784471903'),
            firstName: process.env.NEXT_PUBLIC_TEST_USER_NAME || '测试用户',
            username: process.env.NEXT_PUBLIC_TEST_USERNAME || 'test_user',
            languageCode: 'zh',
          };

          setUser(mockUser);
          await initializeBackendUser(mockUser);
        }
      } else {
        // 开发环境模拟用户 - 使用环境变量配置的测试ID
        const mockUser: TelegramUser = {
          id: parseInt(process.env.NEXT_PUBLIC_TEST_USER_ID || '6784471903'),
          firstName: process.env.NEXT_PUBLIC_TEST_USER_NAME || '测试用户',
          username: process.env.NEXT_PUBLIC_TEST_USERNAME || 'test_user',
          languageCode: 'zh',
        };

        setUser(mockUser);
        await initializeBackendUser(mockUser);
      }
    } catch (error) {
      console.error('Telegram initialization failed:', error);
      setInitError(error instanceof Error ? error.message : '初始化失败');

      // 即使初始化失败，也设置模拟用户以保证应用可以运行
      const fallbackUser: TelegramUser = {
        id: parseInt(process.env.NEXT_PUBLIC_TEST_USER_ID || '6784471903'),
        firstName: process.env.NEXT_PUBLIC_TEST_USER_NAME || '测试用户',
        username: process.env.NEXT_PUBLIC_TEST_USERNAME || 'test_user',
        languageCode: 'zh',
      };

      setUser(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeBackendUser = async (telegramUser: TelegramUser) => {
    try {
      // 转换为后端用户格式
      const backendUser: BackendUser = {
        id: telegramUser.id,
        first_name: telegramUser.firstName,
        last_name: telegramUser.lastName,
        username: telegramUser.username,
        language_code: telegramUser.languageCode,
        is_bot: false,
        can_join_groups: false,
        can_read_all_group_messages: false,
        supports_inline_queries: false,
        is_premium: false,
        added_to_attachment_menu: false,
      };

      // 调用后端初始化接口
      const response = await apiService.initUser(backendUser);

      if (response.success) {
        console.log('用户初始化成功');
        setIsInitialized(true);
      } else {
        console.error('用户初始化失败:', response.message);
        setInitError(response.message || '后端初始化失败');
      }
    } catch (error) {
      console.error('Backend user initialization failed:', error);
      setInitError(error instanceof Error ? error.message : '后端初始化失败');
    }
  };

  return (
    <TelegramContext.Provider value={{
      user,
      isLoading,
      webApp,
      isInitialized,
      initError
    }}>
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
