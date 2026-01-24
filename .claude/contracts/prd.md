# ZenSpace 智能自习室 - 产品需求文档 (PRD)

> **文档状态**: 📋 待审核  
> **版本**: v1.0.0  
> **创建日期**: 2026-01-23  
> **契约锁定**: ⏳ 待用户确认

---

## 1. 产品概述

### 1.1 产品定位

**ZenSpace** 是一款面向城市白领、学生群体的 **智能自习室预约平台**，通过移动端 App 提供座位实时查询、在线预约、智能签到、学习数据追踪等服务，打造沉浸式学习体验。

### 1.2 目标用户

| 用户画像        | 核心诉求                       |
| :-------------- | :----------------------------- |
| 考研/考公备考生 | 需要安静、稳定的长时段学习环境 |
| 职场充电族      | 下班后/周末的高效学习空间      |
| 自由职业者      | 灵活办公，按需付费             |
| 学生群体        | 逃离宿舍/图书馆的专注空间      |

### 1.3 核心价值主张

```
🎯 "一键预约 → 扫码入座 → 专注学习 → 积分激励"
```

---

## 2. 功能架构

### 2.1 功能模块总览

```mermaid
graph TB
    subgraph 用户端App
        A[首页] --> B[实时座位状态]
        A --> C[快速预约]
        A --> D[积分商城]

        E[预约中心] --> E1[日期选择]
        E1 --> E2[区域筛选]
        E2 --> E3[座位选择]
        E3 --> E4[时段确认]
        E4 --> E5[在线支付]

        F[我的] --> F1[预约管理]
        F1 --> F2[签到/签退]
        F --> F3[学习统计]
        F --> F4[成就徽章]
        F --> F5[消息中心]
        F --> F6[设置]
    end

    subgraph 后端服务
        G[API Gateway] --> H[用户服务]
        G --> I[预约服务]
        G --> J[座位服务]
        G --> K[支付服务]
        G --> L[积分服务]
        G --> M[通知服务]
    end
```

### 2.2 MVP 功能清单

| 模块         | 功能点                   | 优先级 | 复杂度 |
| :----------- | :----------------------- | :----: | :----: |
| **核心预约** | 日期→区域→座位→时段→支付 |   P0   | ⭐⭐⭐ |
| **我的预约** | 查看/取消/签到/签退      |   P0   |  ⭐⭐  |
| **实时座位** | WebSocket 座位状态推送   |   P0   | ⭐⭐⭐ |
| **学习统计** | 日/周/月时长图表         |   P1   |  ⭐⭐  |
| **积分商城** | 积分赚取 + 兑换商品      |   P1   | ⭐⭐⭐ |
| **成就系统** | 徽章解锁 + 展示          |   P2   |  ⭐⭐  |
| **门店地图** | 静态楼层图 + 区域导航    |   P2   |   ⭐   |
| **消息中心** | 系统/预约/成就/促销通知  |   P1   |  ⭐⭐  |

---

## 3. 业务规则

### 3.1 收费模型

#### 计费方式：按小时计费

| 规则项       | 定义                        |
| :----------- | :-------------------------- |
| 计费单位     | 1 小时                      |
| 最小预约时长 | 1 小时                      |
| 最大预约时长 | 12 小时/单次                |
| 计费精度     | 整点开始（如 14:00、15:00） |

#### 区域差异定价

| 区域类型    | 基础价格 | VIP价格  | 特点               |
| :---------- | :------: | :------: | :----------------- |
| 静音研讨区  | ¥15/小时 | ¥12/小时 | 绝对安静、独立电源 |
| 综合阅览区  | ¥10/小时 | ¥8/小时  | 自然光、开放式     |
| 协作办公区  | ¥12/小时 | ¥10/小时 | 可交谈、配白板     |
| 包间/小组间 | ¥25/小时 | ¥20/小时 | 2-6人独立空间      |

> [!NOTE] 以上价格为参考值，可在后台管理系统动态配置。

### 3.2 预约规则

| 规则项       | 定义                         |
| :----------- | :--------------------------- |
| 预约窗口     | 可预约未来 7 天内的座位      |
| 时段选择     | 精确到小时（如 14:00-18:00） |
| 营业时间     | 07:00 - 23:00（可配置）      |
| 同时预约上限 | 普通用户 2 个，VIP 用户 5 个 |

