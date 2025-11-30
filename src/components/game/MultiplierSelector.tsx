'use client';

import { useState } from 'react';

/**
 * 倍投选择器组件
 *
 * 功能：
 * 1. 显示倍投选项（1x, 2x, 5x, 10x, 20x）
 * 2. 金色标签样式 + 动态浮动效果
 * 3. 选中时高亮显示
 * 4. 支持音效和震动反馈
 */

interface MultiplierSelectorProps {
  value: number;
  onChange: (multiplier: number) => void;
  disabled?: boolean;
}

const MULTIPLIERS = [1, 2, 5, 10, 20];

export default function MultiplierSelector({
  value,
  onChange,
  disabled = false,
}: MultiplierSelectorProps) {
  const [hoveredMultiplier, setHoveredMultiplier] = useState<number | null>(null);

  return (
    <div
      className="w-full px-3 py-1.5"
      style={{
        background: 'linear-gradient(180deg, rgba(42, 42, 42, 0.95) 0%, rgba(26, 26, 26, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)',
        height: '70px', // 减少高度，防止重叠
        minHeight: '70px',
        maxHeight: '70px',
        overflow: 'hidden',
      }}
    >
      {/* 标题 */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--gold-primary)' }}
        >
          倍投设置
        </span>
        {value > 1 && (
          <span
            className="text-xs font-mono font-bold px-1.5 py-0.5 rounded animate-pulse"
            style={{
              background: 'linear-gradient(135deg, var(--gold-bright) 0%, var(--gold-dark) 100%)',
              color: 'var(--rich-black)',
              boxShadow: '0 0 12px rgba(255, 215, 0, 0.6)',
            }}
          >
            {value}x 倍投中
          </span>
        )}
      </div>

      {/* 倍投选项 - 优化移动端布局 */}
      <div className="grid grid-cols-5 gap-1 mobile-gap-1">
        {MULTIPLIERS.map((multiplier) => {
          const isSelected = value === multiplier;
          const isHovered = hoveredMultiplier === multiplier;

          return (
            <button
              key={multiplier}
              onClick={() => !disabled && onChange(multiplier)}
              onMouseEnter={() => setHoveredMultiplier(multiplier)}
              onMouseLeave={() => setHoveredMultiplier(null)}
              disabled={disabled}
              className="relative flex items-center justify-center rounded-md transition-all duration-200 active:scale-95"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, var(--gold-bright) 0%, var(--gold-dark) 100%)'
                  : isHovered
                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(184, 134, 11, 0.3) 100%)'
                  : 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(184, 134, 11, 0.15) 100%)',
                border: isSelected
                  ? '2px solid var(--gold-bright)'
                  : '2px solid rgba(212, 175, 55, 0.4)',
                boxShadow: isSelected
                  ? '0 0 16px rgba(255, 215, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.2)'
                  : 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                animation: isSelected ? 'float 2s ease-in-out infinite' : 'none',
                height: '28px', // 减少按钮高度
                minHeight: '28px',
                maxHeight: '28px',
              }}
            >
              {/* 倍数文字 */}
              <span
                className="text-sm font-bold font-mono mobile-text-xs mobile-ultra-text-xs"
                style={{
                  color: isSelected ? 'var(--rich-black)' : 'var(--gold-primary)',
                  textShadow: isSelected ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.5)',
                }}
              >
                {multiplier}x
              </span>

              {/* 选中图标 */}
              {isSelected && (
                <div
                  className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center animate-scale-in"
                  style={{
                    background: 'var(--gold-bright)',
                    border: '1px solid var(--rich-black)',
                    boxShadow: '0 1px 4px rgba(255, 215, 0, 0.8)',
                  }}
                >
                  <span className="text-xs" style={{ color: 'var(--rich-black)' }}>✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 说明文字 - 简化移动端显示 */}
      <div className="mt-0.5 text-center">
        <p
          className="text-xs leading-tight"
          style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '9px' }}
        >
          {value > 1
            ? `当前所有下注金额将乘以 ${value} 倍`
            : '选择倍投倍数以放大收益'}
        </p>
      </div>

      {/* 浮动动画样式 */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
