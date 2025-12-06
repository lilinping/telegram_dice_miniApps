/**
 * Three.js 材质定义
 * 玻璃筛盅、骰子等材质
 */

import * as THREE from 'three';

/**
 * 创建玻璃筛盅材质（PBR）
 * 高级透明玻璃效果，带折射和反射
 */
export function createGlassMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.1,
    transmission: 0.95, // 透明度
    thickness: 0.5, // 玻璃厚度
    ior: 1.45, // 折射率（玻璃）
    clearcoat: 1.0, // 清漆层
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.5,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
}

/**
 * 创建骰子材质
 * 白色塑料质感，带轻微反光
 */
export function createDiceMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.1,
    emissive: 0x000000,
  });
}

/**
 * 创建骰子点数材质（黑色）
 */
export function createDotMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.5,
    metalness: 0.0,
  });
}

/**
 * 创建筛盅底座材质（金色）
 */
export function createCupBaseMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xffd700,
    roughness: 0.4,
    metalness: 0.8,
    emissive: 0x332200,
    emissiveIntensity: 0.2,
  });
}

/**
 * 创建环境贴图（用于反射）
 */
export function createEnvironmentMap(): THREE.CubeTexture {
  const loader = new THREE.CubeTextureLoader();
  // 简单的颜色环境贴图
  const urls = [
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  ];
  
  return loader.load(urls);
}
