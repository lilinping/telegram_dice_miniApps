/**
 * 筛盅动画控制
 * 使用GSAP实现流畅的筛盅动画
 */

import * as THREE from 'three';
import gsap from 'gsap';

export interface CupAnimationCallbacks {
  onCoverComplete?: () => void;
  onShakeComplete?: () => void;
  onDropComplete?: () => void;
  onLiftComplete?: () => void;
}

export class CupAnimationController {
  private cup: THREE.Group;
  private timeline: gsap.core.Timeline | null = null;

  constructor(cup: THREE.Group) {
    this.cup = cup;
  }

  /**
   * 盖盅动画
   * 从上方快速盖下
   */
  public coverDown(duration: number = 0.3, onComplete?: () => void) {
    this.timeline = gsap.timeline();
    
    // 初始位置（上方）
    this.cup.position.y = 10;
    this.cup.visible = true;

    this.timeline.to(this.cup.position, {
      y: 1.5, // 盖在骰子上方
      duration: duration,
      ease: 'power2.out',
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    return this.timeline;
  }

  /**
   * 摇盅动画
   * 圆周轨迹 + 随机噪声
   */
  public shake(duration: number = 1.5, onComplete?: () => void) {
    this.timeline = gsap.timeline();

    const radius = 0.8; // 圆周半径
    const rotations = 3; // 旋转圈数
    const steps = 60; // 动画步数

    // 生成圆周路径点
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const angle = progress * Math.PI * 2 * rotations;
      
      // 圆周运动 + 随机噪声
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.2;
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.2;
      const y = 1.5 + Math.sin(progress * Math.PI * 4) * 0.1; // 上下微动

      this.timeline.to(this.cup.position, {
        x: x,
        y: y,
        z: z,
        duration: duration / steps,
        ease: 'none',
      }, i * (duration / steps));

      // 添加轻微旋转
      this.timeline.to(this.cup.rotation, {
        y: angle * 0.1,
        duration: duration / steps,
        ease: 'none',
      }, i * (duration / steps));
    }

    this.timeline.call(() => {
      if (onComplete) onComplete();
    });

    return this.timeline;
  }

  /**
   * 落盅动画
   * 快速落下，带弹跳
   */
  public drop(duration: number = 0.2, onComplete?: () => void) {
    this.timeline = gsap.timeline();

    // 回到中心
    this.timeline.to(this.cup.position, {
      x: 0,
      z: 0,
      duration: duration * 0.3,
      ease: 'power1.in',
    });

    // 落下
    this.timeline.to(this.cup.position, {
      y: 0.8,
      duration: duration * 0.7,
      ease: 'bounce.out',
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    return this.timeline;
  }

  /**
   * 抬盅动画
   * 平滑提起，展示结果
   */
  public lift(duration: number = 1.0, onComplete?: () => void) {
    this.timeline = gsap.timeline();

    // 先微微震动
    this.timeline.to(this.cup.position, {
      y: 0.9,
      duration: 0.1,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: 1,
    });

    // 平滑抬起
    this.timeline.to(this.cup.position, {
      y: 10,
      duration: duration,
      ease: 'power2.in',
      onComplete: () => {
        this.cup.visible = false;
        if (onComplete) onComplete();
      },
    });

    return this.timeline;
  }

  /**
   * 停止当前动画
   */
  public stop() {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
  }

  /**
   * 重置筛盅位置
   */
  public reset() {
    this.stop();
    this.cup.position.set(0, 10, 0);
    this.cup.rotation.set(0, 0, 0);
    this.cup.visible = false;
  }
}
