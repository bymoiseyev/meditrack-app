import 'dotenv/config';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@prisma/client';

function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not set');
  return s;
}

export interface JwtPayload {
  userId: number;
  role: UserRole;
  name: string;
}

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Autentisering krävs' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, getSecret()) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Ogiltig eller utgången session' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Du har inte behörighet att utföra denna åtgärd' });
      return;
    }
    next();
  };
}
// 7-day expiry is jsut for this demo, in production would use maybe 1–2 hours with a refresh token
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}
