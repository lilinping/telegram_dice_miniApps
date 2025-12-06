/**
 * Three.js 视觉效果辅助函数
 * 发光、闪烁等效果
 */

import * as THREE from 'three';
import gsap from 'gsap';

/**
 * 让骰子发光（中奖效果）
 */
export function makeDiceGlow(dice: THREE.Group, duration: number = 1.0) {
  // 找到骰子的主体mesh
  const diceMesh = dice.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
  if (!diceMesh || !diceMesh.material) return;

  const material = diceMesh.material as THREE.MeshStandardMaterial;
  const originalEmissive = material.emissive.clone();
  const originalIntensity = material.emissiveIntensity;

  // 动画到发光状态
  gsap.to(material.emissive, {
    r: 1.0,
    g: 0.84,
    b: 0.0,
    duration: duration * 0.3,
    ease: 'power2.out',
  });

  gsap.to(material, {
    emissiveIntensity: 0.8,
    duration: duration * 0.3,
    ease: 'power2.out',
    onComplete: () => {
      // 恢复原状
      gsap.to(material.emissive, {
        r: originalEmissive.r,
        g: originalEmissive.g,
        b: originalEmissive.b,
        duration: duration * 0.7,
        ease: 'power2.in',
      });

      gsap.to(material, {
        emissiveIntensity: originalIntensity,
        duration: duration * 0.7,
        ease: 'power2.in',
      });
    },
  });
}

/**
 * 骰子闪烁效果
 */
export function makeDiceBlink(dice: THREE.Group, times: number = 3) {
  const diceMesh = dice.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
  if (!diceMesh || !diceMesh.material) return;

  const material = diceMesh.material as THREE.MeshStandardMaterial;
  const timeline = gsap.timeline();

  for (let i = 0; i < times; i++) {
    timeline.to(material, {
      emissiveIntensity: 0.5,
      duration: 0.1,
      ease: 'power1.inOut',
    });
    timeline.to(material, {
      emissiveIntensity: 0.1,
      duration: 0.1,
      ease: 'power1.inOut',
    });
  }
}

/**
 * 筛盅发光效果
 */
export function makeCupGlow(cup: THREE.Group, intensity: number = 0.5, duration: number = 0.5) {
  cup.children.forEach(child => {
    if (child instanceof THREE.Mesh && child.material) {
      const material = child.material as THREE.MeshPhysicalMaterial;
      
      gsap.to(material, {
        emissiveIntensity: intensity,
        duration: duration * 0.5,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      });
    }
  });
}

/**
 * 创建光环效果
 */
export function createHaloEffect(position: THREE.Vector3, color: number = 0xffd700): THREE.Mesh {
  const geometry = new THREE.RingGeometry(0.5, 1.5, 32);
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });

  const halo = new THREE.Mesh(geometry, material);
  halo.position.copy(position);
  halo.rotation.x = -Math.PI / 2;

  // 动画：扩散并淡出
  gsap.to(halo.scale, {
    x: 2,
    y: 2,
    z: 2,
    duration: 1.0,
    ease: 'power2.out',
  });

  gsap.to(material, {
    opacity: 0,
    duration: 1.0,
    ease: 'power2.out',
    onComplete: () => {
      halo.removeFromParent();
      geometry.dispose();
      material.dispose();
    },
  });

  return halo;
}

/**
 * 相机震动效果
 */
export function shakeCameraEffect(camera: THREE.Camera, intensity: number = 0.1, duration: number = 0.3) {
  const originalPosition = camera.position.clone();
  const timeline = gsap.timeline();

  const shakeCount = 10;
  for (let i = 0; i < shakeCount; i++) {
    timeline.to(camera.position, {
      x: originalPosition.x + (Math.random() - 0.5) * intensity,
      y: originalPosition.y + (Math.random() - 0.5) * intensity,
      z: originalPosition.z + (Math.random() - 0.5) * intensity,
      duration: duration / shakeCount,
      ease: 'none',
    });
  }

  timeline.to(camera.position, {
    x: originalPosition.x,
    y: originalPosition.y,
    z: originalPosition.z,
    duration: duration / shakeCount,
    ease: 'power2.out',
  });
}
