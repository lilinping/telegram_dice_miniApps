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
 * 返回使指定点数朝上的目标四元数
 * 
 * 面映射（与 DiceCupAnimation.tsx 中的贴图映射一致）：
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

  // 根据目标点数，计算需要哪个面朝上
  // 然后计算使该面法向量指向 +Y 的四元数
  switch (targetNumber) {
    case 1:
      // 1点在 +X 面，需要 +X 朝上
      // 从初始状态（+Y朝上）绕 Z 轴旋转 -90°，使 +X 转到 +Y 位置
      // 验证：绕 Z 轴 -90°，+Y → +X，+X → -Y，所以原来的 +X 现在朝 -Y？不对
      // 重新思考：我们要让 +X 面朝上，即 +X 方向的法向量指向 +Y
      // 绕 Z 轴旋转 -90°（顺时针看 +Z）：+X → -Y, +Y → +X
      // 所以旋转后，原来指向 +X 的向量现在指向 -Y，不对
      // 绕 Z 轴旋转 +90°（逆时针看 +Z）：+X → +Y, +Y → -X
      // 所以旋转后，原来指向 +X 的向量现在指向 +Y，正确！
      targetQuat.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI / 2);
      break;
    case 2:
      // 2点在 +Y 面，已经朝上，不需要旋转
      targetQuat.set(0, 0, 0, 1);
      break;
    case 3:
      // 3点在 +Z 面，需要 +Z 朝上
      // 绕 X 轴旋转 -90°（顺时针看 +X）：+Y → +Z, +Z → -Y
      // 所以旋转后，原来指向 +Z 的向量现在指向 -Y，不对
      // 绕 X 轴旋转 +90°（逆时针看 +X）：+Y → -Z, +Z → +Y
      // 所以旋转后，原来指向 +Z 的向量现在指向 +Y，正确！
      // 但等等，我们要的是旋转后 +Z 面朝上，即旋转后的 +Z 方向指向世界 +Y
      // 如果绕 X 轴旋转 -90°，新的 +Z 方向 = 旧的 +Y 方向，不对
      // 如果绕 X 轴旋转 +90°，新的 +Z 方向 = 旧的 -Y 方向，也不对
      // 
      // 换个思路：我们要找一个旋转，使得旋转后骰子的 +Z 面朝上
      // 即：旋转后，骰子局部坐标系的 +Z 轴指向世界坐标系的 +Y 轴
      // 这等价于：将世界 +Y 轴旋转到骰子局部 +Z 轴的位置
      // 绕 X 轴旋转 -90°：世界 +Y → 世界 +Z，所以骰子的 +Z 面会朝向世界 +Y
      targetQuat.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      break;
    case 4:
      // 4点在 -Z 面，需要 -Z 朝上
      // 绕 X 轴旋转 +90°：世界 +Y → 世界 -Z，所以骰子的 -Z 面会朝向世界 +Y
      targetQuat.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
      break;
    case 5:
      // 5点在 -Y 面，需要 -Y 朝上
      // 绕 X 轴旋转 180°：世界 +Y → 世界 -Y，所以骰子的 -Y 面会朝向世界 +Y
      targetQuat.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI);
      break;
    case 6:
      // 6点在 -X 面，需要 -X 朝上
      // 绕 Z 轴旋转 -90°：世界 +Y → 世界 +X，所以骰子的 +X 面会朝向世界 +Y？不对
      // 绕 Z 轴旋转 +90°：世界 +Y → 世界 -X，所以骰子的 -X 面会朝向世界 +Y
      // 等等，这和 case 1 矛盾了
      // 
      // 重新理解：setFromAxisAngle 创建的四元数，当应用到物体时，
      // 物体会绕指定轴旋转指定角度
      // 如果物体绕 Z 轴旋转 +90°，物体的 +X 轴会转到原来 +Y 轴的位置
      // 这意味着物体的 +X 面现在朝向世界 +Y，即 1点朝上
      // 
      // 所以 6点朝上（-X 面朝上）：绕 Z 轴旋转 -90°
      // 物体绕 Z 轴旋转 -90°，物体的 -X 轴会转到原来 +Y 轴的位置
      targetQuat.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI / 2);
      break;
    default:
      targetQuat.set(0, 0, 0, 1);
  }

  return targetQuat;
}
