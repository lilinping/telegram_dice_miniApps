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
 * 
 * 面映射（与 DiceCupAnimation 一致）：
 * +X:1, -X:6, +Y:2, -Y:5, +Z:3, -Z:4
 */
export function getDiceUpNumber(body: CANNON.Body): number {
  // 获取骰子的上方向向量
  const upVector = new CANNON.Vec3(0, 1, 0);
  const worldUp = new CANNON.Vec3();
  body.quaternion.vmult(upVector, worldUp);

  // 六个面的法向量（与 DiceCupAnimation 映射一致）
  const faces = [
    { normal: new CANNON.Vec3(1, 0, 0), number: 1 },   // +X -> 1
    { normal: new CANNON.Vec3(-1, 0, 0), number: 6 },   // -X -> 6
    { normal: new CANNON.Vec3(0, 1, 0), number: 2 },   // +Y -> 2
    { normal: new CANNON.Vec3(0, -1, 0), number: 5 },  // -Y -> 5
    { normal: new CANNON.Vec3(0, 0, 1), number: 3 },   // +Z -> 3
    { normal: new CANNON.Vec3(0, 0, -1), number: 4 },  // -Z -> 4
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
 * 
 * 面映射（与 DiceCupAnimation 一致）：
 * +X:1, -X:6, +Y:2, -Y:5, +Z:3, -Z:4
 */
export function correctDiceToNumber(
  body: CANNON.Body,
  targetNumber: number,
  duration: number = 0.1
): CANNON.Quaternion {
  // 目标旋转（使指定点数朝上）
  // 默认状态：+Y朝上显示2
  const targetRotations: Record<number, [number, number, number]> = {
    1: [0, 0, Math.PI / 2],        // 绕Z轴90度，+X朝上显示1
    2: [0, 0, 0],                  // 无旋转，+Y朝上显示2
    3: [-Math.PI / 2, 0, 0],      // 绕X轴-90度，+Z朝上显示3
    4: [Math.PI / 2, 0, 0],        // 绕X轴90度，-Z朝上显示4
    5: [Math.PI, 0, 0],            // 绕X轴180度，-Y朝上显示5
    6: [0, 0, -Math.PI / 2],       // 绕Z轴-90度，-X朝上显示6
  };

  const [x, y, z] = targetRotations[targetNumber] || [0, 0, 0];
  const targetQuat = new CANNON.Quaternion();
  targetQuat.setFromEuler(x, y, z);

  return targetQuat;
}
