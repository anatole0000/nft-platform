import prisma from '../prisma/client';
import { redisCache } from '../cache/redis.cache';
import { createBreaker } from '../utils/breaker';

const NFT_CACHE_KEY = 'nft:all';

// Hàm timeout cho Redis
const promiseTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  const timeout = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error('⏱ Timeout')), ms)
  );
  return Promise.race([promise, timeout]);
};

type NFTListFilters = {
  ownerId?: string;
  limit?: number;
  sort?: 'asc' | 'desc';
};

const fetchNFTFromDB = async (filters?: NFTListFilters) => {
  const { ownerId, limit = 10, sort = 'asc' } = filters || {};

  return await prisma.nFT.findMany({
    where: ownerId ? { ownerId } : undefined,
    take: limit,
    orderBy: {
      createdAt: sort,
    },
  });
};

const fetchNFTBreaker = createBreaker(fetchNFTFromDB);

export const getNFTList = async (filters?: NFTListFilters) => {
  const cacheKey = filters && filters.ownerId
    ? `nft:list:owner:${filters.ownerId}:limit:${filters.limit ?? 10}:sort:${filters.sort ?? 'asc'}`
    : NFT_CACHE_KEY;

  try {
    const cached = await promiseTimeout(redisCache.get(cacheKey), 100);
    if (cached) {
      console.log('✅ Cache hit');
      return cached;
    }
  } catch (err) {
    if (err instanceof Error) {
      console.warn('⚠️ Redis cache timeout or error:', err.message);
    } else {
      console.warn('⚠️ Redis cache timeout or error:', err);
    }
  }

  try {
    const nfts = await fetchNFTBreaker.fire(filters);

    redisCache.set(cacheKey, nfts, { ttl: 60 }).catch((err) => {
      console.warn('⚠️ Redis set cache failed:', err.message);
    });

    return nfts;
  } catch (dbErr) {
    if (dbErr instanceof Error) {
      console.error('❌ DB error:', dbErr.message);
    } else {
      console.error('❌ DB error:', dbErr);
    }

    // fallback: trả về cache cũ nếu có
    try {
      const stale = await redisCache.get(cacheKey);
      if (stale) {
        console.warn('⚠️ Returning stale cache due to DB failure');
        return stale;
      }
    } catch {}

    throw dbErr;
  }
};

export const createNFT = async (name: string, imageUrl: string, ownerId: string) => {
  const nft = await prisma.nFT.create({
    data: {
      name,
      imageUrl,
      ownerId,
    },
  });

  // Xóa cache chính
  try {
    
    await redisCache.del(NFT_CACHE_KEY);
    await redisCache.del(`nft:list:owner:${ownerId}:limit:10:sort:asc`);
  } catch (err: any) {
    console.warn('⚠️ Redis cache delete failed:', err.message);
  }

  return nft;
};

export const getNFTById = async (id: string) => {
  const cacheKey = `nft:${id}`;

  try {
    const cached = await promiseTimeout(redisCache.get(cacheKey), 100);
    if (cached) {
      console.log(`✅ Cache hit for NFT id=${id}`);
      return cached;
    }
  } catch (err) {
    if (err instanceof Error) {
      console.warn(`⚠️ Redis timeout for NFT id=${id}:`, err.message);
    } else {
      console.warn(`⚠️ Redis timeout for NFT id=${id}:`, err);
    }
  }

  try {
    const nft = await prisma.nFT.findUnique({ where: { id } });

    if (nft) {
      redisCache.set(cacheKey, nft, { ttl: 60 }).catch((err) => {
        console.warn('⚠️ Redis set single NFT failed:', err.message);
      });
    }

    return nft;
  } catch (err) {
    if (err instanceof Error) {
      console.error(`❌ DB failed for getNFTById(${id})`, err.message);
    } else {
      console.error(`❌ DB failed for getNFTById(${id})`, err);
    }

    // fallback: thử lấy từ Redis nếu trước đó có cache
    try {
      const stale = await redisCache.get(cacheKey);
      if (stale) {
        console.warn('⚠️ Returning stale NFT from cache');
        return stale;
      }
    } catch {}

    throw err;
  }
};
