import { PrismaClient, SeatType, SeatStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// 加载环境变量
import { config } from 'dotenv';
config();

// 创建连接池和适配器（与 PrismaService 相同的模式）
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('开始种子数据...');

  // 创建区域
  const zone1F = await prisma.zone.upsert({
    where: { id: 'zone-1f' },
    update: {},
    create: {
      id: 'zone-1f',
      name: '综合阅览区',
      floor: 1,
      description: '开放式阅览空间，配备舒适座椅',
      capacity: 48,
      hourlyPrice: 10,
      vipPrice: 8,
      tags: ['WiFi', '充电插座', '自然采光'],
      openTime: '08:00',
      closeTime: '22:00',
    },
  });

  const zone2F = await prisma.zone.upsert({
    where: { id: 'zone-2f' },
    update: {},
    create: {
      id: 'zone-2f',
      name: '静音研讨区',
      floor: 2,
      description: '安静的学习环境，适合深度工作',
      capacity: 36,
      hourlyPrice: 15,
      vipPrice: 12,
      tags: ['WiFi', '充电插座', '台灯', '静音'],
      openTime: '08:00',
      closeTime: '22:00',
    },
  });

  const zone3F = await prisma.zone.upsert({
    where: { id: 'zone-3f' },
    update: {},
    create: {
      id: 'zone-3f',
      name: '协作办公台',
      floor: 3,
      description: '适合小组讨论和协作工作',
      capacity: 24,
      hourlyPrice: 20,
      vipPrice: 16,
      tags: ['WiFi', '充电插座', '白板', '投影仪'],
      openTime: '09:00',
      closeTime: '21:00',
    },
  });

  console.log('区域创建完成');

  // 为 1F 区域创建座位（8行8列，去掉中间走廊）
  const seats1F = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      // 走廊位置（第3、4列）
      if (x === 3 || x === 4) continue;

      const label = `${String.fromCharCode(65 + y)}${x + 1}`;
      const type = x === 0 || x === 7 ? SeatType.WINDOW : SeatType.STANDARD;
      const status = Math.random() < 0.3 ? SeatStatus.OCCUPIED : SeatStatus.AVAILABLE;

      seats1F.push({
        id: `seat-${label.toLowerCase()}`,
        zoneId: zone1F.id,
        label,
        x,
        y,
        type,
        status,
      });
    }
  }

  await prisma.seat.createMany({
    data: seats1F,
    skipDuplicates: true,
  });

  console.log('1F 座位创建完成');

  // 为 2F 区域创建座位
  const seats2F = [];
  for (let y = 0; y < 6; y++) {
    for (let x = 0; x < 6; x++) {
      if (x === 3 || x === 4) continue;

      const label = `${String.fromCharCode(65 + y)}${x + 1}`;
      const type = x === 0 || x === 5 ? SeatType.WINDOW : SeatType.STANDARD;
      const status = Math.random() < 0.25 ? SeatStatus.OCCUPIED : SeatStatus.AVAILABLE;

      seats2F.push({
        id: `seat-2f-${label.toLowerCase()}`,
        zoneId: zone2F.id,
        label,
        x,
        y,
        type,
        status,
      });
    }
  }

  await prisma.seat.createMany({
    data: seats2F,
    skipDuplicates: true,
  });

  console.log('2F 座位创建完成');

  // 为 3F 区域创建座位
  const seats3F = [];
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 6; x++) {
      const label = `${String.fromCharCode(65 + y)}${x + 1}`;
      const type = SeatType.STANDARD;
      const status = Math.random() < 0.15 ? SeatStatus.OCCUPIED : SeatStatus.AVAILABLE;

      seats3F.push({
        id: `seat-3f-${label.toLowerCase()}`,
        zoneId: zone3F.id,
        label,
        x,
        y,
        type,
        status,
      });
    }
  }

  await prisma.seat.createMany({
    data: seats3F,
    skipDuplicates: true,
  });

  console.log('3F 座位创建完成');
  console.log('种子数据完成!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
