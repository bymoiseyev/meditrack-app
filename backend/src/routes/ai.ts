import { Router } from 'express';
import type { Request, Response } from 'express';
import { openai, parseOrderText } from '../services/aiService.js';

const router = Router();

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

  try {
    const result = await parseOrderText(text);
    res.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'invalid_json')      { res.status(500).json({ error: 'AI returned invalid JSON' }); return; }
    if (msg === 'unexpected_shape')  { res.status(500).json({ error: 'Unexpected AI response shape' }); return; }
    res.status(500).json({ error: 'Något gick fel' });
  }
});

export default router;
