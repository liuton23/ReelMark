import express, { Request, Response } from 'express';
import { register, login, logout, getCurrentUser } from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Register a new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const result = await register(username, password, email);

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error && (error.message.includes('already taken') || error.message.includes('already in use'))) {
      return res.status(409).json({ error: error.message });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await login(username, password);

    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid username or password') {
      return res.status(401).json({ error: error.message });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout (requires auth)
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization!.split(' ')[1];
    await logout(token);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user (requires auth)
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await getCurrentUser(req.userId!);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;