### 3.3 取消与退款政策

```mermaid
flowchart LR
    A[用户发起取消] --> B{距开始时间}
    B -->|≥ 2小时| C[全额退款]
    B -->|1-2小时| D[扣除30%手续费]
    B -->|< 1小时| E[不可退款]
    B -->|已签到| F[按实际使用时长计费]
```

| 取消时机        |         退款比例         |
| :-------------- | :----------------------: |
| 开始前 ≥ 2 小时 |           100%           |
| 开始前 1-2 小时 |           70%            |
| 开始前 < 1 小时 |            0%            |
| 已签到提前离开  | 按实际使用计费，余额退还 |

### 3.4 签到规则

#### 签到方式（二选一即可）

| 方式             | 实现                             | 触发条件     |
| :--------------- | :------------------------------- | :----------- |
| **扫码签到**     | 用户展示预约二维码，前台扫码确认 | 用户主动操作 |
| **GPS 自动签到** | 进入门店 50 米范围自动签到       | 后台静默触发 |

#### 超时处理

| 规则               | 行为                                         |
| :----------------- | :------------------------------------------- |
| 超时 15 分钟未签到 | 座位自动释放、订单标记为"爽约"               |
| 爽约惩罚           | 扣除信用分 10 分，连续 3 次爽约限制预约 7 天 |

---

## 4. 用户体系

### 4.1 登录方式

| 方式            | 优先级 | 备注                     |
| :-------------- | :----: | :----------------------- |
| 📱 手机验证码   |   P0   | 主流程，60秒重发限制     |
| 💬 微信一键登录 |   P0   | OAuth2.0，需微信开放平台 |
| 🔑 账号密码     |   P1   | 可选，支持找回密码       |

### 4.2 会员等级

| 等级         | 条件                         | 权益                             |
| :----------- | :--------------------------- | :------------------------------- |
| **普通用户** | 注册即获得                   | 标准价格、同时预约 2 个          |
| **VIP 用户** | 购买会员卡 / 累计消费 ≥ ¥500 | 8折优惠、同时预约 5 个、专属客服 |

#### VIP 套餐（参考）

| 套餐 | 价格 | 有效期 | 折扣 |
| :--- | :--: | :----: | :--: |
| 月卡 | ¥99  | 30 天  | 8折  |
| 季卡 | ¥249 | 90 天  | 8折  |
| 年卡 | ¥799 | 365 天 | 8折  |

### 4.3 积分体系

#### 积分获取

| 行为            |    积分    |
| :-------------- | :--------: |
| 完成 1 小时学习 |   +10 分   |
| 首次预约        |   +50 分   |
| 连续签到 7 天   |  +100 分   |
| 邀请好友注册    |  +200 分   |
| 完成成就解锁    | +50~500 分 |

#### 积分消耗

| 商品类型 | 积分范围  | 示例         |
| :------- | :-------: | :----------- |
| 饮品券   |  100-300  | 咖啡兑换券   |
| 时长抵扣 | 500-1000  | 1小时免费券  |
| 周边商品 | 1000-5000 | 笔记本、文具 |

---

## 5. 技术架构

### 5.1 系统架构

```mermaid
graph TB
    subgraph 客户端["客户端 (UniApp 多端)"]
        H5[H5 网页]
        WeApp[微信小程序]
        iOS[iOS App]
        Android[Android App]
    end

    subgraph 网关层
        Gateway[API Gateway / Nginx]
    end

    subgraph 应用层
        UserSvc[用户服务]
        BookingSvc[预约服务]
        SeatSvc[座位服务]
        PaymentSvc[支付服务]
        PointsSvc[积分服务]
        NotifySvc[通知服务]
    end

    subgraph 数据层
        PostgreSQL[(PostgreSQL)]
        Redis[(Redis)]
        MQ[消息队列]
    end

    subgraph 第三方
        WeChat[微信开放平台]
        SMS[短信服务]
        Payment[支付渠道]
        Push[推送服务]
    end

    H5 --> Gateway
    WeApp --> Gateway
    iOS --> Gateway
    Android --> Gateway
    Gateway --> UserSvc
    Gateway --> BookingSvc
    Gateway --> SeatSvc
    Gateway --> PaymentSvc
    Gateway --> PointsSvc
    Gateway --> NotifySvc

    UserSvc --> PostgreSQL
    BookingSvc --> PostgreSQL
    SeatSvc --> Redis
    PaymentSvc --> PostgreSQL
    PointsSvc --> PostgreSQL
    NotifySvc --> MQ

    UserSvc --> WeChat
    UserSvc --> SMS
    PaymentSvc --> Payment
    NotifySvc --> Push
```

