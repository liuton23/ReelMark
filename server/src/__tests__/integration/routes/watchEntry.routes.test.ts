jest.mock('../../../services/watchEntry.service');
jest.mock('../../../services/content.service');
jest.mock('../../../config/database');

import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/database';
import {
  createWatchEntry,
  getUserWatchHistory,
  getWatchEntryById,
  updateWatchEntry,
  deleteWatchEntry,
  getUserStats,
} from '../../../services/watchEntry.service';
import {
  saveMovieFromTMDB,
  saveTVShowFromTMDB,
} from '../../../services/content.service';

const mockPrisma = prisma as jest.MockedObjectDeep<typeof prisma>;
const mockCreateWatchEntry = createWatchEntry as jest.MockedFunction<typeof createWatchEntry>;
const mockGetUserWatchHistory = getUserWatchHistory as jest.MockedFunction<typeof getUserWatchHistory>;
const mockGetWatchEntryById = getWatchEntryById as jest.MockedFunction<typeof getWatchEntryById>;
const mockUpdateWatchEntry = updateWatchEntry as jest.MockedFunction<typeof updateWatchEntry>;
const mockDeleteWatchEntry = deleteWatchEntry as jest.MockedFunction<typeof deleteWatchEntry>;
const mockGetUserStats = getUserStats as jest.MockedFunction<typeof getUserStats>;
const mockSaveMovieFromTMDB = saveMovieFromTMDB as jest.MockedFunction<typeof saveMovieFromTMDB>;
const mockSaveTVShowFromTMDB = saveTVShowFromTMDB as jest.MockedFunction<typeof saveTVShowFromTMDB>;

const TEST_USER_ID = 'user-uuid-1';
const TEST_TOKEN = 'test-auth-token';

const mockContent = {
  id: 'content-uuid-1',
  tmdbId: 550,
  type: 'MOVIE' as const,
  title: 'Fight Club',
  releaseYear: 1999,
  posterPath: '/poster.jpg',
  genres: ['Drama'],
  overview: 'A movie.',
  runtime: 139,
  showType: null,
  numberOfSeasons: null,
  numberOfEpisodes: null,
  episodeRuntime: null,
  createdAt: new Date('2025-01-01'),
};

