'use client';

import { useEffect, useState } from 'react';

/**
 * 数字滚动动画 Hook
 *
 * 从 0 滚动到目标数字,带缓动效果
 */
export function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }

    let startTime: number | null = null;
    const startValue = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // 缓动函数: easeOutCubic
      const eased = 1 - Math.pow(1 - percentage, 3);
      const currentCount = Math.floor(startValue + (target - startValue) * eased);

      setCount(currentCount);

      if (percentage < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    const animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count;
}

/**
 * 中奖动画组件
 *
 * 功能:
 * 1. 奖金数字从 0 滚动到实际金额
 * 2. 闪烁特效
 * 3. 根据金额大小显示不同样式
 */

interface WinAnimationProps {
  amount: number;
  onComplete?: () => void;
  show: boolean;
}

export default function WinAnimation({ amount, onComplete, show }: WinAnimationProps) {
  const displayAmount = useCountUp(show ? amount : 0, 2000);
  const [flash, setFlash] = useState(0);

  // 闪烁效果: 3 次闪烁
  useEffect(() => {
    if (!show) {
      setFlash(0);
      return;
    }

    const flashIntervals = [0, 300, 600];
    const timers = flashIntervals.map((delay) =>
      setTimeout(() => setFlash((prev) => prev + 1), delay)
    );

    // 2.5秒后完成动画
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 2500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [show, onComplete]);

  if (!show) return null;

  // 根据金额大小判断等级
  const isSmallWin = amount < 100;
  const isMediumWin = amount >= 100 && amount < 1000;
  const isBigWin = amount >= 1000;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="text-center animate-scale-bounce">
        {/* 标题 */}
        <h2
          className="text-h1 font-black mb-6"
          style={{
            color: 'var(--gold-bright)',
            textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
            animation: flash % 2 === 1 ? 'flash 0.3s ease-in-out' : 'none',
          }}
        >
          {isBigWin ? '🎉 恭喜大奖！' : '✨ 恭喜中奖！'}
        </h2>

        {/* 奖金金额 */}
        <div
          className="relative"
          style={{
            animation: flash % 2 === 1 ? 'flash 0.3s ease-in-out' : 'none',
          }}
        >
          {/* 发光背景 */}
          <div
            className="absolute inset-0 blur-3xl"
            style={{
              background: isBigWin
                ? 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)',
            }}
          />

          {/* 金额数字 */}
          <p
            className="relative text-display font-black font-mono"
            style={{
              fontSize: isBigWin ? '96px' : '72px',
              color: 'var(--gold-bright)',
              textShadow: isBigWin
                ? '0 0 40px rgba(255, 215, 0, 1), 0 4px 8px rgba(0, 0, 0, 0.8)'
                : '0 0 20px rgba(255, 215, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.8)',
              lineHeight: 1,
            }}
          >
            +{displayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>

          <p
            className="text-h3 font-bold mt-2"
            style={{ color: 'rgba(255, 215, 0, 0.8)' }}
          >
            USDT
          </p>
        </div>

        {/* 提示文字 */}
        <p
          className="mt-8 text-body"
          style={{ color: 'rgba(255, 255, 255, 0.6)' }}
        >
          {isBigWin ? '恭喜您获得大奖!' : '奖金已自动加入余额'}
        </p>
      </div>

      {/* CSS 动画 */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-bounce {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes flash {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-bounce {
          animation: scale-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
