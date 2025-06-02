// lib/bullmq-connection.ts
import IORedis from 'ioredis';

const bullMQConnection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379,
  maxRetriesPerRequest: null, // 🚨 BẮT BUỘC cho BullMQ
});

export default bullMQConnection;
