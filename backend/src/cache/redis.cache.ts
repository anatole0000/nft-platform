import cacheManager from 'cache-manager';
import redisStore from 'cache-manager-ioredis';
import redisClient from '../lib/bullmq-connection';

const redisCache = cacheManager.caching({
  store: redisStore,
  redisInstance: redisClient,
  ttl: 60, // 60 giây mặc định
});

export { redisCache };
