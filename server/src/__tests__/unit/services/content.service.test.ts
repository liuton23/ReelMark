jest.mock('../../../config/database');
jest.mock('../../../services/tmdb.service');

import { prisma } from '../../../config/database';
import { getMovieDetails, getTVShowDetails } from '../../../services/tmdb.service';
import {
  getContentByTmdbId,
  getContentById,
  saveMovieFromTMDB,
  saveTVShowFromTMDB,
  getAllContent,
} from '../../../services/content.service';

const mockPrisma = prisma as jest.MockedObjectDeep<typeof prisma>;
const mockGetMovieDetails = getMovieDetails as jest.MockedFunction<typeof getMovieDetails>;
const mockGetTVShowDetails = getTVShowDetails as jest.MockedFunction<typeof getTVShowDetails>;

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

const mockTmdbMovieData = {
  id: 550,
  title: 'Fight Club',
  release_date: '1999-10-15',
  poster_path: '/poster.jpg',
  genres: [{ id: 18, name: 'Drama' }, { id: 53, name: 'Thriller' }],
  overview: 'A movie about fight club.',
  runtime: 139,
};

const mockTmdbTVData = {
  id: 1396,
  name: 'Breaking Bad',
  first_air_date: '2008-01-20',
  poster_path: '/bb-poster.jpg',
  genres: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }],
  overview: 'A chemistry teacher turned drug dealer.',
  type: 'Scripted',
  number_of_seasons: 5,
  number_of_episodes: 62,
  episode_run_time: [45],
};

