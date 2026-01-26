# 错误知识库
记录 GLM 犯过的错误，避免重蹈覆辙。

---

## API 404 错误：/api/v1/zones 路由不匹配

**日期**: 2026-01-26

**错误现象**:
```
GET http://localhost:3000/api/v1/zones
404 Not Found
```

**问题分析**:

1. **前端请求路径**: `/api/v1/zones`
2. **后端配置**:
   - 全局前缀: `api` (main.ts:8)
   - Controller 前缀: `booking` (booking.controller.ts:24)
   - 实际路由: `/api/booking/zones`

3. **根因**: 后端全局前缀未配置版本号 `v1`

**解决方案**:

修改 `backend/src/main.ts` 第 8 行：
```typescript
// 修改前
app.setGlobalPrefix('api');

// 修改后
app.setGlobalPrefix('api/v1');
```

**修改后路由结构**:
- 全局前缀: `/api/v1`
- Controller 前缀: `/booking`
- 最终路由: `/api/v1/booking/zones`

---

## 前端 API 路径错误：缺少 Controller 前缀

**日期**: 2026-01-26

**错误现象**:
```
GET http://localhost:3000/api/v1/zones
404 Not Found
```

**问题分析**:

1. **前端请求** (zone.ts:64): `http.get<ZonesResponse>('/zones')`
2. **后端实际路由**: `/api/v1/booking/zones`
3. **根因**: 前端请求路径缺少 `booking` Controller 前缀

**解决方案**:

修改 `frontend/packages/core/src/stores/zone.ts` 第 64 行：
```typescript
// 修改前
const response = await http.get<ZonesResponse>('/zones');

// 修改后
const response = await http.get<ZonesResponse>('/booking/zones');
```

**最终路由**:
- 前端请求: `/booking/zones`
- 完整 URL: `/api/v1/booking/zones`

---

## 批量修复：前端 API 路径缺少 Controller 前缀

**日期**: 2026-01-26

**问题范围**:

多个前端 Store 和 Composable 的 API 请求缺少 Controller 前缀，导致 404 错误。

**修复清单**:

### 1. Zone Store (zone.ts)
- `/zones` → `/booking/zones`

### 2. Booking Store (booking.ts)
- `/bookings` → `/booking/bookings` (POST - 创建预约)
- `/bookings` → `/booking/bookings` (GET - 获取预约列表)
- `/bookings/${id}` → `/booking/bookings/${id}` (DELETE - 取消预约)
- `/bookings/${id}/check-in` → `/booking/bookings/${id}/check-in`
- `/bookings/${id}/check-out` → `/booking/bookings/${id}/check-out`

### 3. Auth Composable (useAuth.ts)
- `/auth/sms-login` → `/auth/login` (后端只有 `/auth/login` 端点)

### 4. User Store (user.ts)
- 新增 `refreshToken` 状态管理
- 登录时保存 `refreshToken`
- 登出时清除 `refreshToken`
- 恢复时加载 `refreshToken`

**后端路由结构参考**:
```
/api/v1/
├── auth/              (@Controller('auth'))
│   ├── send-code
│   ├── login
│   ├── logout
│   ├── refresh
│   ├── profile
│   └── update-profile
└── booking/           (@Controller('booking'))
    ├── zones
    ├── zones/:zoneId/seats
    └── bookings/
        ├── (POST)
        ├── my (GET)
        └── :id (DELETE)
```

---

## API 500 错误：未登录访问受保护接口

**日期**: 2026-01-27

**错误现象**:
```
500 Internal Server Error
ERROR [ExceptionsHandler] Error: SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
```

**问题分析**:

1. 前端未登录时访问需要认证的接口
2. 后端数据库连接问题（可能与环境变量加载有关）
3. 缺少前端路由守卫和 API 错误处理

**解决方案**:

### 1. 创建路由守卫 ([useRouteGuard.ts](frontend/packages/core/src/composables/useRouteGuard.ts))

```typescript
// 公开路由白名单
const PUBLIC_ROUTES = [
  '/pages/index/index',      // 首页
  '/pages/login/index',      // 登录页
  '/pages/map/index',        // 空间热力图
];

// 保护路由（需要登录）
const PROTECTED_ROUTES = [
  '/pages/booking/index',
  '/pages/seat/index',
  '/pages/my-appointments/index',
  '/pages/rewards/index',
  '/pages/profile/index',
  '/pages/stats/index',
  '/pages/notifications/index',
  '/pages/settings/index',
  '/pages/achievements/index',
];
```

使用 `uni.addInterceptor` 拦截所有页面跳转：
- `navigateTo` - 普通跳转
- `redirectTo` - 重定向
- `switchTab` - 切换 Tab
- `reLaunch` - 重启应用

### 2. 增强 HTTP 适配器错误处理 ([adapters.ts](frontend/packages/ui/src/utils/adapters.ts))

```typescript
// 401 错误 - 清除登录信息并跳转登录页
if (res.statusCode === 401) {
  uni.removeStorageSync('token');
  uni.removeStorageSync('refreshToken');
  uni.removeStorageSync('user');
  uni.reLaunch({ url: '/pages/login/index' });
  reject(new Error('登录已过期，请重新登录'));
}

// 500 错误 - 友好提示
if (res.statusCode === 500) {
  console.error('[UniHttp] 服务器错误:', res.data);
  reject(new Error('服务器错误，请稍后重试'));
}
```

### 3. App.vue 初始化 ([App.vue](frontend/packages/ui/src/App.vue))

```typescript
onLaunch(async () => {
  // 1. 恢复用户登录状态
  await userStore.restore();

  // 2. 设置路由守卫
  setupRouteGuard();
});
```

**效果**:
- ✅ 未登录用户访问保护路由 → 自动跳转登录页
- ✅ API 返回 401 → 自动清除登录状态并跳转登录页
- ✅ API 返回 500 → 显示友好错误提示

---

