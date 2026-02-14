jest.mock('../../../services/recommendation.service');
jest.mock('../../../config/database');

import request from 'supertest';
import app from '../../../app';
import {
  getRecommendation,
  canGetRecommendations,
  getRemainingWatchesNeeded,
} from '../../../services/recommendation.service';

const mockGetRecommendation = getRecommendation as jest.MockedFunction<typeof getRecommendation>;
const mockCanGetRecommendations = canGetRecommendations as jest.MockedFunction<typeof canGetRecommendations>;
const mockGetRemainingWatchesNeeded = getRemainingWatchesNeeded as jest.MockedFunction<typeof getRemainingWatchesNeeded>;

const mockRecommendation = {
  title: 'Interstellar',
  year: 2014,
  reason: 'Based on your love of sci-fi and drama...',
  type: 'movie',
};

describe('Recommendation Routes', () => {
  describe('POST /api/recommendations', () => {
    it('should return a recommendation when eligible', async () => {
      mockCanGetRecommendations.mockResolvedValue(true);
      mockGetRecommendation.mockResolvedValue(mockRecommendation);

      const response = await request(app)
        .post('/api/recommendations')
        .send({ userId: 'user-uuid-1' });

      expect(response.status).toBe(200);
      expect(response.body.recommendations).toEqual(mockRecommendation);
      expect(mockGetRecommendation).toHaveBeenCalledWith('user-uuid-1', undefined);
    });

    it('should pass preferences to service', async () => {
      mockCanGetRecommendations.mockResolvedValue(true);
      mockGetRecommendation.mockResolvedValue(mockRecommendation);

      const response = await request(app)
        .post('/api/recommendations')
        .send({ userId: 'user-uuid-1', preferences: 'something lighthearted' });

      expect(response.status).toBe(200);
      expect(mockGetRecommendation).toHaveBeenCalledWith('user-uuid-1', 'something lighthearted');
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/api/recommendations')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('userId is required');
    });

    it('should return 400 when user has insufficient history', async () => {
      mockCanGetRecommendations.mockResolvedValue(false);
      mockGetRemainingWatchesNeeded.mockResolvedValue(3);

      const response = await request(app)
        .post('/api/recommendations')
        .send({ userId: 'user-uuid-1' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Insufficient watch history');
      expect(response.body.remaining).toBe(3);
    });

    it('should return singular message when 1 remaining', async () => {
      mockCanGetRecommendations.mockResolvedValue(false);
      mockGetRemainingWatchesNeeded.mockResolvedValue(1);

      const response = await request(app)
        .post('/api/recommendations')
        .send({ userId: 'user-uuid-1' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Watch 1 more movie/show to get recommendations');
    });

    it('should return 500 on service error', async () => {
      mockCanGetRecommendations.mockResolvedValue(true);
      mockGetRecommendation.mockRejectedValue(new Error('Claude API error'));

      const response = await request(app)
        .post('/api/recommendations')
        .send({ userId: 'user-uuid-1' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to get recommendations');
    });
  });

  describe('GET /api/recommendations/status/:userId', () => {
    it('should return ready status when eligible', async () => {
      mockCanGetRecommendations.mockResolvedValue(true);
      mockGetRemainingWatchesNeeded.mockResolvedValue(0);

      const response = await request(app).get('/api/recommendations/status/user-uuid-1');

      expect(response.status).toBe(200);
      expect(response.body.canGetRecommendations).toBe(true);
      expect(response.body.remainingWatchesNeeded).toBe(0);
      expect(response.body.message).toBe('Ready for recommendations!');
    });

    it('should return not ready status when ineligible', async () => {
      mockCanGetRecommendations.mockResolvedValue(false);
      mockGetRemainingWatchesNeeded.mockResolvedValue(3);

      const response = await request(app).get('/api/recommendations/status/user-uuid-1');

      expect(response.status).toBe(200);
      expect(response.body.canGetRecommendations).toBe(false);
      expect(response.body.remainingWatchesNeeded).toBe(3);
      expect(response.body.message).toBe('Watch 3 more to unlock recommendations');
    });

    it('should return 500 on error', async () => {
      mockCanGetRecommendations.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/recommendations/status/user-uuid-1');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to check recommendation status');
    });
  });
});
