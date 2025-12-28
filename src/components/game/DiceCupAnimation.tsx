/**
 * 骰盅动画组件 - 基于 dice_cup_demo 的完整动画实现
 * 包含摇盅、物理模拟、结果检测等完整流程
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useGameSounds } from '@/hooks/useSound';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { correctDiceToNumber } from '@/lib/physics/bodies';
import { getChooseBetId } from '@/lib/betMapping';
import { GlobalDiceBet } from '@/lib/types';
// 使用 BoxGeometry 替代 RoundedBoxGeometry（更兼容）
// import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

interface DiceCupAnimationProps {
  fullscreen?: boolean;
  winAmount?: number;
  hasWon?: boolean;
  diceResults?: number[];
  gameState?: 'betting' | 'rolling' | 'revealing' | 'settled'; // 允许外部传入 gameState
  onAnimationComplete?: () => void;
}

export default function DiceCupAnimation({
  fullscreen = false,
  winAmount = 0,
  hasWon = false,
  diceResults: propDiceResults,
  gameState: propGameState,
  onAnimationComplete,
}: DiceCupAnimationProps) {
  const { gameState: contextGameState, diceResults: contextDiceResults } = useGame();
  // 优先使用外部传入的 gameState，否则使用 context 中的
  const gameState = propGameState || contextGameState;
  const diceResults = propDiceResults || contextDiceResults;
  // 输出来源调试：说明当前使用的是 prop 还是 context 的结果
  try {
    console.log('🎲 DiceCupAnimation 使用的 diceResults 来源:', propDiceResults ? 'propDiceResults' : 'contextDiceResults', {
      propDiceResults,
      contextDiceResults,
      resolved: diceResults,
    });
  } catch (e) {
    // ignore logging errors
  }
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const worldRef = useRef<CANNON.World | null>(null);
  const diceMeshesRef = useRef<THREE.Mesh[]>([]);
  const diceBodiesRef = useRef<CANNON.Body[]>([]);
  const glassCoverRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number>(0);
  const isShakingRef = useRef(false);
  const shakeFrameRef = useRef(0); // 摇盅帧计数
  const shakeMaxFramesRef = useRef(0); // 摇盅最大帧数
  const hasCorrectedRef = useRef(false);
  const isCorrectingRef = useRef(false); // 标记是否正在校正
  const correctionFrameCountRef = useRef(0); // 引导帧计数，用于减少验证频率
  const lastResultsKeyRef = useRef<string | null>(null); // 记录上一局结果，检测新局重置
  const correctionStartRef = useRef<number>(0); // 柔性矫正开始时间
  const sceneInitializedRef = useRef(false); // 标记场景是否已初始化
  const pendingShakeRef = useRef(false); // 标记是否有待执行的摇盅
  const diceResultsRef = useRef<number[]>([]); // 存储最新的 diceResults，解决闭包问题
  const initialQuatsRef = useRef<CANNON.Quaternion[]>([]); // 保存引导开始时的初始四元数
  const initialVelocitiesRef = useRef<number[]>([]); // 保存引导开始时的初始速度
  const [diceStopped, setDiceStopped] = useState(false); // 跟踪骰子是否已完全停止
  // 物理步进累积器与时间引用（用于固定步长子步）
  const accumulatorRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const stoppedFrameCountRef = useRef(0);
  const diceRollAudioRef = useRef<HTMLAudioElement | null>(null);

  // 配置参数
  const DICE_SIZE = 1.3;
  const CONTAINER_RADIUS = 5.5;
  const DOME_HEIGHT = CONTAINER_RADIUS;
  const TEXTURE_SIZE = 512;
  const GEOMETRY_SEGMENTS = 64;

  // 检测移动端
  const isMobile = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

// 设备分层物理配置（可扩展）
const PHYSICS_PRESETS = {
  low: {
    timeStep: 1 / 60,
    maxSubSteps: 2,
    solverIterations: 8,
    solverTolerance: 0.0015,
    angularDamping: 0.7,
    linearDamping: 0.16,
    diceFriction: 0.6,
    groundFriction: 0.8,
    restitution: 0.35,
    impulseScale: 0.9,
    shakeDurationMultiplier: 1.1,
  },
  medium: {
    timeStep: 1 / 120,
    maxSubSteps: 4,
    solverIterations: 12,
    solverTolerance: 0.001,
    angularDamping: 0.55,
    linearDamping: 0.12,
    diceFriction: 0.4,
    groundFriction: 0.6,
    restitution: 0.35,
    impulseScale: 1.0,
    shakeDurationMultiplier: 1.0,
  },
  high: {
    timeStep: 1 / 240,
    maxSubSteps: 6,
    solverIterations: 20,
    solverTolerance: 0.0008,
    angularDamping: 0.45,
    linearDamping: 0.08,
    diceFriction: 0.3,
    groundFriction: 0.45,
    restitution: 0.3,
    impulseScale: 1.2,
    shakeDurationMultiplier: 0.95,
  }
};

// 根据环境和 query 参数选择 preset（支持 ?physics=low|medium|high）
const selectPhysicsPreset = () => {
  try {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const q = url.searchParams.get('physics');
      if (q && (q === 'low' || q === 'medium' || q === 'high')) return PHYSICS_PRESETS[q];
    }
  } catch (e) {
    // ignore
  }
  if (isMobile) return PHYSICS_PRESETS.low;
  if (typeof window !== 'undefined' && window.devicePixelRatio && window.devicePixelRatio > 1.5) return PHYSICS_PRESETS.high;
  return PHYSICS_PRESETS.medium;
};
const physicsConfig = selectPhysicsPreset();
// 度量埋点（开发时用于对比）
const shakeStartTimeRef = typeof window !== 'undefined' ? (window as any).__shakeStartTimeRef || { current: null } : { current: null };
if (typeof window !== 'undefined') (window as any).__shakeStartTimeRef = shakeStartTimeRef;
  // 初始化场景
  useEffect(() => {
    if (!containerRef.current) return;

    // 清理之前的骰子（防止重复创建）
    diceMeshesRef.current.forEach(mesh => {
      if (mesh.parent) {
        mesh.parent.remove(mesh);
      }
      mesh.geometry.dispose();
      (mesh.material as THREE.Material[]).forEach(mat => mat.dispose());
    });
    diceMeshesRef.current = [];
    diceBodiesRef.current = [];

    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    sceneRef.current = scene;

    // 创建相机
    const aspect = width / height;
    const isPortrait = aspect < 1;
    const fov = isPortrait ? 55 : 40;
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
    
    if (isPortrait) {
      const distance = 28 / aspect;
      camera.position.set(0, Math.min(distance * 0.7, 25), Math.min(distance * 0.8, 28));
    } else {
      camera.position.set(0, 16, 18);
    }
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 设置光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xfff8ee, 300);
    spotLight.position.set(5, 20, 5);
    spotLight.angle = Math.PI / 5;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight);

    const topLight = new THREE.PointLight(0xffffff, 100);
    topLight.position.set(0, 15, 0);
    scene.add(topLight);

    const leftLight = new THREE.PointLight(0xaaccff, 80);
    leftLight.position.set(-10, 8, -10);
    scene.add(leftLight);

    const rightLight = new THREE.PointLight(0xffddaa, 80);
    rightLight.position.set(10, 8, 10);
    scene.add(rightLight);

    const frontLight = new THREE.PointLight(0xffffff, 50);
    frontLight.position.set(0, 6, 12);
    scene.add(frontLight);

    // 环境贴图
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x222233);
    const envLight1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.5),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    envLight1.position.set(5, 8, 5);
    envScene.add(envLight1);
    const envTexture = pmremGenerator.fromScene(envScene).texture;
    scene.environment = envTexture;

    // 创建物理世界
    const world = new CANNON.World();
    world.gravity.set(0, -9.82 * 3, 0);
    // 提升求解器精度并允许睡眠，帮助稳定并更快收敛
    world.allowSleep = true;
    (world.solver as any).iterations = physicsConfig.solverIterations;
    (world.solver as any).tolerance = physicsConfig.solverTolerance;
    worldRef.current = world;

    const groundMat = new CANNON.Material();
    const diceMat = new CANNON.Material();
    const wallMat = new CANNON.Material();

    // 更合理的接触材质，降低弹跳并提高摩擦使骰子更容易停下
    const diceDiceContact = new CANNON.ContactMaterial(diceMat, diceMat, {
      friction: physicsConfig.diceFriction,
      restitution: physicsConfig.restitution
    });
    const diceGroundContact = new CANNON.ContactMaterial(groundMat, diceMat, {
      friction: physicsConfig.groundFriction,
      restitution: physicsConfig.restitution
    });
    const diceWallContact = new CANNON.ContactMaterial(wallMat, diceMat, {
      friction: physicsConfig.diceFriction,
      restitution: physicsConfig.restitution
    });

    world.addContactMaterial(diceDiceContact);
    world.addContactMaterial(diceGroundContact);
    world.addContactMaterial(diceWallContact);

    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: groundMat
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    // 创建物理笼子
    const segments = 16;
    const angleStep = (Math.PI * 2) / segments;
    const radius = CONTAINER_RADIUS - 0.2;
    const cageHeight = DOME_HEIGHT;

    for (let i = 0; i < segments; i++) {
      const angle = i * angleStep;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const wallBody = new CANNON.Body({ mass: 0, material: wallMat });
      const width = 2 * radius * Math.tan(Math.PI / segments) * 1.05;
      const shape = new CANNON.Box(new CANNON.Vec3(width / 2, cageHeight, 0.5));
      wallBody.addShape(shape);
      wallBody.position.set(x, cageHeight / 2, z);
      wallBody.quaternion.setFromEuler(0, -angle + Math.PI / 2, 0);
      world.addBody(wallBody);
    }

    const ceilingBody = new CANNON.Body({ mass: 0, material: wallMat });
    const ceilingShape = new CANNON.Box(new CANNON.Vec3(radius, 0.5, radius));
    ceilingBody.addShape(ceilingShape);
    ceilingBody.position.set(0, DOME_HEIGHT - 0.5, 0);
    world.addBody(ceilingBody);

    // 创建桌面
    const tableGeometry = new THREE.CylinderGeometry(CONTAINER_RADIUS + 1.3, CONTAINER_RADIUS + 1.7, 0.5, 64);
    const tableMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x0a0a0a,
      roughness: 0.4,
      metalness: 0.2
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = -0.25;
    table.receiveShadow = true;
    scene.add(table);

    const padGeo = new THREE.CylinderGeometry(CONTAINER_RADIUS, CONTAINER_RADIUS, 0.1, 64);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x004411, roughness: 1.0 });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = 0.05;
    pad.receiveShadow = true;
    scene.add(pad);

    // 创建底座环
    const ringGeometry = new THREE.TorusGeometry(CONTAINER_RADIUS, 0.2, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.2
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    scene.add(ring);

    // 创建骰子纹理
    const createDiceTexture = (number: number): THREE.Texture => {
      const size = TEXTURE_SIZE;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      const c = size / 2;
      const l = size * 0.22;
      const f = size * 0.78;
      const r = size * 0.12;

      const drawPip = (x: number, y: number, isRed: boolean, scale = 1) => {
        const radius = r * scale;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isRed ? '#e60000' : '#000000';
        ctx.fill();
      };

      const isRed = number === 1 || number === 4;

      if (number === 1) {
        drawPip(c, c, true, 1.6);
      } else if (number === 2) {
        drawPip(f, l, false);
        drawPip(l, f, false);
      } else if (number === 3) {
        drawPip(f, l, false);
        drawPip(c, c, false);
        drawPip(l, f, false);
      } else if (number === 4) {
        drawPip(l, l, true);
        drawPip(f, l, true);
        drawPip(l, f, true);
        drawPip(f, f, true);
      } else if (number === 5) {
        drawPip(l, l, false);
        drawPip(f, l, false);
        drawPip(c, c, false);
        drawPip(l, f, false);
        drawPip(f, f, false);
      } else if (number === 6) {
        drawPip(l, l, false);
        drawPip(f, l, false);
        drawPip(l, c, false);
        drawPip(f, c, false);
        drawPip(l, f, false);
        drawPip(f, f, false);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      return texture;
    };

    // 创建骰子
    const textures: THREE.Texture[] = [];
    for (let i = 1; i <= 6; i++) {
      textures.push(createDiceTexture(i));
    }

    const diceGeometry = new THREE.BoxGeometry(DICE_SIZE, DICE_SIZE, DICE_SIZE);
    const diceMaterialConfig = {
      roughness: 0.2,
      metalness: 0.0,
      envMapIntensity: 0.5
    };

    for (let i = 0; i < 3; i++) {
      // 贴图与朝向映射（与 bodies.ts 一致）：
      // +X:1, -X:6, +Y:2, -Y:5, +Z:3, -Z:4
      const materials = [
        new THREE.MeshStandardMaterial({ map: textures[0], ...diceMaterialConfig }), // +X -> 1
        new THREE.MeshStandardMaterial({ map: textures[5], ...diceMaterialConfig }), // -X -> 6
        new THREE.MeshStandardMaterial({ map: textures[1], ...diceMaterialConfig }), // +Y -> 2
        new THREE.MeshStandardMaterial({ map: textures[4], ...diceMaterialConfig }), // -Y -> 5
        new THREE.MeshStandardMaterial({ map: textures[2], ...diceMaterialConfig }), // +Z -> 3
        new THREE.MeshStandardMaterial({ map: textures[3], ...diceMaterialConfig }), // -Z -> 4
      ];

      const mesh = new THREE.Mesh(diceGeometry, materials);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      const xPos = (i - 1) * 1.5;
      mesh.position.set(xPos, 1.5, 0);
      scene.add(mesh);
      diceMeshesRef.current.push(mesh);

      // 更合理的物理参数，开启睡眠并增加阻尼，利于快速稳定
      const body = new CANNON.Body({
        mass: 5,
        shape: new CANNON.Box(new CANNON.Vec3(DICE_SIZE / 2, DICE_SIZE / 2, DICE_SIZE / 2)),
        material: diceMat,
        // 初始阻尼，稍微偏高以减少长期漂移
        angularDamping: isMobile ? 0.5 : 0.62,
        linearDamping: isMobile ? 0.14 : 0.12
      });
      body.allowSleep = true;
      // 更宽松的睡眠门槛但能保证稳定性
      body.sleepSpeedLimit = 0.2; // 角速度阈值
      body.sleepTimeLimit = 0.5;   // 连续低速时间后进入睡眠
      body.position.set(xPos, 1.5, 0);
      body.quaternion.setFromEuler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      body.sleep();
      world.addBody(body);
      diceBodiesRef.current.push(body);
    }

    // 创建玻璃罩
    const glassSegments = GEOMETRY_SEGMENTS;
    const glassGeometry = new THREE.SphereGeometry(
      CONTAINER_RADIUS,
      glassSegments,
      glassSegments / 2,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.5
    );

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.0,
      transmission: 0.99,
      thickness: 0.0,
      ior: 1.0,
      envMapIntensity: 0.8,
      clearcoat: 0.5,
      clearcoatRoughness: 0.0,
      transparent: true,
      opacity: 0.05,
      side: THREE.FrontSide,
      depthWrite: false
    });

    const glassCover = new THREE.Mesh(glassGeometry, glassMaterial);
    glassCover.position.y = 0.1;
    glassCover.renderOrder = 10;
    scene.add(glassCover);
    glassCoverRef.current = glassCover;

    // 菲涅尔边缘效果
    const rimGeometry = new THREE.SphereGeometry(
      CONTAINER_RADIUS + 0.02,
      glassSegments,
      glassSegments / 2,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.5
    );
    const rimMaterial = new THREE.ShaderMaterial({
      uniforms: {
        rimColor: { value: new THREE.Color(0xffffff) },
        rimPower: { value: 4.0 },
        rimIntensity: { value: 0.2 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 rimColor;
        uniform float rimPower;
        uniform float rimIntensity;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 viewDir = normalize(vViewPosition);
          float rim = 1.0 - max(0.0, dot(viewDir, vNormal));
          rim = pow(rim, rimPower);
          gl_FragColor = vec4(rimColor, rim * rimIntensity);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false
    });
    const rimMesh = new THREE.Mesh(rimGeometry, rimMaterial);
    rimMesh.position.y = 0.1;
    rimMesh.renderOrder = 11;
    scene.add(rimMesh);

    // 底部金属边框
    const baseRingGeo = new THREE.TorusGeometry(CONTAINER_RADIUS, 0.15, 24, 128);
    const baseRingMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.9,
      roughness: 0.2
    });
    const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
    baseRing.rotation.x = -Math.PI / 2;
    baseRing.position.y = 0.12;
    scene.add(baseRing);

    // 高光效果
    const createHighlight = (width: number, height: number, opacity: number) => {
      const shape = new THREE.Shape();
      shape.ellipse(0, 0, width / 2, height / 2, 0, Math.PI * 2);
      const geo = new THREE.ShapeGeometry(shape, 32);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      return new THREE.Mesh(geo, mat);
    };

    const highlight1 = createHighlight(1.2, 0.8, 0.2);
    highlight1.position.set(1.2, DOME_HEIGHT - 1.2, -1.5);
    highlight1.rotation.set(-0.5, 0.4, 0);
    scene.add(highlight1);

    const topHighlight = createHighlight(1.0, 0.8, 0.1);
    topHighlight.position.set(0, DOME_HEIGHT - 0.5, 0);
    topHighlight.rotation.set(-Math.PI / 2, 0, 0);
    scene.add(topHighlight);

    // 渲染循环
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const currentResults = diceResultsRef.current;
      const diceCount = Math.min(diceBodiesRef.current.length, 3);

      // ========== 新设计：摇盅 + 引导融合 ==========
      // 阶段1 (0-70%): 纯物理摇盅，骰子自由碰撞，增加向中心的力促进碰撞
      // 阶段2 (70-100%): 物理摇盅 + 渐进引导，骰子逐渐转向目标
      // 结果：骰子自然停下时就是正确点数
      
      if (isShakingRef.current && shakeFrameRef.current < shakeMaxFramesRef.current) {
        shakeFrameRef.current++;
        const progress = shakeFrameRef.current / shakeMaxFramesRef.current;
        
        // 玻璃罩震动（逐渐减弱）
        if (glassCoverRef.current) {
          const intensity = 0.18 * Math.max(0, 1 - progress * 1.1);
          glassCoverRef.current.position.x = Math.sin(shakeFrameRef.current * 0.2) * intensity;
          glassCoverRef.current.position.z = Math.cos(shakeFrameRef.current * 0.25) * intensity;
        }

        // 对每个骰子施加力和引导
        for (let i = 0; i < diceCount; i++) {
          const body = diceBodiesRef.current[i];
          if (!body) continue;
          
          body.wakeUp();
          
          // === 阶段1: 物理摇盅 (0-70%) ===
          if (progress < 0.7) {
            // 力的强度：使用平滑的衰减曲线，避免突变
            // 0-40%: 全力
            // 40-70%: 平滑衰减
            let forceScale = 1.0;
            if (progress > 0.4) {
              // 使用 easeOutQuad 平滑衰减
              const decayProgress = (progress - 0.4) / 0.3;
              forceScale = 1 - decayProgress * decayProgress;
            }
            
            // 强向中心的回弹力（增加碰撞机会）
            const distFromCenter = Math.sqrt(body.position.x * body.position.x + body.position.z * body.position.z);
            const toCenterStrength = Math.max(3, distFromCenter * 2); // 距离越远，向心力越大
            const toCenterX = -body.position.x * toCenterStrength;
            const toCenterZ = -body.position.z * toCenterStrength;
            
            // 周期性的力（模拟摇盅的节奏感）
            // 使用较低频率避免速度剧烈波动，同时用 forceScale 控制整体强度
            const cyclePhase = shakeFrameRef.current * 0.08; // 降低频率，更平滑
            const cycleForceX = Math.sin(cyclePhase + i * 2) * 70 * forceScale;
            const cycleForceZ = Math.cos(cyclePhase + i * 2.5) * 70 * forceScale;
            const cycleForceY = (Math.abs(Math.sin(cyclePhase * 0.5)) * 50 + 30) * forceScale;
            
            // 施加脉冲（冲量）在骰子偏心点以产生扭矩，更接近真实碰撞
            const offset = new CANNON.Vec3(
              (Math.random() - 0.5) * 0.35,
              (Math.random() - 0.2) * 0.35,
              (Math.random() - 0.5) * 0.35
            );
            // 脉冲基准取决于设备与阶段
            const IMPULSE_BASE = isMobile ? 0.012 : 0.018;
            const impulseScale = IMPULSE_BASE * forceScale;
            const impulse = new CANNON.Vec3(
              (toCenterX + cycleForceX) * impulseScale,
              cycleForceY * impulseScale,
              (toCenterZ + cycleForceZ) * impulseScale
            );
            const worldPoint = body.position.vadd(offset);
            body.applyImpulse(impulse, worldPoint);
            
            // 小角速度时施加微小脉冲促进正翻，但幅度受限
            const curAng = body.angularVelocity.length();
            if (curAng < 4.5) {
              const tiny = new CANNON.Vec3(
                (Math.random() - 0.5) * 0.025 * forceScale,
                (Math.random() - 0.5) * 0.025 * forceScale,
                (Math.random() - 0.5) * 0.025 * forceScale
              );
              body.applyImpulse(tiny, worldPoint);
            }
          }
          
          // === 阶段2: 渐进引导 (70-100%) ===
          if (progress >= 0.7 && currentResults.length === 3) {
            // 引导进度：从0到1
            const guideProgress = (progress - 0.7) / 0.3;
            // 使用 easeOutQuad 缓动，让引导更自然
            const eased = 1 - (1 - guideProgress) * (1 - guideProgress);
            
            // 第一次进入引导阶段时，保存初始四元数
            if (!initialQuatsRef.current[i]) {
              const q = new CANNON.Quaternion();
              q.copy(body.quaternion);
              initialQuatsRef.current[i] = q;
            }
            
            const startQuat = initialQuatsRef.current[i];
            const targetQuat = correctDiceToNumber(body, currentResults[i]);
            
            // 混合物理旋转和目标旋转
            const blendFactor = eased * eased;
            
            // 获取当前物理旋转
            const physicsQuat = new CANNON.Quaternion();
            physicsQuat.copy(body.quaternion);
            
            // 从初始四元数插值到目标四元数
            const guidedQuat = startQuat.slerp(targetQuat, eased);
            
            // 混合物理和引导
            const finalQuat = physicsQuat.slerp(guidedQuat, blendFactor);
            body.quaternion.copy(finalQuat);
            
            // 逐渐减小角速度并增加阻尼以加速收敛
            const angDamping = 0.88 - guideProgress * 0.10;
            body.angularVelocity.scale(angDamping);
            body.angularDamping = Math.min(0.98, body.angularDamping + guideProgress * 0.15);
            
            // 逐渐减小线速度
            const linDamping = 0.92 - guideProgress * 0.06;
            body.velocity.scale(linDamping);
          }
          
          // 限制最大线速度和角速度，防止视觉失真
          const maxLinSpeed = isMobile ? 8 : 10;
          const maxAngSpeed = isMobile ? 12 : 14;
          const linSpeed = body.velocity.length();
          if (linSpeed > maxLinSpeed) {
            body.velocity.scale(maxLinSpeed / linSpeed);
          }
          const angSpeedCur = body.angularVelocity.length();
          if (angSpeedCur > maxAngSpeed) {
            body.angularVelocity.scale(maxAngSpeed / angSpeedCur);
          }
        }

        // 摇盅结束
        if (shakeFrameRef.current >= shakeMaxFramesRef.current) {
          if (glassCoverRef.current) {
            glassCoverRef.current.position.x = 0;
            glassCoverRef.current.position.z = 0;
          }
          
          // 最终校正与稳定：确保骰子完全停在目标点数并消除微小平移漂移
          if (currentResults.length === 3) {
            for (let i = 0; i < diceCount && i < currentResults.length; i++) {
              const body = diceBodiesRef.current[i];
              const mesh = diceMeshesRef.current[i];
              if (!body) continue;
              
              const targetQuat = correctDiceToNumber(body, currentResults[i]);
              // 直接设置朝向，并清零速度
              body.quaternion.copy(targetQuat);
              body.velocity.setZero();
              body.angularVelocity.setZero();
              // 提高阻尼并让物理引擎进入睡眠
              body.linearDamping = Math.max(body.linearDamping, 0.98);
              body.angularDamping = Math.max(body.angularDamping, 0.98);
              // 将位置微调（四舍五入到毫米级）以消除小幅位移
              body.position.x = Math.round(body.position.x * 1000) / 1000;
              body.position.y = Math.round(body.position.y * 1000) / 1000;
              body.position.z = Math.round(body.position.z * 1000) / 1000;
              body.sleep();
              
              if (mesh) {
                mesh.quaternion.copy(targetQuat as any);
                // 将 mesh 位置与 body 严格同步
                mesh.position.set(body.position.x, body.position.y, body.position.z);
              }
            }
            hasCorrectedRef.current = true;
            // 标记本地状态：骰子已停止（用于在组件内显示结果面板）
            try { setDiceStopped(true); } catch (e) {}
            console.log('✅ 骰子已自然停止到目标点数并已稳定:', currentResults);
            // 如果父组件提供了回调，通知外部动画已完成
            try {
              (onAnimationComplete as any)?.();
            } catch (e) {
              // ignore
            }
            // 向全局广播一个事件，作为兜底通知（方便未传入回调的父组件监听）
            try {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('dice:animationComplete', { detail: { results: currentResults } }));
              }
            } catch (e) {}
            // 记录并上报摇盅耗时指标（仅开发环境）
            try {
              if (typeof performance !== 'undefined' && shakeStartTimeRef.current) {
                const elapsed = (performance.now() - shakeStartTimeRef.current) / 1000;
                console.log(`📈 摇盅耗时: ${elapsed.toFixed(3)}s`);
                if (typeof window !== 'undefined') {
                  (window as any).__diceMetrics = (window as any).__diceMetrics || [];
                  (window as any).__diceMetrics.push({
                    timestamp: Date.now(),
                    shakeDurationSec: elapsed,
                    preset: physicsConfig === PHYSICS_PRESETS.low ? 'low' : (physicsConfig === PHYSICS_PRESETS.high ? 'high' : 'medium')
                  });
                }
                shakeStartTimeRef.current = null;
              }
            } catch (e) {
              // ignore metric errors
            }
          } else {
            // 兜底：如果没有结果，也要让骰子停下来
            console.warn('⚠️ 摇盅结束但没有有效结果，让骰子自然停止');
            for (let i = 0; i < diceCount; i++) {
              const body = diceBodiesRef.current[i];
              if (!body) continue;
              body.velocity.setZero();
              body.angularVelocity.setZero();
              body.linearDamping = 0.98;
              body.angularDamping = 0.98;
              body.sleep();
            }
            hasCorrectedRef.current = true;
            try { setDiceStopped(true); } catch (e) {}
          }
          
          isShakingRef.current = false;
          initialQuatsRef.current = [];
          console.log('🎲 摇盅引动画完成');
          
          // 通知外部动画已完成
          try {
            (onAnimationComplete as any)?.();
          } catch (e) {
            // ignore
          }
          // 向全局广播事件
          try {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('dice:animationComplete', { detail: { results: diceResultsRef.current } }));
            }
          } catch (e) {}
        }
      }

      // 固定时间步进物理引擎（子步）以提升稳定性与表现
      if (worldRef.current) {
        // 使用累积器方式步进
        const now = performance.now() / 1000;
        if (!lastTimeRef.current) lastTimeRef.current = now;
        let delta = now - lastTimeRef.current;
        lastTimeRef.current = now;
        // 限制单帧最大 delta（防止暂停/卡顿导致大步长）
        delta = Math.min(delta, 0.1);
        accumulatorRef.current += delta;
        const timeStep = 1 / 120; // 更小的物理步长
        const maxSteps = 4;
        let steps = 0;
        while (accumulatorRef.current >= timeStep && steps < maxSteps) {
          worldRef.current.step(timeStep);
          accumulatorRef.current -= timeStep;
          steps++;
        }
      }

      // 强制边界约束
      const maxRadius = CONTAINER_RADIUS - 0.7;
      for (let i = 0; i < diceCount; i++) {
        const body = diceBodiesRef.current[i];
        if (!body) continue;
        const distSq = body.position.x * body.position.x + body.position.z * body.position.z;
        if (distSq > maxRadius * maxRadius) {
          const angle = Math.atan2(body.position.z, body.position.x);
          body.position.x = Math.cos(angle) * maxRadius;
          body.position.z = Math.sin(angle) * maxRadius;
          const normalX = Math.cos(angle);
          const normalZ = Math.sin(angle);
          const dot = body.velocity.x * normalX + body.velocity.z * normalZ;
          if (dot > 0) {
            body.velocity.x -= 1.5 * dot * normalX;
            body.velocity.z -= 1.5 * dot * normalZ;
            body.velocity.x *= 0.5;
            body.velocity.z *= 0.5;
          }
        }
        if (body.position.y > DOME_HEIGHT - 0.8) {
          body.position.y = DOME_HEIGHT - 0.8;
          if (body.velocity.y > 0) {
            body.velocity.y *= -0.5;
          }
        }
        if (body.position.y < 0.5) {
          body.position.y = 0.5;
          if (body.velocity.y < 0) {
            body.velocity.y = 0;
          }
        }
      }

      // 同步物理和视觉（只同步前3个骰子）
      // 重用上面的 diceCount，确保 meshes 和 bodies 数量一致
      for (let i = 0; i < diceCount; i++) {
        const mesh = diceMeshesRef.current[i];
        const body = diceBodiesRef.current[i];
        if (mesh && body) {
          mesh.position.copy(body.position as any);
          // 始终同步旋转（物理模拟会更新 body.quaternion）
          mesh.quaternion.copy(body.quaternion as any);
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

    };
    animate();
    
    // 标记场景初始化完成
    sceneInitializedRef.current = true;
    console.log('✅ 场景初始化完成');
    
    // 如果有待执行的摇盅，立即执行
    if (pendingShakeRef.current) {
      console.log('🎲 执行待处理的摇盅');
      pendingShakeRef.current = false;
      shakeDice();
    }

    // 窗口大小调整
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;
      cameraRef.current.aspect = width / height;
      
      const isPortrait = width / height < 1;
      if (isPortrait) {
        const distance = 28 / (width / height);
        cameraRef.current.position.set(0, Math.min(distance * 0.7, 25), Math.min(distance * 0.8, 28));
        cameraRef.current.fov = 50;
      } else {
        cameraRef.current.position.set(0, 16, 18);
        cameraRef.current.fov = 40;
      }
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      // 重置所有标志
      sceneInitializedRef.current = false;
      pendingShakeRef.current = false;
      isShakingRef.current = false;
      hasCorrectedRef.current = false;
      isCorrectingRef.current = false;
      shakeFrameRef.current = 0;
      
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
      
      // 清理骰子
      diceMeshesRef.current.forEach(mesh => {
        if (mesh.parent) {
          mesh.parent.remove(mesh);
        }
        mesh.geometry.dispose();
        (mesh.material as THREE.Material[]).forEach(mat => mat.dispose());
      });
      diceMeshesRef.current = [];
      
      // 清理物理体
      if (worldRef.current) {
        diceBodiesRef.current.forEach(body => {
          worldRef.current!.removeBody(body);
        });
      }
      diceBodiesRef.current = [];
      
      if (rendererRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {
          // 忽略错误
        }
      }
      rendererRef.current?.dispose();
      pmremGenerator.dispose();
      textures.forEach(t => t.dispose());
    };
  }, []);

  // 摇盅动画 - 初始化摇盅状态，实际动画在 animate 函数中执行
  const shakeDice = () => {
    console.log('🎲 shakeDice 被调用, isShaking:', isShakingRef.current);
    if (isShakingRef.current || !glassCoverRef.current || !worldRef.current) {
      console.log('⚠️ shakeDice 提前返回');
      return;
    }
    
    // 初始化摇盅状态
    isShakingRef.current = true;
    shakeFrameRef.current = 0;
    // 增加摇盅时间：延长以提高碰撞次数与表现（移动端/桌面端分别设置）
    shakeMaxFramesRef.current = isMobile ? 350 : 390;
    // 清空引导用的初始四元数
    initialQuatsRef.current = [];
    hasCorrectedRef.current = false;
    isCorrectingRef.current = false;
    console.log('✅ shakeDice 开始执行，最大帧数:', shakeMaxFramesRef.current);

    // 唤醒所有骰子并给予初始速度
    const diceCount = Math.min(diceBodiesRef.current.length, 3);
    console.log('🎲 骰子数量:', diceCount);
    
    // 给予初始速度和位置（骰子靠近中心，增加碰撞机会）
    for (let i = 0; i < diceCount; i++) {
      const body = diceBodiesRef.current[i];
      if (body) {
        body.wakeUp();
        // 初始位置：靠近中心，增加碰撞机会
        const angle = (i / diceCount) * Math.PI * 2;
        const radius = 0.8; // 更小的半径，骰子更靠近
        body.position.set(
          Math.cos(angle) * radius,
          2 + i * 0.3, // 稍微错开高度
          Math.sin(angle) * radius
        );
        // 初始速度：向中心和向上，增加碰撞
        const towardsCenterX = -Math.cos(angle) * 3;
        const towardsCenterZ = -Math.sin(angle) * 3;
        body.velocity.set(
          towardsCenterX + (Math.random() - 0.5) * 4,
          Math.random() * 3 + 4,
          towardsCenterZ + (Math.random() - 0.5) * 4
        );
        // 初始角速度：适中，不要太快
        body.angularVelocity.set(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        );
      }
    }
    // 记录摇盅开始时间（用于度量）
    if (typeof performance !== 'undefined') {
      shakeStartTimeRef.current = performance.now();
    }
    
    console.log('🎲 摇盅动画已启动，将在 animate 循环中执行');
  };

  // 获取当前骰子显示的点数（用于调试）
  const getCurrentDiceNumbers = (): number[] => {
    const results: number[] = [];
    const upVector = new CANNON.Vec3(0, 1, 0);
    
    // 只检测前3个骰子（应该只有3个）
    const diceCount = Math.min(diceBodiesRef.current.length, 3);
    
    for (let i = 0; i < diceCount; i++) {
      const body = diceBodiesRef.current[i];
      if (!body) continue;
      // 六个面的法向量（根据 demo 的映射）
      // 新映射：与 bodies.ts 的映射一致
      const faces = [
        { normal: new CANNON.Vec3(1, 0, 0), val: 1 },   // +X = 1点
        { normal: new CANNON.Vec3(-1, 0, 0), val: 6 },  // -X = 6点
        { normal: new CANNON.Vec3(0, 1, 0), val: 2 },   // +Y = 2点
        { normal: new CANNON.Vec3(0, -1, 0), val: 5 },  // -Y = 5点
        { normal: new CANNON.Vec3(0, 0, 1), val: 3 },   // +Z = 3点
        { normal: new CANNON.Vec3(0, 0, -1), val: 4 },  // -Z = 4点
      ];
      
      let maxDot = -1;
      let upNumber = 1;
      
      faces.forEach(({ normal, val }) => {
        const worldNormal = new CANNON.Vec3();
        body.quaternion.vmult(normal, worldNormal);
        const dot = worldNormal.dot(upVector);
        
        if (dot > maxDot) {
          maxDot = dot;
          upNumber = val;
        }
      });
      
      results.push(upNumber);
    }
    
    return results;
  };

  // 兜底强制设置骰子到目标点数（用于超时/settled 仍未对齐的情况）
  const forceSetDiceToResults = (reason: string) => {
    const diceCount = Math.min(diceBodiesRef.current.length, 3);
    console.warn(`🛠️ 兜底强制设置骰子（原因: ${reason}）`, diceResults);
    for (let i = 0; i < diceCount && i < diceResults.length; i++) {
      const body = diceBodiesRef.current[i];
      const mesh = diceMeshesRef.current[i];
      if (!body || !mesh) continue;
      const targetNumber = diceResults[i];
      const targetQuat = correctDiceToNumber(body, targetNumber);
      body.wakeUp();
      body.quaternion.copy(targetQuat);
      body.angularVelocity.setZero();
      body.velocity.setZero();
      body.sleep();
      mesh.quaternion.copy(targetQuat as any);
      mesh.position.copy(body.position as any);
    }
    const finalNumbers = getCurrentDiceNumbers();
    console.warn('🧾 兜底后的点数:', finalNumbers, '目标:', diceResults);
    hasCorrectedRef.current = true;
    isCorrectingRef.current = false;
    correctionFrameCountRef.current = 0;
    try { setDiceStopped(true); } catch (e) {}
    // 通知外部动画已完成（兜底场景）
    try {
      (onAnimationComplete as any)?.();
    } catch (e) {}
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dice:animationComplete', { detail: { results: diceResults } }));
      }
    } catch (e) {}
  };

  // 校正骰子到指定点数（现在引导已融合到摇盅中，这个函数仅作为备用）
  const correctDiceToResults = () => {
    if (diceResults.length !== 3) {
      console.warn('⚠️ diceResults 长度不正确:', diceResults);
      return;
    }

    // 如果已经校正完成，跳过
    if (hasCorrectedRef.current) {
      console.log('⚠️ 已校正完成，跳过');
      return;
    }

    console.log('🎲 备用校正函数被调用，目标点数:', diceResults);
    
    // 直接设置到目标点数
    const diceCount = Math.min(diceBodiesRef.current.length, 3);
    for (let i = 0; i < diceCount && i < diceResults.length; i++) {
      const body = diceBodiesRef.current[i];
      const mesh = diceMeshesRef.current[i];
      if (!body) continue;
      
      const targetQuat = correctDiceToNumber(body, diceResults[i]);
      body.quaternion.copy(targetQuat);
      body.velocity.setZero();
      body.angularVelocity.setZero();
      body.sleep();
      
      if (mesh) {
        mesh.quaternion.copy(targetQuat as any);
        mesh.position.copy(body.position as any);
      }
    }
    
    hasCorrectedRef.current = true;
    console.log('✅ 备用校正完成');
  };

  // 监听 diceResults 变化，只更新 ref（引导由 animate 函数中的摇盅结束逻辑触发）
  useEffect(() => {
    // 更新 ref，解决 animate 函数中的闭包问题
    diceResultsRef.current = diceResults;
    
    // 当 diceResults 更新且有结果时，记录 key
    if (diceResults.length === 3) {
      const key = diceResults.join(',');
      if (lastResultsKeyRef.current !== key) {
        console.log('🆕 检测到新一局结果，记录 key:', diceResults);
        lastResultsKeyRef.current = key;
        // 只重置校正完成标志，不重置校正中标志
        // 这样如果正在校正中，不会被打断
        hasCorrectedRef.current = false;
      }
      
      console.log('🔍 diceResults 已更新:', { diceResults, isShaking: isShakingRef.current, isCorrectingRef: isCorrectingRef.current });
      // 注意：不在这里触发 correctDiceToResults()
      // 引导由 animate 函数中的摇盅结束逻辑统一触发，避免重复执行
    }
  }, [diceResults]);

  // 根据游戏状态触发动画（只监听 gameState，不监听 diceResults）
  useEffect(() => {
    console.log('🎮 DiceCupAnimation gameState 变化:', gameState);
    
    if (gameState === 'rolling') {
      console.log('🎲 开始 rolling 状态，准备摇盅动画');
      // 重置校正标志，不管摇盅状态
      hasCorrectedRef.current = false;
      isCorrectingRef.current = false;
      correctionFrameCountRef.current = 0;
      initialQuatsRef.current = [];
      initialVelocitiesRef.current = [];
      // 清空旧结果 key，等待新结果
      lastResultsKeyRef.current = null;
      
      // 确保骰子被唤醒（如果它们处于 sleep 状态）
      const diceCount = Math.min(diceBodiesRef.current.length, 3);
      for (let i = 0; i < diceCount; i++) {
        const body = diceBodiesRef.current[i];
        if (body) {
          body.wakeUp();
        }
      }

      // 检查场景是否已初始化
      if (!sceneInitializedRef.current) {
        console.log('⏳ 场景尚未初始化，设置待执行摇盅标志');
        pendingShakeRef.current = true;
        return;
      }

      // 立即开始摇盅
      console.log('🎲 调用 shakeDice()');
      shakeDice();
      return;
    } else if (gameState === 'betting') {
      // 重置状态
      isShakingRef.current = false;
      hasCorrectedRef.current = false; // 重置校正标志
      isCorrectingRef.current = false; // 重置校正中标志
      shakeFrameRef.current = 0;
      setDiceStopped(false); // 重置骰子停止状态
      
      // 唤醒骰子，准备下一轮
      diceBodiesRef.current.forEach((body) => {
        body.wakeUp();
      });
      // 重置骰子位置
      diceMeshesRef.current.forEach((mesh, i) => {
        if (diceBodiesRef.current[i]) {
          const body = diceBodiesRef.current[i];
          const xPos = (i - 1) * 1.5;
          mesh.position.set(xPos, 1.5, 0);
          body.position.set(xPos, 1.5, 0);
          body.velocity.setZero();
          body.angularVelocity.setZero();
          body.sleep();
        }
      });
      if (glassCoverRef.current) {
        glassCoverRef.current.position.set(0, 0.1, 0);
      }
    } else if (gameState === 'settled' || gameState === 'revealing') {
      // 兜底：如果进入 settled/revealing 状态但骰子还没停止，强制设置
      if (!diceStopped && diceResults.length === 3) {
        console.log('🛠️ 进入 settled/revealing 状态，强制设置骰子结果');
        forceSetDiceToResults('进入 settled/revealing 状态');
      } else if (!diceStopped && diceResults.length !== 3) {
        // 如果没有结果，也要标记骰子已停止
        console.warn('⚠️ 进入 settled/revealing 状态但没有有效结果');
        setDiceStopped(true);
      }
    }
  }, [gameState, diceStopped, diceResults]); // 监听 gameState, diceStopped 和 diceResults

  // 将 chooseId 转换为可读文本
  const getBetLabel = (chooseId: number): string => {
    const betId = getChooseBetId(chooseId);
    if (!betId) return `选项${chooseId}`;
    
    // 点数 4-17
    if (betId.startsWith('num-')) {
      const num = betId.replace('num-', '');
      return `${num}点`;
    }
    // 大小单双
    if (betId === 'big') return '大';
    if (betId === 'small') return '小';
    if (betId === 'odd') return '单';
    if (betId === 'even') return '双';
    // 任意三同号
    if (betId === 'any-triple') return '任意三同';
    // 对子
    if (betId.startsWith('double-')) {
      const num = betId.replace('double-', '');
      return `${num}-${num}`;
    }
    if (betId.startsWith('pair-')) {
      const parts = betId.replace('pair-', '').split('-');
      return `${parts[0]}-${parts[1]}`;
    }
    // 豹子
    if (betId.startsWith('triple-')) {
      const num = betId.replace('triple-', '');
      return `${num}-${num}-${num}`;
    }
    // 单骰号
    if (betId.startsWith('single-')) {
      const num = betId.replace('single-', '');
      return `单骰${num}`;
    }
    return betId;
  };

  // 计算结果显示（参考 2D 版本）
  const total = diceResults.length === 3 ? diceResults.reduce((sum, val) => sum + val, 0) : 0;
  const isBig = total >= 11 && total <= 17;
  const isSmall = total >= 4 && total <= 10;
  const isOdd = total % 2 === 1;
  
  // 计算全局结果（使用 diceResults）
  const globalTotal = diceResults && diceResults.length === 3 
    ? diceResults.reduce((sum, val) => sum + val, 0) 
    : null;

  // 在全局模式下，当有结果且骰子完全停止后才显示结果卡片
  const showOverlay = (gameState === 'revealing' || gameState === 'settled' || 
                       (gameState === 'rolling' && diceResults.length === 3)) && 
                       diceResults.length === 3 && diceStopped;
  // 为结果面板预留更高的底部空间，避免遮挡骰盅
  const overlayPadding = showOverlay ? (fullscreen ? 460 : 340) : 0;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: fullscreen ? '100vh' : '200px',
        position: 'relative',
        paddingBottom: overlayPadding,
        boxSizing: 'border-box',
      }}
    >
      {/* 结果显示（参考 2D 版本） */}
      {showOverlay && (
        <div
          style={{
            position: 'absolute',
            bottom: fullscreen ? '120px' : '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '20px 30px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            minWidth: '280px',
          }}
        >
          {/* 总点数 */}
          <div
            style={{
              fontSize: fullscreen ? '64px' : '48px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              color: '#ffd700',
              textShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
              marginBottom: '15px',
            }}
          >
            {total}
          </div>

          {/* 开奖结果详情（根据使用场景调整文案：全局模式显示“全局开奖”，个人模式显示“开奖”） */}
          {fullscreen && diceResults && diceResults.length === 3 && globalTotal !== null && (
            <div style={{ marginTop: '8px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                {typeof propGameState !== 'undefined' ? '全局开奖：' : '开奖：'}
              </div>
              <div style={{ fontSize: '18px', color: '#ffd700', fontWeight: 'bold' }}>
                {diceResults.join(' + ')} = {globalTotal}
              </div>
            </div>
          )}

          {/* 输赢提示 */}
          {fullscreen && (
            <div style={{ marginBottom: '15px' }}>
              {hasWon && winAmount > 0 ? (
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981', marginBottom: '8px' }}>
                    🎉 恭喜中奖！
                  </div>
                  <div
                    style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      fontFamily: 'monospace',
                      color: '#ffd700',
                      textShadow: '0 0 16px rgba(255, 215, 0, 0.8)',
                    }}
                  >
                    +${winAmount.toFixed(2)}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  未中奖，再接再厉
                </div>
              )}
            </div>
          )}

          {/* 大小单双标签 */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                background: isBig
                  ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)'
                  : 'rgba(107, 20, 20, 0.3)',
                color: isBig ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
              }}
            >
              大
            </span>
            <span
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                background: isSmall
                  ? 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)'
                  : 'rgba(107, 20, 20, 0.3)',
                color: isSmall ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
              }}
            >
              小
            </span>
            <span
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                background: isOdd
                  ? 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)'
                  : 'rgba(107, 20, 20, 0.3)',
                color: isOdd ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
              }}
            >
              单
            </span>
            <span
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                background: !isOdd
                  ? 'linear-gradient(135deg, #10B981 0%, #047857 100%)'
                  : 'rgba(107, 20, 20, 0.3)',
                color: !isOdd ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
              }}
            >
              双
            </span>
          </div>
        </div>
      )}

      {/* 状态提示 */}
      {gameState === 'rolling' && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#ffd700',
            fontSize: '18px',
            fontWeight: 'bold',
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '10px 20px',
            borderRadius: '8px',
          }}
        >
          开奖中...
        </div>
      )}
    </div>
  );
}

