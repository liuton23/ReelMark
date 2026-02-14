jest.mock('../../../services/content.service');
jest.mock('../../../config/database');

import request from 'supertest';
import app from '../../../app';
import {
  saveMovieFromTMDB,
  saveTVShowFromTMDB,
  getContentById,
  getContentByTmdbId,
  getAllContent,
} from '../../../services/content.service';

const mockSaveMovieFromTMDB = saveMovieFromTMDB as jest.MockedFunction<typeof saveMovieFromTMDB>;
const mockSaveTVShowFromTMDB = saveTVShowFromTMDB as jest.MockedFunction<typeof saveTVShowFromTMDB>;
const mockGetContentById = getContentById as jest.MockedFunction<typeof getContentById>;
const mockGetContentByTmdbId = getContentByTmdbId as jest.MockedFunction<typeof getContentByTmdbId>;
const mockGetAllContent = getAllContent as jest.MockedFunction<typeof getAllContent>;

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

describe('Content Routes', () => {
  describe('GET /api/content', () => {
    it('should return all content', async () => {
      mockGetAllContent.mockResolvedValue([mockMovieContent, mockTVContent]);

      const response = await request(app).get('/api/content');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when no content', async () => {
      mockGetAllContent.mockResolvedValue([]);

      const response = await request(app).get('/api/content');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 500 on error', async () => {
      mockGetAllContent.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/content');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch content');
    });
  });

  describe('GET /api/content/:id', () => {
    it('should return content when found', async () => {
      mockGetContentById.mockResolvedValue(mockMovieContent);

      const response = await request(app).get('/api/content/content-uuid-1');

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Fight Club');
    });

    it('should return 404 when not found', async () => {
      mockGetContentById.mockResolvedValue(null);

      const response = await request(app).get('/api/content/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Content not found');
    });

    it('should return 500 on error', async () => {
      mockGetContentById.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/content/some-id');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch content');
    });
  });

  describe('GET /api/content/tmdb/:tmdbId', () => {
    it('should return content when found by TMDB ID', async () => {
      mockGetContentByTmdbId.mockResolvedValue(mockMovieContent);

      const response = await request(app).get('/api/content/tmdb/550');

      expect(response.status).toBe(200);
      expect(response.body.tmdbId).toBe(550);
    });

    it('should return 400 for invalid TMDB ID', async () => {
      const response = await request(app).get('/api/content/tmdb/notanumber');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid TMDB ID');
    });

    it('should return 404 when not found', async () => {
      mockGetContentByTmdbId.mockResolvedValue(null);

      const response = await request(app).get('/api/content/tmdb/999999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Content not found');
    });

    it('should return 500 on error', async () => {
      mockGetContentByTmdbId.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/content/tmdb/550');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to check content');
    });
  });

  describe('POST /api/content/movie', () => {
    it('should save a movie from TMDB', async () => {
      mockSaveMovieFromTMDB.mockResolvedValue(mockMovieContent);

      const response = await request(app)
        .post('/api/content/movie')
        .send({ tmdbId: 550 });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Fight Club');
      expect(mockSaveMovieFromTMDB).toHaveBeenCalledWith(550);
    });

    it('should return 400 when tmdbId is missing', async () => {
      const response = await request(app)
        .post('/api/content/movie')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('tmdbId is required');
    });

    it('should return 500 on error', async () => {
      mockSaveMovieFromTMDB.mockRejectedValue(new Error('TMDB error'));

      const response = await request(app)
        .post('/api/content/movie')
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
        .send({ tmdbId: 1396 });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Breaking Bad');
      expect(mockSaveTVShowFromTMDB).toHaveBeenCalledWith(1396);
    });

    it('should return 400 when tmdbId is missing', async () => {
      const response = await request(app)
        .post('/api/content/tv')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('tmdbId is required');
    });

    it('should return 500 on error', async () => {
      mockSaveTVShowFromTMDB.mockRejectedValue(new Error('TMDB error'));

      const response = await request(app)
        .post('/api/content/tv')
        .send({ tmdbId: 1396 });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to save TV show');
    });
  });
});
