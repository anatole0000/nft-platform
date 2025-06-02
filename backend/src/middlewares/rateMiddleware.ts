import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const redisClient = new Redis({
  host: 'localhost',
  port: 6379,
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 5, // số requests tối đa
  duration: 60, // trong 60 giây
  keyPrefix: 'rlflx', // prefix key redis
});

export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
  rateLimiter.consume(req.ip || '')
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({ error: 'Too many requests, please try again later.' });
      return;
    });
};
