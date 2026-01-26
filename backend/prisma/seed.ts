import { PrismaClient, SeatType, SeatStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始填充数据...');

  // 创建区域
  const zone1F = await prisma.zone.upsert({
    where: { id: 'zone-1f' },
    update: {},
    create: {
      id: 'zone-1f',
      name: '综合阅览区',
      floor: '1',
      capacity: 48,
      hourlyPrice: 10,
      vipPrice: 8,
      tags: ['WiFi', '充电插座', '自然采光'],
      imageUrl: null,
    },
  });

  const zone2F = await prisma.zone.upsert({
    where: { id: 'zone-2f' },
    update: {},
    create: {
      id: 'zone-2f',
      name: '静音自习区',
      floor: '2',
      capacity: 36,
      hourlyPrice: 15,
      vipPrice: 12,
      tags: ['WiFi', '充电插座', '静音', '隔音'],
      imageUrl: null,
    },
  });

  const zone3F = await prisma.zone.upsert({
    where: { id: 'zone-3f' },
    update: {},
    create: {
      id: 'zone-3f',
      name: 'VIP 专属区',
      floor: '3',
      capacity: 24,
      hourlyPrice: 20,
      vipPrice: 15,
      tags: ['WiFi', '充电插座', '私密', '高档座椅', '咖啡'],
      imageUrl: null,
    },
  });

  console.log('✅ 区域创建完成');

  // 为 1F 创建座位 (6行 x 8列 = 48个)
  const seats1F = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 8; col++) {
      const rowLabel = String.fromCharCode(65 + row); // A-F
      const label = `${rowLabel}${col + 1}`;
      const isWindow = col === 0 || col === 7; // 两侧为窗边

      seats1F.push({
        id: `seat-1f-${label.toLowerCase()}`,
        zoneId: zone1F.id,
        label,
        type: isWindow ? SeatType.WINDOW : SeatType.STANDARD,
        status: SeatStatus.AVAILABLE,
        x: col,
        y: row,
      });
    }
  }

  // 为 2F 创建座位 (6行 x 6列 = 36个)
  const seats2F = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const rowLabel = String.fromCharCode(65 + row);
      const label = `${rowLabel}${col + 1}`;

      seats2F.push({
        id: `seat-2f-${label.toLowerCase()}`,
        zoneId: zone2F.id,
        label,
        type: SeatType.STANDARD,
        status: SeatStatus.AVAILABLE,
        x: col,
        y: row,
      });
    }
  }

  // 为 3F 创建座位 (4行 x 6列 = 24个，全部为卡座)
  const seats3F = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 6; col++) {
      const rowLabel = String.fromCharCode(65 + row);
      const label = `${rowLabel}${col + 1}`;

      seats3F.push({
        id: `seat-3f-${label.toLowerCase()}`,
        zoneId: zone3F.id,
        label,
        type: SeatType.BOOTH,
        status: SeatStatus.AVAILABLE,
        x: col,
        y: row,
      });
    }
  }

  // 批量创建座位
  await prisma.seat.createMany({
    data: [...seats1F, ...seats2F, ...seats3F],
    skipDuplicates: true,
  });

  console.log('✅ 座位创建完成');
  console.log(`   - 1F: ${seats1F.length}个座位`);
  console.log(`   - 2F: ${seats2F.length}个座位`);
  console.log(`   - 3F: ${seats3F.length}个座位`);

  console.log('🎉 数据填充完成！');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 数据填充失败:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
