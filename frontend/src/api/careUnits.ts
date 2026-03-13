import type { CareUnit } from '../types/order.js';
import { request } from './request.js';

export async function getCareUnits(): Promise<CareUnit[]> {
  const list = await request<{ id: number; name: string }[]>('/api/care-units');
  return list.map((cu) => ({ id: String(cu.id), name: cu.name }));
}
