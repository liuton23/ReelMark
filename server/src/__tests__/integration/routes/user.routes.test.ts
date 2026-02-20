jest.mock('../../../services/user.service');
jest.mock('../../../config/database');

import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/database';
import {
  getUserById,
  updateProfile,
  deleteUser,
} from '../../../services/user.service';

const mockPrisma = prisma as jest.MockedObjectDeep<typeof prisma>;
const mockGetUserById = getUserById as jest.MockedFunction<typeof getUserById>;
const mockUpdateProfile = updateProfile as jest.MockedFunction<typeof updateProfile>;
const mockDeleteUser = deleteUser as jest.MockedFunction<typeof deleteUser>;

const TEST_USER_ID = 'user-uuid-1';
const TEST_TOKEN = 'test-auth-token';

const mockUser = {
  id: TEST_USER_ID,
  username: 'testuser',
  email: 'test@example.com',
  displayName: null,
  avatarUrl: null,
  createdAt: new Date('2025-01-01'),
};

beforeEach(() => {
  mockPrisma.session.findUnique.mockResolvedValue({
    id: 'session-id',
    userId: TEST_USER_ID,
    token: TEST_TOKEN,
    expiresAt: new Date(Date.now() + 86400000),
    createdAt: new Date(),
  });
});

describe('User Routes', () => {
  describe('GET /api/users/profile', () => {
    it('should return user profile', async () => {
      mockGetUserById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(TEST_USER_ID);
      expect(response.body.username).toBe('testuser');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/users/profile');

      expect(response.status).toBe(401);
    });

    it('should return 404 when user not found', async () => {
      mockGetUserById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('should return 500 on service error', async () => {
      mockGetUserById.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch profile');
    });
  });

  describe('PATCH /api/users/profile', () => {
    it('should update user profile', async () => {
      const updated = { ...mockUser, displayName: 'Test User' };
      mockUpdateProfile.mockResolvedValue(updated);

      const response = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ displayName: 'Test User' });

      expect(response.status).toBe(200);
      expect(response.body.displayName).toBe('Test User');
      expect(mockUpdateProfile).toHaveBeenCalledWith(TEST_USER_ID, {
        displayName: 'Test User',
        avatarUrl: undefined,
        email: undefined,
      });
    });

    it('should update email', async () => {
      const updated = { ...mockUser, email: 'new@example.com' };
      mockUpdateProfile.mockResolvedValue(updated);

      const response = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ email: 'new@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('new@example.com');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .patch('/api/users/profile')
        .send({ displayName: 'Test' });

      expect(response.status).toBe(401);
    });

    it('should return 409 when email already in use', async () => {
      mockUpdateProfile.mockRejectedValue(new Error('Email already in use'));

      const response = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ email: 'taken@example.com' });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already in use');
    });

    it('should return 500 on service error', async () => {
      mockUpdateProfile.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ displayName: 'Test' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to update profile');
    });
  });

  describe('DELETE /api/users/profile', () => {
    it('should delete user account', async () => {
      mockDeleteUser.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/users/profile')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Account deleted successfully');
      expect(mockDeleteUser).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).delete('/api/users/profile');

      expect(response.status).toBe(401);
    });

    it('should return 500 on service error', async () => {
      mockDeleteUser.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .delete('/api/users/profile')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to delete account');
    });
  });
});