### 5.2 技术选型

| 层级          | 技术                                 | 版本 |
| :------------ | :----------------------------------- | :--- |
| **跨端框架**  | UniApp                               | 3.0+ |
| **前端框架**  | Vue 3 + TypeScript (Composition API) | 3.4+ |
| **UI 组件库** | uv-ui / uView Plus                   | -    |
| **状态管理**  | Pinia                                | 2.x  |
| **后端框架**  | Node.js + NestJS + TypeScript        | 10.x |
| **数据库**    | PostgreSQL                           | 16+  |
| **ORM**       | Prisma                               | 5.x  |
| **缓存**      | Redis                                | 7+   |
| **消息队列**  | BullMQ (Redis-based)                 | -    |
| **实时通信**  | Socket.IO                            | 4.x  |
| **测试**      | Vitest (Frontend) / Jest (Backend)   | -    |

> [!TIP] **为什么后端改用 Node.js + NestJS？**
>
> 经过评估，对于前端开发者来说 **Node.js 确实更友好方便**：
>
> - 🟢 **语言统一**：前后端都是 TypeScript，学习成本为零
> - 🟢 **类型共享**：前后端可以共用 interface 定义
> - 🟢 **工具链统一**：npm/pnpm、ESLint、Prettier 全家通用
> - 🟢 **调试简单**：VS Code 调试无缝衔接
> - 🟢 **NestJS 优势**：架构规范、依赖注入、装饰器模式，对标 Spring Boot

> [!TIP] **为什么选择 UniApp + Vue 3？**
>
> - 一套代码，多端发布：H5 / 微信小程序 / iOS App / Android App
> - Vue 3 Composition API 更适合复杂业务逻辑
> - 丰富的 uniCloud 生态可选（本项目使用自建后端）

---

## 5.3 后端搭建详细指南（前端友好版 - Node.js）

> [!IMPORTANT] **本节由 AI 完成开发，你只需要理解和审核**
>
> 以下指南帮助你理解后端的工作方式。实际代码由 AI 编写，你负责：
>
> - 理解每个步骤的目的
> - 审核生成的代码
> - 运行验证命令

---

### Step 1: 环境准备

#### 1.1 安装 Node.js

```powershell
# Windows: 下载 LTS 版本安装包
# https://nodejs.org/ (选择 20.x LTS)

# 验证安装
node --version   # 应显示 v20.x.x
npm --version    # 应显示 10.x.x

# 推荐：使用 pnpm 替代 npm（更快、更省空间）
npm install -g pnpm
pnpm --version
```

#### 1.2 安装 PostgreSQL

```powershell
# Windows: 下载安装包
# https://www.postgresql.org/download/windows/

# 安装时记住设置的密码（如 postgres123）
# 默认端口 5432

# 验证安装（在 PowerShell 中）
psql --version
```

#### 1.3 安装 Redis

```powershell
# 推荐使用 Docker Desktop（最简单的方式）
# 下载: https://www.docker.com/products/docker-desktop/

# 启动 Redis 容器
docker run -d --name redis -p 6379:6379 redis:7-alpine

# 验证运行
docker ps  # 应看到 redis 容器
```

---

### Step 2: 创建 NestJS 项目

> [!NOTE] **这一步由 AI 自动完成**，你只需要理解项目结构

```powershell
# AI 会执行以下命令创建项目
npx @nestjs/cli new backend --package-manager pnpm --skip-git

# 安装核心依赖
cd backend
pnpm add @nestjs/config @nestjs/swagger
pnpm add @prisma/client prisma
pnpm add @nestjs/passport passport passport-jwt
pnpm add bcrypt class-validator class-transformer
pnpm add ioredis @nestjs/schedule
pnpm add -D @types/passport-jwt @types/bcrypt
```

#### 项目结构说明

