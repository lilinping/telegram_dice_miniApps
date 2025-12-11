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
  
  const diceMaterial = new CANNON.Material({
    friction: 0.5,
    restitution: 0.4, // 弹性
  });

  const body = new CANNON.Body({
    mass: 1,
    shape: shape,
    material: diceMaterial,
    linearDamping: 0.3, // 线性阻尼
    angularDamping: 0.3, // 角阻尼
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
 * 模拟摇盅效果
 */
export function throwDice(body: CANNON.Body, strength: number = 5) {
  // 随机线速度
  body.velocity.set(
    (Math.random() - 0.5) * strength,
    Math.random() * strength * 0.5 + 2,
    (Math.random() - 0.5) * strength
  );

  // 随机角速度
  body.angularVelocity.set(
    (Math.random() - 0.5) * strength * 2,
    (Math.random() - 0.5) * strength * 2,
    (Math.random() - 0.5) * strength * 2
  );
}

/**
 * 检查骰子是否停稳
 */
export function isDiceStopped(body: CANNON.Body, threshold: number = 0.1): boolean {
  const velocityMagnitude = body.velocity.length();
  const angularVelocityMagnitude = body.angularVelocity.length();
  
  return velocityMagnitude < threshold && angularVelocityMagnitude < threshold;
}

/**
 * 获取骰子朝上的点数
 * 根据骰子的旋转姿态判断
 */
export function getDiceUpNumber(body: CANNON.Body): number {
  // 获取骰子的上方向向量
  const upVector = new CANNON.Vec3(0, 1, 0);
  const worldUp = new CANNON.Vec3();
  body.quaternion.vmult(upVector, worldUp);

  // 六个面的法向量
  const faces = [
    { normal: new CANNON.Vec3(0, 0, 1), number: 1 },  // 前面
    { normal: new CANNON.Vec3(0, 0, -1), number: 2 }, // 后面
    { normal: new CANNON.Vec3(1, 0, 0), number: 3 },  // 右面
    { normal: new CANNON.Vec3(-1, 0, 0), number: 4 }, // 左面
    { normal: new CANNON.Vec3(0, 1, 0), number: 5 },  // 上面
    { normal: new CANNON.Vec3(0, -1, 0), number: 6 }, // 下面
  ];

  // 找到与上方向最接近的面
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
 * 平滑过渡到目标旋转
 */
export function correctDiceToNumber(
  body: CANNON.Body,
  targetNumber: number,
  duration: number = 0.1
): CANNON.Quaternion {
  // 目标旋转（使指定点数朝上）
  const targetRotations: Record<number, [number, number, number]> = {
    1: [-Math.PI / 2, 0, 0],
    2: [Math.PI / 2, 0, 0],
    3: [0, 0, -Math.PI / 2],
    4: [0, 0, Math.PI / 2],
    5: [0, 0, 0],
    6: [Math.PI, 0, 0],
  };

  const [x, y, z] = targetRotations[targetNumber] || [0, 0, 0];
  const targetQuat = new CANNON.Quaternion();
  targetQuat.setFromEuler(x, y, z);

  return targetQuat;
}
