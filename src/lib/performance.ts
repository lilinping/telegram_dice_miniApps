/**
 * 性能优化工具函数
 */

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 延迟加载图片
export function lazyLoadImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
}

// 预加载关键资源
export function preloadResources(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(url => {
      if (url.endsWith('.mp3') || url.endsWith('.wav')) {
        // 音频预加载
        return new Promise<void>((resolve) => {
          const audio = new Audio();
          audio.oncanplaythrough = () => resolve();
          audio.onerror = () => resolve(); // 即使失败也继续
          audio.src = url;
        });
      } else {
        // 图片预加载
        return lazyLoadImage(url).then(() => {}).catch(() => {});
      }
    })
  );
}

// 内存优化：清理未使用的对象
export function cleanupUnusedObjects<T extends object>(
  cache: Map<string, T>,
  maxSize: number = 50
): void {
  if (cache.size > maxSize) {
    const keysToDelete = Array.from(cache.keys()).slice(0, cache.size - maxSize);
    keysToDelete.forEach(key => cache.delete(key));
  }
}

// 检测设备性能
export function getDevicePerformance(): 'high' | 'medium' | 'low' {
  if (typeof window === 'undefined') return 'medium';
  
  // 检测硬件并发数
  const cores = navigator.hardwareConcurrency || 2;
  
  // 检测内存（如果可用）
  const memory = (navigator as any).deviceMemory || 4;
  
  // 检测连接速度
  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType || '4g';
  
  // 综合评分
  let score = 0;
  
  if (cores >= 8) score += 3;
  else if (cores >= 4) score += 2;
  else score += 1;
  
  if (memory >= 8) score += 3;
  else if (memory >= 4) score += 2;
  else score += 1;
  
  if (effectiveType === '4g') score += 2;
  else if (effectiveType === '3g') score += 1;
  
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

// 请求空闲回调（优化非关键任务）
export function requestIdleCallback(callback: () => void, timeout: number = 2000): void {
  if (typeof window === 'undefined') {
    callback();
    return;
  }
  
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}

// 批量更新优化
export function batchUpdates<T>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => void | Promise<void>
): Promise<void> {
  return new Promise(async (resolve) => {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await processor(batch);
      
      // 让出主线程
      await new Promise(r => setTimeout(r, 0));
    }
    resolve();
  });
}

// 监控性能指标
export function measurePerformance(name: string, fn: () => void): void {
  if (typeof window === 'undefined' || !window.performance) {
    fn();
    return;
  }
  
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;
  
  performance.mark(startMark);
  fn();
  performance.mark(endMark);
  
  try {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name)[0];
    console.log(`⚡ ${name}: ${measure.duration.toFixed(2)}ms`);
  } catch (e) {
    // 忽略错误
  }
}

// Web Worker 支持检测
export function supportsWebWorker(): boolean {
  return typeof Worker !== 'undefined';
}

// IndexedDB 支持检测
export function supportsIndexedDB(): boolean {
  return typeof indexedDB !== 'undefined';
}

// 本地存储优化
export class OptimizedStorage {
  private prefix: string;
  
  constructor(prefix: string = 'app') {
    this.prefix = prefix;
  }
  
  set(key: string, value: any, ttl?: number): void {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        ttl: ttl || null,
      };
      localStorage.setItem(`${this.prefix}:${key}`, JSON.stringify(item));
    } catch (e) {
      console.warn('Storage quota exceeded');
    }
  }
  
  get<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(`${this.prefix}:${key}`);
      if (!itemStr) return null;
      
      const item = JSON.parse(itemStr);
      
      // 检查是否过期
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.remove(key);
        return null;
      }
      
      return item.value;
    } catch (e) {
      return null;
    }
  }
  
  remove(key: string): void {
    localStorage.removeItem(`${this.prefix}:${key}`);
  }
  
  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(`${this.prefix}:`)) {
        localStorage.removeItem(key);
      }
    });
  }
}
