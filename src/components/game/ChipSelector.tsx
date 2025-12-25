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
    value: 0.1,
    label: '$0.1',
    shortLabel: '0.1',
    gradient: 'radial-gradient(circle, #E0F7FA 0%, #B2EBF2 100%)',
    textColor: '#000000',
    borderColor: '#000000',
  },
  {
    value: 1,
    label: '$1',
    shortLabel: '1',
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
];

interface ChipSelectorProps {
  value?: number;
  onChange?: (value: number) => void;
}

export default function ChipSelector({ value, onChange }: ChipSelectorProps) {
  const gameContext = useGame();
  
  const selectedChip = value !== undefined ? value : gameContext.selectedChip;
  const setSelectedChip = onChange || gameContext.setSelectedChip;

  const handleChipClick = (val: number) => {
    setSelectedChip(val);

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
        height: '90px',
        minHeight: '90px',
        maxHeight: '90px',
        padding: '6px 0px',
        overflow: 'visible',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="flex items-center justify-center w-full h-full"
        style={{
          gap: '2px', // 极小间距，紧凑排列
          paddingLeft: '2px',
          paddingRight: '2px',
        }}
      >
        {chips.map((chip) => {
          const isSelected = selectedChip === chip.value;

          return (
            <div
              key={chip.value}
              className="flex flex-col items-center"
              style={{ 
                position: 'relative',
                flexShrink: 0,
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
                    'relative z-10 w-11 h-11 rounded-full transition-all duration-200 active:scale-95'
                  )}
                  style={{
                    background: chip.gradient,
                    border: isSelected ? '2px solid var(--gold-bright)' : '2px solid transparent',
                    boxShadow: isSelected
                      ? `0 0 12px rgba(255, 215, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.3)`
                      : `inset 0 2px 4px rgba(255, 255, 255, 0.25), inset 0 -2px 4px rgba(0, 0, 0, 0.25), 0 3px 6px rgba(0, 0, 0, 0.3)`,
                    filter: isSelected ? 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.3))' : undefined,
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
                  fontSize: '9px',
                  marginTop: '1px',
                  lineHeight: '1',
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
