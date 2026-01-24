/**
 * 定位适配器接口
 *
 * 用于抽象平台特定的定位 API
 */
export interface ILocation {
  /**
   * 获取当前位置
   * @returns 位置信息
   */
  getCurrentPosition(): Promise<{
    latitude: number;
    longitude: number;
  }>;

  /**
   * 计算两点间距离（单位：米）
   * @param lat1 起点纬度
   * @param lon1 起点经度
   * @param lat2 终点纬度
   * @param lon2 终点经度
   * @returns 距离（米）
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number;
}
