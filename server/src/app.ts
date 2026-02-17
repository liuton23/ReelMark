import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { searchMovies, searchMulti } from './services/tmdb.service';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import contentRoutes from './routes/content.routes';
import watchEntryRoutes from './routes/watchEntry.routes';
import recommendationRoutes from './routes/recommendation.routes';
import { authenticate } from './middleware/auth.middleware';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check (public)
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'ReelMark API is running' });
});

// Public routes
app.use('/api/auth', authRoutes);

// TMDB search — movies and TV shows
app.get('/api/search/multi', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const results = await searchMulti(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search' });
  }
});

// Protected routes (all require valid session token)
app.use('/api/users', authenticate, userRoutes);
app.use('/api/content', authenticate, contentRoutes);
app.use('/api/watch-entries', authenticate, watchEntryRoutes);
app.use('/api/recommendations', authenticate, recommendationRoutes);

export default app;