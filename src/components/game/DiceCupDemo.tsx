/**
 * 骰盅展示组件 - 基于 dice_cup_demo 的实现
 * 在 betting 状态下显示静态的骰盅和骰子
 */

'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
// 使用 BoxGeometry 替代 RoundedBoxGeometry（如果导入失败）
// import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

interface DiceCupDemoProps {
  className?: string;
}

export default function DiceCupDemo({ className = '' }: DiceCupDemoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const worldRef = useRef<CANNON.World | null>(null);
  const diceMeshesRef = useRef<THREE.Mesh[]>([]);
  const diceBodiesRef = useRef<CANNON.Body[]>([]);
  const glassCoverRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number>(0);

  // 配置参数
  const DICE_SIZE = 1.3;
  const CONTAINER_RADIUS = 5.5;
  const DOME_HEIGHT = CONTAINER_RADIUS;
  const TEXTURE_SIZE = 512;
  const GEOMETRY_SEGMENTS = 64; // 降低分段数以提升性能

  useEffect(() => {
    if (!containerRef.current) return;

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
    
    // 相机位置
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

    // 使用 BoxGeometry 替代 RoundedBoxGeometry（更兼容）
    const diceGeometry = new THREE.BoxGeometry(DICE_SIZE, DICE_SIZE, DICE_SIZE);
    const diceMaterialConfig = {
      roughness: 0.2,
      metalness: 0.0,
      envMapIntensity: 0.5
    };

    for (let i = 0; i < 3; i++) {
      const materials = [
        new THREE.MeshStandardMaterial({ map: textures[0], ...diceMaterialConfig }),
        new THREE.MeshStandardMaterial({ map: textures[5], ...diceMaterialConfig }),
        new THREE.MeshStandardMaterial({ map: textures[1], ...diceMaterialConfig }),
        new THREE.MeshStandardMaterial({ map: textures[4], ...diceMaterialConfig }),
        new THREE.MeshStandardMaterial({ map: textures[2], ...diceMaterialConfig }),
        new THREE.MeshStandardMaterial({ map: textures[3], ...diceMaterialConfig }),
      ];

      const mesh = new THREE.Mesh(diceGeometry, materials);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // 初始位置：在桌面上，稍微分散
      const xPos = (i - 1) * 1.5;
      mesh.position.set(xPos, 1.5, 0);
      scene.add(mesh);
      diceMeshesRef.current.push(mesh);

      const body = new CANNON.Body({
        mass: 8,
        shape: new CANNON.Box(new CANNON.Vec3(DICE_SIZE / 2, DICE_SIZE / 2, DICE_SIZE / 2)),
        material: diceMat,
        angularDamping: 0.4,
        linearDamping: 0.1
      });
      body.position.set(xPos, 1.5, 0);
      body.quaternion.setFromEuler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      // 让骰子静止
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

      const deltaTime = 1 / 60;
      if (worldRef.current) {
        worldRef.current.step(1 / 60, deltaTime, 3);
      }

      // 同步物理和视觉
      diceMeshesRef.current.forEach((mesh, i) => {
        if (diceBodiesRef.current[i]) {
          const body = diceBodiesRef.current[i];
          mesh.position.copy(body.position as any);
          mesh.quaternion.copy(body.quaternion as any);
        }
      });

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

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
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
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

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100px',
      }}
    />
  );
}

