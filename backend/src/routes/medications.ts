import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireRole } from '../lib/auth.js';
import { logAction } from '../lib/audit.js';
import { parseId } from '../lib/parseId.js';
import {
  getMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  medicationExists,
  deleteMedication,
  getMedicationSnapshot,
} from '../services/medicationService.js';

const router = Router();

// ─── Validation ───────────────────────────────────────────────────────────────

function validateMedicationBody(body: Record<string, unknown>): string | null {
  const { name, atcCode, form, strength, stockBalance, threshold } = body;

  if (!name     || typeof name     !== 'string' || name.trim()     === '') return 'name is required';
  if (!atcCode  || typeof atcCode  !== 'string' || atcCode.trim()  === '') return 'atcCode is required';
  if (!form     || typeof form     !== 'string' || form.trim()     === '') return 'form is required';
  if (!strength || typeof strength !== 'string' || strength.trim() === '') return 'strength is required';

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
  const medications = await getMedications(search, form);
  res.json(medications);
});

// ─── GET /medications/:id ─────────────────────────────────────────────────────

router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) { res.status(400).json({ error: 'Invalid id' }); return; }

  const medication = await getMedicationById(id);
  if (!medication) { res.status(404).json({ error: 'Medication not found' }); return; }

  res.json(medication);
});

// ─── POST /medications ────────────────────────────────────────────────────────

router.post('/', requireRole('Apotekare', 'Admin'), async (req: Request, res: Response) => {
  const error = validateMedicationBody(req.body);
  if (error) { res.status(400).json({ error }); return; }

  const { name, atcCode, form, strength, stockBalance = 0, threshold = 0 } = req.body as {
    name: string; atcCode: string; form: string; strength: string;
    stockBalance?: number; threshold?: number;
  };

  const medication = await createMedication({
    name:         name.trim(),
    atcCode:      atcCode.trim(),
    form:         form.trim(),
    strength:     strength.trim(),
    stockBalance: Number(stockBalance),
    threshold:    Number(threshold),
  });

  await logAction(req.user!, 'MEDICATION_CREATED', 'Medication', medication.id, {
    name: medication.name,
    atcCode: medication.atcCode,
  });

  res.status(201).json(medication);
});

// ─── PUT /medications/:id ─────────────────────────────────────────────────────

router.put('/:id', requireRole('Apotekare', 'Admin'), async (req: Request<{ id: string }>, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) { res.status(400).json({ error: 'Invalid id' }); return; }

  const error = validateMedicationBody(req.body);
  if (error) { res.status(400).json({ error }); return; }

  if (!(await medicationExists(id))) { res.status(404).json({ error: 'Medication not found' }); return; }

  const { name, atcCode, form, strength, stockBalance, threshold } = req.body as {
    name: string; atcCode: string; form: string; strength: string;
    stockBalance: number; threshold: number;
  };

  const medication = await updateMedication(id, {
    name:         name.trim(),
    atcCode:      atcCode.trim(),
    form:         form.trim(),
    strength:     strength.trim(),
    stockBalance: Number(stockBalance),
    threshold:    Number(threshold),
  });

  await logAction(req.user!, 'MEDICATION_UPDATED', 'Medication', id, { name: medication.name });

  res.json(medication);
});

// ─── DELETE /medications/:id ──────────────────────────────────────────────────

router.delete('/:id', requireRole('Admin'), async (req: Request<{ id: string }>, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) { res.status(400).json({ error: 'Invalid id' }); return; }

  if (!(await medicationExists(id))) { res.status(404).json({ error: 'Medication not found' }); return; }

  const snapshot = await getMedicationSnapshot(id);
  await deleteMedication(id);

  await logAction(req.user!, 'MEDICATION_DELETED', 'Medication', id, {
    name:    snapshot!.name,
    atcCode: snapshot!.atcCode,
  });

  res.status(204).send();
});

export default router;
