import { Router } from 'express';
import type { Request, Response } from 'express';
import { OrderStatus } from '@prisma/client';
import { requireRole } from '../lib/auth.js';
import { logAction } from '../lib/audit.js';
import { parseId } from '../lib/parseId.js';
import {
  getOrders,
  getOrderById,
  careUnitExists,
  getMedicationsForLines,
  createOrder,
  advanceOrderStatus,
} from '../services/orderService.js';

const router = Router();

const VALID_STATUSES = Object.values(OrderStatus);

// ─── GET /orders ──────────────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response) => {
  const { careUnitId, status } = req.query;

  if (status && !VALID_STATUSES.includes(status as OrderStatus)) {
    res.status(400).json({ error: 'Invalid status value' });
    return;
  }

  const parsedCareUnitId = careUnitId ? parseId(careUnitId as string) : undefined;
  if (careUnitId && !parsedCareUnitId) {
    res.status(400).json({ error: 'Invalid careUnitId' });
    return;
  }

  const orders = await getOrders(parsedCareUnitId, status as OrderStatus | undefined);
  res.json(orders);
});

// ─── GET /orders/:id ──────────────────────────────────────────────────────────

router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) { res.status(400).json({ error: 'Invalid id' }); return; }

  const order = await getOrderById(id);
  if (!order) { res.status(404).json({ error: 'Order not found' }); return; }

  res.json(order);
});

// ─── POST /orders ─────────────────────────────────────────────────────────────

router.post('/', async (req: Request, res: Response) => {
  const { careUnitId, lines } = req.body as { careUnitId?: unknown; lines?: unknown };

  if (!careUnitId || typeof careUnitId !== 'number' || !Number.isInteger(careUnitId) || careUnitId < 1) {
    res.status(400).json({ error: 'careUnitId must be a positive integer' });
    return;
  }

  if (!Array.isArray(lines) || lines.length === 0) {
    res.status(400).json({ error: 'lines must be a non-empty array' });
    return;
  }

  for (const line of lines) {
    if (!line.medicationId || typeof line.medicationId !== 'number' || !Number.isInteger(line.medicationId) || line.medicationId < 1) {
      res.status(400).json({ error: 'Each line must have a valid medicationId' });
      return;
    }
    if (!line.quantity || !Number.isInteger(line.quantity) || line.quantity < 1) {
      res.status(400).json({ error: 'Each line must have a quantity of at least 1' });
      return;
    }
  }

  if (!(await careUnitExists(careUnitId))) {
    res.status(400).json({ error: 'Care unit not found' });
    return;
  }

  const medicationIds: number[] = lines.map((l: { medicationId: number }) => l.medicationId);
  const medications = await getMedicationsForLines(medicationIds);

  if (medications.length !== medicationIds.length) {
    res.status(400).json({ error: 'One or more medication IDs not found' });
    return;
  }

  const medMap = new Map(medications.map((m) => [m.id, m]));
  const order = await createOrder(careUnitId, lines, medMap);

  await logAction(req.user!, 'ORDER_CREATED', 'Order', Number(order.id.replace('ORD-', '')), {
    careUnitId: order.careUnitId,
    lineCount:  order.lines.length,
  });

  res.status(201).json(order);
});

// ─── PATCH /orders/:id/status ─────────────────────────────────────────────────

router.patch('/:id/status', requireRole('Apotekare', 'Admin'), async (req: Request<{ id: string }>, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) { res.status(400).json({ error: 'Invalid id' }); return; }

  const result = await advanceOrderStatus(id);

  if ('error' in result) {
    if (result.error === 'Order not found')  { res.status(404).json({ error: result.error }); return; }
    if (result.error === 'already_final')    { res.status(409).json({ error: 'Order is already at final status (Levererad)' }); return; }
    if (result.error === 'conflict')         { res.status(409).json({ error: 'Order status was already changed by another request' }); return; }
  }

  const { order, from, to } = result as { order: Record<string, unknown>; from: OrderStatus; to: OrderStatus };

  await logAction(req.user!, 'ORDER_STATUS_ADVANCED', 'Order', id, { from, to });

  res.json(order);
});

export default router;
