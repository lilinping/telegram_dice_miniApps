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
   * 从上方快速盖下（需求文档：0.3s，轻微玻璃颤动感）
   */
  public coverDown(duration: number = 0.3, onComplete?: () => void) {
    this.timeline = gsap.timeline();
    
    // 初始位置（上方）- 确保可见
    this.cup.position.set(0, 10, 0);
    this.cup.visible = true;
    this.cup.rotation.set(0, 0, 0);

    // 快速盖下（需求文档：0.3s）
    this.timeline.to(this.cup.position, {
      y: 1.5, // 盖在骰子上方
      duration: duration * 0.8, // 80%时间用于下降
      ease: 'power2.out',
    });

    // 轻微玻璃颤动感（需求文档要求）
    this.timeline.to(this.cup.position, {
      y: 1.48,
      duration: duration * 0.1,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: 1,
    });

    this.timeline.call(() => {
      if (onComplete) onComplete();
    });

    return this.timeline;
  }

  /**
   * 摇盅动画
   * 圆周轨迹 + 随机噪声（需求文档：1.2-1.8s，圆周轨迹随机，加少量噪声）
   */
  public shake(duration: number = 1.5, onComplete?: () => void) {
    this.timeline = gsap.timeline();

    const radius = 0.8; // 圆周半径
    const rotations = 3.5; // 旋转圈数（增加圈数，更真实）
    const steps = 90; // 增加动画步数，更流畅

    // 生成圆周路径点（需求文档：圆周轨迹随机，加少量噪声）
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const angle = progress * Math.PI * 2 * rotations;
      
      // 圆周运动 + 随机噪声（需求文档要求）
      const noiseX = (Math.random() - 0.5) * 0.25; // 增加噪声幅度
      const noiseZ = (Math.random() - 0.5) * 0.25;
      const noiseY = Math.sin(progress * Math.PI * 6) * 0.15; // 更明显的上下微动
      
      const x = Math.cos(angle) * radius + noiseX;
      const z = Math.sin(angle) * radius + noiseZ;
      const y = 1.5 + noiseY;

      this.timeline.to(this.cup.position, {
        x: x,
        y: y,
        z: z,
        duration: duration / steps,
        ease: 'power1.inOut', // 更平滑的缓动
      }, i * (duration / steps));

      // 添加旋转（更真实的摇盅效果）
      const rotationY = angle * 0.15; // 增加旋转幅度
      const rotationX = Math.sin(progress * Math.PI * 4) * 0.1; // 添加X轴旋转
      const rotationZ = Math.cos(progress * Math.PI * 3) * 0.08; // 添加Z轴旋转
      
      this.timeline.to(this.cup.rotation, {
        x: rotationX,
        y: rotationY,
        z: rotationZ,
        duration: duration / steps,
        ease: 'power1.inOut',
      }, i * (duration / steps));
    }

    this.timeline.call(() => {
      if (onComplete) onComplete();
    });

    return this.timeline;
  }

  /**
   * 落盅动画
   * 快速落下，带弹跳（需求文档：0.2s，落下时骰子被带起，播放重低频"砰"声）
   */
  public drop(duration: number = 0.2, onComplete?: () => void) {
    this.timeline = gsap.timeline();

    // 回到中心（快速）
    this.timeline.to(this.cup.position, {
      x: 0,
      z: 0,
      duration: duration * 0.2,
      ease: 'power2.in',
    });

    // 落下（需求文档：0.2s，带弹跳效果）
    this.timeline.to(this.cup.position, {
      y: 0.8,
      duration: duration * 0.8,
      ease: 'power3.out', // 更强的弹跳感
      onComplete: () => {
        // 轻微回弹（模拟落地后的微小弹跳）
        gsap.to(this.cup.position, {
          y: 0.82,
          duration: 0.05,
          ease: 'power1.out',
          yoyo: true,
          repeat: 1,
        });
        
        if (onComplete) onComplete();
      },
    });

    return this.timeline;
  }

  /**
   * 抬盅动画
   * 平滑提起，展示结果（需求文档：1s，平滑提起，玻璃折射变化，让画面更高级）
   */
  public lift(duration: number = 1.0, onComplete?: () => void) {
    this.timeline = gsap.timeline();

    // 先微微震动（模拟抬起的准备动作）
    this.timeline.to(this.cup.position, {
      y: 0.9,
      duration: 0.1,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: 1,
    });

    // 平滑抬起（需求文档：1s，平滑提起）
    // 添加旋转，增强玻璃折射变化效果
    this.timeline.to(this.cup.position, {
      y: 10,
      duration: duration,
      ease: 'power2.in',
    }, '<');

    // 同时添加旋转，让玻璃折射变化更明显（需求文档：玻璃折射变化）
    this.timeline.to(this.cup.rotation, {
      y: this.cup.rotation.y + Math.PI * 0.3, // 旋转30度
      duration: duration,
      ease: 'power2.in',
    }, '<');

    this.timeline.call(() => {
      this.cup.visible = false;
      if (onComplete) onComplete();
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
