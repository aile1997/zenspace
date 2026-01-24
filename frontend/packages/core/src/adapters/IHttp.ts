/**
 * HTTP 请求适配器接口
 *
 * 用于抽象平台特定的请求 API（如 uni.request）
 */
export interface IHttp {
  /**
   * GET 请求
   * @param url 请求路径（不含 base URL）
   * @param params 查询参数
   * @returns 响应数据
   */
  get<T>(url: string, params?: Record<string, unknown>): Promise<T>;

  /**
   * POST 请求
   * @param url 请求路径（不含 base URL）
   * @param data 请求体
   * @returns 响应数据
   */
  post<T>(url: string, data?: unknown): Promise<T>;

  /**
   * PUT 请求
   * @param url 请求路径（不含 base URL）
   * @param data 请求体
   * @returns 响应数据
   */
  put<T>(url: string, data?: unknown): Promise<T>;

  /**
   * DELETE 请求
   * @param url 请求路径（不含 base URL）
   * @returns 响应数据
   */
  delete<T>(url: string): Promise<T>;

  /**
   * 设置认证 Token
   * @param token JWT Token
   */
  setAuthToken?(token: string): void;
}
