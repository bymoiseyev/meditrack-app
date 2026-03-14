import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { signToken, requireAuth } from '../lib/auth.js';

const router = Router();

// ─── POST /auth/login ─────────────────────────────────────────────────────────

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: unknown; password?: unknown };

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    res.status(400).json({ error: 'E-post och lösenord krävs' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Use a constant-time comparison even on not-found to avoid timing attacks
  const passwordMatch = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !passwordMatch) {
    // Slow down failed attempts to make brute force attacks impractical
    await new Promise((resolve) => setTimeout(resolve, 2000));
    res.status(401).json({ error: 'Fel e-post eller lösenord' });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role, name: user.name });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) { res.status(404).json({ error: 'Användare hittades inte' }); return; }

  res.json(user);
});

export default router;
