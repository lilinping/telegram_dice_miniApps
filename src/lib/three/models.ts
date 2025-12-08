/**
 * Three.js 3D模型创建
 * 骰子、筛盅等模型
 */

import * as THREE from 'three';
import { createDiceMaterial, createDotMaterial, createGlassMaterial, createCupBaseMaterial } from './materials';

/**
 * 创建骰子模型
 * 包含六个面和点数
 */
export function createDice(size: number = 1): THREE.Group {
  const diceGroup = new THREE.Group();
  
  // 骰子主体
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = createDiceMaterial();
  const cube = new THREE.Mesh(geometry, material);
  cube.castShadow = true;
  cube.receiveShadow = true;
  diceGroup.add(cube);

  // 添加点数
  const dotRadius = size * 0.08;
  const dotDepth = size * 0.02;
  const offset = size * 0.5 + dotDepth * 0.5;
  
  // 点数位置配置
  const dotPositions: Record<number, Array<[number, number, number]>> = {
    1: [[0, 0, offset]], // 前面 - 1点
    2: [[-0.25, 0.25, -offset], [0.25, -0.25, -offset]], // 后面 - 2点
    3: [[-0.25, 0.25, 0], [0, 0, 0], [0.25, -0.25, 0]], // 右面 - 3点（需要旋转）
    4: [[-0.25, 0.25, 0], [0.25, 0.25, 0], [-0.25, -0.25, 0], [0.25, -0.25, 0]], // 左面 - 4点
    5: [[-0.25, 0.25, 0], [0.25, 0.25, 0], [0, 0, 0], [-0.25, -0.25, 0], [0.25, -0.25, 0]], // 上面 - 5点
    6: [[-0.25, 0.25, 0], [0.25, 0.25, 0], [-0.25, 0, 0], [0.25, 0, 0], [-0.25, -0.25, 0], [0.25, -0.25, 0]], // 下面 - 6点
  };

  const dotGeometry = new THREE.CylinderGeometry(dotRadius, dotRadius, dotDepth, 16);
  const dotMaterial = createDotMaterial();

  // 面1（前面，z+）
  dotPositions[1].forEach(([x, y]) => {
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.position.set(x * size, y * size, offset);
    dot.rotation.x = Math.PI / 2;
    diceGroup.add(dot);
  });

  // 面2（后面，z-）
  dotPositions[2].forEach(([x, y]) => {
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.position.set(x * size, y * size, -offset);
    dot.rotation.x = Math.PI / 2;
    diceGroup.add(dot);
  });

  // 面3（右面，x+）
  dotPositions[3].forEach(([x, y]) => {
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.position.set(offset, y * size, x * size);
    dot.rotation.z = Math.PI / 2;
    diceGroup.add(dot);
  });

  // 面4（左面，x-）
  dotPositions[4].forEach(([x, y]) => {
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.position.set(-offset, y * size, x * size);
    dot.rotation.z = Math.PI / 2;
    diceGroup.add(dot);
  });

  // 面5（上面，y+）
  dotPositions[5].forEach(([x, z]) => {
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.position.set(x * size, offset, z * size);
    diceGroup.add(dot);
  });

  // 面6（下面，y-）
  dotPositions[6].forEach(([x, z]) => {
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.position.set(x * size, -offset, z * size);
    diceGroup.add(dot);
  });

  return diceGroup;
}

/**
 * 创建玻璃筛盅模型
 * 透明玻璃材质，圆柱形
 * 需求文档：PBR材质、折射、环境光反射、Fresnel效果
 */
export function createDiceCup(radius: number = 2.5, height: number = 3, envMap?: THREE.CubeTexture): THREE.Group {
  const cupGroup = new THREE.Group();

  // 玻璃盅体（圆柱形，无底）
  // 增加分段数，提升玻璃边缘Fresnel效果质量
  const cupGeometry = new THREE.CylinderGeometry(
    radius, // 顶部半径
    radius * 0.92, // 底部半径（略小，更真实）
    height, // 高度
    64, // 增加分段数，提升玻璃折射质量
    1,
    true // 开口（无顶无底）
  );
  
  const glassMaterial = createGlassMaterial();
  const cup = new THREE.Mesh(cupGeometry, glassMaterial);
  cup.castShadow = true;
  cup.receiveShadow = true;
  cupGroup.add(cup);

  // 玻璃盅顶部边缘（加厚效果，增强Fresnel边缘）
  const rimGeometry = new THREE.TorusGeometry(radius, 0.12, 24, 64);
  const rim = new THREE.Mesh(rimGeometry, glassMaterial);
  rim.position.y = height / 2;
  rim.rotation.x = Math.PI / 2;
  cupGroup.add(rim);

  // 玻璃盅底部边缘（增强真实感）
  const bottomRimGeometry = new THREE.TorusGeometry(radius * 0.92, 0.1, 24, 64);
  const bottomRim = new THREE.Mesh(bottomRimGeometry, glassMaterial);
  bottomRim.position.y = -height / 2;
  bottomRim.rotation.x = Math.PI / 2;
  cupGroup.add(bottomRim);

  // 金色把手（需求文档：高级质感）
  const handleGeometry = new THREE.TorusGeometry(0.3, 0.12, 16, 32);
  const handleMaterial = createCupBaseMaterial();
  const handle = new THREE.Mesh(handleGeometry, handleMaterial);
  handle.position.set(0, height / 2 + 0.3, 0);
  handle.rotation.x = Math.PI / 2;
  handle.castShadow = true;
  cupGroup.add(handle);

  return cupGroup;
}

/**
 * 创建筛盅底座
 * 金色圆盘
 */
export function createCupBase(radius: number = 3): THREE.Mesh {
  const geometry = new THREE.CylinderGeometry(radius, radius * 0.95, 0.3, 32);
  const material = createCupBaseMaterial();
  const base = new THREE.Mesh(geometry, material);
  base.castShadow = true;
  base.receiveShadow = true;
  return base;
}

/**
 * 根据点数设置骰子旋转
 * 使指定点数朝上
 */
export function setDiceRotationForNumber(dice: THREE.Group, number: number) {
  // 重置旋转
  dice.rotation.set(0, 0, 0);

  // 根据点数设置旋转
  switch (number) {
    case 1: // 1点朝上（前面朝上）
      dice.rotation.x = -Math.PI / 2;
      break;
    case 2: // 2点朝上（后面朝上）
      dice.rotation.x = Math.PI / 2;
      break;
    case 3: // 3点朝上（右面朝上）
      dice.rotation.z = -Math.PI / 2;
      break;
    case 4: // 4点朝上（左面朝上）
      dice.rotation.z = Math.PI / 2;
      break;
    case 5: // 5点朝上（上面朝上）
      // 默认状态
      break;
    case 6: // 6点朝上（下面朝上）
      dice.rotation.x = Math.PI;
      break;
  }
}
