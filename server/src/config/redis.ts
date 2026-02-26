import Redis from 'ioredis';

// In production (Upstash), REDIS_URL is the full TCP URL e.g. rediss://default:password@host:6379
// In local Docker, falls back to individual host/port config
const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: 6379,
    });

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export const SESSION_CACHE_PREFIX = 'session:';
export default redis;
