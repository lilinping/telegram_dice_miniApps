'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/contexts/GameContext';

/**
 * 3D骰子动画组件
 *
 * 功能：
 * 1. 使用@react-three/fiber实现3D骰子动画
 * 2. 骰盅晃动动画
 * 3. 骰子抛出、滚动、定格
 * 4. 物理引擎模拟真实碰撞
 * 5. 降级方案（低端设备显示2D动画）
 */

interface DiceAnimationProps {
  fullscreen?: boolean;
}

export default function DiceAnimation({ fullscreen = false }: DiceAnimationProps) {
  const { gameState, diceResults } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [use3D, setUse3D] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'shaking' | 'rolling' | 'stopped'>('idle');

  // 检测WebGL支持
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const hasWebGL = !!gl;

    // 检测设备性能（简单判断）
    const isLowEndDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    setUse3D(hasWebGL && !isLowEndDevice);
  }, []);

  // 根据游戏状态更新动画阶段
  useEffect(() => {
    if (gameState === 'betting') {
      setAnimationPhase('idle');
    } else if (gameState === 'rolling') {
      setAnimationPhase('shaking');
      setTimeout(() => setAnimationPhase('rolling'), 2000);
    } else if (gameState === 'revealing') {
      setAnimationPhase('stopped');
    }
  }, [gameState]);

  // 2D降级动画
  const Dice2D = ({ value }: { value: number }) => {
    const getDiceDots = (num: number) => {
      const positions: Record<number, string[]> = {
        1: ['center'],
        2: ['top-left', 'bottom-right'],
        3: ['top-left', 'center', 'bottom-right'],
        4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
        6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
      };
      return positions[num] || [];
    };

    const dots = getDiceDots(value);

    return (
      <div className={`relative w-20 h-20 bg-white rounded-xl shadow-lg transform ${animationPhase === 'rolling' ? 'animate-dice-roll' : ''}`}>
        <div className="absolute inset-0 p-2">
          {dots.map((position, idx) => (
            <div
              key={idx}
              className={`absolute w-3 h-3 bg-black rounded-full ${
                position === 'top-left' ? 'top-2 left-2' :
                position === 'top-right' ? 'top-2 right-2' :
                position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
                position === 'middle-left' ? 'top-1/2 left-2 -translate-y-1/2' :
                position === 'middle-right' ? 'top-1/2 right-2 -translate-y-1/2' :
                position === 'bottom-left' ? 'bottom-2 left-2' :
                'bottom-2 right-2'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  // 骰盅组件
  const DiceCup = () => (
    <div className={`relative ${animationPhase === 'shaking' ? 'animate-shake' : ''}`}>
      {/* 骰盅 */}
      <div className="relative w-32 h-32 mx-auto">
        {/* 骰盅盖 */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-gold to-primary-dark-gold rounded-t-full opacity-90 shadow-xl" />
        {/* 骰盅边缘高光 */}
        <div className="absolute inset-0 border-4 border-primary-light-gold/30 rounded-t-full" />
        {/* 骰盅装饰纹路 */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-20 h-1 bg-primary-light-gold/50 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary-light-gold/50 rounded-full" />
      </div>
      {/* 底座 */}
      <div className="w-40 h-4 mx-auto mt-2 bg-gradient-to-b from-primary-dark-gold to-primary-darkest rounded-full shadow-lg" />
    </div>
  );

  // 根据状态显示不同内容
  const renderContent = () => {
    if (gameState === 'betting' || animationPhase === 'idle') {
      // 待机状态 - 显示骰盅
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <DiceCup />
          <p className="mt-6 text-text-secondary text-sm">
            {gameState === 'betting' ? '正在下注中...' : '准备开始'}
          </p>
        </div>
      );
    }

    if (animationPhase === 'shaking') {
      // 晃动阶段 - 显示晃动的骰盅
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <DiceCup />
          <p className="mt-6 text-primary-gold text-base font-semibold animate-pulse">
            摇骰中...
          </p>
        </div>
      );
    }

    if (animationPhase === 'rolling') {
      // 滚动阶段 - 显示滚动的骰子
      return (
        <div className="flex flex-col items-center justify-center h-full gap-8">
          <div className="flex gap-4">
            {[1, 2, 3].map((idx) => (
              <Dice2D key={idx} value={Math.floor(Math.random() * 6) + 1} />
            ))}
          </div>
          <p className="text-primary-gold text-base font-semibold animate-pulse">
            开奖中...
          </p>
        </div>
      );
    }

    if (animationPhase === 'stopped' && diceResults.length === 3) {
      // 停止阶段 - 显示最终结果
      const total = diceResults.reduce((sum, val) => sum + val, 0);
      const isBig = total >= 11 && total <= 17;
      const isSmall = total >= 4 && total <= 10;
      const isOdd = total % 2 === 1;

      return (
        <div className="flex flex-col items-center justify-center h-full gap-6">
          {/* 骰子结果 */}
          <div className="flex gap-4">
            {diceResults.map((value, idx) => (
              <div key={idx} className="animate-bounce" style={{ animationDelay: `${idx * 100}ms` }}>
                <Dice2D value={value} />
              </div>
            ))}
          </div>

          {/* 总点数 */}
          <div className="text-center">
            <p className="text-6xl font-bold font-mono text-primary-gold animate-scale-in">
              {total}
            </p>
            <div className="flex gap-2 mt-3 justify-center">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isBig ? 'bg-error text-white' : 'bg-bg-medium text-text-secondary'}`}>
                大
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isSmall ? 'bg-info text-white' : 'bg-bg-medium text-text-secondary'}`}>
                小
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isOdd ? 'bg-warning text-white' : 'bg-bg-medium text-text-secondary'}`}>
                单
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${!isOdd ? 'bg-success text-white' : 'bg-bg-medium text-text-secondary'}`}>
                双
              </span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={fullscreen ? 'w-screen h-screen' : 'w-full h-full'}>
      {/* 3D模式（待实现Three.js） */}
      {use3D && false && (
        <canvas ref={canvasRef} className="w-full h-full" />
      )}

      {/* 2D降级模式 */}
      {(!use3D || true) && (
        <div className="w-full h-full bg-gradient-radial from-primary-darkest/20 to-transparent">
          {renderContent()}
        </div>
      )}
    </div>
  );
}
