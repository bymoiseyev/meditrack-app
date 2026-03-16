import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireRole } from '../lib/auth.js';
import { getAuditLogs } from '../services/auditLogService.js';

const router = Router();

// ─── GET /audit-log ───────────────────────────────────────────────────────────
// Admin only — returns the full audit log, newest first.

router.get('/', requireRole('Admin'), async (_req: Request, res: Response) => {
  const logs = await getAuditLogs();
  res.json(logs);
});

export default router;
