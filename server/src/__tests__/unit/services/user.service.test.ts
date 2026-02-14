jest.mock('../../../config/database');

import { prisma } from '../../../config/database';
import {
  createUser,
  getUserById,
  getUserByUsername,
  getOrCreateDefaultUser,
  getAllUsers,
} from '../../../services/user.service';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  username: 'testuser',
  email: 'test@example.com',
  createdAt: new Date('2025-01-01'),
};

describe('User Service', () => {
  describe('createUser', () => {
    it('should create a new user with username and email', async () => {
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await createUser('testuser', 'test@example.com');

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { username: 'testuser', email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should create a user without email', async () => {
      const userNoEmail = { ...mockUser, email: null };
      mockPrisma.user.create.mockResolvedValue(userNoEmail);

      const result = await createUser('testuser');

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { username: 'testuser', email: undefined },
      });
      expect(result).toEqual(userNoEmail);
    });

    it('should throw on database error', async () => {
      mockPrisma.user.create.mockRejectedValue(new Error('DB error'));

      await expect(createUser('testuser')).rejects.toThrow('DB error');
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await getUserById(mockUser.id);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
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

  describe('getOrCreateDefaultUser', () => {
    it('should return existing default user', async () => {
      const defaultUser = { ...mockUser, username: 'default_user' };
      mockPrisma.user.findUnique.mockResolvedValue(defaultUser);

      const result = await getOrCreateDefaultUser();

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'default_user' },
      });
      expect(result).toEqual(defaultUser);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should create default user when not found', async () => {
      const defaultUser = { ...mockUser, username: 'default_user' };
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(defaultUser);

      const result = await getOrCreateDefaultUser();

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { username: 'default_user', email: undefined },
      });
      expect(result).toEqual(defaultUser);
    });
  });

  describe('getAllUsers', () => {
    it('should return array of users', async () => {
      const users = [mockUser, { ...mockUser, id: 'another-id', username: 'user2' }];
      mockPrisma.user.findMany.mockResolvedValue(users);

      const result = await getAllUsers();

      expect(mockPrisma.user.findMany).toHaveBeenCalled();
      expect(result).toEqual(users);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);

      const result = await getAllUsers();

      expect(result).toEqual([]);
    });

    it('should throw on database error', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('DB error'));

      await expect(getAllUsers()).rejects.toThrow('DB error');
    });
  });
});
