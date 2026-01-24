/**
 * 存储适配器接口
 *
 * 用于抽象平台特定的存储 API（如 uni.getStorageSync）
 */
export interface IStorage {
  /**
   * 获取存储值
   * @param key 存储键
   * @returns 存储的值，不存在则返回 null
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * 设置存储值
   * @param key 存储键
   * @param value 要存储的值
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * 移除存储值
   * @param key 存储键
   */
  remove(key: string): Promise<void>;

  /**
   * 清空所有存储
   */
  clear(): Promise<void>;
}
