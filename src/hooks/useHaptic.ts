import { useCallback, useEffect, useState } from 'react';

/**
 * 震动强度类型
 */
export type HapticStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';

/**
 * 震动通知类型
 */
export type NotificationType = 'error' | 'success' | 'warning';

/**
 * Telegram WebApp Haptic Feedback Hook
 *
 * 使用 Telegram Mini App 的震动反馈 API
 * 提供轻量级、中等、强烈三种震动强度
 */
export function useHaptic() {
  const [enabled, setEnabled] = useState(true);

  /**
   * 触发震动反馈
   */
  const impactOccurred = useCallback((style: HapticStyle = 'medium') => {
    if (!enabled) return;

    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
      }
    } catch (error) {
      console.warn('Haptic feedback not available', error);
    }
  }, [enabled]);

  /**
   * 触发通知震动
   */
  const notificationOccurred = useCallback((type: NotificationType) => {
    if (!enabled) return;

    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
      }
    } catch (error) {
      console.warn('Haptic feedback not available', error);
    }
  }, [enabled]);

  /**
   * 触发选择变化震动
   */
  const selectionChanged = useCallback(() => {
    if (!enabled) return;

    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
      }
    } catch (error) {
      console.warn('Haptic feedback not available', error);
    }
  }, [enabled]);

  /**
   * 切换震动开关
   */
  const toggleHaptic = useCallback(() => {
    setEnabled((prev) => {
      const newValue = !prev;
      // 保存到本地存储
      if (typeof window !== 'undefined') {
        localStorage.setItem('haptic-enabled', String(newValue));
      }
      return newValue;
    });
  }, []);

  /**
   * 从本地存储恢复设置
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('haptic-enabled');
      if (saved !== null) {
        setEnabled(saved === 'true');
      }
    }
  }, []);

  return {
    enabled,
    impactOccurred,
    notificationOccurred,
    selectionChanged,
    toggleHaptic,
  };
}

/**
 * 游戏震动反馈快捷方法
 */
export function useGameHaptics() {
  const { impactOccurred, notificationOccurred, enabled, toggleHaptic } = useHaptic();

  // 轻微震动：下注点击
  const hapticBetClick = useCallback(() => {
    impactOccurred('light');
  }, [impactOccurred]);

  // 中等震动：筹码选择、确认下注
  const hapticChipSelect = useCallback(() => {
    impactOccurred('medium');
  }, [impactOccurred]);

  // 强烈震动：中奖
  const hapticWin = useCallback(() => {
    impactOccurred('heavy');
    // 延迟再震两次
    setTimeout(() => impactOccurred('heavy'), 150);
    setTimeout(() => impactOccurred('heavy'), 300);
  }, [impactOccurred]);

  // 开盘震动
  const hapticRoundStart = useCallback(() => {
    impactOccurred('rigid');
  }, [impactOccurred]);

  // 错误震动
  const hapticError = useCallback(() => {
    notificationOccurred('error');
  }, [notificationOccurred]);

  // 成功震动
  const hapticSuccess = useCallback(() => {
    notificationOccurred('success');
  }, [notificationOccurred]);

  return {
    enabled,
    toggleHaptic,
    hapticBetClick,
    hapticChipSelect,
    hapticWin,
    hapticRoundStart,
    hapticError,
    hapticSuccess,
  };
}
