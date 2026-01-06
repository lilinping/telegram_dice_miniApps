/**
 * API 缓存层 - 减少重复请求，提升性能
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache: Map<string, CacheItem<any>>;
  private pendingRequests: Map<string, Promise<any>>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.maxSize = maxSize;
  }

  /**
   * 生成缓存键
   */
  private generateKey(endpoint: string, params?: any): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${endpoint}:${paramStr}`;
  }

  /**
   * 获取缓存数据
   */
  get<T>(endpoint: string, params?: any): T | null {
    const key = this.generateKey(endpoint, params);
    const item = this.cache.get(key);

    if (!item) return null;

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * 设置缓存数据
   */
  set<T>(endpoint: string, data: T, ttl: number = 60000, params?: any): void {
    const key = this.generateKey(endpoint, params);

    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * 删除缓存
   */
  delete(endpoint: string, params?: any): void {
    const key = this.generateKey(endpoint, params);
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * 清空特定前缀的缓存
   */
  clearByPrefix(prefix: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * 防止重复请求 - 如果相同请求正在进行中，返回同一个 Promise
   */
  async dedupe<T>(
    endpoint: string,
    fetcher: () => Promise<T>,
    params?: any
  ): Promise<T> {
    const key = this.generateKey(endpoint, params);

    // 如果有正在进行的请求，返回该 Promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // 创建新请求
    const promise = fetcher().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      pendingRequests: this.pendingRequests.size,
    };
  }
}

// 导出单例
export const apiCache = new APICache(100);

// 缓存配置 - 不同 API 的缓存时间
export const CACHE_TTL = {
  // 用户信息 - 5分钟
  USER: 5 * 60 * 1000,
  // 账户余额 - 30秒（频繁更新）
  BALANCE: 30 * 1000,
  // 游戏历史 - 2分钟
  HISTORY: 2 * 60 * 1000,
  // 统计数据 - 5分钟
  STATISTICS: 5 * 60 * 1000,
  // 配置数据 - 10分钟
  CONFIG: 10 * 60 * 1000,
  // 全局游戏结果 - 10秒
  GLOBAL_RESULTS: 10 * 1000,
  // 反水信息 - 1分钟
  REBATE: 60 * 1000,
  // 通知列表 - 30秒
  NOTIFICATIONS: 30 * 1000,
} as const;
