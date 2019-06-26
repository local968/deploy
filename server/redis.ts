import config from '../config';
import Redis from 'ioredis';
export const redis = new Redis({ ...config.redis, db: 10 } as any);
export const pubsub = new Redis({ ...config.redis, db: 0 } as any);
console.log('redis connection...', config.redis);
redis.on('connect', () => {
  console.log('redis connected');
});
pubsub.on('connect', () => {
  console.log('pubsub redis connected');
});
redis.on('error', console.log.bind(console, 'redis error:'));
