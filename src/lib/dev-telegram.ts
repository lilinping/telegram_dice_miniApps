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
    return;
  }

  console.log('🔧 开发模式：模拟 Telegram WebApp');

  // 创建模拟的 initData
  const mockUser = {
    id: 123456789,
    first_name: 'Dev',
    last_name: 'User',
    username: 'devuser',
    language_code: 'en',
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

  // 创建模拟的 Telegram WebApp 对象
  window.Telegram = {
    WebApp: {
      initData: mockInitData,
      initDataUnsafe: mockInitDataUnsafe,
      version: '6.0',
      platform: 'web',
      colorScheme: 'dark',
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
      viewportHeight: window.innerHeight,
      viewportStableHeight: window.innerHeight,
      headerColor: '#1a1a1a',
      backgroundColor: '#1a1a1a',
      isClosingConfirmationEnabled: false,
      BackButton: {
        isVisible: false,
        onClick: () => {},
        offClick: () => {},
        show: () => {},
        hide: () => {},
      },
      MainButton: {
        text: '',
        color: '#d4af37',
        textColor: '#1a1a1a',
        isVisible: false,
        isActive: true,
        isProgressVisible: false,
        setText: () => {},
        onClick: () => {},
        offClick: () => {},
        show: () => {},
        hide: () => {},
        enable: () => {},
        disable: () => {},
        showProgress: () => {},
        hideProgress: () => {},
        setParams: () => {},
      },
      HapticFeedback: {
        impactOccurred: () => {},
        notificationOccurred: () => {},
        selectionChanged: () => {},
      },
      ready: () => console.log('📱 Telegram WebApp ready (mock)'),
      expand: () => {},
      close: () => {},
      enableClosingConfirmation: () => {},
      disableClosingConfirmation: () => {},
      onEvent: () => {},
      offEvent: () => {},
      sendData: () => {},
      openLink: () => {},
      openTelegramLink: () => {},
      openInvoice: () => {},
      showPopup: () => {},
      showAlert: () => {},
      showConfirm: () => {},
      showScanQrPopup: () => {},
      closeScanQrPopup: () => {},
      readTextFromClipboard: () => {},
      requestWriteAccess: () => {},
      requestContact: () => {},
      switchInlineQuery: () => {},
    },
  };

  console.log('✅ Telegram WebApp 模拟完成');
  console.log('👤 模拟用户:', mockUser);
  console.log('🔑 initData:', mockInitData.substring(0, 50) + '...');
}
