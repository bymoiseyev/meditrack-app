import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseId(raw: string): number | null {
  const n = parseInt(raw, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function validateMedicationBody(body: Record<string, unknown>): string | null {
  const { name, atcCode, form, strength, stockBalance, threshold } = body;

  if (!name       || typeof name       !== 'string' || name.trim()       === '') return 'name is required';
  if (!atcCode    || typeof atcCode    !== 'string' || atcCode.trim()    === '') return 'atcCode is required';
  if (!form       || typeof form       !== 'string' || form.trim()       === '') return 'form is required';
  if (!strength   || typeof strength   !== 'string' || strength.trim()   === '') return 'strength is required';

  if (stockBalance !== undefined) {
    const sb = Number(stockBalance);
    if (!Number.isInteger(sb) || sb < 0) return 'stockBalance must be a non-negative integer';
  }
  if (threshold !== undefined) {
    const th = Number(threshold);
    if (!Number.isInteger(th) || th < 0) return 'threshold must be a non-negative integer';
  }

  return null;
}

// ─── GET /medications ─────────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
  const form   = typeof req.query.form   === 'string' ? req.query.form.trim()   : undefined;

  const medications = await prisma.medication.findMany({
    where: {
      ...(search && {
        OR: [
          { name:    { contains: search, mode: 'insensitive' } },
          { atcCode: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(form && { form: { equals: form, mode: 'insensitive' } }),
    },
    orderBy: { name: 'asc' },
  });

  res.json(medications);
});

// ─── GET /medications/:id ─────────────────────────────────────────────────────

router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) { res.status(400).json({ error: 'Invalid id' }); return; }

  const medication = await prisma.medication.findUnique({ where: { id } });
  if (!medication) { res.status(404).json({ error: 'Medication not found' }); return; }

  res.json(medication);
});

// ─── POST /medications ────────────────────────────────────────────────────────

router.post('/', async (req: Request, res: Response) => {
  const error = validateMedicationBody(req.body);
  if (error) { res.status(400).json({ error }); return; }

  const { name, atcCode, form, strength, stockBalance = 0, threshold = 0 } = req.body as {
    name: string; atcCode: string; form: string; strength: string;
    stockBalance?: number; threshold?: number;
  };

  const medication = await prisma.medication.create({
    data: {
      name:         name.trim(),
      atcCode:      atcCode.trim(),
      form:         form.trim(),
      strength:     strength.trim(),
      stockBalance: Number(stockBalance),
      threshold:    Number(threshold),
    },
  });

  res.status(201).json(medication);
});

// ─── PUT /medications/:id ─────────────────────────────────────────────────────

router.put('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) { res.status(400).json({ error: 'Invalid id' }); return; }

  const error = validateMedicationBody(req.body);
  if (error) { res.status(400).json({ error }); return; }

  const exists = await prisma.medication.findUnique({ where: { id }, select: { id: true } });
  if (!exists) { res.status(404).json({ error: 'Medication not found' }); return; }

  const { name, atcCode, form, strength, stockBalance, threshold } = req.body as {
    name: string; atcCode: string; form: string; strength: string;
    stockBalance: number; threshold: number;
  };

  const medication = await prisma.medication.update({
    where: { id },
    data: {
      name:         name.trim(),
      atcCode:      atcCode.trim(),
      form:         form.trim(),
      strength:     strength.trim(),
      stockBalance: Number(stockBalance),
      threshold:    Number(threshold),
    },
  });

  res.json(medication);
});

// ─── DELETE /medications/:id ──────────────────────────────────────────────────

router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) { res.status(400).json({ error: 'Invalid id' }); return; }

  const exists = await prisma.medication.findUnique({ where: { id }, select: { id: true } });
  if (!exists) { res.status(404).json({ error: 'Medication not found' }); return; }

  const orderLineCount = await prisma.orderLine.count({ where: { medicationId: id } });
  if (orderLineCount > 0) {
    res.status(409).json({ error: 'Läkemedlet kan inte tas bort eftersom det finns beställningar kopplade till det.' });
    return;
  }

  await prisma.medication.delete({ where: { id } });
  res.status(204).send();
});

export default router;
