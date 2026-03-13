import type { Order, OrderStatus } from '../types/order.js';
import { request as sharedRequest } from './request.js';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

interface BackendOrderLine {
  medicationId: number;
  medicationName: string;
  form: string;
  strength: string;
  quantity: number;
}

interface BackendOrder {
  id: string; // already formatted as ORD-XXXX by the backend
  status: OrderStatus;
  createdAt: string;
  careUnit: { id: number; name: string };
  lines: BackendOrderLine[];
}

function map(o: BackendOrder): Order {
  return {
    id:           o.id,
    status:       o.status,
    createdAt:    o.createdAt,
    careUnitId:   String(o.careUnit.id),
    careUnitName: o.careUnit.name,
    lines: o.lines.map((l) => ({
      medicationId:   String(l.medicationId),
      medicationName: l.medicationName,
      form:           l.form,
      strength:       l.strength,
      quantity:       l.quantity,
    })),
  };
}

function request<T>(path: string, init?: RequestInit): Promise<T> {
  return sharedRequest<T>(path, init);
}

export async function getOrders(params?: { careUnitId?: string; status?: string }): Promise<Order[]> {
  const qs = new URLSearchParams();
  if (params?.careUnitId) qs.set('careUnitId', params.careUnitId);
  if (params?.status)     qs.set('status',     params.status);
  const query = qs.toString() ? `?${qs}` : '';
  const list = await request<BackendOrder[]>(`/api/orders${query}`);
  return list.map(map);
}

export async function createOrder(data: {
  careUnitId: number;
  lines: { medicationId: number; quantity: number }[];
}): Promise<Order> {
  const o = await request<BackendOrder>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return map(o);
}

export async function advanceOrderStatus(id: string): Promise<Order> {
  const numericId = id.replace(/^ORD-0*/, '');
  const o = await request<BackendOrder>(`/api/orders/${numericId}/status`, {
    method: 'PATCH',
  });
  return map(o);
}
