import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// ─── GET /care-units ──────────────────────────────────────────────────────────

router.get('/', async (_req: Request, res: Response) => {
  const careUnits = await prisma.careUnit.findMany({ orderBy: { name: 'asc' } });
  res.json(careUnits);
});

export default router;
