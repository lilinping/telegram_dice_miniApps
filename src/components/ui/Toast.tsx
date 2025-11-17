'use client';

import { useEffect, useState } from 'react';

/**
 * Toast 提示组件
 *
 * 用于显示操作反馈、错误提示、成功消息等
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

let toastId = 0;
const toastListeners: ((message: ToastMessage) => void)[] = [];

// 全局 Toast 方法
export const toast = {
  show: (message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = `toast-${toastId++}`;
    const toastMessage: ToastMessage = { id, type, message, duration };
    toastListeners.forEach((listener) => listener(toastMessage));
    return id;
  },
  success: (message: string, duration?: number) => toast.show(message, 'success', duration),
  error: (message: string, duration?: number) => toast.show(message, 'error', duration),
  warning: (message: string, duration?: number) => toast.show(message, 'warning', duration),
  info: (message: string, duration?: number) => toast.show(message, 'info', duration),
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (message: ToastMessage) => {
      setToasts((prev) => [...prev, message]);

      // 自动移除
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== message.id));
      }, message.duration);
    };

    toastListeners.push(listener);

    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 left-0 right-0 z-[200] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((toast, index) => (
        <ToastItem key={toast.id} toast={toast} index={index} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: ToastMessage;
  index: number;
}

function ToastItem({ toast, index }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 入场动画
    setTimeout(() => setIsVisible(true), 10);

    // 退场动画
    setTimeout(() => setIsVisible(false), toast.duration - 300);
  }, [toast.duration]);

  const getToastStyles = () => {
    const baseStyle = {
      padding: '12px 20px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      fontSize: '15px',
      fontWeight: 600,
      maxWidth: '90vw',
      wordBreak: 'break-word' as const,
    };

    switch (toast.type) {
      case 'success':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
          color: '#FFFFFF',
          border: '2px solid #059669',
        };
      case 'error':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
          color: '#FFFFFF',
          border: '2px solid #DC2626',
        };
      case 'warning':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          color: '#FFFFFF',
          border: '2px solid #F59E0B',
        };
      case 'info':
      default:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
          color: '#FFFFFF',
          border: '2px solid #2563EB',
        };
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div
      className="flex items-center gap-2 transition-all duration-300 pointer-events-auto"
      style={{
        ...getToastStyles(),
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.9)',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <span className="text-xl">{getIcon()}</span>
      <span>{toast.message}</span>
    </div>
  );
}
