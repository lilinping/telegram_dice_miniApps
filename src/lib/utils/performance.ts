/**
 * 性能检测和优化工具
 */

export interface DevicePerformance {
  tier: 'high' | 'medium' | 'low';
  supportsWebGL2: boolean;
  maxTextureSize: number;
  renderer: string;
  isMobile: boolean;
  pixelRatio: number;
}

/**
 * 检测设备性能等级
 */
export function detectDevicePerformance(): DevicePerformance {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  
  if (!gl) {
    return {
      tier: 'low',
      supportsWebGL2: false,
      maxTextureSize: 0,
      renderer: 'unknown',
      isMobile: isMobileDevice(),
      pixelRatio: window.devicePixelRatio || 1,
    };
  }

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = debugInfo 
    ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    : 'unknown';

  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const supportsWebGL2 = !!canvas.getContext('webgl2');

  // 根据GPU判断性能等级
  let tier: 'high' | 'medium' | 'low' = 'medium';

  if (typeof renderer === 'string') {
    const rendererLower = renderer.toLowerCase();
    
    // 低端GPU
    if (
      rendererLower.includes('mali-4') ||
      rendererLower.includes('adreno 3') ||
      rendererLower.includes('powervr sgx') ||
      rendererLower.includes('intel hd 3000') ||
      rendererLower.includes('intel hd 4000')
    ) {
      tier = 'low';
    }
    // 高端GPU
    else if (
      rendererLower.includes('nvidia') ||
      rendererLower.includes('geforce') ||
      rendererLower.includes('radeon') ||
      rendererLower.includes('adreno 6') ||
      rendererLower.includes('adreno 7') ||
      rendererLower.includes('mali-g') ||
      rendererLower.includes('apple gpu') ||
      rendererLower.includes('m1') ||
      rendererLower.includes('m2')
    ) {
      tier = 'high';
    }
  }

  // 移动设备降级
  if (isMobileDevice() && tier === 'high') {
    tier = 'medium';
  }

  return {
    tier,
    supportsWebGL2,
    maxTextureSize,
    renderer: renderer as string,
    isMobile: isMobileDevice(),
    pixelRatio: window.devicePixelRatio || 1,
  };
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * 根据性能等级获取优化配置
 */
export function getOptimizedSettings(performance: DevicePerformance) {
  switch (performance.tier) {
    case 'high':
      return {
        pixelRatio: Math.min(performance.pixelRatio, 2),
        shadowMapSize: 2048,
        antialias: true,
        physicsSteps: 3,
        particleCount: 100,
        usePostProcessing: true,
        usePBR: true,
        useTransmission: true,
      };
    
    case 'medium':
      return {
        pixelRatio: Math.min(performance.pixelRatio, 1.5),
        shadowMapSize: 1024,
        antialias: true,
        physicsSteps: 2,
        particleCount: 50,
        usePostProcessing: false,
        usePBR: true,
        useTransmission: false, // 禁用透明度（性能消耗大）
      };
    
    case 'low':
      return {
        pixelRatio: 1,
        shadowMapSize: 512,
        antialias: false,
        physicsSteps: 1,
        particleCount: 0,
        usePostProcessing: false,
        usePBR: false,
        useTransmission: false,
      };
  }
}

/**
 * FPS监控器
 */
export class FPSMonitor {
  private frames: number = 0;
  private lastTime: number = performance.now();
  private fps: number = 60;
  private callback?: (fps: number) => void;

  constructor(callback?: (fps: number) => void) {
    this.callback = callback;
  }

  public update() {
    this.frames++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;

    if (elapsed >= 1000) {
      this.fps = Math.round((this.frames * 1000) / elapsed);
      this.frames = 0;
      this.lastTime = currentTime;

      if (this.callback) {
        this.callback(this.fps);
      }
    }
  }

  public getFPS(): number {
    return this.fps;
  }
}

/**
 * 内存监控器
 */
export class MemoryMonitor {
  public getMemoryUsage(): number | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1048576); // MB
    }
    return null;
  }

  public getMemoryLimit(): number | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.jsHeapSizeLimit / 1048576); // MB
    }
    return null;
  }
}
