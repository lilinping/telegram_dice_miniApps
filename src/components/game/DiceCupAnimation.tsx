/**
 * 骰盅动画组件 - 基于 dice_cup_demo 的完整动画实现
 * 包含摇盅、物理模拟、结果检测等完整流程
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
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
}

export default function DiceCupAnimation({
  fullscreen = false,
  winAmount = 0,
  hasWon = false,
  diceResults: propDiceResults,
  gameState: propGameState,
}: DiceCupAnimationProps) {
  const { gameState: contextGameState, diceResults: contextDiceResults } = useGame();
  // 优先使用外部传入的 gameState，否则使用 context 中的
  const gameState = propGameState || contextGameState;
  const diceResults = propDiceResults || contextDiceResults;
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
    world.allowSleep = true;
    worldRef.current = world;

    const groundMat = new CANNON.Material();
    const diceMat = new CANNON.Material();
    const wallMat = new CANNON.Material();

    const diceDiceContact = new CANNON.ContactMaterial(diceMat, diceMat, {
      friction: 0.1,
      restitution: 0.5
    });
    const diceGroundContact = new CANNON.ContactMaterial(groundMat, diceMat, {
      friction: 0.3,
      restitution: 0.3
    });
    const diceWallContact = new CANNON.ContactMaterial(wallMat, diceMat, {
      friction: 0.0,
      restitution: 0.6
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

      const body = new CANNON.Body({
        mass: 5,
        shape: new CANNON.Box(new CANNON.Vec3(DICE_SIZE / 2, DICE_SIZE / 2, DICE_SIZE / 2)),
        material: diceMat,
        angularDamping: 0.1, // 适中的角速度阻尼
        linearDamping: 0.1   // 适中的线速度阻尼
      });
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
            // 力的强度：前50%全力，50-70%逐渐减弱
            let forceScale = 1.0;
            if (progress > 0.5) {
              forceScale = 1 - (progress - 0.5) / 0.2;
            }
            
            // 强向中心的回弹力（增加碰撞机会）
            const distFromCenter = Math.sqrt(body.position.x * body.position.x + body.position.z * body.position.z);
            const toCenterStrength = Math.max(3, distFromCenter * 2); // 距离越远，向心力越大
            const toCenterX = -body.position.x * toCenterStrength;
            const toCenterZ = -body.position.z * toCenterStrength;
            
            // 周期性的力（模拟摇盅的节奏感）
            const cyclePhase = shakeFrameRef.current * 0.15;
            const cycleForceX = Math.sin(cyclePhase + i * 2) * 60;
            const cycleForceZ = Math.cos(cyclePhase + i * 2.5) * 60;
            const cycleForceY = Math.abs(Math.sin(cyclePhase * 0.7)) * 50 + 30;
            
            // 施加力（向中心 + 周期性）
            body.applyForce(
              new CANNON.Vec3(
                (toCenterX + cycleForceX) * forceScale,
                cycleForceY * forceScale,
                (toCenterZ + cycleForceZ) * forceScale
              ),
              body.position
            );
            
            // 施加扭矩（通过碰撞产生旋转，减少直接扭矩）
            // 只在速度较低时施加少量扭矩
            const angSpeed = body.angularVelocity.length();
            if (angSpeed < 5) {
              const torqueScale = forceScale * 20;
              body.applyTorque(
                new CANNON.Vec3(
                  (Math.sin(shakeFrameRef.current * 0.3 + i) - 0.5) * torqueScale,
                  (Math.cos(shakeFrameRef.current * 0.25 + i) - 0.5) * torqueScale,
                  (Math.sin(shakeFrameRef.current * 0.35 + i * 2) - 0.5) * torqueScale
                )
              );
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
            
            // 逐渐减小角速度
            const angDamping = 0.9 - guideProgress * 0.12;
            body.angularVelocity.scale(angDamping);
            
            // 逐渐减小线速度
            const linDamping = 0.93 - guideProgress * 0.08;
            body.velocity.scale(linDamping);
          }
          
          // 限制最大速度（稍微提高，让碰撞更有力）
          const maxLinSpeed = 14;
          const maxAngSpeed = 18;
          const linSpeed = body.velocity.length();
          if (linSpeed > maxLinSpeed) {
            body.velocity.scale(maxLinSpeed / linSpeed);
          }
          const angSpeed = body.angularVelocity.length();
          if (angSpeed > maxAngSpeed) {
            body.angularVelocity.scale(maxAngSpeed / angSpeed);
          }
        }

        // 摇盅结束
        if (shakeFrameRef.current >= shakeMaxFramesRef.current) {
          if (glassCoverRef.current) {
            glassCoverRef.current.position.x = 0;
            glassCoverRef.current.position.z = 0;
          }
          
          // 最终校正：确保骰子完全停在目标点数
          if (currentResults.length === 3) {
            for (let i = 0; i < diceCount && i < currentResults.length; i++) {
              const body = diceBodiesRef.current[i];
              const mesh = diceMeshesRef.current[i];
              if (!body) continue;
              
              const targetQuat = correctDiceToNumber(body, currentResults[i]);
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
            console.log('✅ 骰子已自然停止到目标点数:', currentResults);
          }
          
          isShakingRef.current = false;
          initialQuatsRef.current = [];
          console.log('� 摇盅引动画完成');
        }
      }

      // 始终运行物理引擎
      const deltaTime = 1 / 60;
      if (worldRef.current) {
        worldRef.current.step(1 / 60, deltaTime, 3);
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
    // 增加摇盅时间：约4.5-5秒（270-300帧）
    shakeMaxFramesRef.current = isMobile ? 270 : 300;
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
    }
  }, [gameState]); // 只监听 gameState，不监听 diceResults

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
  
  // 计算全局结果
  const globalTotal = globalOutcome && globalOutcome.length === 3 
    ? globalOutcome.reduce((sum, val) => sum + val, 0) 
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

          {/* 我的下注和全局结果 */}
          {fullscreen && myBets.length > 0 && (
            <div style={{ marginBottom: '15px', fontSize: '14px' }}>
              <div style={{ marginBottom: '8px', color: 'rgba(255, 255, 255, 0.8)' }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>我的下注：</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                  {myBets.map((bet, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: 'rgba(255, 215, 0, 0.2)',
                        border: '1px solid rgba(255, 215, 0, 0.4)',
                        color: '#ffd700',
                        fontSize: '12px',
                      }}
                    >
                      {getBetLabel(bet.chooseId)} × {bet.amount}
                    </span>
                  ))}
                </div>
              </div>
              {globalOutcome && globalOutcome.length === 3 && globalTotal !== null && (
                <div style={{ marginTop: '8px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>全局开奖：</div>
                  <div style={{ fontSize: '18px', color: '#ffd700', fontWeight: 'bold' }}>
                    {globalOutcome.join(' + ')} = {globalTotal}
                  </div>
                </div>
              )}
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

