/**
 * Telegram WebApp 配置 Hook
 * 用于管理 Telegram 小程序的视口、主题等设置
 */

import { useEffect, useRef } from 'react';

interface TelegramWebAppConfig {
  minHeight?: number;
  backgroundColor?: string;
  headerColor?: string;
  enableClosingConfirmation?: boolean;
}

export function useTelegramWebApp(config: TelegramWebAppConfig = {}) {
  const {
    minHeight = 600,
    backgroundColor = '#0A0A0A',
    headerColor = '#1a1a1a',
    enableClosingConfirmation = false,
  } = config;

  const configAppliedRef = useRef(false);

  useEffect(() => {
    // 避免重复配置
    if (configAppliedRef.current) return;

    const applyConfig = () => {
      const tg = (window as any).Telegram?.WebApp;
      
      if (tg) {
        console.log('🔧 应用 Telegram WebApp 配置:', config);
        
        // 确保应用已展开
        tg.expand();
        
        // 设置最小视口高度
        const targetHeight = Math.max(window.innerHeight, minHeight);
        if (tg.setViewportHeight) {
          tg.setViewportHeight(targetHeight);
        }
        
        // 设置背景颜色
        if (tg.setBackgroundColor) {
          tg.setBackgroundColor(backgroundColor);
        }
        
        // 设置头部颜色
        if (tg.setHeaderColor) {
          tg.setHeaderColor(headerColor);
        }
        
        // 设置关闭确认
        if (enableClosingConfirmation) {
          tg.enableClosingConfirmation();
        } else {
          tg.disableClosingConfirmation();
        }
        
        // 隐藏主按钮（如果不需要）
        if (tg.MainButton) {
          tg.MainButton.hide();
        }
        
        // 隐藏返回按钮（如果不需要）
        if (tg.BackButton) {
          tg.BackButton.hide();
        }
        
        configAppliedRef.current = true;
        console.log('✅ Telegram WebApp 配置完成');
      } else {
        console.log('⚠️ Telegram WebApp 不可用，跳过配置');
      }
    };

    // 立即尝试应用配置
    applyConfig();

    // 监听窗口大小变化，重新调整视口
    const handleResize = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.setViewportHeight) {
        const targetHeight = Math.max(window.innerHeight, minHeight);
        tg.setViewportHeight(targetHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [minHeight, backgroundColor, headerColor, enableClosingConfirmation, config]);

  return {
    isConfigured: configAppliedRef.current,
  };
}

/**
 * 获取 Telegram WebApp 视口信息
 */
export function useTelegramViewport() {
  const getViewportInfo = () => {
    const tg = (window as any).Telegram?.WebApp;
    
    if (tg) {
      return {
        height: tg.viewportHeight || window.innerHeight,
        stableHeight: tg.viewportStableHeight || window.innerHeight,
        isExpanded: tg.isExpanded || false,
        platform: tg.platform || 'unknown',
      };
    }
    
    return {
      height: window.innerHeight,
      stableHeight: window.innerHeight,
      isExpanded: false,
      platform: 'web',
    };
  };

  return getViewportInfo();
}