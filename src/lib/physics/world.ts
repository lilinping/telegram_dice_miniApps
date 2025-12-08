/**
 * Cannon-es 物理世界
 * 创建和配置物理模拟环境
 */

import * as CANNON from 'cannon-es';

export class PhysicsWorld {
  public world: CANNON.World;
  private timeStep: number = 1 / 60;
  private maxSubSteps: number = 3;

  constructor() {
    // 创建物理世界
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82 * 2, 0), // 重力加速度（稍微增强）
    });

    // 设置碰撞检测
    this.world.broadphase = new CANNON.NaiveBroadphase();
    // 设置求解器参数（使用类型断言绕过类型检查）
    (this.world.solver as any).iterations = 10;
    (this.world.solver as any).tolerance = 0.001;

    // 允许物体休眠（性能优化）
    this.world.allowSleep = true;

    // 创建地面
    this.createGround();

    // 创建墙壁（防止骰子飞出）
    this.createWalls();
  }

  private createGround() {
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
      mass: 0, // 静态物体
      shape: groundShape,
      material: new CANNON.Material({
        friction: 0.4,
        restitution: 0.3, // 弹性系数
      }),
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(groundBody);
  }

  private createWalls() {
    const wallMaterial = new CANNON.Material({
      friction: 0.3,
      restitution: 0.5,
    });

    const wallShape = new CANNON.Box(new CANNON.Vec3(10, 5, 0.1));

    // 四面墙
    const walls = [
      { position: [0, 2.5, -5], rotation: [0, 0, 0] },
      { position: [0, 2.5, 5], rotation: [0, Math.PI, 0] },
      { position: [-5, 2.5, 0], rotation: [0, Math.PI / 2, 0] },
      { position: [5, 2.5, 0], rotation: [0, -Math.PI / 2, 0] },
    ];

    walls.forEach(({ position, rotation }) => {
      const wall = new CANNON.Body({
        mass: 0,
        shape: wallShape,
        material: wallMaterial,
      });
      wall.position.set(position[0], position[1], position[2]);
      wall.quaternion.setFromEuler(rotation[0], rotation[1], rotation[2]);
      this.world.addBody(wall);
    });
  }

  public step(deltaTime: number) {
    this.world.step(this.timeStep, deltaTime, this.maxSubSteps);
  }

  public reset() {
    // 移除所有动态物体
    const bodiesToRemove: CANNON.Body[] = [];
    this.world.bodies.forEach((body) => {
      if (body.mass > 0) {
        bodiesToRemove.push(body);
      }
    });
    bodiesToRemove.forEach((body) => {
      this.world.removeBody(body);
    });
  }
}
