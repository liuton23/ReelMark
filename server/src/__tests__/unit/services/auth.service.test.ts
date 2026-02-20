jest.mock('../../../config/database');
jest.mock('bcrypt');
jest.mock('crypto');

import { prisma } from '../../../config/database';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { register, login, logout, getCurrentUser } from '../../../services/auth.service';

const mockPrisma = prisma as jest.MockedObjectDeep<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockCrypto = crypto as jest.Mocked<typeof crypto>;

const mockUser = {
  id: 'user-uuid-1',
  username: 'testuser',
  email: null,
  displayName: null,
  avatarUrl: null,
  passwordHash: 'hashed-password',
  createdAt: new Date('2025-01-01'),
};

const mockSession = {
  id: 'session-id',
  userId: 'user-uuid-1',
  token: 'random-token-hex',
  expiresAt: new Date(Date.now() + 86400000 * 30),
  createdAt: new Date(),
};

beforeEach(() => {
  (mockCrypto.randomBytes as jest.Mock).mockReturnValue({
    toString: () => 'random-token-hex',
  });
});

describe('Auth Service', () => {
  describe('register', () => {
    it('should register a new user and return session', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null); // no existing user
      (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue({
        id: mockUser.id,
        username: mockUser.username,
        email: null,
        displayName: null,
        createdAt: mockUser.createdAt,
      } as any);
      mockPrisma.session.create.mockResolvedValue(mockSession);

      const result = await register('testuser', 'password123');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { username: 'testuser' } });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            username: 'testuser',
            passwordHash: 'hashed-password',
          }),
        }),
      );
      expect(result.user.username).toBe('testuser');
      expect(result.token).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });

    it('should register with optional email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue({
        id: mockUser.id,
        username: 'testuser',
        email: 'test@example.com',
        displayName: null,
        createdAt: mockUser.createdAt,
      } as any);
      mockPrisma.session.create.mockResolvedValue(mockSession);

      const result = await register('testuser', 'password123', 'test@example.com');

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'test@example.com' }),
        }),
      );
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw "Username already taken" when username exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(register('testuser', 'password123')).rejects.toThrow('Username already taken');

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should throw "Email already in use" when email exists', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null) // username check passes
        .mockResolvedValueOnce(mockUser); // email check fails

      await expect(register('newuser', 'password123', 'taken@example.com')).rejects.toThrow(
        'Email already in use',
      );
    });
  });

  describe('login', () => {
    it('should login successfully and return session', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.session.create.mockResolvedValue(mockSession);

      const result = await login('testuser', 'password123');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { username: 'testuser' } });
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(result.user.username).toBe('testuser');
      expect(result.token).toBeDefined();
    });

    it('should throw "Invalid username or password" when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(login('nonexistent', 'password123')).rejects.toThrow(
        'Invalid username or password',
      );
    });

    it('should throw "Invalid username or password" when user has no password hash', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, passwordHash: null });

      await expect(login('testuser', 'password123')).rejects.toThrow(
        'Invalid username or password',
      );
    });

    it('should throw "Invalid username or password" when password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(login('testuser', 'wrongpassword')).rejects.toThrow(
        'Invalid username or password',
      );
    });
  });

  describe('logout', () => {
    it('should delete the session', async () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 1 });

      await logout('some-token');

      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: { token: 'some-token' },
      });
    });

    it('should not throw if session does not exist', async () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });

      await expect(logout('nonexistent-token')).resolves.not.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user when found', async () => {
      const publicUser = {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        displayName: mockUser.displayName,
        avatarUrl: mockUser.avatarUrl,
        createdAt: mockUser.createdAt,
      };
      mockPrisma.user.findUnique.mockResolvedValue(publicUser as any);

      const result = await getCurrentUser('user-uuid-1');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(publicUser);
    });

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await getCurrentUser('nonexistent-id');

      expect(result).toBeNull();
    });
  });
});
