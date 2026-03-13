import 'dotenv/config';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import cors from 'cors';

import medicationsRouter from './routes/medications.js';
import ordersRouter      from './routes/orders.js';
import careUnitsRouter   from './routes/careUnits.js';
import aiRouter          from './routes/ai.js';
import authRouter        from './routes/auth.js';
import { requireAuth }   from './lib/auth.js';

const app  = express();
const PORT = process.env.PORT || 4000;

// ─── Security middleware ───────────────────────────────────────────────────────

app.use(cors({
  origin:  process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// Limit request body size to prevent large-payload attacks
app.use(express.json({ limit: '16kb' }));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth',        authRouter);
app.use('/api/medications', requireAuth, medicationsRouter);
app.use('/api/orders',      requireAuth, ordersRouter);
app.use('/api/care-units',  requireAuth, careUnitsRouter);
app.use('/api/ai',          requireAuth, aiRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// Catches any unhandled promise rejections forwarded by Express 5's async routing.
// Never leaks stack traces to the client.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
