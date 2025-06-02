import prisma from '../prisma/client';
import { redisCache } from '../cache/redis.cache';

export const getTransferHistory = async (userId?: string) => {
  const cacheKey = userId ? `transferHistory:${userId}` : 'transferHistory:all';

  // Thử lấy cache
  const cached = await redisCache.get(cacheKey);
  if (cached) {
    console.log('✅ Cache hit for', cacheKey);
    return cached;
  }

  // Nếu không có cache, truy vấn DB
  const whereClause = userId
    ? {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      }
    : {};

  const transfers = await prisma.transferHistory.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      nft: true,
      fromUser: { select: { id: true, email: true } },
      toUser: { select: { id: true, email: true } },
    },
  });

  // Lưu cache trong 60s
  await redisCache.set(cacheKey, transfers, { ttl: 60 });

  return transfers;
};
