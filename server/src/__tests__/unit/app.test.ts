jest.mock('../../services/tmdb.service');
jest.mock('../../config/database');

import request from 'supertest';
import app from '../../app';
import { searchMulti } from '../../services/tmdb.service';

const mockSearchMulti = searchMulti as jest.MockedFunction<typeof searchMulti>;

describe('App', () => {
  describe('GET /health', () => {
    it('should return health check response', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        message: 'ReelMark API is running',
      });
    });
  });

  describe('GET /api/search/multi', () => {
    it('should return search results', async () => {
      const mockResults = [
        { id: 550, title: 'Fight Club', media_type: 'movie' },
        { id: 1396, name: 'Breaking Bad', media_type: 'tv' },
      ];
      mockSearchMulti.mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/api/search/multi')
        .query({ q: 'Fight Club' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResults);
      expect(mockSearchMulti).toHaveBeenCalledWith('Fight Club');
    });

    it('should return 400 when query parameter is missing', async () => {
      const response = await request(app).get('/api/search/multi');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Query parameter "q" is required',
      });
    });

    it('should return 500 when search fails', async () => {
      mockSearchMulti.mockRejectedValue(new Error('TMDB error'));

      const response = await request(app)
        .get('/api/search/multi')
        .query({ q: 'test' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to search' });
    });
  });
});
