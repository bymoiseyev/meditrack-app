import type { Medication } from '../types/medication.js';
import { request } from './request.js';

interface BackendMedication {
  id: number;
  name: string;
  atcCode: string;
  form: string;
  strength: string;
  stockBalance: number;
  threshold: number;
}

function map(m: BackendMedication): Medication {
  return { ...m, id: String(m.id) };
}

export async function getMedications(params?: { search?: string; form?: string }): Promise<Medication[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.form)   qs.set('form',   params.form);
  const query = qs.toString() ? `?${qs}` : '';
  const list = await request<BackendMedication[]>(`/api/medications${query}`);
  return list.map(map);
}

export async function createMedication(data: Omit<Medication, 'id'>): Promise<Medication> {
  const m = await request<BackendMedication>('/api/medications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return map(m);
}

export async function updateMedication(id: string, data: Omit<Medication, 'id'>): Promise<Medication> {
  const m = await request<BackendMedication>(`/api/medications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return map(m);
}

export async function deleteMedication(id: string): Promise<void> {
  await request(`/api/medications/${id}`, { method: 'DELETE' });
}
