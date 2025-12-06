/**
 * Three.js + Cannon-es 骰子动画组件
 * 真实物理模拟 + 玻璃筛盅效果
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { DiceScene } from '@/lib/three/scene';
import { PhysicsWorld } from '@/lib/physics/world';
import { createDice, createDiceCup, createCupBase, setDiceRotationForNumber } from '@/lib/three/models';
import { createDiceBody, throwDice, isDiceStopped, getDiceUpNumber, correctDiceToNumber } from '@/lib/physics/bodies';
import { CupAnimationController } from '@/lib/animations/cupAnimation';
import { DiceSoundManager, SimpleSoundGenerator } from '@/lib/sounds/diceSound';
import { detectDevicePerformance, getOptimizedSettings, FPSMonitor } from '@/lib/utils/performance';

interface DiceAnimationThreeProps {
  fullscreen?: boolean;
  winAmount?: number;
  hasWon?: boolean;
}

type AnimationPhase = 
  | 'idle'
  | 'cover_down'
  | 'cup_shake'
  | 'cup_drop'
  | 'dice_physics'
  | 'result_correct'
  | 'cup_up'
  | 'result_show';

export default function DiceAnimationThree({ 
  fullscreen = false, 
  winAmount = 0, 
  hasWon = false 
}: DiceAnimationThreeProps) {
  const { gameState, diceResults } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Three.js 和物理引擎实例
  const sceneRef = useRef<DiceScene | null>(null);
  const physicsRef = useRef<PhysicsWorld | null>(null);
  const cupAnimationRef = useRef<CupAnimationController | null>(null);
  const soundManagerRef = useRef<DiceSoundManager | null>(null);
  const simpleSoundRef = useRef<SimpleSoundGenerator | null>(null);
  
  // 3D对象引用
  const diceGroupsRef = useRef<THREE.Group[]>([]);
  const diceBodiesRef = useRef<CANNON.Body[]>([]);
  const cupRef = useRef<THREE.Group | null>(null);
  
  // 动画状态
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('idle');
  const animationFrameRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  
  // 性能监控
  const [fps, setFps] = useState<number>(60);
  const fpsMonitorRef = useRef<FPSMonitor | null>(null);
  
  // 初始化Three.js场景
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // 检测设备性能
    const devicePerf = detectDevicePerformance();
    const settings = getOptimizedSettings(devicePerf);
    
    console.log('🎮 设备性能:', devicePerf.tier, '渲染器:', devicePerf.renderer);
    console.log('⚙️ 优化设置:', settings);

    // 创建场景
    const scene = new DiceScene({
      canvas,
      width: rect.width,
      height: rect.height,
    });
    
    // 应用性能优化设置
    scene.renderer.setPixelRatio(settings.pixelRatio);
    if (settings.shadowMapSize) {
      scene.renderer.shadowMap.enabled = true;
    }
    
    sceneRef.current = scene;

    // 创建物理世界
    const physics = new PhysicsWorld();
    physicsRef.current = physics;

    // 创建三颗骰子
    for (let i = 0; i < 3; i++) {
      const dice = createDice(1);
      dice.position.set((i - 1) * 1.5, 5, 0);
      scene.scene.add(dice);
      diceGroupsRef.current.push(dice);

      const body = createDiceBody(1, dice.position);
      physics.world.addBody(body);
      diceBodiesRef.current.push(body);
    }

    // 创建筛盅
    const cup = createDiceCup(2.5, 3);
    cup.position.set(0, 10, 0);
    cup.visible = false;
    scene.scene.add(cup);
    cupRef.current = cup;

    // 创建筛盅动画控制器
    cupAnimationRef.current = new CupAnimationController(cup);

    // 创建声效管理器
    soundManagerRef.current = new DiceSoundManager();
    simpleSoundRef.current = new SimpleSoundGenerator();

    // 创建FPS监控器
    fpsMonitorRef.current = new FPSMonitor((currentFps) => {
      setFps(currentFps);
      
      // 如果FPS过低，自动降低画质
      if (currentFps < 30 && settings.pixelRatio > 1) {
        console.warn('⚠️ FPS过低，降低画质');
        scene.renderer.setPixelRatio(1);
      }
    });

    // 创建底座
    const base = createCupBase(3);
    base.position.y = 0.15;
    scene.scene.add(base);

    // 窗口大小调整
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      scene.resize(rect.width, rect.height);
    };
    window.addEventListener('resize', handleResize);

    // 渲染循环
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      const deltaTime = clockRef.current.getDelta();
      
      // 更新FPS监控
      fpsMonitorRef.current?.update();
      
      // 更新物理世界
      physics.step(deltaTime);
      
      // 同步Three.js对象和物理刚体
      diceGroupsRef.current.forEach((dice, index) => {
        const body = diceBodiesRef.current[index];
        dice.position.copy(body.position as any);
        dice.quaternion.copy(body.quaternion as any);
      });
      
      // 渲染场景
      scene.render();
    };
    animate();

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
      scene.dispose();
      soundManagerRef.current?.dispose();
    };
  }, []);

  // 根据游戏状态控制动画
  useEffect(() => {
    if (gameState === 'betting') {
      setAnimationPhase('idle');
      resetAnimation();
    } else if (gameState === 'rolling') {
      startRollingAnimation();
    } else if (gameState === 'revealing') {
      // 物理模拟完成，等待结果校正
    }
  }, [gameState]);

  // 重置动画
  const resetAnimation = () => {
    if (!physicsRef.current || !cupAnimationRef.current) return;

    // 重置筛盅
    cupAnimationRef.current.reset();

    // 重置骰子位置
    diceGroupsRef.current.forEach((dice, index) => {
      const body = diceBodiesRef.current[index];
      
      // 设置初始位置
      dice.position.set((index - 1) * 1.5, 2, 0);
      body.position.set((index - 1) * 1.5, 2, 0);
      
      // 设置初始旋转（显示结果）
      if (diceResults.length === 3) {
        setDiceRotationForNumber(dice, diceResults[index]);
        const targetQuat = correctDiceToNumber(body, diceResults[index]);
        body.quaternion.copy(targetQuat);
      }
      
      // 清除速度
      body.velocity.setZero();
      body.angularVelocity.setZero();
    });
  };

  // 开始滚动动画
  const startRollingAnimation = async () => {
    if (!cupAnimationRef.current || !physicsRef.current) return;

    console.log('🎲 开始骰子动画流程');

    // 阶段1：盖盅
    setAnimationPhase('cover_down');
    simpleSoundRef.current?.playDrop(); // 简单音效
    await new Promise<void>((resolve) => {
      cupAnimationRef.current!.coverDown(0.3, resolve);
    });

    // 阶段2：摇盅
    setAnimationPhase('cup_shake');
    soundManagerRef.current?.playCupShake(); // 开始摇盅声
    await new Promise<void>((resolve) => {
      cupAnimationRef.current!.shake(1.5, resolve);
    });
    soundManagerRef.current?.stopCupShake(); // 停止摇盅声

    // 阶段3：落盅
    setAnimationPhase('cup_drop');
    soundManagerRef.current?.playCupDrop(); // 落盅声
    simpleSoundRef.current?.playDrop();
    await new Promise<void>((resolve) => {
      cupAnimationRef.current!.drop(0.2, resolve);
    });

    // 阶段4：骰子物理模拟
    setAnimationPhase('dice_physics');
    
    // 给骰子施加随机力
    diceBodiesRef.current.forEach((body) => {
      throwDice(body, 5);
    });

    // 监听碰撞并播放音效
    startCollisionSoundMonitoring();

    // 等待骰子停稳
    await waitForDiceStop();

    // 停止碰撞音效监听
    stopCollisionSoundMonitoring();

    // 阶段5：结果校正
    setAnimationPhase('result_correct');
    await correctDiceResults();

    // 阶段6：抬盅
    setAnimationPhase('cup_up');
    soundManagerRef.current?.playCupLift(); // 抬盅声
    await new Promise<void>((resolve) => {
      cupAnimationRef.current!.lift(1.0, resolve);
    });

    // 阶段7：展示结果
    setAnimationPhase('result_show');
    soundManagerRef.current?.playResultShow(); // 结果音效
    console.log('🎲 动画流程完成');
  };

  // 碰撞音效监听
  const collisionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const startCollisionSoundMonitoring = () => {
    collisionIntervalRef.current = setInterval(() => {
      diceBodiesRef.current.forEach((body) => {
        const velocity = body.velocity.length();
        if (velocity > 1) {
          // 根据速度计算碰撞强度
          const intensity = Math.min(velocity / 10, 1);
          simpleSoundRef.current?.playCollision(intensity);
        }
      });
    }, 100); // 每100ms检查一次
  };

  const stopCollisionSoundMonitoring = () => {
    if (collisionIntervalRef.current) {
      clearInterval(collisionIntervalRef.current);
      collisionIntervalRef.current = null;
    }
  };

  // 等待骰子停稳
  const waitForDiceStop = (): Promise<void> => {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const allStopped = diceBodiesRef.current.every((body) => 
          isDiceStopped(body, 0.1)
        );

        if (allStopped) {
          clearInterval(checkInterval);
          console.log('🎲 骰子已停稳');
          resolve();
        }
      }, 100);

      // 超时保护（3秒）
      setTimeout(() => {
        clearInterval(checkInterval);
        console.log('🎲 骰子停稳超时，强制继续');
        resolve();
      }, 3000);
    });
  };

  // 校正骰子结果
  const correctDiceResults = async () => {
    if (diceResults.length !== 3) return;

    console.log('🎲 校正骰子结果:', diceResults);

    // 平滑过渡到目标旋转
    const duration = 0.2;
    const startTime = Date.now();

    await new Promise<void>((resolve) => {
      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);

        diceGroupsRef.current.forEach((dice, index) => {
          const body = diceBodiesRef.current[index];
          const targetNumber = diceResults[index];
          
          // 获取目标旋转
          const targetQuat = correctDiceToNumber(body, targetNumber);
          
          // 插值
          body.quaternion.slerp(targetQuat, progress * 0.5);
          
          // 停止运动
          body.velocity.setZero();
          body.angularVelocity.setZero();
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });
  };

  return (
    <div 
      ref={containerRef}
      className={fullscreen ? 'w-screen h-screen' : 'w-full h-full'}
      style={{ position: 'relative' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
      
      {/* FPS显示（开发模式） */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '5px 10px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: fps >= 50 ? '#10B981' : fps >= 30 ? '#F59E0B' : '#EF4444',
            fontSize: '14px',
            fontFamily: 'monospace',
            borderRadius: '4px',
          }}
        >
          FPS: {fps}
        </div>
      )}

      {/* 状态提示 */}
      {animationPhase !== 'idle' && (
        <div 
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'var(--gold-bright)',
            fontSize: '18px',
            fontWeight: 'bold',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
          }}
        >
          {animationPhase === 'cover_down' && '盖盅中...'}
          {animationPhase === 'cup_shake' && '摇盅中...'}
          {animationPhase === 'cup_drop' && '落盅中...'}
          {animationPhase === 'dice_physics' && '开奖中...'}
          {animationPhase === 'cup_up' && '抬盅中...'}
          {animationPhase === 'result_show' && '开奖结果'}
        </div>
      )}

      {/* 结果展示 */}
      {animationPhase === 'result_show' && diceResults.length === 3 && (
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'var(--gold-bright)',
              textShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
              marginBottom: '10px',
            }}
          >
            {diceResults.reduce((sum, val) => sum + val, 0)}
          </div>
          
          {fullscreen && hasWon && winAmount > 0 && (
            <div style={{ color: '#10B981', fontSize: '24px', fontWeight: 'bold' }}>
              🎉 恭喜中奖！+${winAmount.toFixed(2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
