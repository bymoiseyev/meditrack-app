import prisma from '../lib/prisma.js';

export async function getAllCareUnits() {
  return prisma.careUnit.findMany({ orderBy: { name: 'asc' } });
}
