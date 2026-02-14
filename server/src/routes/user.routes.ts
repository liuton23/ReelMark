import express, { Request, Response } from 'express';
import { createUser, getUserById, getOrCreateDefaultUser } from '../services/user.service';

const router = express.Router();

// Get or create default user
router.get('/default', async (req: Request, res: Response) => {
  try {
    const user = await getOrCreateDefaultUser();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get/create default user' });
  }
});

// Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await getUserById(req.params.id as string);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user (for future multi-user)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { username, email } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const user = await createUser(username, email);
    res.status(201).json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;