/**
 * Telegram WebApp 配置 Hook
 * 用于管理 Telegram 小程序的视口、主题等设置
 */

import { useEffect, useRef, useCallback } from 'react';

interface TelegramWebAppConfig {
  minHeight?: number;
  minWidth?: number;
  backgroundColor?: string;
  headerColor?: string;
  enableClosingConfirmation?: boolean;
}

export function useTelegramWebApp(config: TelegramWebAppConfig = {}) {
  const {
    minHeight = 600,
    minWidth = 414,
    backgroundColor = '#0A0A0A',
    headerColor = '#1a1a1a',
    enableClosingConfirmation = false,
  } = config;

  const configAppliedRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 10;

  const applyConfig = useCallback(() => {
    const tg = (window as any).Telegram?.WebApp;
    
    if (!tg) {
      console.log('⚠️ Telegram WebApp 不可用，跳过配置');
      return false;
    }

    console.log('🔧 应用 Telegram WebApp 配置:', {
      config,
      version: tg.version,
      platform: tg.platform,
      isExpanded: tg.isExpanded,
      viewportHeight: tg.viewportHeight,
      viewportStableHeight: tg.viewportStableHeight
    });

    try {
      // 1. 确保应用已展开 - 这是最重要的
      if (typeof tg.expand === 'function') {
        tg.expand();
        console.log('📱 调用 tg.expand()');
      }

      // 2. 设置背景颜色 - 使用正确的方法名
      if (typeof tg.setBackgroundColor === 'function') {
        tg.setBackgroundColor(backgroundColor);
        console.log('🎨 设置背景颜色:', backgroundColor);
      } else if (tg.themeParams) {
        // 备用方法：直接修改主题参数
        tg.themeParams.bg_color = backgroundColor;
        tg.themeParams.secondary_bg_color = backgroundColor;
        console.log('🎨 通过 themeParams 设置背景颜色:', backgroundColor);
      }

      // 3. 设置头部颜色
      if (typeof tg.setHeaderColor === 'function') {
        tg.setHeaderColor(headerColor);
        console.log('🎨 设置头部颜色:', headerColor);
      } else if (tg.headerColor !== undefined) {
        tg.headerColor = headerColor;
        console.log('🎨 直接设置头部颜色:', headerColor);
      }

      // 4. 设置关闭确认
      if (enableClosingConfirmation) {
        if (typeof tg.enableClosingConfirmation === 'function') {
          tg.enableClosingConfirmation();
        }
      } else {
        if (typeof tg.disableClosingConfirmation === 'function') {
          tg.disableClosingConfirmation();
        }
      }

      // 5. 隐藏不需要的按钮
      if (tg.MainButton && typeof tg.MainButton.hide === 'function') {
        tg.MainButton.hide();
      }
      
      if (tg.BackButton && typeof tg.BackButton.hide === 'function') {
        tg.BackButton.hide();
      }

      // 6. 尝试设置视口尺寸（如果支持）
      const targetHeight = Math.max(window.innerHeight, minHeight);
      const targetWidth = Math.max(window.innerWidth, minWidth);
      
      // 方法1: 使用 setViewportHeight（如果存在）
      if (typeof tg.setViewportHeight === 'function') {
        tg.setViewportHeight(targetHeight);
        console.log('📏 使用 setViewportHeight 设置高度:', targetHeight);
      }
      
      // 方法2: 直接设置属性（备用）
      if (tg.viewportHeight !== undefined) {
        tg.viewportHeight = targetHeight;
        tg.viewportStableHeight = targetHeight;
        console.log('📏 直接设置视口高度属性:', targetHeight);
      }

      // 方法3: 尝试设置宽度（如果支持）
      if (typeof tg.setViewportWidth === 'function') {
        tg.setViewportWidth(targetWidth);
        console.log('📏 使用 setViewportWidth 设置宽度:', targetWidth);
      }
      
      if (tg.viewportWidth !== undefined) {
        tg.viewportWidth = targetWidth;
        console.log('📏 直接设置视口宽度属性:', targetWidth);
      }

      // 7. 强制触发视口更新事件
      if (typeof tg.onEvent === 'function') {
        // 监听视口变化事件
        tg.onEvent('viewportChanged', () => {
          console.log('📱 视口已变化:', {
            height: tg.viewportHeight,
            stableHeight: tg.viewportStableHeight,
            isExpanded: tg.isExpanded
          });
        });
      }

      // 8. 设置 CSS 变量作为备用方案
      document.documentElement.style.setProperty('--tg-viewport-height', `${targetHeight}px`);
      document.documentElement.style.setProperty('--tg-viewport-stable-height', `${targetHeight}px`);
      document.documentElement.style.setProperty('--tg-viewport-width', `${targetWidth}px`);
      
      // 9. 强制设置 body 最小尺寸
      document.body.style.minHeight = `${targetHeight}px`;
      document.body.style.minWidth = `${targetWidth}px`;
      
      // 10. 设置容器最小宽度，确保内容不会过窄
      const mainElement = document.querySelector('main');
      if (mainElement) {
        (mainElement as HTMLElement).style.minWidth = `${targetWidth}px`;
      }
      
      console.log('✅ Telegram WebApp 配置完成');
      return true;
      
    } catch (error) {
      console.error('❌ Telegram WebApp 配置失败:', error);
      return false;
    }
  }, [minHeight, backgroundColor, headerColor, enableClosingConfirmation]);

  useEffect(() => {
    // 避免重复配置
    if (configAppliedRef.current) return;

    const tryApplyConfig = () => {
      const success = applyConfig();
      
      if (success) {
        configAppliedRef.current = true;
        retryCountRef.current = 0;
      } else if (retryCountRef.current < maxRetries) {
        // 如果配置失败，延迟重试
        retryCountRef.current++;
        console.log(`🔄 配置失败，${500 * retryCountRef.current}ms 后重试 (${retryCountRef.current}/${maxRetries})`);
        setTimeout(tryApplyConfig, 500 * retryCountRef.current);
      } else {
        console.warn('⚠️ 达到最大重试次数，停止尝试配置 Telegram WebApp');
      }
    };

    // 立即尝试配置
    tryApplyConfig();

    // 监听窗口大小变化，重新调整视口
    const handleResize = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        const targetHeight = Math.max(window.innerHeight, minHeight);
        const targetWidth = Math.max(window.innerWidth, minWidth);
        
        // 尝试多种方法设置尺寸
        if (typeof tg.setViewportHeight === 'function') {
          tg.setViewportHeight(targetHeight);
        }
        if (tg.viewportHeight !== undefined) {
          tg.viewportHeight = targetHeight;
          tg.viewportStableHeight = targetHeight;
        }
        
        if (typeof tg.setViewportWidth === 'function') {
          tg.setViewportWidth(targetWidth);
        }
        if (tg.viewportWidth !== undefined) {
          tg.viewportWidth = targetWidth;
        }
        
        // 更新 CSS 变量
        document.documentElement.style.setProperty('--tg-viewport-height', `${targetHeight}px`);
        document.documentElement.style.setProperty('--tg-viewport-width', `${targetWidth}px`);
        document.body.style.minHeight = `${targetHeight}px`;
        document.body.style.minWidth = `${targetWidth}px`;
        
        // 更新主容器
        const mainElement = document.querySelector('main');
        if (mainElement) {
          (mainElement as HTMLElement).style.minWidth = `${targetWidth}px`;
        }
        
        console.log('📏 窗口大小变化，重新设置视口尺寸:', { height: targetHeight, width: targetWidth });
      }
    };

    // 延迟添加事件监听器，确保初始配置完成
    const addEventListeners = () => {
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);
      
      // 监听 Telegram WebApp 的特定事件
      const tg = (window as any).Telegram?.WebApp;
      if (tg && typeof tg.onEvent === 'function') {
        tg.onEvent('themeChanged', () => {
          console.log('🎨 主题已变化，重新应用配置');
          applyConfig();
        });
      }
    };

    setTimeout(addEventListeners, 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [applyConfig, minHeight, minWidth]);

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