const mockWatchEntry = {
  id: 'entry-uuid-1',
  userId: TEST_USER_ID,
  contentId: 'content-uuid-1',
  watchedAt: new Date('2025-06-01'),
  rating: 9,
  notes: 'Great movie!',
  season: null,
  episode: null,
  createdAt: new Date('2025-06-01'),
  updatedAt: new Date('2025-06-01'),
  content: mockContent,
  user: { id: TEST_USER_ID, username: 'testuser', email: null, createdAt: new Date('2025-01-01') },
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

describe('WatchEntry Routes', () => {
  describe('POST /api/watch-entries', () => {
    it('should create a watch entry with contentId', async () => {
      mockCreateWatchEntry.mockResolvedValue(mockWatchEntry);

      const response = await request(app)
        .post('/api/watch-entries')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({
          contentId: 'content-uuid-1',
          rating: 9,
          notes: 'Great movie!',
        });

      expect(response.status).toBe(201);
      expect(response.body.rating).toBe(9);
      expect(mockCreateWatchEntry).toHaveBeenCalled();
    });

    it('should create a watch entry with tmdbId for movie', async () => {
      mockSaveMovieFromTMDB.mockResolvedValue(mockContent);
      mockCreateWatchEntry.mockResolvedValue(mockWatchEntry);

      const response = await request(app)
        .post('/api/watch-entries')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({
          tmdbId: 550,
          contentType: 'movie',
          rating: 9,
        });

      expect(response.status).toBe(201);
      expect(mockSaveMovieFromTMDB).toHaveBeenCalledWith(550);
    });

    it('should create a watch entry with tmdbId for TV show', async () => {
      const tvContent = { ...mockContent, id: 'tv-content-id', type: 'TV_SHOW' as const };
      mockSaveTVShowFromTMDB.mockResolvedValue(tvContent);
      mockCreateWatchEntry.mockResolvedValue({
        ...mockWatchEntry,
        content: tvContent,
      });

      const response = await request(app)
        .post('/api/watch-entries')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({
          tmdbId: 1396,
          contentType: 'tv',
          rating: 10,
        });

      expect(response.status).toBe(201);
      expect(mockSaveTVShowFromTMDB).toHaveBeenCalledWith(1396);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/watch-entries')
        .send({ contentId: 'content-uuid-1' });

      expect(response.status).toBe(401);
    });

    it('should return 400 when neither contentId nor tmdbId provided', async () => {
      const response = await request(app)
        .post('/api/watch-entries')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Either contentId or tmdbId must be provided');
    });

    it('should return 400 when tmdbId provided without contentType', async () => {
      const response = await request(app)
        .post('/api/watch-entries')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ tmdbId: 550 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('contentType (movie/tv) is required when using tmdbId');
    });

    it('should return 400 for invalid contentType', async () => {
      const response = await request(app)
        .post('/api/watch-entries')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ tmdbId: 550, contentType: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('contentType must be "movie" or "tv"');
    });

    it('should return 500 on service error', async () => {
      mockCreateWatchEntry.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .post('/api/watch-entries')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ contentId: 'content-uuid-1' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to create watch entry');
    });
  });

  describe('GET /api/watch-entries/history', () => {
    it('should return watch history for authenticated user', async () => {
      mockGetUserWatchHistory.mockResolvedValue([mockWatchEntry]);

      const response = await request(app)
        .get('/api/watch-entries/history')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(mockGetUserWatchHistory).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/watch-entries/history');

      expect(response.status).toBe(401);
    });

    it('should return 500 on error', async () => {
      mockGetUserWatchHistory.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/watch-entries/history')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch watch history');
    });
  });

  describe('GET /api/watch-entries/stats', () => {
    it('should return stats for authenticated user', async () => {
      const mockStats = {
        totalWatched: 10,
        movies: 7,
        tvShows: 3,
        averageRating: 8.2,
        thisMonth: 2,
        lastMonth: 3,
        favoriteGenre: 'Drama',
      };
      mockGetUserStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/watch-entries/stats')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body.totalWatched).toBe(10);
      expect(mockGetUserStats).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/watch-entries/stats');

      expect(response.status).toBe(401);
    });

    it('should return 500 on error', async () => {
      mockGetUserStats.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/watch-entries/stats')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch stats');
    });
  });

  describe('GET /api/watch-entries/:id', () => {
    it('should return a specific watch entry', async () => {
      mockGetWatchEntryById.mockResolvedValue(mockWatchEntry);

      const response = await request(app)
        .get('/api/watch-entries/entry-uuid-1')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('entry-uuid-1');
      expect(mockGetWatchEntryById).toHaveBeenCalledWith('entry-uuid-1', TEST_USER_ID);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/watch-entries/entry-uuid-1');

      expect(response.status).toBe(401);
    });

    it('should return 404 when not found', async () => {
      mockGetWatchEntryById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/watch-entries/nonexistent')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Watch entry not found');
    });

    it('should return 500 on error', async () => {
      mockGetWatchEntryById.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/watch-entries/some-id')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch watch entry');
    });
  });

  describe('PATCH /api/watch-entries/:id', () => {
    it('should update a watch entry', async () => {
      const updated = { ...mockWatchEntry, rating: 10, notes: 'Updated!' };
      mockUpdateWatchEntry.mockResolvedValue(updated);

      const response = await request(app)
        .patch('/api/watch-entries/entry-uuid-1')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ rating: 10, notes: 'Updated!' });

      expect(response.status).toBe(200);
      expect(response.body.rating).toBe(10);
      expect(mockUpdateWatchEntry).toHaveBeenCalledWith('entry-uuid-1', TEST_USER_ID, 10, 'Updated!');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .patch('/api/watch-entries/entry-uuid-1')
        .send({ rating: 10 });

      expect(response.status).toBe(401);
    });

    it('should return 404 when entry not found or not owned', async () => {
      mockUpdateWatchEntry.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/watch-entries/entry-uuid-1')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ rating: 5 });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Watch entry not found');
    });

    it('should return 500 on error', async () => {
      mockUpdateWatchEntry.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .patch('/api/watch-entries/some-id')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ rating: 5 });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to update watch entry');
    });
  });

  describe('DELETE /api/watch-entries/:id', () => {
    it('should delete a watch entry', async () => {
      mockDeleteWatchEntry.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/watch-entries/entry-uuid-1')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Watch entry deleted successfully');
      expect(mockDeleteWatchEntry).toHaveBeenCalledWith('entry-uuid-1', TEST_USER_ID);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).delete('/api/watch-entries/entry-uuid-1');

      expect(response.status).toBe(401);
    });

    it('should return 404 when entry not found or not owned', async () => {
      mockDeleteWatchEntry.mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/watch-entries/nonexistent')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Watch entry not found');
    });

    it('should return 500 on error', async () => {
      mockDeleteWatchEntry.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .delete('/api/watch-entries/some-id')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to delete watch entry');
    });
  });
});
