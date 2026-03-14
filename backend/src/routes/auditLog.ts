import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { requireRole } from '../lib/auth.js';

const router = Router();

const ACTION_LABEL: Record<string, string> = {
  ORDER_CREATED:          'Order skapad',
  ORDER_STATUS_ADVANCED:  'Orderstatus uppdaterad',
  MEDICATION_CREATED:     'Läkemedel tillagt',
  MEDICATION_UPDATED:     'Läkemedel uppdaterat',
  MEDICATION_DELETED:     'Läkemedel borttaget',
};

// ─── GET /audit-log ───────────────────────────────────────────────────────────
// Admin only — returns the full audit log, newest first.

router.get('/', requireRole('Admin'), async (_req: Request, res: Response) => {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  res.json(logs.map((log) => ({
    ...log,
    actionLabel: ACTION_LABEL[log.action] ?? log.action,
  })));
});

export default router;
