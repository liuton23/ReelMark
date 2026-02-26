import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import redis, { SESSION_CACHE_PREFIX } from '../config/redis';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Auth middleware — checks Redis first, falls back to PostgreSQL
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const cacheKey = `${SESSION_CACHE_PREFIX}${token}`;

    // ── 1. Check Redis cache first ───────────────────────────────
    const cached = await redis.get(cacheKey);

    if (cached) {
      const { userId, expiresAt } = JSON.parse(cached);

      // Still validate expiry even from cache
      if (new Date() > new Date(expiresAt)) {
        await redis.del(cacheKey);
        await prisma.session.deleteMany({ where: { token } });
        return res.status(401).json({ error: 'Session expired' });
      }

      req.userId = userId;
      return next();
    }

    // ── 2. Cache miss — query PostgreSQL ─────────────────────────
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session) {
      return res.status(401).json({ error: 'Invalid session token' });
    }

    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { id: session.id } });
      return res.status(401).json({ error: 'Session expired' });
    }

    // ── 3. Write to Redis for subsequent requests ─────────────────
    // TTL = seconds remaining until session expiry
    const ttlSeconds = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000);
    await redis.set(
      cacheKey,
      JSON.stringify({ userId: session.userId, expiresAt: session.expiresAt }),
      'EX',
      ttlSeconds,
    );

    req.userId = session.userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};
