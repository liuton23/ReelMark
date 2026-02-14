import express, { Request, Response } from 'express';
import {
  createWatchEntry,
  getUserWatchHistory,
  getWatchEntryById,
  updateWatchEntry,
  deleteWatchEntry,
} from '../services/watchEntry.service';
import { saveMovieFromTMDB, saveTVShowFromTMDB } from '../services/content.service';

const router = express.Router();

// Create a watch entry (the main endpoint you'll use!)
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      contentId,
      tmdbId,
      contentType, // 'movie' or 'tv'
      rating,
      notes,
      season,
      episode,
      watchedAt,
    } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    let finalContentId = contentId;

    // If tmdbId is provided, save content first (if not already in DB)
    if (tmdbId && !contentId) {
      if (!contentType) {
        return res.status(400).json({ error: 'contentType (movie/tv) is required when using tmdbId' });
      }

      let content;
      if (contentType === 'movie') {
        content = await saveMovieFromTMDB(tmdbId);
      } else if (contentType === 'tv') {
        content = await saveTVShowFromTMDB(tmdbId);
      } else {
        return res.status(400).json({ error: 'contentType must be "movie" or "tv"' });
      }

      finalContentId = content.id;
    }

    if (!finalContentId) {
      return res.status(400).json({ error: 'Either contentId or tmdbId must be provided' });
    }

    // Create the watch entry
    const watchEntry = await createWatchEntry(
      userId,
      finalContentId,
      rating,
      notes,
      season,
      episode,
      watchedAt ? new Date(watchedAt) : undefined
    );

    res.status(201).json(watchEntry);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({
      error: 'Failed to create watch entry',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get all watch entries for a user
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const watchHistory = await getUserWatchHistory(userId);
    res.json(watchHistory);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Failed to fetch watch history' });
  }
});

// Get a specific watch entry
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const entryId = req.params.id as string;
    const entry = await getWatchEntryById(entryId);

    if (!entry) {
      return res.status(404).json({ error: 'Watch entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Failed to fetch watch entry' });
  }
});

// Update a watch entry
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const entryId = req.params.id as string;
    const { rating, notes } = req.body;

    const updated = await updateWatchEntry(entryId, rating, notes);
    res.json(updated);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Failed to update watch entry' });
  }
});

// Delete a watch entry
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const entryId = req.params.id as string;
    await deleteWatchEntry(entryId);
    res.json({ message: 'Watch entry deleted successfully' });
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Failed to delete watch entry' });
  }
});

export default router;