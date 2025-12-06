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
    value: 2,
    label: '$2',
    shortLabel: '2',
    gradient: 'radial-gradient(circle, #00BCD4 0%, #0097A7 100%)', // 青色
    textColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  {
    value: 5,
    label: '$5',
    shortLabel: '5',
    gradient: 'radial-gradient(circle, #4CAF50 0%, #2E7D32 100%)',
    textColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  {
    value: 10,
    label: '$10',
    shortLabel: '10',
    gradient: 'radial-gradient(circle, #E53935 0%, #C62828 100%)',
    textColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  {
    value: 20,
    label: '$20',
    shortLabel: '20',
    gradient: 'radial-gradient(circle, #FF9800 0%, #F57C00 100%)',
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
      className="w-full"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 26, 26, 0.95) 0%, rgba(13, 13, 13, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(212, 175, 55, 0.1)',
        height: '90px', // 固定高度，防止重叠
        minHeight: '90px',
        maxHeight: '90px',
        padding: '8px 12px',
        overflow: 'hidden',
      }}
    >
      <div
        className="flex justify-between items-center w-full h-full"
        style={{
          gap: '6px', // 减少间距，让筹码更紧凑
        }}
      >
        {chips.map((chip) => {
          const isSelected = selectedChip === chip.value;

          return (
            <div
              key={chip.value}
              className="flex flex-col items-center gap-1 flex-1"
              style={{ 
                position: 'relative',
                minWidth: '0', // 允许flex收缩
              }}
            >
              {/* 筹码 */}
              <div className="relative z-10">
                {/* 发光效果 - 优化移动端显示 */}
                {isSelected && (
                  <div
                    className="absolute"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 'calc(48px + 20px)', // 筹码宽度48px + 发光扩展20px
                      height: 'calc(48px + 20px)',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0) 70%)',
                      filter: 'blur(2px)',
                      zIndex: 0,
                      pointerEvents: 'none',
                    }}
                  />
                )}
                <button
                  onClick={() => handleChipClick(chip.value)}
                  className={cn(
                    'relative z-10 w-12 h-12 rounded-full transition-all duration-200 active:scale-95'
                  )}
                  style={{
                    background: chip.gradient,
                    border: isSelected ? '2px solid var(--gold-bright)' : '2px solid transparent',
                    boxShadow: isSelected
                      ? `0 0 16px rgba(255, 215, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.3)`
                      : `inset 0 2px 4px rgba(255, 255, 255, 0.25), inset 0 -2px 4px rgba(0, 0, 0, 0.25), 0 4px 8px rgba(0, 0, 0, 0.3)`,
                    filter: isSelected ? 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.3))' : undefined,
                  }}
                >
                  {/* 中心内容 */}
                  <div className="relative z-10 flex items-center justify-center w-full h-full">
                    <span
                      className="font-mono font-black text-xs"
                      style={{
                        color: chip.textColor,
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                      }}
                    >
                      {chip.label}
                    </span>
                  </div>
                </button>
              </div>

              {/* 筹码标签 - 优化移动端显示 */}
              <span
                className="text-xs font-semibold"
                style={{
                  color: isSelected ? 'var(--gold-bright)' : 'rgba(255, 255, 255, 0.6)',
                  transition: 'color 0.3s',
                  fontSize: '10px',
                }}
              >
                {chip.shortLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
