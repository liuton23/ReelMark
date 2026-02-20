jest.mock('../../../config/database');

import { prisma } from '../../../config/database';
import {
  getUserById,
  getUserByUsername,
  updateProfile,
  deleteUser,
} from '../../../services/user.service';

const mockPrisma = prisma as jest.MockedObjectDeep<typeof prisma>;

const mockUser = {
  id: 'user-uuid-1',
  username: 'testuser',
  email: 'test@example.com',
  displayName: null,
  avatarUrl: null,
  createdAt: new Date('2025-01-01'),
};

describe('User Service', () => {
  describe('getUserById', () => {
    it('should return user when found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await getUserById(mockUser.id);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await getUserById('nonexistent-id');

      expect(result).toBeNull();
    });

    it('should throw on database error', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('DB error'));

      await expect(getUserById('some-id')).rejects.toThrow('DB error');
    });
  });

  describe('getUserByUsername', () => {
    it('should return user when found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await getUserByUsername('testuser');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await getUserByUsername('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw on database error', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('DB error'));

      await expect(getUserByUsername('test')).rejects.toThrow('DB error');
    });
  });

  describe('updateProfile', () => {
    it('should update displayName', async () => {
      const updated = { ...mockUser, displayName: 'Test User' };
      mockPrisma.user.update.mockResolvedValue(updated);

      const result = await updateProfile('user-uuid-1', { displayName: 'Test User' });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: { displayName: 'Test User' },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
      expect(result.displayName).toBe('Test User');
    });

    it('should update email', async () => {
      const updated = { ...mockUser, email: 'new@example.com' };
      mockPrisma.user.update.mockResolvedValue(updated);

      const result = await updateProfile('user-uuid-1', { email: 'new@example.com' });

      expect(result.email).toBe('new@example.com');
    });

    it('should throw "Email already in use" on P2002 error', async () => {
      const prismaError = new Error('Unique constraint') as any;
      prismaError.code = 'P2002';
      mockPrisma.user.update.mockRejectedValue(prismaError);

      await expect(updateProfile('user-uuid-1', { email: 'taken@example.com' })).rejects.toThrow(
        'Email already in use',
      );
    });

    it('should rethrow on other database errors', async () => {
      mockPrisma.user.update.mockRejectedValue(new Error('DB error'));

      await expect(updateProfile('user-uuid-1', { displayName: 'Test' })).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return true', async () => {
      mockPrisma.user.delete.mockResolvedValue(mockUser as any);

      const result = await deleteUser('user-uuid-1');

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
      });
      expect(result).toBe(true);
    });

    it('should throw on database error', async () => {
      mockPrisma.user.delete.mockRejectedValue(new Error('DB error'));

      await expect(deleteUser('user-uuid-1')).rejects.toThrow('DB error');
    });
  });
});
