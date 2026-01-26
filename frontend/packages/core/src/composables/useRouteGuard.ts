/**
 * 路由守卫
 *
 * 在 UniApp 中拦截页面跳转，检查登录状态
 */
import { useUserStore } from '../stores';

/**
 * 公开路由白名单（不需要登录）
 */
const PUBLIC_ROUTES = [
  '/pages/index/index',      // 首页
  '/pages/login/index',      // 登录页
  '/pages/map/index',        // 空间热力图
];

/**
 * 需要登录的路由
 */
const PROTECTED_ROUTES = [
  '/pages/booking/index',        // 预约
  '/pages/seat/index',           // 选座
  '/pages/my-appointments/index',// 我的行程
  '/pages/rewards/index',        // 积分商城
  '/pages/profile/index',        // 个人中心
  '/pages/stats/index',          // 学习周报
  '/pages/notifications/index',  // 消息中心
  '/pages/settings/index',       // 偏好设置
  '/pages/achievements/index',   // 勋章墙
];

/**
 * 检查路由是否需要登录
 */
function isProtectedRoute(url: string): boolean {
  // 提取路径部分（去除查询参数）
  const path = url.split('?')[0];

  // 检查是否在保护路由列表中
  return PROTECTED_ROUTES.some(route => path === route || path.startsWith(route));
}

/**
 * 检查路由是否在白名单中
 */
function isPublicRoute(url: string): boolean {
  const path = url.split('?')[0];
  return PUBLIC_ROUTES.some(route => path === route || path.startsWith(route));
}

/**
 * 设置路由守卫
 *
 * 拦截所有页面跳转，检查登录状态
 */
export function setupRouteGuard() {
  const userStore = useUserStore();

  // 拦截 navigateTo
  uni.addInterceptor('navigateTo', {
    invoke(args: any) {
      const url = args.url;

      // 如果是公开路由，直接放行
      if (isPublicRoute(url)) {
        return true;
      }

      // 如果是保护路由但未登录，重定向到登录页
      if (isProtectedRoute(url) && !userStore.isAuthenticated) {
        console.warn('[RouteGuard] 未登录，重定向到登录页');
        uni.redirectTo({
          url: '/pages/login/index',
          success: () => {
            // 可以在这里显示提示
            console.log('[RouteGuard] 已重定向到登录页');
          },
        });
        return false; // 阻止原导航
      }

      return true;
    },
  });

  // 拦截 redirectTo
  uni.addInterceptor('redirectTo', {
    invoke(args: any) {
      const url = args.url;

      // 如果是公开路由，直接放行
      if (isPublicRoute(url)) {
        return true;
      }

      // 如果是保护路由但未登录，重定向到登录页
      if (isProtectedRoute(url) && !userStore.isAuthenticated) {
        console.warn('[RouteGuard] 未登录，重定向到登录页');
        uni.redirectTo({
          url: '/pages/login/index',
        });
        return false;
      }

      return true;
    },
  });

  // 拦截 switchTab（ tabBar 页面不能使用 redirectTo，需要用 switchTab）
  uni.addInterceptor('switchTab', {
    invoke(args: any) {
      const url = args.url;

      // 首页是公开的，直接放行
      if (url.includes('/pages/index/index')) {
        return true;
      }

      // 其他 tabBar 页面需要登录
      if (!userStore.isAuthenticated) {
        console.warn('[RouteGuard] 未登录，重定向到登录页');
        uni.navigateTo({
          url: '/pages/login/index',
        });
        return false;
      }

      return true;
    },
  });

  // 拦截 reLaunch
  uni.addInterceptor('reLaunch', {
    invoke(args: any) {
      const url = args.url;

      // 如果是公开路由，直接放行
      if (isPublicRoute(url)) {
        return true;
      }

      // 如果是保护路由但未登录，重定向到登录页
      if (isProtectedRoute(url) && !userStore.isAuthenticated) {
        console.warn('[RouteGuard] 未登录，重定向到登录页');
        uni.reLaunch({
          url: '/pages/login/index',
        });
        return false;
      }

      return true;
    },
  });

  console.log('[RouteGuard] 路由守卫已启用');
}

/**
 * 导航到指定页面（自动处理登录检查）
 *
 * @param url 目标页面 URL
 * @param type 导航类型：navigateTo | redirectTo | switchTab | reLaunch
 */
export function navigateTo(url: string, type: 'navigateTo' | 'redirectTo' | 'switchTab' | 'reLaunch' = 'navigateTo') {
  const userStore = useUserStore();

  // 如果是公开路由，直接导航
  if (isPublicRoute(url)) {
    uni[type]({ url });
    return;
  }

  // 如果是保护路由但未登录，先跳登录
  if (isProtectedRoute(url) && !userStore.isAuthenticated) {
    console.warn('[RouteGuard] 需要登录，跳转到登录页');
    uni.navigateTo({
      url: '/pages/login/index',
    });
    return;
  }

  // 已登录，正常导航
  uni[type]({ url });
}
