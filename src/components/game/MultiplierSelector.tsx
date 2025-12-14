'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MultiplierSelectorProps {
  // 悬浮模式（全局模式使用）
  isOpen?: boolean;
  onClose?: () => void;
  onSelect?: (multiplier: number) => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
  currentMultiplier?: number;
  
  // 固定显示模式（个人模式使用）
  value?: number;
  onChange?: (multiplier: number) => void;
  disabled?: boolean;
}

const multipliers = [1, 2, 5, 10, 20];

export default function MultiplierSelector({
  // 悬浮模式参数
  isOpen, 
  onClose, 
  onSelect,
  buttonRef,
  currentMultiplier,
  
  // 固定显示模式参数
  value,
  onChange,
  disabled = false,
}: MultiplierSelectorProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  
  // 判断是悬浮模式还是固定显示模式
  const isPopupMode = isOpen !== undefined;
  const selectedMultiplier = isPopupMode ? (currentMultiplier ?? 1) : (value ?? 1);

  // 点击外部关闭（仅悬浮模式）
  useEffect(() => {
    if (!isPopupMode || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopupMode, isOpen, onClose, buttonRef]);

  // 计算位置（仅悬浮模式）
  useEffect(() => {
    if (!isPopupMode || !isOpen || !buttonRef?.current || !popupRef.current) return;

    const updatePosition = () => {
      const buttonRect = buttonRef.current!.getBoundingClientRect();
      const popup = popupRef.current!;
      
      // 等待 DOM 更新后获取弹框高度
      requestAnimationFrame(() => {
        const popupHeight = popup.offsetHeight || 200; // 默认高度 200px
        const left = buttonRect.left + buttonRect.width / 2;
        
        // 在按钮上方显示，距离按钮 8px
        const top = buttonRect.top - popupHeight - 8;
        
        // 如果上方空间不够，显示在下方
        if (top < 10) {
          popup.style.top = `${buttonRect.bottom + 8}px`;
          popup.style.bottom = 'auto';
        } else {
          popup.style.top = `${top}px`;
          popup.style.bottom = 'auto';
        }
        
        popup.style.left = `${left}px`;
        popup.style.transform = 'translateX(-50%)';
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isPopupMode, isOpen, buttonRef]);

  const handleSelect = (multiplier: number) => {
    if (isPopupMode) {
      onSelect?.(multiplier);
      onClose?.();
    } else {
      onChange?.(multiplier);
    }
  };

  // 悬浮模式：只在 isOpen 为 true 时显示
  if (isPopupMode && !isOpen) return null;
  
  // 固定显示模式的容器
  const content = (
    <div
      className={cn(
        isPopupMode ? 'rounded-2xl p-4 shadow-2xl' : 'rounded-lg p-2',
        isPopupMode ? '' : 'w-full h-full'
      )}
      style={isPopupMode ? {
        background: 'linear-gradient(180deg, rgba(26, 26, 26, 0.98) 0%, rgba(13, 13, 13, 0.98) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(212, 175, 55, 0.1)',
        backdropFilter: 'blur(20px)',
      } : {
        background: 'linear-gradient(180deg, rgba(26, 26, 26, 0.95) 0%, rgba(13, 13, 13, 0.95) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
      }}
        >
      {/* 标题 - 仅悬浮模式显示 */}
      {isPopupMode && (
        <div className="mb-3">
          <h3
            className="text-sm font-bold"
            style={{
              color: '#ffd75e',
              textShadow: '0 0 8px rgba(255, 215, 94, 0.5)',
            }}
          >
            倍投设置
          </h3>
      </div>
      )}

      {/* 倍数按钮组 */}
      <div className={cn('flex', isPopupMode ? 'gap-1.5 mb-3' : 'gap-1')}>
            {multipliers.map((multiplier) => {
              const isSelected = selectedMultiplier === multiplier;
          return (
            <button
              key={multiplier}
                  onClick={() => handleSelect(multiplier)}
              disabled={disabled}
                  className={cn(
                    'relative flex-1 px-2 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200',
                    'active:scale-95',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
              style={{
                background: isSelected
                      ? 'linear-gradient(180deg, #ffd75e 0%, #ffc107 100%)'
                      : 'linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.08) 100%)',
                border: isSelected
                      ? '1px solid rgba(255, 215, 94, 0.5)'
                      : '1px solid rgba(212, 175, 55, 0.2)',
                    color: isSelected ? '#000' : '#ffd75e',
                boxShadow: isSelected
                      ? '0 4px 12px rgba(255, 215, 94, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
                  : 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
                }}
              >
              {isSelected && (
                <div
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                        background: '#ffd75e',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="#000"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                </div>
              )}
                  {multiplier}x
            </button>
          );
        })}
      </div>

      {/* 提示文字 - 仅悬浮模式显示 */}
      {isPopupMode && (
        <div className="text-center">
        <p
            className="text-xs"
            style={{
              color: 'rgba(255, 215, 94, 0.7)',
            }}
        >
            选择倍投倍数以放大收益
        </p>
      </div>
      )}
    </div>
  );

  // 悬浮模式：返回带遮罩的悬浮弹窗
  if (isPopupMode) {
    return (
      <>
        {/* 背景遮罩 */}
        <div
          className="fixed inset-0"
          onClick={onClose}
          style={{ 
            background: 'transparent',
            zIndex: 150,
          }}
        />
        
        {/* 倍投选择器 */}
        <div
          ref={popupRef}
          className="fixed"
          style={{
            minWidth: '280px',
            maxWidth: '90vw',
            zIndex: 151,
          }}
        >
          {content}
        </div>
      </>
    );
  }

  // 固定显示模式：直接返回内容
  return <div className="w-full h-full flex flex-col justify-center">{content}</div>;
}