describe('Content Service', () => {
  describe('getContentByTmdbId', () => {
    it('should return content when found', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(mockMovieContent);

      const result = await getContentByTmdbId(550);

      expect(mockPrisma.content.findUnique).toHaveBeenCalledWith({
        where: { tmdbId: 550 },
      });
      expect(result).toEqual(mockMovieContent);
    });

    it('should return null when not found', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null);

      const result = await getContentByTmdbId(999999);

      expect(result).toBeNull();
    });

    it('should throw on database error', async () => {
      mockPrisma.content.findUnique.mockRejectedValue(new Error('DB error'));

      await expect(getContentByTmdbId(550)).rejects.toThrow('DB error');
    });
  });

  describe('getContentById', () => {
    it('should return content when found', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(mockMovieContent);

      const result = await getContentById('content-uuid-1');

      expect(mockPrisma.content.findUnique).toHaveBeenCalledWith({
        where: { id: 'content-uuid-1' },
      });
      expect(result).toEqual(mockMovieContent);
    });

    it('should return null when not found', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null);

      const result = await getContentById('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw on database error', async () => {
      mockPrisma.content.findUnique.mockRejectedValue(new Error('DB error'));

      await expect(getContentById('id')).rejects.toThrow('DB error');
    });
  });

  describe('saveMovieFromTMDB', () => {
    it('should return existing movie if already in DB', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(mockMovieContent);

      const result = await saveMovieFromTMDB(550);

      expect(result).toEqual(mockMovieContent);
      expect(mockGetMovieDetails).not.toHaveBeenCalled();
      expect(mockPrisma.content.create).not.toHaveBeenCalled();
    });

    it('should fetch from TMDB and save new movie', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null);
      mockGetMovieDetails.mockResolvedValue(mockTmdbMovieData);
      mockPrisma.content.create.mockResolvedValue(mockMovieContent);

      const result = await saveMovieFromTMDB(550);

      expect(mockGetMovieDetails).toHaveBeenCalledWith(550);
      expect(mockPrisma.content.create).toHaveBeenCalledWith({
        data: {
          tmdbId: 550,
          type: 'MOVIE',
          title: 'Fight Club',
          releaseYear: 1999,
          posterPath: '/poster.jpg',
          genres: ['Drama', 'Thriller'],
          overview: 'A movie about fight club.',
          runtime: 139,
        },
      });
      expect(result).toEqual(mockMovieContent);
    });

    it('should handle movie with no release date', async () => {
      const tmdbDataNoDate = { ...mockTmdbMovieData, release_date: '' };
      mockPrisma.content.findUnique.mockResolvedValue(null);
      mockGetMovieDetails.mockResolvedValue(tmdbDataNoDate);
      mockPrisma.content.create.mockResolvedValue(mockMovieContent);

      await saveMovieFromTMDB(550);

      expect(mockPrisma.content.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          releaseYear: null,
        }),
      });
    });

    it('should handle movie with no genres', async () => {
      const tmdbDataNoGenres = { ...mockTmdbMovieData, genres: null };
      mockPrisma.content.findUnique.mockResolvedValue(null);
      mockGetMovieDetails.mockResolvedValue(tmdbDataNoGenres);
      mockPrisma.content.create.mockResolvedValue(mockMovieContent);

      await saveMovieFromTMDB(550);

      expect(mockPrisma.content.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          genres: [],
        }),
      });
    });

    it('should throw on error', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null);
      mockGetMovieDetails.mockRejectedValue(new Error('TMDB error'));

      await expect(saveMovieFromTMDB(550)).rejects.toThrow('TMDB error');
    });
  });

  describe('saveTVShowFromTMDB', () => {
    it('should return existing TV show if already in DB', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(mockTVContent);

      const result = await saveTVShowFromTMDB(1396);

      expect(result).toEqual(mockTVContent);
      expect(mockGetTVShowDetails).not.toHaveBeenCalled();
      expect(mockPrisma.content.create).not.toHaveBeenCalled();
    });

    it('should fetch from TMDB and save new TV show', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null);
      mockGetTVShowDetails.mockResolvedValue(mockTmdbTVData);
      mockPrisma.content.create.mockResolvedValue(mockTVContent);

      const result = await saveTVShowFromTMDB(1396);

      expect(mockGetTVShowDetails).toHaveBeenCalledWith(1396);
      expect(mockPrisma.content.create).toHaveBeenCalledWith({
        data: {
          tmdbId: 1396,
          type: 'TV_SHOW',
          title: 'Breaking Bad',
          releaseYear: 2008,
          posterPath: '/bb-poster.jpg',
          genres: ['Drama', 'Crime'],
          overview: 'A chemistry teacher turned drug dealer.',
          showType: 'Scripted',
          numberOfSeasons: 5,
          numberOfEpisodes: 62,
          episodeRuntime: 45,
        },
      });
      expect(result).toEqual(mockTVContent);
    });

    it('should handle TV show with empty episode runtime array', async () => {
      const tmdbDataNoRuntime = { ...mockTmdbTVData, episode_run_time: [] };
      mockPrisma.content.findUnique.mockResolvedValue(null);
      mockGetTVShowDetails.mockResolvedValue(tmdbDataNoRuntime);
      mockPrisma.content.create.mockResolvedValue(mockTVContent);

      await saveTVShowFromTMDB(1396);

      expect(mockPrisma.content.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          episodeRuntime: null,
        }),
      });
    });

    it('should throw on error', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null);
      mockGetTVShowDetails.mockRejectedValue(new Error('TMDB error'));

      await expect(saveTVShowFromTMDB(1396)).rejects.toThrow('TMDB error');
    });
  });

  describe('getAllContent', () => {
    it('should return all content ordered by date', async () => {
      const content = [mockMovieContent, mockTVContent];
      mockPrisma.content.findMany.mockResolvedValue(content);

      const result = await getAllContent();

      expect(mockPrisma.content.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(content);
    });

    it('should return empty array when no content', async () => {
      mockPrisma.content.findMany.mockResolvedValue([]);

      const result = await getAllContent();

      expect(result).toEqual([]);
    });

    it('should throw on database error', async () => {
      mockPrisma.content.findMany.mockRejectedValue(new Error('DB error'));

      await expect(getAllContent()).rejects.toThrow('DB error');
    });
  });
});
