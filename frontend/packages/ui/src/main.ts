/**
 * ZenSpace UniApp 应用入口
 *
 * 职责：
 * 1. 创建 Vue 应用实例
 * 2. 配置 Pinia
 * 3. 注入平台适配器
 * 4. 挂载应用
 */
import { createSSRApp } from 'vue';
import * as Pinia from 'pinia';
import { registerAdapters } from '@zenspace/core/adapters';
import { UniStorage, UniHttp } from './utils/adapters';
import App from './App.vue';

export function createApp() {
  const app = createSSRApp(App);

  // 配置 Pinia
  const pinia = Pinia.createPinia();
  app.use(pinia);

  // 注入平台适配器
  registerAdapters({
    storage: new UniStorage(),
    http: new UniHttp('http://localhost:3000/api/v1'),
  });

  return { app };
}

// 启动应用
const { app } = createApp();
app.mount('#app');
