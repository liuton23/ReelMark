import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { searchMovies } from './services/tmdb.service';
import userRoutes from './routes/user.routes';
import contentRoutes from './routes/content.routes';
import watchEntryRoutes from './routes/watchEntry.routes';
import recommendationRoutes from './routes/recommendation.routes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/watch-entries', watchEntryRoutes)
app.use('/api/recommendations', recommendationRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'ReelMark API is running' });
});

// Test TMDB search
app.get('/api/search/movies', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const results = await searchMovies(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

export default app;
