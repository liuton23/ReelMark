jest.mock('axios');

import axios from 'axios';
import {
  searchMovies,
  searchTVShows,
  getMovieDetails,
  getTVShowDetails,
} from '../../../services/tmdb.service';

const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockMovieResults = [
  { id: 550, title: 'Fight Club', release_date: '1999-10-15' },
  { id: 551, title: 'Fight Club 2', release_date: '2020-01-01' },
];

const mockTVResults = [
  { id: 1396, name: 'Breaking Bad', first_air_date: '2008-01-20' },
];

const mockMovieDetails = {
  id: 550,
  title: 'Fight Club',
  release_date: '1999-10-15',
  runtime: 139,
  genres: [{ id: 18, name: 'Drama' }],
  overview: 'A movie about fight club.',
  poster_path: '/poster.jpg',
};

const mockTVDetails = {
  id: 1396,
  name: 'Breaking Bad',
  first_air_date: '2008-01-20',
  number_of_seasons: 5,
  number_of_episodes: 62,
  episode_run_time: [45],
  genres: [{ id: 18, name: 'Drama' }],
  overview: 'A chemistry teacher turned drug dealer.',
  poster_path: '/bb-poster.jpg',
  type: 'Scripted',
};

describe('TMDB Service', () => {
  describe('searchMovies', () => {
    it('should return movie search results', async () => {
      mockedAxios.get.mockResolvedValue({ data: { results: mockMovieResults } });

      const result = await searchMovies('Fight Club');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/search/movie'),
        expect.objectContaining({
          params: expect.objectContaining({ query: 'Fight Club' }),
        })
      );
      expect(result).toEqual(mockMovieResults);
    });

    it('should throw on API error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(searchMovies('test')).rejects.toThrow('Network error');
    });
  });

  describe('searchTVShows', () => {
    it('should return TV show search results', async () => {
      mockedAxios.get.mockResolvedValue({ data: { results: mockTVResults } });

      const result = await searchTVShows('Breaking Bad');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/search/tv'),
        expect.objectContaining({
          params: expect.objectContaining({ query: 'Breaking Bad' }),
        })
      );
      expect(result).toEqual(mockTVResults);
    });

    it('should throw on API error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(searchTVShows('test')).rejects.toThrow('Network error');
    });
  });

  describe('getMovieDetails', () => {
    it('should return movie details', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockMovieDetails });

      const result = await getMovieDetails(550);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/movie/550'),
        expect.objectContaining({
          params: expect.objectContaining({ api_key: expect.any(String) }),
        })
      );
      expect(result).toEqual(mockMovieDetails);
    });

    it('should throw on API error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Not found'));

      await expect(getMovieDetails(999999)).rejects.toThrow('Not found');
    });
  });

  describe('getTVShowDetails', () => {
    it('should return TV show details', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockTVDetails });

      const result = await getTVShowDetails(1396);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/tv/1396'),
        expect.objectContaining({
          params: expect.objectContaining({ api_key: expect.any(String) }),
        })
      );
      expect(result).toEqual(mockTVDetails);
    });

    it('should throw on API error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Not found'));

      await expect(getTVShowDetails(999999)).rejects.toThrow('Not found');
    });
  });
});
