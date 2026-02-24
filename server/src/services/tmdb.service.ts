import axios from 'axios';
import dotenv from 'dotenv';
import redis from '../config/redis';

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;

const CACHE_TTL = {
  SEARCH: 60 * 5, // 5 minutes
  DETAILS: 60 * 60 * 24, // 24 hours
};

// Search for movies
export const searchMovies = async (query: string) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

// Search for both movies and TV shows (with Redis caching)
export const searchMulti = async (query: string) => {
  console.log('searchMulti called with:', query);
  const cacheKey = `search:multi:${query.toLowerCase().trim()}`;

  try {
    // Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Cache hit: ${cacheKey}`);
      return JSON.parse(cached);
    }

    // Cache miss — call TMDB
    const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
      },
    });

    const results = response.data.results.filter(
      (item: any) => item.media_type === 'movie' || item.media_type === 'tv',
    );

    // Store in cache
    await redis.setex(cacheKey, CACHE_TTL.SEARCH, JSON.stringify(results));
    console.log(`Cache set: ${cacheKey}`);

    return results;
  } catch (error) {
    console.error('Error searching multi:', error);
    throw error;
  }
};

// Search for TV shows
export const searchTVShows = async (query: string) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching TV shows:', error);
    throw error;
  }
};

// Get movie details by TMDB ID (with Redis caching)
export const getMovieDetails = async (tmdbId: number) => {
  const cacheKey = `movie:details:${tmdbId}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Cache hit: ${cacheKey}`);
      return JSON.parse(cached);
    }

    const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });

    await redis.setex(cacheKey, CACHE_TTL.DETAILS, JSON.stringify(response.data));
    console.log(`Cache set: ${cacheKey}`);

    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

// Get TV show details by TMDB ID (with Redis caching)
export const getTVShowDetails = async (tmdbId: number) => {
  const cacheKey = `tv:details:${tmdbId}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Cache hit: ${cacheKey}`);
      return JSON.parse(cached);
    }

    const response = await axios.get(`${TMDB_BASE_URL}/tv/${tmdbId}`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });

    await redis.setex(cacheKey, CACHE_TTL.DETAILS, JSON.stringify(response.data));
    console.log(`Cache set: ${cacheKey}`);

    return response.data;
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    throw error;
  }
};
