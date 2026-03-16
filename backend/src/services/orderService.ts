import { OrderStatus } from '@prisma/client';
import prisma from '../lib/prisma.js';

export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  Utkast:    OrderStatus.Skickad,
  Skickad:   OrderStatus.Bekräftad,
  Bekräftad: OrderStatus.Levererad,
};

export function formatOrderId(id: number): string {
  return `ORD-${String(id).padStart(4, '0')}`;
}

export function formatOrder(order: { id: number; [key: string]: unknown }) {
  return { ...order, id: formatOrderId(order.id) };
}

const ORDER_INCLUDE = {
  careUnit: { select: { id: true, name: true } },
  lines:    true,
} as const;

export async function getOrders(careUnitId?: number, status?: OrderStatus) {
  const orders = await prisma.order.findMany({
    where: {
      ...(careUnitId && { careUnitId }),
      ...(status     && { status }),
    },
    include: ORDER_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
  return orders.map(formatOrder);
}

export async function getOrderById(id: number) {
  const order = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
  return order ? formatOrder(order) : null;
}

export async function careUnitExists(id: number): Promise<boolean> {
  const result = await prisma.careUnit.findUnique({ where: { id }, select: { id: true } });
  return result !== null;
}

export async function getMedicationsForLines(medicationIds: number[]) {
  return prisma.medication.findMany({
    where: { id: { in: medicationIds } },
    select: { id: true, name: true, form: true, strength: true },
  });
}

export async function createOrder(
  careUnitId: number,
  lines: { medicationId: number; quantity: number }[],
  medMap: Map<number, { id: number; name: string; form: string; strength: string }>,
) {
  const order = await prisma.order.create({
    data: {
      careUnitId,
      lines: {
        create: lines.map((l) => {
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
    include: ORDER_INCLUDE,
  });
  return formatOrder(order);
}

export async function advanceOrderStatus(id: number) {
  const order = await prisma.order.findUnique({ where: { id }, include: { lines: true } });
  if (!order) return { error: 'Order not found' as const };

  const next = NEXT_STATUS[order.status];
  if (!next) return { error: 'already_final' as const };

  if (next === OrderStatus.Levererad) {
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

    if (result.count === 0) return { error: 'conflict' as const };

    const updated = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    return { order: formatOrder(updated!), from: order.status, to: next };
  }

   // Only update if the status hasn't changed since we read it.
  // If another request advanced it first, count will be 0 and we return a 409.
  const result = await prisma.order.updateMany({
    where: { id, status: order.status },
    data:  { status: next },
  });

  if (result.count === 0) return { error: 'conflict' as const };

  const updated = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
  return { order: formatOrder(updated!), from: order.status, to: next };
}
