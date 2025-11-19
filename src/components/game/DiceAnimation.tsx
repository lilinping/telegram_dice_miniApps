'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';

/**
 * 增强版3D骰子动画组件 V2.0
 *
 * 新增功能：
 * 1. CSS 3D Transform 实现真实3D旋转
 * 2. 1.5秒流畅滚动动画
 * 3. 落地弹跳效果
 * 4. GPU加速优化
 * 5. 音效集成
 */

interface DiceAnimationProps {
  fullscreen?: boolean;
}

export default function DiceAnimation({ fullscreen = false }: DiceAnimationProps) {
  const { gameState, diceResults } = useGame();
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'shaking' | 'rolling' | 'stopped'>('idle');

  // 调试：监控diceResults变化
  useEffect(() => {
    if (diceResults.length > 0) {
      console.log('DiceAnimation - diceResults更新:', diceResults);
    }
  }, [diceResults]);

  // 根据游戏状态更新动画阶段
  useEffect(() => {
    if (gameState === 'betting') {
      setAnimationPhase('idle');
    } else if (gameState === 'rolling') {
      setAnimationPhase('shaking');
      setTimeout(() => setAnimationPhase('rolling'), 800);
    } else if (gameState === 'revealing') {
      setAnimationPhase('stopped');
    }
  }, [gameState]);

  // 3D骰子面组件
  const DiceFace = ({ number, position }: { number: number; position: string }) => {
    const getDots = (num: number) => {
      const dotPositions: Record<number, Array<[number, number]>> = {
        1: [[50, 50]],
        2: [[25, 25], [75, 75]],
        3: [[25, 25], [50, 50], [75, 75]],
        4: [[25, 25], [25, 75], [75, 25], [75, 75]],
        5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
        6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]],
      };
      return dotPositions[num] || [];
    };

    const dots = getDots(number);

    return (
      <div
        className="absolute w-full h-full flex items-center justify-center"
        style={{
          transform: position,
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F0F0 100%)',
          border: '2px solid #D0D0D0',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        {dots.map(([x, y], idx) => (
          <div
            key={idx}
            className="absolute w-[18%] h-[18%] bg-black rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>
    );
  };

  // 3D骰子组件
  const Dice3D = ({ value, delay = 0 }: { value: number; delay?: number }) => {
    const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
    const [isRolling, setIsRolling] = useState(false);
    const [translateZ, setTranslateZ] = useState(32); // 默认 32px (64px / 2)

    // 调试：输出当前骰子的值
    useEffect(() => {
      console.log('Dice3D - 收到value:', value, '延迟:', delay);
    }, [value, delay]);

    // 根据屏幕尺寸动态计算 translateZ 值
    useEffect(() => {
      const updateTranslateZ = () => {
        // 小屏幕：64px (w-16) -> 32px
        // 大屏幕：80px (md:w-20) -> 40px
        const isLargeScreen = window.matchMedia('(min-width: 768px)').matches;
        setTranslateZ(isLargeScreen ? 40 : 32);
      };

      updateTranslateZ();
      window.addEventListener('resize', updateTranslateZ);
      return () => window.removeEventListener('resize', updateTranslateZ);
    }, []);

    const finalRotations: Record<number, { x: number; y: number; z: number }> = {
      1: { x: 0, y: 0, z: 0 },          // 显示前面 (number=1)
      2: { x: 0, y: 180, z: 0 },        // 旋转180度显示后面 (number=2)
      3: { x: 0, y: -90, z: 0 },        // 向左转90度显示右面 (number=3)
      4: { x: 0, y: 90, z: 0 },         // 向右转90度显示左面 (number=4)
      5: { x: -90, y: 0, z: 0 },        // 向上转90度显示上面 (number=5)
      6: { x: 90, y: 0, z: 0 },         // 向下转90度显示下面 (number=6)
    };

    useEffect(() => {
      if (animationPhase === 'rolling') {
        setIsRolling(true);
        // 快速随机旋转1.5秒
        const interval = setInterval(() => {
          setRotation({
            x: Math.random() * 360,
            y: Math.random() * 360,
            z: Math.random() * 360,
          });
        }, 50);

        setTimeout(() => {
          clearInterval(interval);
          setIsRolling(false);
          // 根据结果设置最终旋转角度
          setRotation(finalRotations[value] || finalRotations[1]);
        }, 1500 + delay);
      }
    }, [animationPhase, value, delay]);

    // 当进入停下或展示阶段时保持正确面朝向（避免重新挂载后恢复到1点）
    useEffect(() => {
      if (animationPhase === 'stopped') {
        setIsRolling(false);
        setRotation(finalRotations[value] || finalRotations[1]);
      }
    }, [animationPhase, value]);

    return (
      <div 
        className="relative w-16 h-16 md:w-20 md:h-20" 
        style={{ perspective: '600px' }}
      >
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
            transition: isRolling ? 'none' : 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            animation: animationPhase === 'stopped' ? 'diceBounce 0.6s ease-out' : 'none',
            animationDelay: `${delay}ms`,
          }}
        >
          {/* 6个面 - translateZ 值为骰子边长的一半，确保面紧密贴合 */}
          <DiceFace number={1} position={`translateZ(${translateZ}px)`} />
          <DiceFace number={2} position={`rotateY(180deg) translateZ(${translateZ}px)`} />
          <DiceFace number={3} position={`rotateY(90deg) translateZ(${translateZ}px)`} />
          <DiceFace number={4} position={`rotateY(-90deg) translateZ(${translateZ}px)`} />
          <DiceFace number={5} position={`rotateX(90deg) translateZ(${translateZ}px)`} />
          <DiceFace number={6} position={`rotateX(-90deg) translateZ(${translateZ}px)`} />
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
        <div
          className="absolute inset-0 rounded-t-full opacity-90 shadow-xl"
          style={{
            background: 'linear-gradient(180deg, var(--gold-bright) 0%, var(--gold-dark) 100%)',
          }}
        />
        {/* 骰盅边缘高光 */}
        <div
          className="absolute inset-0 border-4 rounded-t-full"
          style={{
            borderColor: 'rgba(255, 215, 0, 0.3)',
          }}
        />
        {/* 骰盅装饰纹路 */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-20 h-1 rounded-full"
          style={{
            background: 'rgba(255, 215, 0, 0.5)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full"
          style={{
            background: 'rgba(255, 215, 0, 0.5)',
          }}
        />
      </div>
      {/* 底座 */}
      <div
        className="w-40 h-4 mx-auto mt-2 rounded-full shadow-lg"
        style={{
          background: 'linear-gradient(180deg, var(--gold-dark) 0%, #8B6914 100%)',
        }}
      />
    </div>
  );

  // 根据状态显示不同内容
  const renderContent = () => {
    if (gameState === 'betting' || animationPhase === 'idle') {
      // 待机状态 - 显示骰盅
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <DiceCup />
          <p
            className="mt-6 text-sm"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
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
          <p
            className="mt-6 text-base font-semibold animate-pulse"
            style={{ color: 'var(--gold-bright)' }}
          >
            摇骰中...
          </p>
        </div>
      );
    }

    if (animationPhase === 'rolling') {
      // 滚动阶段 - 显示3D滚动的骰子
      return (
        <div className="flex flex-col items-center justify-center h-full gap-8">
          <div className="flex gap-4">
            {diceResults.length === 3 ? (
              diceResults.map((value, idx) => (
                <Dice3D key={idx} value={value} delay={idx * 100} />
              ))
            ) : (
              // 默认显示三个骰子
              [4, 5, 6].map((value, idx) => (
                <Dice3D key={idx} value={value} delay={idx * 100} />
              ))
            )}
          </div>
          <p
            className="text-base font-semibold animate-pulse"
            style={{ color: 'var(--gold-bright)' }}
          >
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
              <Dice3D key={idx} value={value} delay={idx * 100} />
            ))}
          </div>

          {/* 总点数 */}
          <div className="text-center">
            <p
              className="text-6xl font-bold font-mono animate-scale-in"
              style={{
                color: 'var(--gold-bright)',
                textShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
              }}
            >
              {total}
            </p>
            <div className="flex gap-2 mt-3 justify-center">
              <span
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  background: isBig ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)' : 'rgba(107, 20, 20, 0.3)',
                  color: isBig ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                }}
              >
                大
              </span>
              <span
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  background: isSmall ? 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)' : 'rgba(107, 20, 20, 0.3)',
                  color: isSmall ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                }}
              >
                小
              </span>
              <span
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  background: isOdd ? 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)' : 'rgba(107, 20, 20, 0.3)',
                  color: isOdd ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                }}
              >
                单
              </span>
              <span
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  background: !isOdd ? 'linear-gradient(135deg, #10B981 0%, #047857 100%)' : 'rgba(107, 20, 20, 0.3)',
                  color: !isOdd ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                }}
              >
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
      <div className="w-full h-full">
        {renderContent()}
      </div>

      {/* CSS动画 */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        @keyframes diceBounce {
          0% { transform: rotateX(var(--final-x, 0deg)) rotateY(var(--final-y, 0deg)) rotateZ(var(--final-z, 0deg)) translateY(0); }
          50% { transform: rotateX(var(--final-x, 0deg)) rotateY(var(--final-y, 0deg)) rotateZ(var(--final-z, 0deg)) translateY(-10px); }
          75% { transform: rotateX(var(--final-x, 0deg)) rotateY(var(--final-y, 0deg)) rotateZ(var(--final-z, 0deg)) translateY(-5px); }
          100% { transform: rotateX(var(--final-x, 0deg)) rotateY(var(--final-y, 0deg)) rotateZ(var(--final-z, 0deg)) translateY(0); }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-shake {
          animation: shake 0.8s ease-in-out;
        }

        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
