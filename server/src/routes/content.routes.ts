import express, { Request, Response } from 'express';
import { 
  saveMovieFromTMDB, 
  saveTVShowFromTMDB, 
  getContentById, 
  getContentByTmdbId,
  getAllContent 
} from '../services/content.service';

const router = express.Router();

// Get all content
router.get('/', async (req: Request, res: Response) => {
  try {
    const content = await getAllContent();
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get content by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const contentId = req.params.id as string;
    const content = await getContentById(contentId);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Save movie from TMDB
router.post('/movie', async (req: Request, res: Response) => {
  try {
    const { tmdbId } = req.body;
    
    if (!tmdbId) {
      return res.status(400).json({ error: 'tmdbId is required' });
    }
    
    const content = await saveMovieFromTMDB(tmdbId);
    res.status(201).json(content);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Failed to save movie', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Save TV show from TMDB
router.post('/tv', async (req: Request, res: Response) => {
  try {
    const { tmdbId } = req.body;
    
    if (!tmdbId) {
      return res.status(400).json({ error: 'tmdbId is required' });
    }
    
    const content = await saveTVShowFromTMDB(tmdbId);
    res.status(201).json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save TV show' });
  }
});

// Check if content exists by TMDB ID
router.get('/tmdb/:tmdbId', async (req: Request, res: Response) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId as string);
    
    if (isNaN(tmdbId)) {
      return res.status(400).json({ error: 'Invalid TMDB ID' });
    }
    
    const content = await getContentByTmdbId(tmdbId);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check content' });
  }
});

export default router;