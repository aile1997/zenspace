/**
 * 适配器接口统一导出
 */

export * from './IStorage';
export * from './IHttp';
export * from './ILocation';

/**
 * 适配器容器
 * 用于在运行时注入平台特定的实现
 */
export interface Adapters {
  storage: import('./IStorage').IStorage;
  http: import('./IHttp').IHttp;
  location?: import('./ILocation').ILocation;
}

/**
 * 全局适配器注册表
 */
let registeredAdapters: Adapters | null = null;

/**
 * 注册平台适配器
 * @param adapters 适配器实例
 */
export function registerAdapters(adapters: Adapters): void {
  registeredAdapters = adapters;
}

/**
 * 获取已注册的适配器
 * @returns 适配器实例
 * @throws 如果未注册适配器
 */
export function getAdapters(): Adapters {
  if (!registeredAdapters) {
    throw new Error('适配器未注册，请先调用 registerAdapters()');
  }
  return registeredAdapters;
}
