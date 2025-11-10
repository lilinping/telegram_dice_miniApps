'use client';

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
}: BetCellProps) {
  const hasAmount = amount > 0;

  // 触觉反馈
  const handleClick = () => {
    if (disabled || closed) return;

    onClick();

    // 中等反馈 (点击投注格)
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  // 尺寸样式
  const sizeStyles = {
    small: 'min-w-[50px] min-h-[55px] p-sm text-tiny',
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

    // 已下注状态
    if (hasAmount) {
      return {
        background: 'linear-gradient(135deg, var(--burgundy) 0%, var(--casino-red) 100%)',
        border: '3px solid var(--gold-bright)',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.6)',
      };
    }

    // 默认状态
    return {
      background: 'linear-gradient(135deg, var(--burgundy) 0%, var(--casino-red) 100%)',
      border: '3px solid var(--gold-primary)',
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3), var(--shadow-sm)',
    };
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
        className
      )}
      style={{
        ...baseStyles,
        backgroundImage: !win && !lose ? 'url(/textures/velvet.png), ' + baseStyles.background : baseStyles.background,
        backgroundBlendMode: !win && !lose ? 'overlay' : 'normal',
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
                color: '#FFFFFF',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
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
                style={{ color: 'var(--gold-bright)' }}
              >
                {odds}
              </span>
            )}
          </>
        )}

        {/* 点数投注格 */}
        {type === 'points' && (
          <>
            <span
              className="font-mono text-h1 font-black"
              style={{
                color: '#FFFFFF',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              }}
            >
              {name}
            </span>
            {odds && (
              <span
                className="text-body font-bold font-mono"
                style={{
                  color: ['4', '17'].includes(name) ? '#FFA500' : 'var(--gold-bright)',
                  textShadow: '0 0 8px rgba(255, 215, 0, 0.5)',
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

      {/* 筹码叠加显示 */}
      {hasAmount && !win && !lose && (
        <div
          className="absolute bottom-1 right-1 px-2 py-0.5 rounded"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid var(--gold-bright)',
          }}
        >
          <span
            className="text-tiny font-bold font-mono"
            style={{ color: 'var(--gold-bright)' }}
          >
            ${amount}
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
    </button>
  );
}
