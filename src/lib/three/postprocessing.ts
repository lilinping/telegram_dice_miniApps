/**
 * Three.js 后处理效果
 * 辉光、景深等效果
 * 
 * 注意：此文件暂未使用，后续需要安装 @types/three 的后处理模块类型定义
 */

// @ts-nocheck
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

export interface PostProcessingConfig {
  enableBloom: boolean;
  enableFXAA: boolean;
  bloomStrength: number;
  bloomRadius: number;
  bloomThreshold: number;
}

export class PostProcessingManager {
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass | null = null;
  private fxaaPass: ShaderPass | null = null;
  private config: PostProcessingConfig;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    config: Partial<PostProcessingConfig> = {}
  ) {
    // 默认配置
    this.config = {
      enableBloom: true,
      enableFXAA: true,
      bloomStrength: 0.8,
      bloomRadius: 0.5,
      bloomThreshold: 0.85,
      ...config,
    };

    // 创建效果合成器
    this.composer = new EffectComposer(renderer);

    // 添加渲染通道
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    // 添加辉光效果
    if (this.config.enableBloom) {
      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        this.config.bloomStrength,
        this.config.bloomRadius,
        this.config.bloomThreshold
      );
      this.composer.addPass(this.bloomPass);
    }

    // 添加抗锯齿
    if (this.config.enableFXAA) {
      this.fxaaPass = new ShaderPass(FXAAShader);
      const pixelRatio = renderer.getPixelRatio();
      this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
      this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
      this.composer.addPass(this.fxaaPass);
    }
  }

  /**
   * 渲染场景（使用后处理）
   */
  public render() {
    this.composer.render();
  }

  /**
   * 调整大小
   */
  public setSize(width: number, height: number) {
    this.composer.setSize(width, height);

    if (this.fxaaPass) {
      const pixelRatio = this.composer.renderer.getPixelRatio();
      this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
      this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);
    }
  }

  /**
   * 设置辉光强度
   */
  public setBloomStrength(strength: number) {
    if (this.bloomPass) {
      this.bloomPass.strength = strength;
    }
  }

  /**
   * 启用/禁用辉光
   */
  public setBloomEnabled(enabled: boolean) {
    if (this.bloomPass) {
      this.bloomPass.enabled = enabled;
    }
  }

  /**
   * 触发中奖辉光效果
   * 短暂增强辉光强度
   */
  public triggerWinGlow() {
    if (!this.bloomPass) return;

    const originalStrength = this.bloomPass.strength;
    const targetStrength = 1.5;
    const duration = 1000; // 1秒
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 先增强后恢复
      const strength = progress < 0.3
        ? originalStrength + (targetStrength - originalStrength) * (progress / 0.3)
        : targetStrength - (targetStrength - originalStrength) * ((progress - 0.3) / 0.7);

      this.setBloomStrength(strength);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.setBloomStrength(originalStrength);
      }
    };

    animate();
  }

  /**
   * 清理资源
   */
  public dispose() {
    this.composer.passes.forEach(pass => {
      if (pass.dispose) {
        pass.dispose();
      }
    });
  }
}
