jest.mock('../../../services/content.service');
jest.mock('../../../config/database');

import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/database';
import {
  saveMovieFromTMDB,
  saveTVShowFromTMDB,
  getContentByIdForUser,
  getContentByTmdbId,
  getAllContentForUser,
} from '../../../services/content.service';

const mockPrisma = prisma as jest.MockedObjectDeep<typeof prisma>;
const mockSaveMovieFromTMDB = saveMovieFromTMDB as jest.MockedFunction<typeof saveMovieFromTMDB>;
const mockSaveTVShowFromTMDB = saveTVShowFromTMDB as jest.MockedFunction<typeof saveTVShowFromTMDB>;
const mockGetContentByIdForUser = getContentByIdForUser as jest.MockedFunction<typeof getContentByIdForUser>;
const mockGetContentByTmdbId = getContentByTmdbId as jest.MockedFunction<typeof getContentByTmdbId>;
const mockGetAllContentForUser = getAllContentForUser as jest.MockedFunction<typeof getAllContentForUser>;

const TEST_USER_ID = 'user-uuid-1';
const TEST_TOKEN = 'test-auth-token';

const mockMovieContent = {
  id: 'content-uuid-1',
  tmdbId: 550,
  type: 'MOVIE' as const,
  title: 'Fight Club',
  releaseYear: 1999,
  posterPath: '/poster.jpg',
  genres: ['Drama', 'Thriller'],
  overview: 'A movie about fight club.',
  runtime: 139,
  showType: null,
  numberOfSeasons: null,
  numberOfEpisodes: null,
  episodeRuntime: null,
  createdAt: new Date('2025-01-01'),
};

const mockTVContent = {
  id: 'content-uuid-2',
  tmdbId: 1396,
  type: 'TV_SHOW' as const,
  title: 'Breaking Bad',
  releaseYear: 2008,
  posterPath: '/bb-poster.jpg',
  genres: ['Drama', 'Crime'],
  overview: 'A chemistry teacher turned drug dealer.',
  runtime: null,
  showType: null,
  numberOfSeasons: 5,
  numberOfEpisodes: 62,
  episodeRuntime: 45,
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

describe('Content Routes', () => {
  describe('GET /api/content', () => {
    it('should return content in user library', async () => {
      mockGetAllContentForUser.mockResolvedValue([mockMovieContent, mockTVContent]);

      const response = await request(app)
        .get('/api/content')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(mockGetAllContentForUser).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('should return empty array when user has no content', async () => {
      mockGetAllContentForUser.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/content')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/content');

      expect(response.status).toBe(401);
    });

    it('should return 500 on error', async () => {
      mockGetAllContentForUser.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/content')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch content');
    });
  });

  describe('GET /api/content/:id', () => {
    it('should return content when found in user library', async () => {
      mockGetContentByIdForUser.mockResolvedValue(mockMovieContent);

      const response = await request(app)
        .get('/api/content/content-uuid-1')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Fight Club');
      expect(mockGetContentByIdForUser).toHaveBeenCalledWith('content-uuid-1', TEST_USER_ID);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/content/content-uuid-1');

      expect(response.status).toBe(401);
    });

    it('should return 404 when not found or not in user library', async () => {
      mockGetContentByIdForUser.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/content/nonexistent')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Content not found');
    });

    it('should return 500 on error', async () => {
      mockGetContentByIdForUser.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/content/some-id')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch content');
    });
  });

  describe('GET /api/content/tmdb/:tmdbId', () => {
    it('should return content when found by TMDB ID', async () => {
      mockGetContentByTmdbId.mockResolvedValue(mockMovieContent);

      const response = await request(app)
        .get('/api/content/tmdb/550')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body.tmdbId).toBe(550);
    });

    it('should return 400 for invalid TMDB ID', async () => {
      const response = await request(app)
        .get('/api/content/tmdb/notanumber')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid TMDB ID');
    });

    it('should return 404 when not found', async () => {
      mockGetContentByTmdbId.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/content/tmdb/999999')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Content not found');
    });

    it('should return 500 on error', async () => {
      mockGetContentByTmdbId.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/content/tmdb/550')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to check content');
    });
  });

  describe('POST /api/content/movie', () => {
    it('should save a movie from TMDB', async () => {
      mockSaveMovieFromTMDB.mockResolvedValue(mockMovieContent);

      const response = await request(app)
        .post('/api/content/movie')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ tmdbId: 550 });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Fight Club');
      expect(mockSaveMovieFromTMDB).toHaveBeenCalledWith(550);
    });

    it('should return 400 when tmdbId is missing', async () => {
      const response = await request(app)
        .post('/api/content/movie')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('tmdbId is required');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/content/movie')
        .send({ tmdbId: 550 });

      expect(response.status).toBe(401);
    });

    it('should return 500 on error', async () => {
      mockSaveMovieFromTMDB.mockRejectedValue(new Error('TMDB error'));

      const response = await request(app)
        .post('/api/content/movie')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ tmdbId: 550 });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to save movie');
    });
  });

  describe('POST /api/content/tv', () => {
    it('should save a TV show from TMDB', async () => {
      mockSaveTVShowFromTMDB.mockResolvedValue(mockTVContent);

      const response = await request(app)
        .post('/api/content/tv')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ tmdbId: 1396 });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Breaking Bad');
      expect(mockSaveTVShowFromTMDB).toHaveBeenCalledWith(1396);
    });

    it('should return 400 when tmdbId is missing', async () => {
      const response = await request(app)
        .post('/api/content/tv')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('tmdbId is required');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/content/tv')
        .send({ tmdbId: 1396 });

      expect(response.status).toBe(401);
    });

    it('should return 500 on error', async () => {
      mockSaveTVShowFromTMDB.mockRejectedValue(new Error('TMDB error'));

      const response = await request(app)
        .post('/api/content/tv')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ tmdbId: 1396 });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to save TV show');
    });
  });
});
