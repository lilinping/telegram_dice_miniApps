/**
 * Telegram WebApp 调试工具
 * 用于检查和调试 Telegram WebApp 的配置和状态
 */

export function debugTelegramWebApp() {
  const tg = (window as any).Telegram?.WebApp;
  
  if (!tg) {
    console.log('❌ Telegram WebApp 不可用');
    return null;
  }

  const info = {
    // 基本信息
    version: tg.version,
    platform: tg.platform,
    colorScheme: tg.colorScheme,
    
    // 视口信息
    viewportHeight: tg.viewportHeight,
    viewportStableHeight: tg.viewportStableHeight,
    isExpanded: tg.isExpanded,
    
    // 主题信息
    themeParams: tg.themeParams,
    backgroundColor: tg.backgroundColor,
    headerColor: tg.headerColor,
    
    // 用户信息
    initDataUnsafe: tg.initDataUnsafe,
    
    // 可用方法
    availableMethods: {
      ready: typeof tg.ready === 'function',
      expand: typeof tg.expand === 'function',
      setViewportHeight: typeof tg.setViewportHeight === 'function',
      setBackgroundColor: typeof tg.setBackgroundColor === 'function',
      setHeaderColor: typeof tg.setHeaderColor === 'function',
      onEvent: typeof tg.onEvent === 'function',
      offEvent: typeof tg.offEvent === 'function',
    },
    
    // 窗口信息
    windowInfo: {
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth,
      devicePixelRatio: window.devicePixelRatio,
      userAgent: navigator.userAgent,
    },
    
    // CSS 变量
    cssVariables: {
      tgViewportHeight: getComputedStyle(document.documentElement).getPropertyValue('--tg-viewport-height'),
      tgViewportStableHeight: getComputedStyle(document.documentElement).getPropertyValue('--tg-viewport-stable-height'),
    },
    
    // Body 样式
    bodyStyles: {
      minHeight: document.body.style.minHeight,
      backgroundColor: document.body.style.backgroundColor,
    }
  };

  console.log('🔍 Telegram WebApp 调试信息:', info);
  return info;
}

/**
 * 测试 Telegram WebApp 配置
 */
export function testTelegramWebAppConfig() {
  const tg = (window as any).Telegram?.WebApp;
  
  if (!tg) {
    console.log('❌ Telegram WebApp 不可用，无法测试');
    return;
  }

  console.log('🧪 开始测试 Telegram WebApp 配置...');

  // 测试展开
  if (typeof tg.expand === 'function') {
    console.log('✅ 测试 expand()');
    tg.expand();
  } else {
    console.log('❌ expand() 方法不可用');
  }

  // 测试设置视口高度
  if (typeof tg.setViewportHeight === 'function') {
    console.log('✅ 测试 setViewportHeight(700)');
    tg.setViewportHeight(700);
    setTimeout(() => {
      console.log('📏 设置后的视口高度:', tg.viewportHeight);
    }, 100);
  } else {
    console.log('❌ setViewportHeight() 方法不可用');
  }

  // 测试设置背景颜色
  if (typeof tg.setBackgroundColor === 'function') {
    console.log('✅ 测试 setBackgroundColor(#FF0000)');
    tg.setBackgroundColor('#FF0000');
    setTimeout(() => {
      console.log('🎨 设置后的背景颜色:', tg.backgroundColor);
      // 恢复原始颜色
      tg.setBackgroundColor('#0A0A0A');
    }, 1000);
  } else {
    console.log('❌ setBackgroundColor() 方法不可用');
  }

  // 测试事件监听
  if (typeof tg.onEvent === 'function') {
    console.log('✅ 测试事件监听');
    const testHandler = (data: any) => {
      console.log('📱 收到视口变化事件:', data);
    };
    tg.onEvent('viewportChanged', testHandler);
    
    // 5秒后移除监听器
    setTimeout(() => {
      if (typeof tg.offEvent === 'function') {
        tg.offEvent('viewportChanged', testHandler);
        console.log('🔇 移除事件监听器');
      }
    }, 5000);
  } else {
    console.log('❌ onEvent() 方法不可用');
  }

  console.log('🧪 测试完成');
}

/**
 * 在控制台中暴露调试工具
 */
export function exposeTelegramDebugTools() {
  if (typeof window !== 'undefined') {
    (window as any).debugTelegramWebApp = debugTelegramWebApp;
    (window as any).testTelegramWebAppConfig = testTelegramWebAppConfig;
    
    console.log('🛠️ Telegram WebApp 调试工具已暴露到全局:');
    console.log('  - debugTelegramWebApp(): 查看当前状态');
    console.log('  - testTelegramWebAppConfig(): 测试配置功能');
  }
}