```
backend/
├── src/
│   ├── main.ts                 # 🚀 应用入口，启动服务器
│   ├── app.module.ts           # 📦 根模块，组装所有功能模块
│   │
│   ├── common/                 # 🔧 通用工具
│   │   ├── decorators/         # 自定义装饰器
│   │   ├── filters/            # 异常过滤器
│   │   ├── guards/             # 认证守卫
│   │   └── interceptors/       # 拦截器
│   │
│   ├── modules/                # 📁 业务模块（核心代码在这里）
│   │   ├── auth/               # 🔐 认证模块
│   │   │   ├── auth.controller.ts    # 处理 /auth/* 请求
│   │   │   ├── auth.service.ts       # 登录/注册逻辑
│   │   │   └── auth.module.ts        # 模块配置
│   │   │
│   │   ├── users/              # 👤 用户模块
│   │   ├── bookings/           # 📅 预约模块
│   │   ├── seats/              # 💺 座位模块
│   │   ├── zones/              # 🏢 区域模块
│   │   └── payments/           # 💰 支付模块
│   │
│   └── prisma/                 # 🗄️ 数据库
│       └── prisma.service.ts   # Prisma 客户端服务
│
├── prisma/
│   └── schema.prisma           # 📋 数据库模型定义
│
├── test/                       # 🧪 测试文件
├── .env                        # ⚙️ 环境变量（数据库密码等）
└── package.json                # 📦 依赖清单
```

---

### Step 3: 理解 NestJS 核心概念

> [!TIP] **NestJS 结构 = Vue 组件思维**
>
> 如果你熟悉 Vue，可以这样类比：
>
> - **Module** ≈ Vue 的 `App.vue`（组装各个部分）
> - **Controller** ≈ Vue 的 `template`（处理请求，定义路由）
> - **Service** ≈ Vue 的 `script`（业务逻辑）
> - **DTO** ≈ Vue 的 `props` 类型定义

#### 3.1 一个完整的例子：创建区域接口

```typescript
// ============================================
// 文件: src/modules/zones/zones.controller.ts
// 用途: 处理 /api/zones 的所有 HTTP 请求
// ============================================

import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ZonesService } from "./zones.service";
import { CreateZoneDto } from "./dto/create-zone.dto";

@Controller("zones") // 👈 定义路由前缀 /zones
export class ZonesController {
  // 依赖注入：NestJS 自动创建 ZonesService 实例
  constructor(private readonly zonesService: ZonesService) {}

  // GET /api/zones - 获取所有区域
  @Get()
  async findAll() {
    return this.zonesService.findAll();
  }

  // GET /api/zones/:id - 获取单个区域
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.zonesService.findOne(id);
  }

  // POST /api/zones - 创建新区域
  @Post()
  async create(@Body() createZoneDto: CreateZoneDto) {
    return this.zonesService.create(createZoneDto);
  }
}
```

```typescript
// ============================================
// 文件: src/modules/zones/zones.service.ts
// 用途: 区域相关的业务逻辑（查询、创建等）
// ============================================

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateZoneDto } from "./dto/create-zone.dto";

@Injectable() // 👈 标记为可注入的服务
export class ZonesService {
  constructor(private prisma: PrismaService) {}

  // 查询所有区域
  async findAll() {
    return this.prisma.zone.findMany({
      include: { seats: true }, // 关联查询座位
    });
  }

  // 根据 ID 查询单个区域
  async findOne(id: string) {
    return this.prisma.zone.findUnique({
      where: { id },
      include: { seats: true },
    });
  }

  // 创建新区域
  async create(data: CreateZoneDto) {
    return this.prisma.zone.create({ data });
  }
}
```

---

### Step 4: 数据库配置 (Prisma)

#### 4.1 环境变量配置

```env
# 文件: .env
# 用途: 存储敏感配置，不提交到 Git

DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/zenspace"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-key-change-in-production"
```

#### 4.2 数据库模型定义

