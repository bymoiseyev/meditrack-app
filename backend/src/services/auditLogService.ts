import prisma from '../lib/prisma.js';

const ACTION_LABEL: Record<string, string> = {
  ORDER_CREATED:         'Order skapad',
  ORDER_STATUS_ADVANCED: 'Orderstatus uppdaterad',
  MEDICATION_CREATED:    'Läkemedel tillagt',
  MEDICATION_UPDATED:    'Läkemedel uppdaterat',
  MEDICATION_DELETED:    'Läkemedel borttaget',
};

export async function getAuditLogs() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return logs.map((log) => ({
    ...log,
    actionLabel: ACTION_LABEL[log.action] ?? log.action,
  }));
}
