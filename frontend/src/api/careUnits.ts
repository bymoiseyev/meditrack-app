import type { CareUnit } from '../types/order.js';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function getCareUnits(): Promise<CareUnit[]> {
  const res = await fetch(`${BASE}/api/care-units`);
  if (!res.ok) throw new Error(`Failed to load care units: ${res.status}`);
  const list = await res.json() as { id: number; name: string }[];
  return list.map((cu) => ({ id: String(cu.id), name: cu.name }));
}
