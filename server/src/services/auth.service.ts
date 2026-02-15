import { prisma } from '../config/database';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 10;
const SESSION_DURATION_DAYS = 30;

// Generate a secure random token
const generateToken = (): string => {
  return crypto.randomBytes(48).toString('hex');
};

// Create a session for a user
const createSession = async (userId: string) => {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return { token: session.token, expiresAt: session.expiresAt };
};

// Register a new user
export const register = async (username: string, password: string, email?: string) => {
  // Check if username is taken
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new Error('Username already taken');
  }

  // Check if email is taken (if provided)
  if (email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new Error('Email already in use');
    }
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      username,
      email: email || null,
      passwordHash,
    },
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
  const user = await prisma.user.findUnique({
    where: { username },
  });

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

// Logout — delete the session
export const logout = async (token: string) => {
  await prisma.session.deleteMany({
    where: { token },
  });
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