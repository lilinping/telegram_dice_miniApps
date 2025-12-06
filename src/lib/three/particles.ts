/**
 * Three.js 粒子系统
 * 骰子落地粉尘、中奖特效等
 */

import * as THREE from 'three';

/**
 * 创建骰子落地粉尘效果
 */
export class DustParticles {
  private particles: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private velocities: Float32Array;
  private lifetimes: Float32Array;
  private maxLifetime: number = 1.0; // 1秒生命周期
  private particleCount: number;

  constructor(particleCount: number = 50) {
    this.particleCount = particleCount;

    // 创建几何体
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // 初始化粒子属性
    this.velocities = new Float32Array(particleCount * 3);
    this.lifetimes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // 初始位置（会在触发时更新）
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      // 颜色（灰白色粉尘）
      colors[i * 3] = 0.8 + Math.random() * 0.2;
      colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;

      // 大小
      sizes[i] = 0.1 + Math.random() * 0.2;

      // 生命周期（初始为0，未激活）
      this.lifetimes[i] = 0;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // 创建材质
    this.material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // 创建粒子系统
    this.particles = new THREE.Points(this.geometry, this.material);
    this.particles.visible = false;
  }

  /**
   * 触发粉尘效果
   */
  public trigger(position: THREE.Vector3) {
    const positions = this.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < this.particleCount; i++) {
      // 设置初始位置
      positions[i * 3] = position.x + (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = position.y + Math.random() * 0.2;
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.5;

      // 设置速度（向外扩散）
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.0;
      this.velocities[i * 3] = Math.cos(angle) * speed;
      this.velocities[i * 3 + 1] = 1.0 + Math.random() * 1.5; // 向上
      this.velocities[i * 3 + 2] = Math.sin(angle) * speed;

      // 重置生命周期
      this.lifetimes[i] = this.maxLifetime;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.particles.visible = true;
  }

  /**
   * 更新粒子
   */
  public update(deltaTime: number) {
    if (!this.particles.visible) return;

    const positions = this.geometry.attributes.position.array as Float32Array;
    let anyAlive = false;

    for (let i = 0; i < this.particleCount; i++) {
      if (this.lifetimes[i] > 0) {
        anyAlive = true;

        // 更新位置
        positions[i * 3] += this.velocities[i * 3] * deltaTime;
        positions[i * 3 + 1] += this.velocities[i * 3 + 1] * deltaTime;
        positions[i * 3 + 2] += this.velocities[i * 3 + 2] * deltaTime;

        // 应用重力
        this.velocities[i * 3 + 1] -= 2.0 * deltaTime;

        // 减少生命周期
        this.lifetimes[i] -= deltaTime;

        // 根据生命周期调整透明度
        const lifeRatio = this.lifetimes[i] / this.maxLifetime;
        this.material.opacity = 0.6 * lifeRatio;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;

    // 如果所有粒子都死亡，隐藏粒子系统
    if (!anyAlive) {
      this.particles.visible = false;
    }
  }

  public getObject(): THREE.Points {
    return this.particles;
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

/**
 * 创建中奖光效
 */
export class WinSparkles {
  private particles: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private velocities: Float32Array;
  private lifetimes: Float32Array;
  private maxLifetime: number = 2.0;
  private particleCount: number;
  private time: number = 0;

  constructor(particleCount: number = 100) {
    this.particleCount = particleCount;

    // 创建几何体
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    this.velocities = new Float32Array(particleCount * 3);
    this.lifetimes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      // 金色闪光
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
      colors[i * 3 + 2] = 0.0;

      sizes[i] = 0.2 + Math.random() * 0.3;
      this.lifetimes[i] = 0;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // 创建材质（发光效果）
    this.material = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particles = new THREE.Points(this.geometry, this.material);
    this.particles.visible = false;
  }

  /**
   * 触发中奖特效
   */
  public trigger(position: THREE.Vector3) {
    const positions = this.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < this.particleCount; i++) {
      // 圆形扩散
      const angle = (i / this.particleCount) * Math.PI * 2;
      const radius = 0.5 + Math.random() * 0.5;

      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y + 1.0;
      positions[i * 3 + 2] = position.z;

      // 向外扩散的速度
      this.velocities[i * 3] = Math.cos(angle) * radius * 2;
      this.velocities[i * 3 + 1] = 2.0 + Math.random() * 2.0;
      this.velocities[i * 3 + 2] = Math.sin(angle) * radius * 2;

      this.lifetimes[i] = this.maxLifetime * (0.5 + Math.random() * 0.5);
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.particles.visible = true;
    this.time = 0;
  }

  /**
   * 更新粒子
   */
  public update(deltaTime: number) {
    if (!this.particles.visible) return;

    this.time += deltaTime;
    const positions = this.geometry.attributes.position.array as Float32Array;
    const sizes = this.geometry.attributes.size.array as Float32Array;
    let anyAlive = false;

    for (let i = 0; i < this.particleCount; i++) {
      if (this.lifetimes[i] > 0) {
        anyAlive = true;

        // 更新位置
        positions[i * 3] += this.velocities[i * 3] * deltaTime;
        positions[i * 3 + 1] += this.velocities[i * 3 + 1] * deltaTime;
        positions[i * 3 + 2] += this.velocities[i * 3 + 2] * deltaTime;

        // 轻微重力
        this.velocities[i * 3 + 1] -= 1.0 * deltaTime;

        // 减少生命周期
        this.lifetimes[i] -= deltaTime;

        // 闪烁效果
        const lifeRatio = this.lifetimes[i] / this.maxLifetime;
        const flicker = 0.5 + 0.5 * Math.sin(this.time * 10 + i);
        sizes[i] = (0.2 + Math.random() * 0.3) * lifeRatio * flicker;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;

    if (!anyAlive) {
      this.particles.visible = false;
    }
  }

  public getObject(): THREE.Points {
    return this.particles;
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
