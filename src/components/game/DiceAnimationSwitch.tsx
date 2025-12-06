/**
 * 骰子动画切换组件
 * 根据配置或设备性能选择CSS版本或Three.js版本
 */

'use client';

import { useState, useEffect } from 'react';
import DiceAnimation from './DiceAnimation'; // CSS版本
import DiceAnimationThree from './DiceAnimationThree'; // Three.js版本
import { detectDevicePerformance } from '@/lib/utils/performance';

interface DiceAnimationSwitchProps {
  fullscreen?: boolean;
  winAmount?: number;
  hasWon?: boolean;
  forceVersion?: 'css' | 'three'; // 强制使用指定版本
}

export default function DiceAnimationSwitch({
  fullscreen = false,
  winAmount = 0,
  hasWon = false,
  forceVersion,
}: DiceAnimationSwitchProps) {
  const [useThreeJS, setUseThreeJS] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查用户偏好设置
    const savedPreference = localStorage.getItem('dice_animation_version');
    
    if (forceVersion) {
      // 强制使用指定版本
      setUseThreeJS(forceVersion === 'three');
      setIsLoading(false);
      return;
    }

    if (savedPreference) {
      // 使用保存的偏好
      setUseThreeJS(savedPreference === 'three');
      setIsLoading(false);
      return;
    }

    // 自动检测设备性能
    const performance = detectDevicePerformance();
    
    // 高端设备默认使用Three.js版本
    // 中低端设备使用CSS版本
    const shouldUseThree = performance.tier === 'high' && !performance.isMobile;
    
    setUseThreeJS(shouldUseThree);
    setIsLoading(false);

    console.log('🎮 自动选择动画版本:', shouldUseThree ? 'Three.js' : 'CSS');
  }, [forceVersion]);

  // 切换版本
  const toggleVersion = () => {
    const newVersion = !useThreeJS;
    setUseThreeJS(newVersion);
    localStorage.setItem('dice_animation_version', newVersion ? 'three' : 'css');
    console.log('🔄 切换到:', newVersion ? 'Three.js' : 'CSS');
  };

  if (isLoading) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--gold-bright)',
      }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 版本切换按钮（开发模式） */}
      {process.env.NODE_ENV === 'development' && !fullscreen && (
        <button
          onClick={toggleVersion}
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 1000,
            padding: '5px 10px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'var(--gold-bright)',
            border: '1px solid var(--gold-primary)',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          {useThreeJS ? '3D' : '2D'}
        </button>
      )}

      {/* 渲染对应版本 */}
      {useThreeJS ? (
        <DiceAnimationThree
          fullscreen={fullscreen}
          winAmount={winAmount}
          hasWon={hasWon}
        />
      ) : (
        <DiceAnimation
          fullscreen={fullscreen}
          winAmount={winAmount}
          hasWon={hasWon}
        />
      )}
    </div>
  );
}
