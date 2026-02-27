import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Shared Redis connection for BullMQ
// In production: REDIS_URL = full Upstash TCP URL (rediss://...)
// In local Docker: falls back to service name 'redis'
const connection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new Redis({ host: process.env.REDIS_HOST || 'redis', port: 6379, maxRetriesPerRequest: null });

export const recommendationQueue = new Queue('recommendations', {
  connection,
  defaultJobOptions: {
    removeOnComplete: true, // clean up completed jobs from Redis immediately
    removeOnFail: 10, // keep last 10 failed jobs for debugging
  },
});

console.log('✅ Recommendation queue initialized');
