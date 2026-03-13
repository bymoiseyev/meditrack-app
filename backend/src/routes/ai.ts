import { Router } from 'express';
import type { Request, Response } from 'express';
import OpenAI from 'openai';
import prisma from '../lib/prisma.js';

const router = Router();

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey && apiKey !== 'your-openai-api-key-here'
  ? new OpenAI({ apiKey })
  : null;

// ─── POST /ai/parse-order ─────────────────────────────────────────────────────
// Accepts free-form Swedish text from a nurse, matches it against the medication
// database, and returns structured order lines ready to pre-fill the order form.

router.post('/parse-order', async (req: Request, res: Response) => {
  const { text } = req.body as { text?: unknown };

  if (!openai) {
    res.status(503).json({ error: 'AI-funktionen är inte konfigurerad. Kontakta administratören.' });
    return;
  }

  if (!text || typeof text !== 'string' || !text.trim()) {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  const [medications, careUnits] = await Promise.all([
    prisma.medication.findMany({ select: { id: true, name: true, form: true, strength: true } }),
    prisma.careUnit.findMany({ select: { id: true, name: true } }),
  ]);

  const medicationList = medications
    .map((m) => `ID ${m.id}: ${m.name} (${m.form}, ${m.strength})`)
    .join('\n');

  const careUnitList = careUnits
    .map((c) => `ID ${c.id}: ${c.name}`)
    .join('\n');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Du är en assistent för läkemedelsbeställningar på en vårdenhet i Sverige.
Din uppgift är att tolka fritext från en sjuksköterska och matcha mot tillgängliga läkemedel och vårdenheter.
Returnera ett JSON-objekt med:
- "lines": array där varje objekt har medicationId (number), name (string), quantity (number)
- "careUnitId": number om en vårdenhet nämns, annars null

Matcha bara mot läkemedel och vårdenheter som finns i listorna nedan. Om antal inte anges, använd 1.
Om inget läkemedel matchar, returnera { "lines": [], "careUnitId": null }.

Tillgängliga läkemedel:
${medicationList}

Tillgängliga vårdenheter:
${careUnitList}`,
      },
      {
        role: 'user',
        content: text.trim(),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '{"lines":[],"careUnitId":null}';

  let parsed: { lines: { medicationId: number; name: string; quantity: number }[]; careUnitId: number | null };
  try {
    parsed = JSON.parse(raw) as typeof parsed;
  } catch {
    res.status(500).json({ error: 'AI returned invalid JSON' });
    return;
  }

  if (!Array.isArray(parsed.lines)) {
    res.status(500).json({ error: 'Unexpected AI response shape' });
    return;
  }

  res.json({ lines: parsed.lines, careUnitId: parsed.careUnitId ?? null });
});

export default router;
