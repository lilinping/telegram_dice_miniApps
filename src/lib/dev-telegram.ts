import { exposeTelegramDebugTools } from '@/utils/telegramDebug';

/**
 * 开发环境 Telegram WebApp 模拟工具
 * 用于在本地开发时模拟 Telegram 环境
 */

export function setupDevTelegram() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  // 如果已经有 Telegram WebApp，不需要模拟
  if (window.Telegram?.WebApp) {
    console.log('✅ Telegram WebApp 已存在');
    // 但仍然暴露调试工具
    exposeTelegramDebugTools();
    return;
  }

  console.log('🔧 开发模式：模拟 Telegram WebApp');

  // 从环境变量或使用默认值创建模拟用户
  const mockUser = {
    id: parseInt(process.env.NEXT_PUBLIC_TEST_USER_ID || '6784471903'),
    first_name: process.env.NEXT_PUBLIC_TEST_USER_NAME || '测试用户',
    last_name: 'Dev',
    username: process.env.NEXT_PUBLIC_TEST_USERNAME || 'test_user',
    language_code: 'zh',
  };

  const mockInitDataUnsafe = {
    user: mockUser,
    auth_date: Math.floor(Date.now() / 1000),
    hash: 'mock_hash_for_development',
  };

  // 创建 initData 字符串（简化版）
  const mockInitData = `user=${encodeURIComponent(JSON.stringify(mockUser))}&auth_date=${mockInitDataUnsafe.auth_date}&hash=${mockInitDataUnsafe.hash}`;

  // 保存到 localStorage
  localStorage.setItem('telegram_init_data', mockInitData);

  // 创建事件处理器存储
  const eventHandlers: { [key: string]: Function[] } = {};

  // 创建模拟的 Telegram WebApp 对象
  // 使用 as any 避免类型检查问题
  (window as any).Telegram = {
    WebApp: {
      initData: mockInitData,
      initDataUnsafe: mockInitDataUnsafe,
      version: '6.0',
      platform: 'web',
      colorScheme: 'dark' as 'dark',
      themeParams: {
        bg_color: '#1a1a1a',
        text_color: '#ffffff',
        hint_color: '#aaaaaa',
        link_color: '#d4af37',
        button_color: '#d4af37',
        button_text_color: '#1a1a1a',
        secondary_bg_color: '#2a2a2a',
      },
      isExpanded: true,
      viewportHeight: Math.max(window.innerHeight, 600), // 最小高度 600px
      viewportStableHeight: Math.max(window.innerHeight, 600),
      headerColor: '#1a1a1a',
      backgroundColor: '#1a1a1a',
      isClosingConfirmationEnabled: false,
      BackButton: {
        isVisible: false,
        onClick(callback: () => void) {},
        offClick(callback: () => void) {},
        show() {},
        hide() {},
      },
      MainButton: {
        text: '',
        color: '#d4af37',
        textColor: '#1a1a1a',
        isVisible: false,
        isActive: true,
        isProgressVisible: false,
        setText(text: string) {},
        onClick(callback: () => void) {},
        offClick(callback: () => void) {},
        show() {},
        hide() {},
        enable() {},
        disable() {},
        showProgress(leaveActive?: boolean) {},
        hideProgress() {},
        setParams(params: {
          text?: string;
          color?: string;
          text_color?: string;
          is_active?: boolean;
          is_visible?: boolean;
        }) {},
      },
      HapticFeedback: {
        impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') {},
        notificationOccurred(type: 'error' | 'success' | 'warning') {},
        selectionChanged() {},
      },
      ready() { 
        console.log('📱 Telegram WebApp ready (mock)');
        // 模拟设置视口高度
        this.viewportHeight = Math.max(window.innerHeight, 600);
        this.viewportStableHeight = this.viewportHeight;
        this.isExpanded = true;
        
        // 设置 CSS 变量
        document.documentElement.style.setProperty('--tg-viewport-height', `${this.viewportHeight}px`);
        document.body.style.minHeight = `${this.viewportHeight}px`;
      },
      expand() {
        console.log('📱 Telegram WebApp expand (mock)');
        this.isExpanded = true;
        this.viewportHeight = Math.max(window.innerHeight, 600);
        this.viewportStableHeight = this.viewportHeight;
        
        // 更新 CSS 变量
        document.documentElement.style.setProperty('--tg-viewport-height', `${this.viewportHeight}px`);
        document.body.style.minHeight = `${this.viewportHeight}px`;
        
        // 触发视口变化事件
        const webApp = this;
        if (webApp._triggerEvent && typeof webApp._triggerEvent === 'function') {
          setTimeout(() => {
            webApp._triggerEvent('viewportChanged', {
              height: this.viewportHeight,
              stableHeight: this.viewportStableHeight,
              isExpanded: this.isExpanded
            });
          }, 100);
        }
      },
      setViewportHeight(height: number) {
        console.log('📱 设置视口高度:', height);
        this.viewportHeight = height;
        this.viewportStableHeight = height;
        
        // 更新 CSS 变量和 body 样式
        document.documentElement.style.setProperty('--tg-viewport-height', `${height}px`);
        document.body.style.minHeight = `${height}px`;
        
        // 触发视口变化事件
        const webApp = this;
        if (webApp._triggerEvent && typeof webApp._triggerEvent === 'function') {
          setTimeout(() => {
            webApp._triggerEvent('viewportChanged', {
              height: this.viewportHeight,
              stableHeight: this.viewportStableHeight,
              isExpanded: this.isExpanded
            });
          }, 50);
        }
      },
      setBackgroundColor(color: string) {
        console.log('📱 设置背景颜色:', color);
        this.backgroundColor = color;
        this.themeParams.bg_color = color;
        this.themeParams.secondary_bg_color = color;
        document.body.style.backgroundColor = color;
        
        // 触发主题变化事件
        const webApp = this;
        if (webApp._triggerEvent && typeof webApp._triggerEvent === 'function') {
          setTimeout(() => {
            webApp._triggerEvent('themeChanged');
          }, 50);
        }
      },
      setHeaderColor(color: string) {
        console.log('📱 设置头部颜色:', color);
        this.headerColor = color;
      },
      close() {},
      enableClosingConfirmation() {},
      disableClosingConfirmation() {},
      onEvent(eventType: string, eventHandler: (data?: any) => void) {
        if (!eventHandlers[eventType]) {
          eventHandlers[eventType] = [];
        }
        eventHandlers[eventType].push(eventHandler);
        console.log('📱 注册事件监听器:', eventType);
      },
      offEvent(eventType: string, eventHandler: (data?: any) => void) {
        if (eventHandlers[eventType]) {
          const index = eventHandlers[eventType].indexOf(eventHandler);
          if (index > -1) {
            eventHandlers[eventType].splice(index, 1);
          }
        }
      },
      // 内部方法：触发事件
      _triggerEvent(eventType: string, data?: any) {
        if (eventHandlers[eventType]) {
          eventHandlers[eventType].forEach((handler: any) => {
            try {
              handler(data);
            } catch (e) {
              console.error('事件处理器错误:', e);
            }
          });
        }
      },
      sendData(data: string) {},
      openLink(url: string, options?: { try_instant_view?: boolean }) {},
      openTelegramLink(url: string) {},
      openInvoice(url: string, callback?: (status: string) => void) {},
      showPopup(params: {
        title?: string;
        message: string;
        buttons?: Array<{
          id?: string;
          type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
          text?: string;
        }>;
      }, callback?: (buttonId: string) => void) {},
      showAlert(message: string, callback?: () => void) {},
      showConfirm(message: string, callback?: (confirmed: boolean) => void) {},
      showScanQrPopup(params: { text?: string }, callback?: (text: string) => boolean) {},
      closeScanQrPopup() {},
      readTextFromClipboard(callback?: (text: string) => void) {},
      requestWriteAccess(callback?: (granted: boolean) => void) {},
      requestContact(callback?: (granted: boolean, contact?: {
        contact: {
          phone_number: string;
          first_name: string;
          last_name?: string;
          user_id?: number;
        };
      }) => void) {},
      switchInlineQuery(query: string, choose_chat_types?: string[]) {},
    },
  };

  console.log('✅ Telegram WebApp 模拟完成');
  console.log('👤 模拟用户:', mockUser);
  console.log('🔑 initData:', mockInitData.substring(0, 50) + '...');
  
  // 暴露调试工具
  exposeTelegramDebugTools();
  
  // 自动运行一次调试信息
  setTimeout(() => {
    console.log('🔍 自动运行调试信息:');
    (window as any).debugTelegramWebApp?.();
  }, 1000);
}
