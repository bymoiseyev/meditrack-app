import prisma from './prisma.js';
import type { JwtPayload } from './auth.js';

export async function logAction(
  user: JwtPayload,
  action: string,
  entity: string,
  entityId: number,
  details?: Record<string, unknown>,
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId:   user.userId,
        userName: user.name,
        userRole: user.role,
        action,
        entity,
        entityId,
        details:  (details ?? {}) as object,
      },
    });
  } catch (err) {
    // Logging failure should never surface to the user
    console.error('Audit log failed:', err);
  }
}
