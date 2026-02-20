jest.mock('../../../services/recommendation.service');
jest.mock('../../../config/database');

import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/database';
import {
  getRecommendation,
  canGetRecommendations,
  getRemainingWatchesNeeded,
  getUserRecommendations,
} from '../../../services/recommendation.service';

const mockPrisma = prisma as jest.MockedObjectDeep<typeof prisma>;
const mockGetRecommendation = getRecommendation as jest.MockedFunction<typeof getRecommendation>;
const mockCanGetRecommendations = canGetRecommendations as jest.MockedFunction<typeof canGetRecommendations>;
const mockGetRemainingWatchesNeeded = getRemainingWatchesNeeded as jest.MockedFunction<typeof getRemainingWatchesNeeded>;
const mockGetUserRecommendations = getUserRecommendations as jest.MockedFunction<typeof getUserRecommendations>;

const TEST_USER_ID = 'user-uuid-1';
const TEST_TOKEN = 'test-auth-token';

const mockRecommendation = {
  id: 'rec-uuid-1',
  title: 'Interstellar',
  year: 2014,
  reason: 'Based on your love of sci-fi and drama...',
  type: 'movie' as const,
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

describe('Recommendation Routes', () => {
  describe('POST /api/recommendations', () => {
    it('should return a recommendation when eligible', async () => {
      mockCanGetRecommendations.mockResolvedValue(true);
      mockGetRecommendation.mockResolvedValue(mockRecommendation);

      const response = await request(app)
        .post('/api/recommendations')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.recommendation).toEqual(mockRecommendation);
      expect(mockGetRecommendation).toHaveBeenCalledWith(TEST_USER_ID, undefined);
    });

    it('should pass preferences to service', async () => {
      mockCanGetRecommendations.mockResolvedValue(true);
      mockGetRecommendation.mockResolvedValue(mockRecommendation);

      const response = await request(app)
        .post('/api/recommendations')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ preferences: 'something lighthearted' });

      expect(response.status).toBe(200);
      expect(mockGetRecommendation).toHaveBeenCalledWith(TEST_USER_ID, 'something lighthearted');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/recommendations')
        .send({});

      expect(response.status).toBe(401);
    });

    it('should return 400 when user has insufficient history', async () => {
      mockCanGetRecommendations.mockResolvedValue(false);
      mockGetRemainingWatchesNeeded.mockResolvedValue(3);

      const response = await request(app)
        .post('/api/recommendations')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Insufficient watch history');
      expect(response.body.remaining).toBe(3);
    });

    it('should return singular message when 1 remaining', async () => {
      mockCanGetRecommendations.mockResolvedValue(false);
      mockGetRemainingWatchesNeeded.mockResolvedValue(1);

      const response = await request(app)
        .post('/api/recommendations')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Watch 1 more movie/show to get recommendations');
    });

    it('should return 500 on service error', async () => {
      mockCanGetRecommendations.mockResolvedValue(true);
      mockGetRecommendation.mockRejectedValue(new Error('Claude API error'));

      const response = await request(app)
        .post('/api/recommendations')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to get recommendation');
    });
  });

  describe('GET /api/recommendations/history', () => {
    it('should return past recommendations for authenticated user', async () => {
      const pastRecs = [
        { id: 'rec-1', userId: TEST_USER_ID, title: 'Interstellar', reason: 'Sci-fi fan', contentId: null, tmdbId: null, createdAt: new Date() },
        { id: 'rec-2', userId: TEST_USER_ID, title: 'Inception', reason: 'Complex plots', contentId: null, tmdbId: null, createdAt: new Date() },
      ];
      mockGetUserRecommendations.mockResolvedValue(pastRecs);

      const response = await request(app)
        .get('/api/recommendations/history')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(mockGetUserRecommendations).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/recommendations/history');

      expect(response.status).toBe(401);
    });

    it('should return 500 on error', async () => {
      mockGetUserRecommendations.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/recommendations/history')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch recommendation history');
    });
  });

  describe('GET /api/recommendations/status', () => {
    it('should return ready status when eligible', async () => {
      mockCanGetRecommendations.mockResolvedValue(true);
      mockGetRemainingWatchesNeeded.mockResolvedValue(0);

      const response = await request(app)
        .get('/api/recommendations/status')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body.canGetRecommendations).toBe(true);
      expect(response.body.remainingWatchesNeeded).toBe(0);
      expect(response.body.message).toBe('Ready for recommendations!');
    });

    it('should return not ready status when ineligible', async () => {
      mockCanGetRecommendations.mockResolvedValue(false);
      mockGetRemainingWatchesNeeded.mockResolvedValue(3);

      const response = await request(app)
        .get('/api/recommendations/status')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body.canGetRecommendations).toBe(false);
      expect(response.body.remainingWatchesNeeded).toBe(3);
      expect(response.body.message).toBe('Watch 3 more to unlock recommendations');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/recommendations/status');

      expect(response.status).toBe(401);
    });

    it('should return 500 on error', async () => {
      mockCanGetRecommendations.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/recommendations/status')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to check recommendation status');
    });
  });
});
