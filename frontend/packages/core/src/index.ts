/**
 * ZenSpace Core - 平台无关的业务逻辑层
 *
 * 核心原则：
 * 1. 严禁出现 uni.xxx、wx.xxx 等平台特定 API
 * 2. 平台功能通过 adapters 接口注入
 * 3. 所有类型定义在 types/ 目录
 * 4. 状态管理使用 Pinia stores
 * 5. 业务逻辑使用 composables
 */

// 导出所有类型
export * from './types';

// 导出所有适配器接口
export * from './adapters';

// 导出所有 stores
export * from './stores';

// 导出所有 composables
export * from './composables';
