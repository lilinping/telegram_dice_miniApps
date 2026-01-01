'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * 专业投注格组件 V2.0 - 赌场标准
 *
 * 6种交互状态：
 * 1. 默认状态 - 深红绒布背景 + 金色边框
 * 2. Hover状态 - 金色光晕
 * 3. 已下注状态 - 筹码叠加 + 金额显示
 * 4. 封盘状态 - 灰化 + 禁用
 * 5. 中奖状态 - 金色闪烁 + 粒子爆炸
 * 6. 未中奖状态 - 半透明灰化
 */

interface BetCellProps {
  id: string;
  name: string;
  nameEn?: string;
  desc?: string;
  odds: string;
  icon?: string;
  amount: number;
  onClick: () => void;
  disabled?: boolean;
  closed?: boolean;
  win?: boolean;
  lose?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'primary' | 'points' | 'combination' | 'triple';
  theme?: 'classic' | 'green';
  policyText?: string;
}

export default function BetCell({
  id,
  name,
  nameEn,
  desc,
  odds,
  icon,
  amount,
  onClick,
  disabled = false,
  closed = false,
  win = false,
  lose = false,
  className,
  size = 'medium',
  type = 'primary',
  theme = 'classic',
  policyText,
}: BetCellProps) {
  const hasAmount = amount > 0;
  const formattedAmount = hasAmount ? (Math.round((amount + Number.EPSILON) * 100) / 100).toFixed(2) : '0.00';

  // 筹码飞入动画状态
  const [isAnimating, setIsAnimating] = useState(false);

  // 获取赔率颜色（根据赔率高低分级）
  const getOddsColor = (oddsString: string) => {
    const ratio = parseFloat(oddsString.split(':')[0]);

    if (ratio >= 180) {
      // 特高赔率: 彩虹渐变
      return {
        color: '#FF00FF',
        textShadow: '0 0 10px rgba(255, 0, 255, 0.8), 0 0 20px rgba(255, 215, 0, 0.6)',
        animation: 'rainbow 3s linear infinite',
      };
    } else if (ratio >= 30) {
      // 高赔率: 金色发光
      return {
        color: '#FFD700',
        textShadow: '0 0 8px rgba(255, 215, 0, 0.8)',
      };
    } else if (ratio >= 6) {
      // 中赔率: 黄色
      return {
        color: '#F59E0B',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
      };
    } else {
      // 低赔率: 白色
      return {
        color: '#FFFFFF',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
      };
    }
  };

  // 触觉反馈和筹码飞入动画
  const handleClick = () => {
    if (disabled || closed) return;

    // 触发筹码飞入动画
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    onClick();

    // 中等反馈 (点击投注格)
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  // 尺寸样式
  const sizeStyles = {
    small: 'min-w-[55px] max-[400px]:min-w-[38px] min-h-[60px] p-sm text-tiny',
    medium: 'min-w-[65px] min-h-[75px] p-sm',
    large: 'min-w-[110px] min-h-[100px] p-md',
  };

  // 获取基础样式
  const getBaseStyles = () => {
    // 中奖状态
    if (win) {
      return {
        background: 'radial-gradient(circle, #FFD700 0%, #FFA500 100%)',
        border: '4px solid #FF0000',
        boxShadow: '0 0 40px rgba(255, 215, 0, 1), 0 0 80px rgba(255, 165, 0, 0.8)',
        animation: 'win-flash 0.5s ease-in-out 3',
      };
    }

    // 未中奖状态
    if (lose) {
      return {
        background: 'rgba(107, 20, 20, 0.3)',
        border: '2px solid rgba(212, 175, 55, 0.3)',
        opacity: 0.4,
        filter: 'grayscale(0.7)',
      };
    }

    // 封盘状态
    if (closed) {
      return {
        background: 'linear-gradient(135deg, #3A3A3A 0%, #8B0000 100%)',
        border: '2px solid #666666',
        opacity: 0.5,
        filter: 'grayscale(1)',
        cursor: 'not-allowed',
      };
    }

    if (theme === 'green') {
      const greenBase = {
        background: 'linear-gradient(180deg, #0f6b45 0%, #0b4d34 100%)',
        border: '2px solid #d6e8c2',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.28)',
      };

      const greenActive = {
        background: 'linear-gradient(180deg, #1d8150 0%, #0f6b45 100%)',
        border: '2px solid #f4f2d6',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.35), 0 0 12px rgba(244, 242, 214, 0.5)',
      };

      if (hasAmount) {
        return type === 'points'
          ? { ...greenActive }
          : { ...greenActive };
      }

      if (type === 'points') {
        return {
          background: 'linear-gradient(180deg, #0e613f 0%, #0a4b32 100%)',
          border: '2px solid #d6e8c2',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.25)',
        };
      }

      return greenBase;
    } else {
    if (hasAmount) {
      if (type === 'points') {
        return {
          background: 'linear-gradient(180deg, #F8D26A 0%, #D29C2F 100%)',
          border: '3px solid var(--gold-bright)',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.6)',
        };
      }

      return {
        background: 'linear-gradient(135deg, var(--burgundy) 0%, var(--casino-red) 100%)',
        border: '3px solid var(--gold-bright)',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.6)',
      };
    }

    if (type === 'points') {
      return {
        background: 'linear-gradient(180deg, #F5EDE3 0%, #E2D7C1 100%)',
        border: '2px solid rgba(0, 0, 0, 0.2)',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
      };
    }

    // 默认状态
    return {
      background: 'linear-gradient(135deg, var(--burgundy) 0%, var(--casino-red) 100%)',
      border: '3px solid var(--gold-primary)',
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3), var(--shadow-sm)',
    };
    }
  };

  const baseStyles = getBaseStyles();

  return (
    <button
      onClick={handleClick}
      disabled={disabled || closed}
      className={cn(
        'relative flex flex-col items-center justify-center gap-1',
        'rounded-lg transition-all duration-200',
        'active:scale-95',
        // Hover效果 (非禁用且非封盘)
        !disabled && !closed && !win && !lose && 'hover:border-[var(--gold-bright)] hover:shadow-[0_0_16px_rgba(255,215,0,0.6)] hover:-translate-y-0.5',
        sizeStyles[size],
        type === 'points' && 'aspect-square w-full min-h-[50px] p-1 gap-0.5',
        className
      )}
      style={{
        ...baseStyles,
        ...(theme === 'green'
          ? {
              borderRadius: 10,
            }
          : {}),
      }}
    >
      {/* 主要内容区 */}
      <div className="relative z-10 flex flex-col items-center gap-0.5 w-full">
        {/* 大/小等主要投注格 */}
        {type === 'primary' && (
          <>
            <h3
              className="font-display text-h3 font-black text-center leading-none"
              style={{
                color: theme === 'green' ? '#FFFFFF' : '#FFFFFF',
                textShadow: theme === 'green' ? '0 2px 3px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0, 0, 0, 0.5)',
                letterSpacing: theme === 'green' ? '1px' : undefined,
              }}
            >
              {name}
            </h3>
            {nameEn && (
              <p className="text-tiny uppercase tracking-wide" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {nameEn}
              </p>
            )}
            {desc && (
              <p className="text-tiny text-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {desc}
              </p>
            )}
            {odds && (
              <span
                className="text-small font-bold"
                style={
                  theme === 'green'
                    ? { color: '#f2d04f', textShadow: '0 1px 2px rgba(0,0,0,0.35)' }
                    : getOddsColor(odds)
                }
              >
                {odds}
              </span>
            )}
            {policyText && (
              <div className="text-xs text-text-secondary mt-1" style={{ fontSize: '11px' }}>
                {policyText}
              </div>
            )}
          </>
        )}

        {/* 点数投注格 */}
        {type === 'points' && (
          <>
            <span
              className="font-mono font-black leading-none"
              style={{
                color: theme === 'green' ? '#f7f7f7' : '#1E1203',
                textShadow: theme === 'green' ? '0 1px 2px rgba(0,0,0,0.35)' : '0 1px 2px rgba(255, 255, 255, 0.5)',
                fontSize: '22px',
                lineHeight: 1,
              }}
            >
              {name}
            </span>
            {odds && (
              <span
                className="font-bold font-mono"
                style={{
                  color: theme === 'green' ? '#f2d04f' : ['4', '17'].includes(name) ? '#C08222' : '#4A2A0A',
                  textShadow: theme === 'green' ? '0 1px 2px rgba(0,0,0,0.35)' : 'none',
                  fontSize: '10px',
                  lineHeight: 1,
                }}
              >
                {odds}
              </span>
            )}
          </>
        )}

        {/* 两骰组合格 */}
        {type === 'combination' && (
          <>
            <div className="flex gap-0.5 text-tiny" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              {icon}
            </div>
            <span className="text-body font-bold" style={{ color: '#FFFFFF' }}>
              {name}
            </span>
            {odds && (
              <span className="text-small font-bold" style={{ color: 'var(--gold-bright)' }}>
                {odds}
              </span>
            )}
          </>
        )}

        {/* 三同号格 */}
        {type === 'triple' && (
          <>
            <span className="text-xl">{icon}</span>
            <span className="text-small font-bold text-center" style={{ color: '#FFFFFF' }}>
              {name}
            </span>
            {odds && (
              <span
                className="text-body font-bold"
                style={{
                  color: odds.includes('180') ? '#FFA500' : 'var(--gold-bright)',
                  textShadow: '0 0 8px rgba(255, 215, 0, 0.5)',
                }}
              >
                {odds}
              </span>
            )}
          </>
        )}
      </div>

      {/* 筹码飞入动画效果 */}
      {isAnimating && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'chipFlyIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-tiny font-bold"
            style={{
              background: 'radial-gradient(circle, #FFD700 0%, #D4AF37 100%)',
              border: '3px solid #8B4513',
              boxShadow: '0 4px 12px rgba(255, 215, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
              color: '#1A1A1A',
            }}
          >
            $
          </div>
        </div>
      )}

      {/* 筹码叠加显示 */}
      {hasAmount && !win && !lose && (
        <div
          className="absolute bottom-1 right-1 px-2 py-0.5 rounded"
          style={{
            background: type === 'points' ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.8)',
            border: '1px solid var(--gold-bright)',
          }}
        >
          <span
            className="text-tiny font-bold font-mono"
            style={{ color: 'var(--gold-bright)' }}
          >
            ${formattedAmount}
          </span>
        </div>
      )}

      {/* 中奖金额弹出 */}
      {win && (
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap animate-[numberPopUp_1.5s_ease-out_forwards]"
          style={{
            fontSize: 'var(--text-h2)',
            fontWeight: 'var(--font-black)',
            color: 'var(--gold-bright)',
            textShadow: '0 0 10px rgba(255, 215, 0, 1), 0 2px 4px rgba(0, 0, 0, 0.8)',
          }}
        >
          +${(amount * parseFloat(odds.split(':')[0])).toFixed(2)}
        </div>
      )}

      {/* 动画样式 */}
      <style jsx>{`
        @keyframes chipFlyIn {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(0) scale(0.5);
          }
          60% {
            opacity: 1;
            transform: translateX(-50%) translateY(-80px) scale(1.1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-80px) scale(0.8);
          }
        }

        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
