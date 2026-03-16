import prisma from '../lib/prisma.js';

export async function getMedications(search?: string, form?: string) {
  return prisma.medication.findMany({
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
}

export async function getMedicationById(id: number) {
  return prisma.medication.findUnique({ where: { id } });
}

export async function createMedication(data: {
  name: string; atcCode: string; form: string; strength: string;
  stockBalance: number; threshold: number;
}) {
  return prisma.medication.create({ data });
}

export async function updateMedication(id: number, data: {
  name: string; atcCode: string; form: string; strength: string;
  stockBalance: number; threshold: number;
}) {
  return prisma.medication.update({ where: { id }, data });
}

export async function medicationExists(id: number): Promise<boolean> {
  const result = await prisma.medication.findUnique({ where: { id }, select: { id: true } });
  return result !== null;
}

export async function medicationHasOrders(id: number): Promise<boolean> {
  const count = await prisma.orderLine.count({ where: { medicationId: id } });
  return count > 0;
}

export async function deleteMedication(id: number) {
  return prisma.medication.delete({ where: { id } });
}

export async function getMedicationSnapshot(id: number) {
  return prisma.medication.findUnique({ where: { id }, select: { name: true, atcCode: true } });
}