```prisma
// 文件: prisma/schema.prisma
// 用途: 定义数据库表结构（类似 TypeScript interface）

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户表
model User {
  id          String   @id @default(uuid())
  phone       String?  @unique
  wechatOpenId String? @unique @map("wechat_openid")
  nickname    String?
  avatar      String?
  level       UserLevel @default(NORMAL)
  points      Int      @default(0)
  creditScore Int      @default(100) @map("credit_score")
  createdAt   DateTime @default(now()) @map("created_at")

  bookings    Booking[]

  @@map("users")
}

enum UserLevel {
  NORMAL
  VIP
}

// 区域表
model Zone {
  id          String   @id @default(uuid())
  name        String
  floor       String
  capacity    Int
  hourlyPrice Decimal  @map("hourly_price")
  vipPrice    Decimal  @map("vip_price")
  tags        String[]
  imageUrl    String?  @map("image_url")

  seats       Seat[]

  @@map("zones")
}

// 座位表
model Seat {
  id      String     @id @default(uuid())
  zoneId  String     @map("zone_id")
  label   String
  type    SeatType   @default(STANDARD)
  status  SeatStatus @default(AVAILABLE)
  x       Int
  y       Int

  zone     Zone      @relation(fields: [zoneId], references: [id])
  bookings Booking[]

  @@map("seats")
}

enum SeatType {
  WINDOW
  STANDARD
  BOOTH
}

enum SeatStatus {
  AVAILABLE
  OCCUPIED
  MAINTENANCE
}
```

#### 4.3 数据库操作命令

| 操作               | 命令                                              | 说明           |
| :----------------- | :------------------------------------------------ | :------------- |
| 创建数据库         | `psql -U postgres -c "CREATE DATABASE zenspace;"` | 首次执行       |
| 同步模型到数据库   | `pnpm prisma db push`                             | 开发时快速同步 |
| 生成迁移文件       | `pnpm prisma migrate dev --name init`             | 生产环境推荐   |
| 打开数据库可视化   | `pnpm prisma studio`                              | 浏览器查看数据 |
| 生成 Prisma 客户端 | `pnpm prisma generate`                            | 更新类型定义   |

---

### Step 5: 常用命令速查

| 操作           | 命令              |
| :------------- | :---------------- |
| 启动开发服务器 | `pnpm start:dev`  |
| 启动生产服务器 | `pnpm start:prod` |
| 运行测试       | `pnpm test`       |
| 运行 E2E 测试  | `pnpm test:e2e`   |
| 代码格式化     | `pnpm format`     |
| 代码检查       | `pnpm lint`       |
| 构建生产版本   | `pnpm build`      |

---

### Step 6: 前后端联调

#### 6.1 API 文档

启动后端后，访问 Swagger 文档：

- **地址**: `http://localhost:3000/api/docs`
- **功能**: 可视化 API 列表、在线测试接口

#### 6.2 前端请求封装 (UniApp / Vue 3)

```typescript
// ============================================
// 文件: src/utils/request.ts
// 用途: 封装 HTTP 请求，统一处理认证和错误
// ============================================

const BASE_URL = "http://localhost:3000/api";

interface RequestOptions extends Omit<UniApp.RequestOptions, "url"> {
  showLoading?: boolean;
}

export const request = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
  const { showLoading = true, ...restOptions } = options;

  // 获取存储的 token
  const token = uni.getStorageSync("token");

  // 显示加载提示
  if (showLoading) {
    uni.showLoading({ title: "加载中..." });
  }

  try {
    const response = await new Promise<UniApp.RequestSuccessCallbackResult>((resolve, reject) => {
      uni.request({
        url: BASE_URL + url,
        header: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
          ...restOptions.header,
        },
        ...restOptions,
        success: resolve,
        fail: reject,
      });
    });

    if (response.statusCode === 200) {
      return response.data as T;
    } else if (response.statusCode === 401) {
      // Token 过期，跳转登录
      uni.removeStorageSync("token");
      uni.redirectTo({ url: "/pages/login/index" });
      throw new Error("登录已过期");
    } else {
      throw new Error((response.data as any)?.message || "请求失败");
    }
  } finally {
    if (showLoading) {
      uni.hideLoading();
    }
  }
};

// ============================================
// 使用示例
// ============================================

// 获取区域列表
const zones = await request<Zone[]>("/zones");

// 创建预约
const booking = await request<Booking>("/bookings", {
  method: "POST",
  data: {
    seatId: "xxx",
    date: "2026-01-23",
    startTime: "14:00",
    endTime: "18:00",
  },
});
```

#### 6.3 CORS 配置

后端已配置 CORS，如需修改：

```typescript
// 文件: src/main.ts
app.enableCors({
  origin: ["http://localhost:5173", "http://localhost:8080"],
  credentials: true,
});
```

---

### 5.4 API 设计规范

- **风格**: RESTful
- **认证**: JWT (Access Token + Refresh Token)
- **版本控制**: URL 前缀 `/api/v1/`
- **响应格式**:

