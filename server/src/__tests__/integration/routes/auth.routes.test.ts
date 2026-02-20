jest.mock('../../../services/auth.service');
jest.mock('../../../config/database');

import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/database';
import { register, login, logout, getCurrentUser } from '../../../services/auth.service';

const mockPrisma = prisma as jest.MockedObjectDeep<typeof prisma>;
const mockRegister = register as jest.MockedFunction<typeof register>;
const mockLogin = login as jest.MockedFunction<typeof login>;
const mockLogout = logout as jest.MockedFunction<typeof logout>;
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

const TEST_USER_ID = 'user-uuid-1';
const TEST_TOKEN = 'test-auth-token';

const mockUser = {
  id: TEST_USER_ID,
  username: 'testuser',
  email: null,
  displayName: null,
  createdAt: new Date('2025-01-01'),
};

const mockAuthResult = {
  user: mockUser,
  token: TEST_TOKEN,
  expiresAt: new Date(Date.now() + 86400000 * 30),
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

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      mockRegister.mockResolvedValue(mockAuthResult);

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.token).toBe(TEST_TOKEN);
      expect(mockRegister).toHaveBeenCalledWith('testuser', 'password123', undefined);
    });

    it('should register with optional email', async () => {
      mockRegister.mockResolvedValue({
        ...mockAuthResult,
        user: { ...mockUser, email: 'test@example.com' },
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123', email: 'test@example.com' });

      expect(response.status).toBe(201);
      expect(mockRegister).toHaveBeenCalledWith('testuser', 'password123', 'test@example.com');
    });

    it('should return 400 when username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and password are required');
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and password are required');
    });

    it('should return 400 when password is too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'abc' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Password must be at least 6 characters');
    });

    it('should return 409 when username already taken', async () => {
      mockRegister.mockRejectedValue(new Error('Username already taken'));

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'existinguser', password: 'password123' });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Username already taken');
    });

    it('should return 409 when email already in use', async () => {
      mockRegister.mockRejectedValue(new Error('Email already in use'));

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123', email: 'taken@example.com' });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already in use');
    });

    it('should return 500 on other errors', async () => {
      mockRegister.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Registration failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      mockLogin.mockResolvedValue(mockAuthResult);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe(TEST_TOKEN);
      expect(response.body.user.username).toBe('testuser');
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });

    it('should return 400 when username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and password are required');
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and password are required');
    });

    it('should return 401 for invalid credentials', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid username or password'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid username or password');
    });

    it('should return 500 on other errors', async () => {
      mockLogin.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Login failed');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      mockLogout.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
      expect(mockLogout).toHaveBeenCalledWith(TEST_TOKEN);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(TEST_USER_ID);
      expect(response.body.username).toBe('testuser');
      expect(mockGetCurrentUser).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return 404 when user not found', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('should return 500 on service error', async () => {
      mockGetCurrentUser.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to get user');
    });
  });
});
