/**
 * Cannon-es 刚体定义
 * 骰子物理刚体
 */

import * as CANNON from 'cannon-es';
import * as THREE from 'three';

/**
 * 创建骰子物理刚体
 */
export function createDiceBody(size: number = 1, position: THREE.Vector3): CANNON.Body {
  const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
  
  // 需求文档：真实物理碰撞，增强摩擦和弹性
  const diceMaterial = new CANNON.Material({
    friction: 0.6, // 增加摩擦力，更真实
    restitution: 0.5, // 增加弹性，更真实的弹跳
  });

  const body = new CANNON.Body({
    mass: 1.2, // 稍微增加质量，更真实
    shape: shape,
    material: diceMaterial,
    linearDamping: 0.4, // 增加线性阻尼，更快停稳
    angularDamping: 0.5, // 增加角阻尼，减少过度旋转
  });

  body.position.set(position.x, position.y, position.z);

  // 添加随机初始旋转
  body.quaternion.setFromEuler(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  );

  return body;
}

/**
 * 给骰子施加随机力和扭矩
 * 模拟摇盅效果（需求文档：骰子自然物理停稳，随机弹跳/滚动）
 */
export function throwDice(body: CANNON.Body, strength: number = 5) {
  // 随机线速度（增强随机性，更真实的弹跳）
  body.velocity.set(
    (Math.random() - 0.5) * strength * 1.2,
    Math.random() * strength * 0.6 + 2.5, // 增加向上的力
    (Math.random() - 0.5) * strength * 1.2
  );

  // 随机角速度（需求文档：真实滚动）
  body.angularVelocity.set(
    (Math.random() - 0.5) * strength * 2.5, // 增加旋转速度
    (Math.random() - 0.5) * strength * 2.5,
    (Math.random() - 0.5) * strength * 2.5
  );
}

/**
 * 检查骰子是否停稳
 * 需求文档：速度 < 0.1 m/s 且角速度 < 0.1 rad/s
 */
export function isDiceStopped(body: CANNON.Body, threshold: number = 0.1): boolean {
  const velocityMagnitude = body.velocity.length();
  const angularVelocityMagnitude = body.angularVelocity.length();
  
  return velocityMagnitude < threshold && angularVelocityMagnitude < threshold;
}

/**
 * 检查所有骰子是否都停稳
 * 需求文档：所有骰子停稳，持续 0.3s
 */
export function areAllDiceStopped(
  bodies: CANNON.Body[], 
  threshold: number = 0.1,
  stableDuration: number = 0.3
): { allStopped: boolean; stableTime: number } {
  let allStopped = true;
  let minStableTime = Infinity;
  
  bodies.forEach((body) => {
    const stopped = isDiceStopped(body, threshold);
    if (!stopped) {
      allStopped = false;
    }
    
    // 计算每个骰子的稳定时间（简化版，实际需要记录历史）
    const velocity = body.velocity.length();
    const angularVelocity = body.angularVelocity.length();
    const currentStableTime = (velocity < threshold && angularVelocity < threshold) ? stableDuration : 0;
    minStableTime = Math.min(minStableTime, currentStableTime);
  });
  
  return {
    allStopped: allStopped && minStableTime >= stableDuration,
    stableTime: minStableTime
  };
}

/**
 * 获取骰子朝上的点数
 * 根据骰子的旋转姿态判断
 */
export function getDiceUpNumber(body: CANNON.Body): number {
  // 映射与贴图一致：+X=1, -X=6, +Y=2, -Y=5, +Z=3, -Z=4
  const upVector = new CANNON.Vec3(0, 1, 0);
  const faces = [
    { normal: new CANNON.Vec3(1, 0, 0), number: 1 },   // +X -> 1
    { normal: new CANNON.Vec3(-1, 0, 0), number: 6 },  // -X -> 6
    { normal: new CANNON.Vec3(0, 1, 0), number: 2 },   // +Y -> 2
    { normal: new CANNON.Vec3(0, -1, 0), number: 5 },  // -Y -> 5
    { normal: new CANNON.Vec3(0, 0, 1), number: 3 },   // +Z -> 3
    { normal: new CANNON.Vec3(0, 0, -1), number: 4 },  // -Z -> 4
  ];

  let maxDot = -1;
  let upNumber = 1;

  faces.forEach(({ normal, number }) => {
    const worldNormal = new CANNON.Vec3();
    body.quaternion.vmult(normal, worldNormal);
    const dot = worldNormal.dot(upVector);
    if (dot > maxDot) {
      maxDot = dot;
      upNumber = number;
    }
  });

  return upNumber;
}

/**
 * 校正骰子到指定点数
 * 返回使指定点数朝上的目标四元数
 * 
 * 面映射（与贴图一致）：
 * +X方向 (1,0,0) = 1点
 * -X方向 (-1,0,0) = 6点
 * +Y方向 (0,1,0) = 2点
 * -Y方向 (0,-1,0) = 5点
 * +Z方向 (0,0,1) = 3点
 * -Z方向 (0,0,-1) = 4点
 */
export function correctDiceToNumber(
  body: CANNON.Body,
  targetNumber: number,
  duration: number = 0.1
): CANNON.Quaternion {
  const targetQuat = new CANNON.Quaternion();

  // 目标面的法向量（局部坐标系）
  const faceNormals: Record<number, CANNON.Vec3> = {
    1: new CANNON.Vec3(1, 0, 0),   // +X -> 1
    2: new CANNON.Vec3(0, 1, 0),   // +Y -> 2
    3: new CANNON.Vec3(0, 0, 1),   // +Z -> 3
    4: new CANNON.Vec3(0, 0, -1),  // -Z -> 4
    5: new CANNON.Vec3(0, -1, 0),  // -Y -> 5
    6: new CANNON.Vec3(-1, 0, 0),  // -X -> 6
  };

  const from = faceNormals[targetNumber] || new CANNON.Vec3(0, 1, 0);
  const to = new CANNON.Vec3(0, 1, 0); // 世界 +Y 朝上

  // 计算将 from 向量旋转到 to 向量的四元数
  const cross = from.cross(to, new CANNON.Vec3());
  const dot = Math.min(1, Math.max(-1, from.dot(to)));

  if (cross.lengthSquared() < 1e-8) {
    // 平行或反向
    if (dot > 0.9999) {
      targetQuat.set(0, 0, 0, 1); // already aligned
    } else {
      // 反向，绕任意垂直轴旋转180°
      const axis = Math.abs(from.x) < 0.9 ? new CANNON.Vec3(1, 0, 0) : new CANNON.Vec3(0, 0, 1);
      const ortho = from.cross(axis, new CANNON.Vec3());
      ortho.normalize();
      targetQuat.setFromAxisAngle(ortho, Math.PI);
    }
  } else {
    cross.normalize();
    const angle = Math.acos(dot);
    targetQuat.setFromAxisAngle(cross, angle);
  }

  return targetQuat;
}
