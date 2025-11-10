'use client';

import { useGame } from '@/contexts/GameContext';
import { cn } from '@/lib/utils';

/**
 * 专业筹码选择器组件 V2.0
 *
 * 功能：
 * 1. 真实赌场筹码配色 ($10红/$50蓝/$100黑/$500紫/$1K金)
 * 2. 3D立体效果 (内外阴影)
 * 3. 选中状态脉冲动画
 * 4. 边缘条纹装饰
 * 5. $1K筹码金色光晕
 * 6. 触摸反馈优化
 */

const chips = [
  {
    value: 10,
    label: '$10',
    shortLabel: '10',
    gradient: 'radial-gradient(circle, #E53935 0%, #C62828 100%)',
    textColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  {
    value: 50,
    label: '$50',
    shortLabel: '50',
    gradient: 'radial-gradient(circle, #1E88E5 0%, #1565C0 100%)',
    textColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  {
    value: 100,
    label: '$100',
    shortLabel: '100',
    gradient: 'radial-gradient(circle, #1A1A1A 0%, #000000 100%)',
    textColor: 'var(--gold-bright)',
    borderColor: 'var(--gold-bright)',
  },
  {
    value: 500,
    label: '$500',
    shortLabel: '500',
    gradient: 'radial-gradient(circle, #9C27B0 0%, #7B1FA2 100%)',
    textColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    hasShimmer: true,
  },
  {
    value: 1000,
    label: '$1K',
    shortLabel: '1K',
    gradient: 'radial-gradient(circle, #FFD700 0%, #FFA500 100%)',
    textColor: '#000000',
    borderColor: '#000000',
    hasGlow: true,
  },
];

export default function ChipSelector() {
  const { selectedChip, setSelectedChip } = useGame();

  const handleChipClick = (value: number) => {
    setSelectedChip(value);

    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(30); // 30ms轻触反馈
    }
  };

  return (
    <div
      className="flex gap-md justify-center items-center overflow-x-auto scrollbar-hide"
      style={{
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {chips.map((chip) => {
        const isSelected = selectedChip === chip.value;

        return (
          <div
            key={chip.value}
            className="flex flex-col items-center gap-xs flex-shrink-0"
            style={{ scrollSnapAlign: 'center' }}
          >
            {/* 筹码 */}
            <button
              onClick={() => handleChipClick(chip.value)}
              className={cn(
                'relative w-16 h-16 rounded-full transition-all duration-300 active:scale-95',
                isSelected && 'scale-125 z-10'
              )}
              style={{
                background: chip.gradient,
                boxShadow: isSelected
                  ? `inset 0 3px 6px rgba(255, 255, 255, 0.5), inset 0 -3px 6px rgba(0, 0, 0, 0.5), 0 0 0 4px var(--gold-bright), 0 10px 20px rgba(255, 215, 0, 0.6)`
                  : `inset 0 3px 6px rgba(255, 255, 255, 0.3), inset 0 -3px 6px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.4)`,
                animation: isSelected ? 'chip-pulse 1.5s infinite' : 'none',
              }}
            >
              {/* 边缘条纹装饰 */}
              <div
                className="absolute inset-0 rounded-full opacity-60"
                style={{
                  border: '4px solid',
                  borderColor: chip.borderColor,
                  borderImage: 'repeating-conic-gradient(from 0deg, currentColor 0deg 22.5deg, transparent 22.5deg 45deg) 4',
                }}
              />

              {/* 中心内容 */}
              <div
                className="relative z-10 flex items-center justify-center w-full h-full"
              >
                <span
                  className="font-mono font-black text-lg"
                  style={{
                    color: chip.textColor,
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {chip.label}
                </span>
              </div>

              {/* $500筹码闪光效果 */}
              {chip.hasShimmer && (
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
                    animation: 'shimmer 2s infinite',
                  }}
                />
              )}

              {/* $1K筹码金色光晕 */}
              {chip.hasGlow && (
                <div
                  className="absolute -inset-2 rounded-full pointer-events-none -z-10"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)',
                    animation: 'glow-pulse 2s infinite',
                  }}
                />
              )}
            </button>

            {/* 筹码标签 */}
            <span
              className="text-small font-semibold"
              style={{
                color: isSelected ? 'var(--gold-bright)' : 'rgba(255, 255, 255, 0.6)',
                transition: 'color 0.3s',
              }}
            >
              {chip.shortLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}
