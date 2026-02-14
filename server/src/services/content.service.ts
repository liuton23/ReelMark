import { prisma } from '../config/database';
import { ContentType } from '@prisma/client';
import { getMovieDetails, getTVShowDetails } from './tmdb.service';

// Get content by TMDB ID
export const getContentByTmdbId = async (tmdbId: number) => {
  try {
    const content = await prisma.content.findUnique({
      where: { tmdbId },
    });
    return content;
  } catch (error) {
    console.error('Error fetching content by TMDB ID:', error);
    throw error;
  }
};

// Get content by ID
export const getContentById = async (contentId: string) => {
  try {
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });
    return content;
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    throw error;
  }
};

// Save movie to database from TMDB data
export const saveMovieFromTMDB = async (tmdbId: number) => {
  try {
    // Check if already exists
    const existing = await getContentByTmdbId(tmdbId);
    if (existing) {
      console.log('Movie already exists in DB:', existing.title);
      return existing;
    }

    // Fetch from TMDB
    const tmdbData = await getMovieDetails(tmdbId);

    // Save to database
    const content = await prisma.content.create({
      data: {
        tmdbId: tmdbData.id,
        type: ContentType.MOVIE,
        title: tmdbData.title,
        releaseYear: tmdbData.release_date ? new Date(tmdbData.release_date).getFullYear() : null,
        posterPath: tmdbData.poster_path,
        genres: tmdbData.genres ? tmdbData.genres.map((g: any) => g.name) : [],
        overview: tmdbData.overview,
        runtime: tmdbData.runtime,
      },
    });

    console.log('✨ Saved movie to DB:', content.title);
    return content;
  } catch (error) {
    console.error('Error saving movie from TMDB:', error);
    throw error;
  }
};

// Save TV show to database from TMDB data
export const saveTVShowFromTMDB = async (tmdbId: number) => {
  try {
    // Check if already exists
    const existing = await getContentByTmdbId(tmdbId);
    if (existing) {
      console.log('TV show already exists in DB:', existing.title);
      return existing;
    }

    // Fetch from TMDB
    const tmdbData = await getTVShowDetails(tmdbId);

    // Save to database
    const content = await prisma.content.create({
      data: {
        tmdbId: tmdbData.id,
        type: ContentType.TV_SHOW,
        title: tmdbData.name,
        releaseYear: tmdbData.first_air_date ? new Date(tmdbData.first_air_date).getFullYear() : null,
        posterPath: tmdbData.poster_path,
        genres: tmdbData.genres ? tmdbData.genres.map((g: any) => g.name) : [],
        overview: tmdbData.overview,
        showType: tmdbData.type || null,
        numberOfSeasons: tmdbData.number_of_seasons,
        numberOfEpisodes: tmdbData.number_of_episodes,
        episodeRuntime: tmdbData.episode_run_time && tmdbData.episode_run_time.length > 0 
          ? tmdbData.episode_run_time[0] 
          : null,
      },
    });

    console.log('✨ Saved TV show to DB:', content.title);
    return content;
  } catch (error) {
    console.error('Error saving TV show from TMDB:', error);
    throw error;
  }
};

// Get all content (for browsing library)
export const getAllContent = async () => {
  try {
    const content = await prisma.content.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return content;
  } catch (error) {
    console.error('Error fetching all content:', error);
    throw error;
  }
};