/**
 * Three.js 场景设置
 * 创建和配置3D场景、相机、渲染器
 */

import * as THREE from 'three';

export interface SceneConfig {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

export class DiceScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private spotLight: THREE.SpotLight;

  constructor(config: SceneConfig) {
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a); // 深黑色背景

    // 创建相机
    this.camera = new THREE.PerspectiveCamera(
      45, // FOV
      config.width / config.height, // 宽高比
      0.1, // 近裁剪面
      1000 // 远裁剪面
    );
    this.camera.position.set(0, 8, 12);
    this.camera.lookAt(0, 0, 0);

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas: config.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(config.width, config.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // 添加光照
    this.setupLights();

    // 添加桌面
    this.createTable();
  }

  private setupLights() {
    // 环境光 - 提供基础照明
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    // 主光源 - 模拟顶部照明
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(5, 10, 5);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 50;
    this.directionalLight.shadow.camera.left = -10;
    this.directionalLight.shadow.camera.right = 10;
    this.directionalLight.shadow.camera.top = 10;
    this.directionalLight.shadow.camera.bottom = -10;
    this.scene.add(this.directionalLight);

    // 聚光灯 - 增强戏剧效果
    this.spotLight = new THREE.SpotLight(0xffd700, 0.5);
    this.spotLight.position.set(0, 15, 0);
    this.spotLight.angle = Math.PI / 6;
    this.spotLight.penumbra = 0.3;
    this.spotLight.castShadow = true;
    this.scene.add(this.spotLight);
  }

  private createTable() {
    // 创建木质桌面
    const tableGeometry = new THREE.BoxGeometry(20, 0.5, 20);
    const tableMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1810,
      roughness: 0.8,
      metalness: 0.1,
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = -0.25;
    table.receiveShadow = true;
    this.scene.add(table);

    // 添加桌面纹理（可选）
    const textureLoader = new THREE.TextureLoader();
    // 如果有木纹理图片，可以加载
    // textureLoader.load('/textures/wood.jpg', (texture) => {
    //   tableMaterial.map = texture;
    //   tableMaterial.needsUpdate = true;
    // });
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    this.renderer.dispose();
    this.scene.clear();
  }
}
