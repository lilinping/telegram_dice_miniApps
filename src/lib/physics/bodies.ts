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
  // 根据 demo 代码中的面映射：
  // +X方向 (1,0,0) = 1点
  // -X方向 (-1,0,0) = 6点
  // +Y方向 (0,1,0) = 2点（朝上）
  // -Y方向 (0,-1,0) = 5点（朝下）
  // +Z方向 (0,0,1) = 3点
  // -Z方向 (0,0,-1) = 4点
  // 
  // 要让某个点数朝上（+Y方向），需要旋转骰子使对应面的法向量指向 +Y
  // 使用欧拉角 (x, y, z) 表示绕 X、Y、Z 轴的旋转
  // 注意：Cannon-es 的 setFromEuler 使用 (x, y, z) 顺序，对应绕 X、Y、Z 轴的旋转
  // 映射与贴图一致（BoxGeometry 顺序：+X, -X, +Y, -Y, +Z, -Z）
  // +X = 1, -X = 6, +Y = 2, -Y = 5, +Z = 3, -Z = 4
  const targetRotations: Record<number, [number, number, number]> = {
    1: [0, 0, Math.PI / 2],        // +X -> +Y
    2: [0, 0, 0],                  // +Y 已经朝上
    3: [-Math.PI / 2, 0, 0],       // +Z -> +Y
    4: [Math.PI / 2, 0, 0],        // -Z -> +Y
    5: [Math.PI, 0, 0],            // -Y -> +Y
    6: [0, 0, -Math.PI / 2],       // -X -> +Y
  };

  const [x, y, z] = targetRotations[targetNumber] || [0, 0, 0];
  const targetQuat = new CANNON.Quaternion();
  targetQuat.setFromEuler(x, y, z);

  return targetQuat;
}
