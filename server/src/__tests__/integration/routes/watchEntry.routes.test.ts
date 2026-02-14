jest.mock('../../../services/watchEntry.service');
jest.mock('../../../services/content.service');
jest.mock('../../../config/database');

import request from 'supertest';
import app from '../../../app';
import {
  createWatchEntry,
  getUserWatchHistory,
  getWatchEntryById,
  updateWatchEntry,
  deleteWatchEntry,
} from '../../../services/watchEntry.service';
import {
  saveMovieFromTMDB,
  saveTVShowFromTMDB,
} from '../../../services/content.service';

const mockCreateWatchEntry = createWatchEntry as jest.MockedFunction<typeof createWatchEntry>;
const mockGetUserWatchHistory = getUserWatchHistory as jest.MockedFunction<typeof getUserWatchHistory>;
const mockGetWatchEntryById = getWatchEntryById as jest.MockedFunction<typeof getWatchEntryById>;
const mockUpdateWatchEntry = updateWatchEntry as jest.MockedFunction<typeof updateWatchEntry>;
const mockDeleteWatchEntry = deleteWatchEntry as jest.MockedFunction<typeof deleteWatchEntry>;
const mockSaveMovieFromTMDB = saveMovieFromTMDB as jest.MockedFunction<typeof saveMovieFromTMDB>;
const mockSaveTVShowFromTMDB = saveTVShowFromTMDB as jest.MockedFunction<typeof saveTVShowFromTMDB>;

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

const mockUser = {
  id: 'user-uuid-1',
  username: 'testuser',
  email: null,
  createdAt: new Date('2025-01-01'),
};

const mockWatchEntry = {
  id: 'entry-uuid-1',
  userId: 'user-uuid-1',
  contentId: 'content-uuid-1',
  watchedAt: new Date('2025-06-01'),
  rating: 9,
  notes: 'Great movie!',
  season: null,
  episode: null,
  createdAt: new Date('2025-06-01'),
  updatedAt: new Date('2025-06-01'),
  content: mockContent,
  user: mockUser,
};

describe('WatchEntry Routes', () => {
  describe('POST /api/watch-entries', () => {
    it('should create a watch entry with contentId', async () => {
      mockCreateWatchEntry.mockResolvedValue(mockWatchEntry);

      const response = await request(app)
        .post('/api/watch-entries')
        .send({
          userId: 'user-uuid-1',
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
        .send({
          userId: 'user-uuid-1',
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
        .send({
          userId: 'user-uuid-1',
          tmdbId: 1396,
          contentType: 'tv',
          rating: 10,
        });

      expect(response.status).toBe(201);
      expect(mockSaveTVShowFromTMDB).toHaveBeenCalledWith(1396);
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/api/watch-entries')
        .send({ contentId: 'content-uuid-1' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('userId is required');
    });

    it('should return 400 when neither contentId nor tmdbId provided', async () => {
      const response = await request(app)
        .post('/api/watch-entries')
        .send({ userId: 'user-uuid-1' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Either contentId or tmdbId must be provided');
    });

    it('should return 400 when tmdbId provided without contentType', async () => {
      const response = await request(app)
        .post('/api/watch-entries')
        .send({ userId: 'user-uuid-1', tmdbId: 550 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('contentType (movie/tv) is required when using tmdbId');
    });

    it('should return 400 for invalid contentType', async () => {
      const response = await request(app)
        .post('/api/watch-entries')
        .send({ userId: 'user-uuid-1', tmdbId: 550, contentType: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('contentType must be "movie" or "tv"');
    });

    it('should return 500 on service error', async () => {
      mockCreateWatchEntry.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .post('/api/watch-entries')
        .send({ userId: 'user-uuid-1', contentId: 'content-uuid-1' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to create watch entry');
    });
  });

  describe('GET /api/watch-entries/user/:userId', () => {
    it('should return watch history for user', async () => {
      mockGetUserWatchHistory.mockResolvedValue([mockWatchEntry]);

      const response = await request(app).get('/api/watch-entries/user/user-uuid-1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(mockGetUserWatchHistory).toHaveBeenCalledWith('user-uuid-1');
    });

    it('should return 500 on error', async () => {
      mockGetUserWatchHistory.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/watch-entries/user/user-uuid-1');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch watch history');
    });
  });

  describe('GET /api/watch-entries/:id', () => {
    it('should return a specific watch entry', async () => {
      mockGetWatchEntryById.mockResolvedValue(mockWatchEntry);

      const response = await request(app).get('/api/watch-entries/entry-uuid-1');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('entry-uuid-1');
    });

    it('should return 404 when not found', async () => {
      mockGetWatchEntryById.mockResolvedValue(null);

      const response = await request(app).get('/api/watch-entries/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Watch entry not found');
    });

    it('should return 500 on error', async () => {
      mockGetWatchEntryById.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/watch-entries/some-id');

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
        .send({ rating: 10, notes: 'Updated!' });

      expect(response.status).toBe(200);
      expect(response.body.rating).toBe(10);
      expect(mockUpdateWatchEntry).toHaveBeenCalledWith('entry-uuid-1', 10, 'Updated!');
    });

    it('should return 500 on error', async () => {
      mockUpdateWatchEntry.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .patch('/api/watch-entries/some-id')
        .send({ rating: 5 });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to update watch entry');
    });
  });

  describe('DELETE /api/watch-entries/:id', () => {
    it('should delete a watch entry', async () => {
      mockDeleteWatchEntry.mockResolvedValue(true);

      const response = await request(app).delete('/api/watch-entries/entry-uuid-1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Watch entry deleted successfully');
    });

    it('should return 500 on error', async () => {
      mockDeleteWatchEntry.mockRejectedValue(new Error('DB error'));

      const response = await request(app).delete('/api/watch-entries/some-id');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to delete watch entry');
    });
  });
});
