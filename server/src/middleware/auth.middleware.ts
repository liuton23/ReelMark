import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Auth middleware — validates session token and attaches userId to request
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session) {
      return res.status(401).json({ error: 'Invalid session token' });
    }

    if (new Date() > session.expiresAt) {
      // Clean up expired session
      await prisma.session.delete({ where: { id: session.id } });
      return res.status(401).json({ error: 'Session expired' });
    }

    req.userId = session.userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};