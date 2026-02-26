import { prisma } from '../config/database';
import redis, { SESSION_CACHE_PREFIX } from '../config/redis';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 10;
const SESSION_DURATION_DAYS = 30;

// Generate a secure random token
const generateToken = (): string => {
  return crypto.randomBytes(48).toString('hex');
};

// Create a session for a user — persists to PostgreSQL and caches in Redis
const createSession = async (userId: string) => {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  const session = await prisma.session.create({
    data: { userId, token, expiresAt },
  });

  // Cache in Redis with TTL matching session expiry
  const ttlSeconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  await redis.set(
    `${SESSION_CACHE_PREFIX}${token}`,
    JSON.stringify({ userId, expiresAt }),
    'EX',
    ttlSeconds,
  );

  return { token: session.token, expiresAt: session.expiresAt };
};

// Register a new user
export const register = async (username: string, password: string, email?: string) => {
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    throw new Error('Username already taken');
  }

  if (email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw new Error('Email already in use');
    }
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { username, email: email || null, passwordHash },
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      createdAt: true,
    },
  });

  const session = await createSession(user.id);
  return { user, ...session };
};

// Login an existing user
export const login = async (username: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !user.passwordHash) {
    throw new Error('Invalid username or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid username or password');
  }

  const session = await createSession(user.id);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt,
    },
    ...session,
  };
};

// Logout — delete from both Redis and PostgreSQL
export const logout = async (token: string) => {
  await redis.del(`${SESSION_CACHE_PREFIX}${token}`);
  await prisma.session.deleteMany({ where: { token } });
};

// Get current user from userId (used by GET /auth/me)
export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  return user;
};
