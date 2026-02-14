jest.mock('../../../services/user.service');
jest.mock('../../../config/database');

import request from 'supertest';
import app from '../../../app';
import {
  createUser,
  getUserById,
  getOrCreateDefaultUser,
} from '../../../services/user.service';

const mockCreateUser = createUser as jest.MockedFunction<typeof createUser>;
const mockGetUserById = getUserById as jest.MockedFunction<typeof getUserById>;
const mockGetOrCreateDefaultUser = getOrCreateDefaultUser as jest.MockedFunction<typeof getOrCreateDefaultUser>;

const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  username: 'testuser',
  email: 'test@example.com',
  createdAt: new Date('2025-01-01'),
};

describe('User Routes', () => {
  describe('GET /api/users/default', () => {
    it('should return the default user', async () => {
      const defaultUser = { ...mockUser, username: 'default_user' };
      mockGetOrCreateDefaultUser.mockResolvedValue(defaultUser);

      const response = await request(app).get('/api/users/default');

      expect(response.status).toBe(200);
      expect(response.body.username).toBe('default_user');
    });

    it('should return 500 on service error', async () => {
      mockGetOrCreateDefaultUser.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/users/default');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to get/create default user');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user when found', async () => {
      mockGetUserById.mockResolvedValue(mockUser);

      const response = await request(app).get(`/api/users/${mockUser.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(mockUser.id);
      expect(response.body.username).toBe('testuser');
    });

    it('should return 404 when user not found', async () => {
      mockGetUserById.mockResolvedValue(null);

      const response = await request(app).get('/api/users/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('should return 500 on service error', async () => {
      mockGetUserById.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/users/some-id');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch user');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      mockCreateUser.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users')
        .send({ username: 'testuser', email: 'test@example.com' });

      expect(response.status).toBe(201);
      expect(response.body.username).toBe('testuser');
      expect(mockCreateUser).toHaveBeenCalledWith('testuser', 'test@example.com');
    });

    it('should return 400 when username is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username is required');
    });

    it('should return 400 for duplicate username', async () => {
      const prismaError = new Error('Unique constraint') as any;
      prismaError.code = 'P2002';
      mockCreateUser.mockRejectedValue(prismaError);

      const response = await request(app)
        .post('/api/users')
        .send({ username: 'existinguser' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username already exists');
    });

    it('should return 500 on other errors', async () => {
      mockCreateUser.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .post('/api/users')
        .send({ username: 'testuser' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to create user');
    });
  });
});
