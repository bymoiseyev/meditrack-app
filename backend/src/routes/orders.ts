import { Router } from 'express';
import type { Request, Response } from 'express';
import { OrderStatus } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { requireRole } from '../lib/auth.js';
import { logAction } from '../lib/audit.js';

const router = Router();

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_STATUSES = Object.values(OrderStatus);

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  Utkast:    OrderStatus.Skickad,
  Skickad:   OrderStatus.Bekräftad,
  Bekräftad: OrderStatus.Levererad,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseId(raw: string): number | null {
  const n = parseInt(raw, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function formatOrderId(id: number): string {
  return `ORD-${String(id).padStart(4, '0')}`;
}

function formatOrder(order: { id: number; [key: string]: unknown }) {
  return { ...order, id: formatOrderId(order.id) };
}

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

  const orders = await prisma.order.findMany({
    where: {
      ...(parsedCareUnitId && { careUnitId: parsedCareUnitId }),
      ...(status            && { status:     status as OrderStatus }),
    },
    include: {
      careUnit: { select: { id: true, name: true } },
      lines:    true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(orders.map(formatOrder));
});

// ─── GET /orders/:id ──────────────────────────────────────────────────────────

router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) { res.status(400).json({ error: 'Invalid id' }); return; }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      careUnit: { select: { id: true, name: true } },
      lines:    true,
    },
  });

  if (!order) { res.status(404).json({ error: 'Order not found' }); return; }

  res.json(formatOrder(order));
});

// ─── POST /orders ─────────────────────────────────────────────────────────────

router.post('/', async (req: Request, res: Response) => {
  const { careUnitId, lines } = req.body as {
    careUnitId?: unknown;
    lines?: unknown;
  };

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

  // Verify care unit exists
  const careUnit = await prisma.careUnit.findUnique({ where: { id: careUnitId }, select: { id: true } });
  if (!careUnit) { res.status(400).json({ error: 'Care unit not found' }); return; }

  // Fetch medication snapshots for all line items
  const medicationIds: number[] = lines.map((l: { medicationId: number }) => l.medicationId);
  const medications = await prisma.medication.findMany({
    where: { id: { in: medicationIds } },
    select: { id: true, name: true, form: true, strength: true },
  });

  if (medications.length !== medicationIds.length) {
    res.status(400).json({ error: 'One or more medication IDs not found' });
    return;
  }

  const medMap = new Map(medications.map((m) => [m.id, m]));

  const order = await prisma.order.create({
    data: {
      careUnitId,
      lines: {
        create: lines.map((l: { medicationId: number; quantity: number }) => {
          const med = medMap.get(l.medicationId)!;
          return {
            medicationId:   med.id,
            medicationName: med.name,
            form:           med.form,
            strength:       med.strength,
            quantity:       l.quantity,
          };
        }),
      },
    },
    include: {
      careUnit: { select: { id: true, name: true } },
      lines:    true,
    },
  });

  await logAction(req.user!, 'ORDER_CREATED', 'Order', order.id, {
    careUnitId: order.careUnitId,
    lineCount:  order.lines.length,
  });

  res.status(201).json(formatOrder(order));
});

// ─── PATCH /orders/:id/status ─────────────────────────────────────────────────
// Advances the order one step in the fixed flow:
// Utkast → Skickad → Bekräftad → Levererad
// Reaching Levererad triggers a stock increment for every order line.

router.patch('/:id/status', requireRole('Apotekare', 'Admin'), async (req: Request<{ id: string }>, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) { res.status(400).json({ error: 'Invalid id' }); return; }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { lines: true },
  });

  if (!order) { res.status(404).json({ error: 'Order not found' }); return; }

  const next = NEXT_STATUS[order.status];
  if (!next) {
    res.status(409).json({ error: 'Order is already at final status (Levererad)' });
    return;
  }

  if (next === OrderStatus.Levererad) {
    // Advance status and increment stock atomically.
    // Including current status in WHERE prevents double-delivery if two requests race.
    const [result] = await prisma.$transaction([
      prisma.order.updateMany({
        where: { id, status: order.status },
        data:  { status: next, deliveredAt: new Date() },
      }),
      ...order.lines.map((line) =>
        prisma.medication.update({
          where: { id: line.medicationId },
          data:  { stockBalance: { increment: line.quantity } },
        }),
      ),
    ]);

    if (result.count === 0) {
      res.status(409).json({ error: 'Order status was already changed by another request' });
      return;
    }

    const updated = await prisma.order.findUnique({
      where: { id },
      include: {
        careUnit: { select: { id: true, name: true } },
        lines:    true,
      },
    });

    await logAction(req.user!, 'ORDER_STATUS_ADVANCED', 'Order', id, {
      from: order.status,
      to:   next,
    });

    res.json(formatOrder(updated as typeof order & { careUnit: { id: number; name: string } }));
    return;
  }

  const result = await prisma.order.updateMany({
    where: { id, status: order.status },
    data:  { status: next },
  });

  if (result.count === 0) {
    res.status(409).json({ error: 'Order status was already changed by another request' });
    return;
  }

  const updated = await prisma.order.findUnique({
    where: { id },
    include: {
      careUnit: { select: { id: true, name: true } },
      lines:    true,
    },
  });

  await logAction(req.user!, 'ORDER_STATUS_ADVANCED', 'Order', id, {
    from: order.status,
    to:   next,
  });

  res.json(formatOrder(updated as typeof order & { careUnit: { id: number; name: string } }));
});

export default router;
