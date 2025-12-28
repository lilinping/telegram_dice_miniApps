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
  const lastUserIdRef = useRef<number | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  // 检查 Telegram WebApp 中当前用户是否变化（可在多账号/切换场景使用）
  const checkTelegramUser = () => {
    try {
      const current = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
      const currentId = current ? current.id : null;
      if (currentId && lastUserIdRef.current !== currentId) {
        // 用户切换：更新本地状态并重新初始化后端用户
        lastUserIdRef.current = currentId;
        const userObj: TelegramUser = {
          id: current.id,
          firstName: current.first_name,
          lastName: current.last_name,
          username: current.username,
          languageCode: current.language_code,
          photoUrl: current.photo_url,
          isPremium: current.is_premium || false,
        };
        console.log('检测到 Telegram 用户变更，更新用户：', userObj);
        setUser(userObj);
        // 异步触发后端初始化但不阻塞UI
        initializeBackendUser(userObj).catch((e) => console.warn('初始化后端用户失败', e));
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;
    initializeTelegram();
    // 清理定时器和事件监听
    return () => {
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
      }
      window.removeEventListener('focus', checkTelegramUser);
      document.removeEventListener('visibilitychange', checkTelegramUser);
    };
  }, []);

  const initializeTelegram = async () => {
    try {
      // 检查Telegram WebApp是否可用
      const tg = (window as any).Telegram?.WebApp;

      if (tg) {
        setWebApp(tg);

        // 检测用户切换：如果当前Telegram用户与本地缓存用户不一致，清除缓存
        const currentUserId = tg.initDataUnsafe?.user?.id;
        if (currentUserId) {
          const storedUserId = localStorage.getItem('last_tg_user_id');
          // 如果存储的用户ID不匹配（或首次运行无记录），清除缓存以防止串号
          if (storedUserId !== String(currentUserId)) {
            console.log('🔄 检测到用户切换或首次运行，清除本地缓存', { stored: storedUserId, current: currentUserId });
            localStorage.clear();
            sessionStorage.clear();
          }
          // 更新存储的用户ID
          localStorage.setItem('last_tg_user_id', String(currentUserId));
        }

        // 初始化Telegram WebApp
        tg.ready();
        tg.expand();

        // 立即记录当前 user id
        lastUserIdRef.current = tg.initDataUnsafe?.user?.id || null;
        // 轮询检查（2s）
        pollTimerRef.current = window.setInterval(checkTelegramUser, 2000);
        // 在窗口聚焦或可见性变化时也立即检查
        window.addEventListener('focus', checkTelegramUser);
        document.addEventListener('visibilitychange', checkTelegramUser);

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
