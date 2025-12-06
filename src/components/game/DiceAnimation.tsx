'use client';

import { useEffect, useState, useRef } from 'react';
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
  winAmount?: number; // 中奖金额
  hasWon?: boolean; // 是否中奖
}

// 骰子旋转角度映射（定义在组件外部，避免重复创建）
const FINAL_ROTATIONS: Record<number, { x: number; y: number; z: number }> = {
  1: { x: 0, y: 0, z: 0 },          // 显示前面 (number=1)
  2: { x: 0, y: 180, z: 0 },        // 旋转180度显示后面 (number=2)
  3: { x: 0, y: -90, z: 0 },        // 向左转90度显示右面 (number=3)
  4: { x: 0, y: 90, z: 0 },         // 向右转90度显示左面 (number=4)
  5: { x: -90, y: 0, z: 0 },        // 向上转90度显示上面 (number=5)
  6: { x: 90, y: 0, z: 0 },         // 向下转90度显示下面 (number=6)
};

export default function DiceAnimation({ fullscreen = false, winAmount = 0, hasWon = false }: DiceAnimationProps) {
  const { gameState, diceResults } = useGame();
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'shaking' | 'rolling' | 'stopped'>('idle');

  // 调试：监控diceResults变化
  useEffect(() => {
    if (diceResults.length > 0) {
      console.log('DiceAnimation - diceResults更新:', diceResults);
    }
  }, [diceResults]);

  // 调试：监控中奖信息变化
  useEffect(() => {
    if (fullscreen) {
      console.log('🎲 DiceAnimation (fullscreen) - hasWon:', hasWon, 'winAmount:', winAmount);
    }
  }, [fullscreen, hasWon, winAmount]);

  // 根据游戏状态更新动画阶段
  useEffect(() => {
    if (gameState === 'betting') {
      setAnimationPhase('idle');
    } else if (gameState === 'rolling') {
      // 直接进入rolling，不显示骰盅
      setAnimationPhase('rolling');
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
    // 初始rotation设置为value对应的角度（静态组件立即显示正确面）
    const [rotation, setRotation] = useState(() => FINAL_ROTATIONS[value] || FINAL_ROTATIONS[1]);
    const [isRolling, setIsRolling] = useState(false);
    const [translateZ, setTranslateZ] = useState(32); // 默认 32px (64px / 2)
    
    // 使用ref保存最新的value，避免闭包问题
    const valueRef = useRef(value);
    // 使用ref保存定时器引用，用于清理
    const timersRef = useRef<{
      fastInterval?: NodeJS.Timeout;
      phaseTimeout?: NodeJS.Timeout;
      convergenceInterval?: NodeJS.Timeout;
      finalTimeout?: NodeJS.Timeout;
    }>({});
    // 使用ref记录是否已经处理过stopped状态，避免重复执行
    const stoppedHandledRef = useRef(false);
    
    useEffect(() => {
      valueRef.current = value;
      // 只在idle状态更新rotation（用于静态组件）
      // rolling和stopped阶段有专门的动画逻辑，不要在这里设置
      if (animationPhase === 'idle') {
        const targetRot = FINAL_ROTATIONS[value] || FINAL_ROTATIONS[1];
        setRotation(targetRot);
      }
    }, [value]);

    // 调试：输出当前骰子的值（已注释，减少控制台输出）
    // useEffect(() => {
    //   console.log('Dice3D - 收到value:', value, '延迟:', delay);
    // }, [value, delay]);

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

    useEffect(() => {
      if (animationPhase === 'rolling') {
        setIsRolling(true);
        const currentValue = valueRef.current;
        const targetRotation = FINAL_ROTATIONS[currentValue] || FINAL_ROTATIONS[1];
        
        // 第一阶段：快速随机旋转1.2秒
        timersRef.current.fastInterval = setInterval(() => {
          setRotation({
            x: Math.random() * 360,
            y: Math.random() * 360,
            z: Math.random() * 360,
          });
        }, 50);

        // 1.2秒后进入收敛阶段
        timersRef.current.phaseTimeout = setTimeout(() => {
          if (timersRef.current.fastInterval) {
            clearInterval(timersRef.current.fastInterval);
          }
          
          // 第二阶段：逐渐收敛到目标角度（0.6秒）
          // 使用更小的随机范围，围绕目标角度波动
          let convergenceStep = 0;
          timersRef.current.convergenceInterval = setInterval(() => {
            convergenceStep++;
            // 随着时间推移，随机范围逐渐缩小（从±80度到±5度）
            const range = Math.max(5, 80 - convergenceStep * 10);
            setRotation({
              x: targetRotation.x + (Math.random() - 0.5) * range,
              y: targetRotation.y + (Math.random() - 0.5) * range,
              z: targetRotation.z + (Math.random() - 0.5) * range,
            });
          }, 75); // 0.6秒内执行8次

          // 0.6秒后完全停止，设置精确角度
          timersRef.current.finalTimeout = setTimeout(() => {
            if (timersRef.current.convergenceInterval) {
              clearInterval(timersRef.current.convergenceInterval);
            }
            setIsRolling(false);
            // 设置精确的最终角度
            setRotation(targetRotation);
          }, 600);
        }, 1200 + delay);
      }
      
      // Cleanup函数：清理所有定时器
      return () => {
        if (timersRef.current.fastInterval) {
          clearInterval(timersRef.current.fastInterval);
        }
        if (timersRef.current.phaseTimeout) {
          clearTimeout(timersRef.current.phaseTimeout);
        }
        if (timersRef.current.convergenceInterval) {
          clearInterval(timersRef.current.convergenceInterval);
        }
        if (timersRef.current.finalTimeout) {
          clearTimeout(timersRef.current.finalTimeout);
        }
      };
    }, [animationPhase, delay]); // 移除value依赖，避免value变化时重新触发动画

    // 当进入stopped阶段时保持正确面朝向
    useEffect(() => {
      if (animationPhase === 'stopped' && !stoppedHandledRef.current) {
        stoppedHandledRef.current = true;
        setIsRolling(false);
        // 使用ref获取最新值
        const currentValue = valueRef.current;
        const targetRot = FINAL_ROTATIONS[currentValue] || FINAL_ROTATIONS[1];
        setRotation(targetRot);
      } else if (animationPhase !== 'stopped') {
        // 离开stopped状态时重置标记
        stoppedHandledRef.current = false;
      }
    }, [animationPhase]); // 只依赖animationPhase，不依赖value

    const shouldBounce = animationPhase === 'stopped';

    return (
      <div 
        className="relative w-16 h-16 md:w-20 md:h-20" 
        style={{ perspective: '600px' }}
      >
        <div
          className={shouldBounce ? 'dice-bounce-wrapper' : ''}
          style={{
            width: '100%',
            height: '100%',
            animationDelay: shouldBounce ? `${delay}ms` : undefined,
          }}
        >
          <div
            className="relative w-full h-full"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
              // idle状态不需要transition，立即显示；只有rolling阶段结束时需要平滑过渡
              transition: isRolling ? 'none' : (animationPhase === 'idle' ? 'none' : 'transform 0.5s ease-out'),
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
    // 骰子值：优先使用diceResults，否则显示默认值
    const displayDice = diceResults.length === 3 ? diceResults : [1, 1, 1];
    const baseWrapperClass = `flex flex-col items-center h-full ${fullscreen ? 'justify-center' : ''}`;
    const baseSpacing = {
      paddingTop: fullscreen ? '0px' : '12px',
      paddingBottom: fullscreen ? '0px' : '10px',
    };

    if (gameState === 'betting' || animationPhase === 'idle') {
      // 待机状态 - 使用稳定的key，不切换组件
      return (
        <div className={baseWrapperClass} style={{ ...baseSpacing, gap: fullscreen ? '20px' : '12px' }}>
          <div className="flex gap-4">
            {displayDice.map((value, idx) => (
              <Dice3D key={`dice-${idx}`} value={value} delay={0} />
            ))}
          </div>
          {/* <p
            className="text-sm"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            {gameState === 'betting' ? '请下注' : '准备开始'}
          </p> */}
        </div>
      );
    }

    // 取消shaking阶段，直接进入rolling

    if (animationPhase === 'rolling') {
      // 滚动阶段 - 显示进度条和骰子滚动
      return (
        <div className={baseWrapperClass} style={{ ...baseSpacing, gap: fullscreen ? '20px' : '16px' }}>
          {/* 进度条 */}
          <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600"
              style={{
                animation: 'progressBar 2.3s ease-out forwards',
              }}
            />
          </div>
          
          {/* 骰子滚动 */}
          <div className="flex gap-4">
            {displayDice.map((value, idx) => (
              <Dice3D key={`dice-${idx}`} value={value} delay={idx * 100} />
            ))}
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
      // 停止阶段 - 继续使用相同的key，保持组件实例
      const total = diceResults.reduce((sum, val) => sum + val, 0);
      const isBig = total >= 11 && total <= 17;
      const isSmall = total >= 4 && total <= 10;
      const isOdd = total % 2 === 1;

      return (
        <div className={baseWrapperClass} style={{ ...baseSpacing, gap: fullscreen ? '20px' : '16px' }}>
          {/* 下注结果提示 */}
          <div className="text-center animate-fade-in">
            <p className="text-lg font-bold" style={{ color: 'var(--gold-bright)' }}>
              开奖结果
            </p>
          </div>

          {/* 骰子结果 - 使用相同的key，保持组件实例不变 */}
          <div className="flex gap-4">
            {diceResults.map((value, idx) => (
              <Dice3D key={`dice-${idx}`} value={value} delay={idx * 100} />
            ))}
          </div>

          {/* 总点数 */}
          <div className="text-center">
            <p
              className="text-5xl md:text-6xl font-bold font-mono animate-scale-in"
              style={{
                color: 'var(--gold-bright)',
                textShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
                lineHeight: '1.2',
              }}
            >
              {total}
            </p>
            
            {/* 输赢提示 */}
            {fullscreen && (
              <div className="mt-4 animate-fade-in">
                {hasWon && winAmount > 0 ? (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-2xl font-bold" style={{ color: '#10B981' }}>
                      🎉 恭喜中奖！
                    </p>
                    <p className="text-3xl font-bold font-mono" style={{ 
                      color: 'var(--gold-bright)',
                      textShadow: '0 0 16px rgba(255, 215, 0, 0.8)',
                    }}>
                      +${winAmount.toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p className="text-xl font-semibold" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    未中奖，再接再厉
                  </p>
                )}
              </div>
            )}
            
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

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progressBar {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-shake {
          animation: shake 0.8s ease-in-out;
        }

        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .dice-bounce-wrapper {
          display: inline-block;
          animation: diceBounce 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
