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
      className="flex gap-md items-center overflow-x-auto scrollbar-hide"
      style={{
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        overflowY: 'visible',
        overflowX: 'auto',
        position: 'relative',
        width: '100%',
        height: '100%',
        paddingTop: '0',
        paddingBottom: '0',
        paddingLeft: '16px', // 左侧padding确保第一个筹码可以完全显示
        paddingRight: '16px', // 右侧padding确保最后一个筹码可以完全显示
      }}
    >
      {chips.map((chip) => {
        const isSelected = selectedChip === chip.value;

        return (
          <div
            key={chip.value}
            className="flex flex-col items-center gap-xs flex-shrink-0"
            style={{ 
              scrollSnapAlign: 'center',
              position: 'relative',
              // 不添加paddingTop，避免筹码下移
            }}
          >
            {/* 筹码 */}
            <div className="relative z-10">
              {/* 发光效果 - 相对于筹码按钮居中，在所有方向扩展 */}
              {isSelected && (
                <div
                  className="absolute"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'calc(64px + 32px)', // 筹码宽度64px + 发光扩展32px
                    height: 'calc(64px + 32px)',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.35) 0%, rgba(255, 215, 0, 0) 70%)',
                    filter: 'blur(2px)',
                    zIndex: 0,
                    pointerEvents: 'none',
                  }}
                />
              )}
              <button
                onClick={() => handleChipClick(chip.value)}
                className={cn(
                  'relative z-10 w-16 h-16 rounded-full transition-all duration-200 active:scale-98'
                )}
                style={{
                  background: chip.gradient,
                  border: isSelected ? '3px solid var(--gold-bright)' : '3px solid transparent',
                  boxShadow: isSelected
                    ? `0 0 22px rgba(255, 215, 0, 0.35), 0 8px 16px rgba(0, 0, 0, 0.45), inset 0 3px 6px rgba(255, 255, 255, 0.4), inset 0 -3px 6px rgba(0, 0, 0, 0.4)`
                    : `inset 0 3px 6px rgba(255, 255, 255, 0.3), inset 0 -3px 6px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.4)`,
                  filter: isSelected ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.35))' : undefined,
                }}
              >
                {/* 中心内容 */}
                <div className="relative z-10 flex items-center justify-center w-full h-full">
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
              </button>
            </div>

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
