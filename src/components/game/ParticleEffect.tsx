'use client';

import { useEffect, useRef } from 'react';

/**
 * 粒子特效组件
 *
 * 使用 Canvas 实现:
 * 1. 金币粒子从中奖格飞向余额区
 * 2. 大额中奖礼花效果
 * 3. 筹码飞入光尾粒子
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
}

interface ParticleEffectProps {
  type: 'coin' | 'confetti' | 'sparkle';
  sourceX: number;
  sourceY: number;
  targetX?: number;
  targetY?: number;
  count?: number;
  duration?: number;
  onComplete?: () => void;
}

export default function ParticleEffect({
  type,
  sourceX,
  sourceY,
  targetX,
  targetY,
  count = 20,
  duration = 2000,
  onComplete,
}: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 Canvas 尺寸
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    let animationId: number;

    // 创建粒子
    const createParticles = () => {
      if (type === 'coin') {
        // 金币粒子 - 从源点飞向目标点
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
          const speed = 2 + Math.random() * 3;
          particles.push({
            x: sourceX,
            y: sourceY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 8 + Math.random() * 8,
            life: 0,
            maxLife: duration,
            color: '#FFD700',
            alpha: 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
          });
        }
      } else if (type === 'confetti') {
        // 礼花粒子 - 向上爆发
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 5 + Math.random() * 10;
          particles.push({
            x: sourceX,
            y: sourceY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 5,
            size: 6 + Math.random() * 6,
            life: 0,
            maxLife: duration,
            color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][
              Math.floor(Math.random() * 5)
            ],
            alpha: 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.3,
          });
        }
      } else if (type === 'sparkle') {
        // 闪烁粒子 - 小范围扩散
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 2;
          particles.push({
            x: sourceX,
            y: sourceY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 3,
            life: 0,
            maxLife: duration * 0.5,
            color: '#FFD700',
            alpha: 1,
            rotation: 0,
            rotationSpeed: 0,
          });
        }
      }
    };

    // 更新粒子
    const updateParticles = () => {
      particles.forEach((p) => {
        p.life += 16; // 约 60fps

        if (type === 'coin' && targetX !== undefined && targetY !== undefined) {
          // 金币粒子向目标点移动
          const dx = targetX - p.x;
          const dy = targetY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 5) {
            p.vx += (dx / dist) * 0.5;
            p.vy += (dy / dist) * 0.5;
          }
        } else if (type === 'confetti') {
          // 礼花粒子受重力影响
          p.vy += 0.3;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // 渐隐效果
        const progress = p.life / p.maxLife;
        p.alpha = 1 - progress;
      });

      // 移除过期粒子
      for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].life >= particles[i].maxLife) {
          particles.splice(i, 1);
        }
      }
    };

    // 渲染粒子
    const renderParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (type === 'coin') {
          // 绘制金币
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();

          // 金币高光
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.beginPath();
          ctx.arc(-p.size / 3, -p.size / 3, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (type === 'confetti') {
          // 绘制彩纸
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        } else if (type === 'sparkle') {
          // 绘制星星
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * p.size;
            const y = Math.sin(angle) * p.size;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            const innerAngle = angle + Math.PI / 5;
            const innerX = Math.cos(innerAngle) * (p.size / 2);
            const innerY = Math.sin(innerAngle) * (p.size / 2);
            ctx.lineTo(innerX, innerY);
          }
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });
    };

    // 动画循环
    const animate = () => {
      updateParticles();
      renderParticles();

      if (particles.length > 0) {
        animationId = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    createParticles();
    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [type, sourceX, sourceY, targetX, targetY, count, duration, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[90]"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

/**
 * 粒子特效 Hook
 *
 * 使用方法:
 * const { triggerCoinEffect, triggerConfettiEffect } = useParticleEffects();
 * triggerCoinEffect(sourceX, sourceY, targetX, targetY);
 */
export function useParticleEffects() {
  const [effect, setEffect] = useState<ParticleEffectProps | null>(null);

  const triggerCoinEffect = (sourceX: number, sourceY: number, targetX: number, targetY: number) => {
    setEffect({
      type: 'coin',
      sourceX,
      sourceY,
      targetX,
      targetY,
      count: 30,
      duration: 1500,
      onComplete: () => setEffect(null),
    });
  };

  const triggerConfettiEffect = (sourceX: number, sourceY: number) => {
    setEffect({
      type: 'confetti',
      sourceX,
      sourceY,
      count: 50,
      duration: 3000,
      onComplete: () => setEffect(null),
    });
  };

  const triggerSparkleEffect = (sourceX: number, sourceY: number) => {
    setEffect({
      type: 'sparkle',
      sourceX,
      sourceY,
      count: 20,
      duration: 800,
      onComplete: () => setEffect(null),
    });
  };

  return {
    effect,
    triggerCoinEffect,
    triggerConfettiEffect,
    triggerSparkleEffect,
  };
}

// 导入useState
import { useState } from 'react';
