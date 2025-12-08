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
    // 相机位置：从斜上方观察，确保能看到骰子和筛盅
    this.camera.position.set(0, 6, 10);
    this.camera.lookAt(0, 1, 0); // 看向桌面中心

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas: config.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance', // 性能优化
    });
    this.renderer.setSize(config.width, config.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    // 启用输出编码，增强颜色表现
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 添加光照
    this.setupLights();

    // 添加桌面
    this.createTable();
  }

  private setupLights() {
    // 环境光 - 提供基础照明（增强）
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    // 主光源 - 模拟顶部照明（增强阴影质量）
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.directionalLight.position.set(5, 12, 5);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 50;
    this.directionalLight.shadow.camera.left = -10;
    this.directionalLight.shadow.camera.right = 10;
    this.directionalLight.shadow.camera.top = 10;
    this.directionalLight.shadow.camera.bottom = -10;
    this.directionalLight.shadow.bias = -0.0001; // 减少阴影瑕疵
    this.scene.add(this.directionalLight);

    // 聚光灯 - 增强戏剧效果（金色光，用于玻璃反射）
    this.spotLight = new THREE.SpotLight(0xffd700, 1.0);
    this.spotLight.position.set(0, 15, 0);
    this.spotLight.angle = Math.PI / 5;
    this.spotLight.penumbra = 0.3;
    this.spotLight.decay = 2;
    this.spotLight.distance = 30;
    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;
    this.scene.add(this.spotLight);

    // 添加辅助光源 - 填充阴影，增强玻璃反射
    const fillLight1 = new THREE.DirectionalLight(0x4488ff, 0.4);
    fillLight1.position.set(-5, 5, -5);
    this.scene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0xff8844, 0.3);
    fillLight2.position.set(5, 3, -5);
    this.scene.add(fillLight2);

    // 添加半球光 - 模拟天空和地面反射（增强玻璃环境反射）
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
    this.scene.add(hemisphereLight);

    // 添加点光源 - 增强玻璃边缘Fresnel效果
    const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 20);
    pointLight1.position.set(-3, 8, 3);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffd700, 0.4, 20);
    pointLight2.position.set(3, 8, -3);
    this.scene.add(pointLight2);
  }

  private createTable() {
    // 创建木质桌面（需求文档：木质/皮革主题）
    const tableGeometry = new THREE.BoxGeometry(20, 0.5, 20);
    const tableMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1810, // 深棕色木质
      roughness: 0.8,
      metalness: 0.1,
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = -0.25;
    table.receiveShadow = true;
    this.scene.add(table);

    // 创建环境贴图用于玻璃反射（需求文档：HDRI环境反射）
    // 优先使用 PMREMGenerator，备选方案：程序生成环境贴图
    try {
      const envMap = this.createEnvironmentMapWithPMREM();
      this.scene.environment = envMap;
    } catch (error) {
      console.warn('Failed to create environment map with PMREM, using fallback:', error);
      try {
        const envMap = this.createSimpleEnvironmentMap();
        this.scene.environment = envMap;
      } catch (fallbackError) {
        console.warn('Failed to create fallback environment map:', fallbackError);
        // 如果都失败，使用默认值（不影响渲染）
      }
    }
    
    // 为玻璃材质设置环境贴图（在材质创建时设置）
  }

  /**
   * 使用 PMREMGenerator 创建环境贴图（推荐方法）
   * 需求文档：HDRI环境反射
   */
  private createEnvironmentMapWithPMREM(): THREE.Texture {
    // 创建一个简单的渲染目标用于生成环境贴图
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    // 创建一个临时的场景用于生成环境贴图
    const tempScene = new THREE.Scene();
    
    // 添加渐变背景（从顶部金色到底部深色）
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size * 2; // 2:1 比例用于 equirectangular
    canvas.height = size;
    const context = canvas.getContext('2d')!;
    
    // 创建渐变
    const gradient = context.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, '#ffd700'); // 顶部金色
    gradient.addColorStop(0.5, '#ffffff'); // 中间白色
    gradient.addColorStop(1, '#1a1a1a'); // 底部深色
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // 创建纹理
    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    
    // 使用 PMREMGenerator 生成环境贴图
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    
    // 清理
    texture.dispose();
    pmremGenerator.dispose();
    
    return envMap;
  }

  /**
   * 创建简单的环境贴图（用于玻璃反射）
   * 如果没有HDRI，使用程序生成的渐变环境
   * 使用同步方式创建，避免图像加载问题
   */
  private createSimpleEnvironmentMap(): THREE.CubeTexture {
    const size = 256;
    const images: HTMLImageElement[] = [];

    // 创建6个面的图像
    for (let i = 0; i < 6; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Failed to get 2D context');
      }

      // 根据面创建不同的渐变
      let gradient: CanvasGradient;
      if (i === 0) { // 右面
        gradient = context.createLinearGradient(0, 0, size, 0);
        gradient.addColorStop(0, '#ffd700');
        gradient.addColorStop(1, '#ffffff');
      } else if (i === 1) { // 左面
        gradient = context.createLinearGradient(0, 0, size, 0);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#ffd700');
      } else if (i === 2) { // 上面
        gradient = context.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0, '#ffd700');
        gradient.addColorStop(1, '#ffffff');
      } else if (i === 3) { // 下面
        gradient = context.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#1a1a1a');
      } else { // 前面和后面
        const radialGradient = context.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        radialGradient.addColorStop(0, '#ffffff');
        radialGradient.addColorStop(1, '#1a1a1a');
        gradient = radialGradient;
      }

      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);

      // 创建图像并同步设置数据URL
      const img = document.createElement('img');
      img.width = size;
      img.height = size;
      // 使用 toDataURL 同步获取数据
      const dataURL = canvas.toDataURL('image/png');
      if (!dataURL) {
        throw new Error('Failed to create data URL');
      }
      img.src = dataURL;
      
      // 确保图像已加载（同步检查）
      if (img.complete) {
        images.push(img);
      } else {
        // 如果图像未立即加载，创建一个占位符
        const placeholder = document.createElement('canvas');
        placeholder.width = size;
        placeholder.height = size;
        const placeholderCtx = placeholder.getContext('2d');
        if (placeholderCtx) {
          placeholderCtx.fillStyle = '#ffffff';
          placeholderCtx.fillRect(0, 0, size, size);
          const placeholderImg = document.createElement('img');
          placeholderImg.width = size;
          placeholderImg.height = size;
          placeholderImg.src = placeholder.toDataURL('image/png');
          images.push(placeholderImg);
        } else {
          // 最后的备选方案：使用白色图像
          const whiteImg = document.createElement('img');
          whiteImg.width = size;
          whiteImg.height = size;
          whiteImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
          images.push(whiteImg);
        }
      }
    }

    // 创建CubeTexture
    // 注意：需要确保所有图像都已准备好
    if (images.length !== 6) {
      throw new Error(`Failed to create all 6 images for environment map. Got ${images.length} images.`);
    }
    
    const cubeTexture = new THREE.CubeTexture(images);
    cubeTexture.mapping = THREE.CubeReflectionMapping;
    cubeTexture.needsUpdate = true;

    return cubeTexture;
  }

  public resize(width: number, height: number) {
    if (!this.renderer) {
      console.warn('Renderer not initialized, skipping resize');
      return;
    }
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public render() {
    // 安全检查：确保 renderer 已初始化
    if (!this.renderer) {
      console.warn('Renderer not initialized, skipping render');
      return;
    }
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    if (this.renderer) {
      this.renderer.dispose();
    }
    this.scene.clear();
  }
}