```json
{
  "code": 0,
  "message": "success",
  "data": { ... },
  "timestamp": 1706000000
}
```

---

## 6. 数据模型（核心实体）

### 6.1 ER 图

```mermaid
erDiagram
    USER ||--o{ BOOKING : creates
    USER ||--o{ POINT_LOG : earns
    USER ||--o{ ACHIEVEMENT : unlocks
    ZONE ||--o{ SEAT : contains
    SEAT ||--o{ BOOKING : reserves
    BOOKING ||--o{ PAYMENT : pays

    USER {
        uuid id PK
        string phone
        string wechat_openid
        string nickname
        string avatar
        enum level "normal|vip"
        int points
        int credit_score
        datetime created_at
    }

    ZONE {
        uuid id PK
        string name
        string floor
        int capacity
        decimal hourly_price
        decimal vip_price
        json tags
        string image_url
    }

    SEAT {
        uuid id PK
        uuid zone_id FK
        string label
        enum type "window|standard|booth"
        enum status "available|occupied|maintenance"
        int x
        int y
    }

    BOOKING {
        uuid id PK
        uuid user_id FK
        uuid seat_id FK
        date booking_date
        time start_time
        time end_time
        enum status "pending|confirmed|active|completed|cancelled|no_show"
        datetime check_in_at
        datetime check_out_at
        decimal amount
    }

    PAYMENT {
        uuid id PK
        uuid booking_id FK
        decimal amount
        enum channel "wechat|alipay"
        enum status "pending|paid|refunded"
        string transaction_id
    }
```

---

## 7. 非功能需求

### 7.1 性能要求

| 指标                | 目标值  |
| :------------------ | :-----: |
| API 响应时间（P95） | < 200ms |
| 座位状态更新延迟    | < 500ms |
| App 冷启动时间      |  < 3s   |
| 并发用户支持        |  1000+  |

### 7.2 安全要求

- 所有 API 通信使用 HTTPS
- 用户密码使用 bcrypt 加密存储
- 敏感操作（支付、取消）需二次验证
- 实现接口限流防止 DDoS

### 7.3 可用性

- 服务可用性 ≥ 99.9%
- 数据备份周期：每日增量 + 每周全量

---

## 8. 里程碑规划

| 阶段                | 周期 | 交付物                       |
| :------------------ | :--: | :--------------------------- |
| **M1: 核心预约**    | 4 周 | 预约流程、支付、我的预约     |
| **M2: 实时 + 签到** | 2 周 | WebSocket 座位状态、签到功能 |
| **M3: 用户增长**    | 3 周 | 积分商城、成就系统、统计     |
| **M4: 体验优化**    | 2 周 | 地图、通知、性能优化         |
| **M5: 上线准备**    | 1 周 | 测试、文档、部署             |

---

## 9. 待确认事项

> [!NOTE] 以下事项已经业务方确认：

| 事项            | 状态 | 确认结果                 |
| :-------------- | :--: | :----------------------- |
| 价格体系        |  ✅  | 采用参考定价             |
| 支付渠道        |  ✅  | 微信支付 + 支付宝 都接入 |
| 运营后台        |  ✅  | 需要同步开发管理后台     |
| 多门店支持      |  ✅  | MVP 即支持多门店切换     |
| 短信/推送服务商 |  ✅  | 无指定，由开发选型       |

---

## 10. 工作模式说明

> [!IMPORTANT] **AI 完成开发 + 用户 Review 模式**

本项目采用 **AI 主导开发** 模式：

| 角色                       | 职责                         |
| :------------------------- | :--------------------------- |
| **AI (Architect/Builder)** | 编写代码、实现功能、处理报错 |
| **用户 (Reviewer)**        | 审核代码、理解逻辑、提供反馈 |

**为确保你能理解和审核代码，AI 会：**

1. ✅ 每个文件顶部添加 **文件用途说明**
2. ✅ 关键函数添加 **详细注释**（解释“为什么”而不仅仅是“是什么”）
3. ✅ 复杂逻辑附带 **流程图或时序图**
4. ✅ 每个模块完成后提供 **Review 检查清单**
5. ✅ 提供 **操作教程**（如何运行、如何调试、如何测试）

---

**📌 这份契约已确认。输入 `/ui` 进入设计阶段，或继续补充细节？**
