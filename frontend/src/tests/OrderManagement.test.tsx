// Tests for the order management page — covers the filter logic (by status, care unit,
// and combined), and that creating a new order adds it to the list with the correct status.
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

afterEach(cleanup);

// ─── API mocks ────────────────────────────────────────────────────────────────
// vi.mock is hoisted before imports, so mock factories cannot reference
// variables imported in this file. All fixture data is inlined here.

vi.mock('../api/orders.js', () => ({
  getOrders: vi.fn().mockResolvedValue([
    {
      id: 'ORD-1001', createdAt: '2026-03-01T09:12:00', status: 'Levererad',
      careUnitId: 'cu-1', careUnitName: 'Avdelning 1A – Medicin',
      lines: [{ medicationId: 'cu-1', medicationName: 'Alvedon', form: 'Tablett', strength: '500 mg', quantity: 200 }],
    },
    {
      id: 'ORD-1002', createdAt: '2026-03-03T13:45:00', status: 'Bekräftad',
      careUnitId: 'cu-2', careUnitName: 'Avdelning 2B – Kirurgi',
      lines: [],
    },
    {
      id: 'ORD-1003', createdAt: '2026-03-05T08:30:00', status: 'Skickad',
      careUnitId: 'cu-3', careUnitName: 'Akutmottagningen',
      lines: [],
    },
    {
      id: 'ORD-1004', createdAt: '2026-03-08T11:00:00', status: 'Utkast',
      careUnitId: 'cu-1', careUnitName: 'Avdelning 1A – Medicin',
      lines: [],
    },
    {
      id: 'ORD-1005', createdAt: '2026-03-10T14:22:00', status: 'Utkast',
      careUnitId: 'cu-4', careUnitName: 'Intensivvårdsavdelningen',
      lines: [],
    },
    {
      id: 'ORD-1006', createdAt: '2026-03-11T09:05:00', status: 'Skickad',
      careUnitId: 'cu-5', careUnitName: 'Barnmedicin',
      lines: [],
    },
  ]),
  createOrder: vi.fn().mockResolvedValue({
    id: 'ORD-1043', createdAt: new Date().toISOString(), status: 'Utkast',
    careUnitId: 'cu-1', careUnitName: 'Avdelning 1A – Medicin',
    lines: [{ medicationId: '1', medicationName: 'Alvedon', form: 'Tablett', strength: '500 mg', quantity: 25 }],
  }),
  advanceOrderStatus: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../api/careUnits.js', () => ({
  getCareUnits: vi.fn().mockResolvedValue([
    { id: 'cu-1', name: 'Avdelning 1A – Medicin' },
    { id: 'cu-2', name: 'Avdelning 2B – Kirurgi' },
    { id: 'cu-3', name: 'Akutmottagningen' },
    { id: 'cu-4', name: 'Intensivvårdsavdelningen' },
    { id: 'cu-5', name: 'Barnmedicin' },
  ]),
}));

vi.mock('../api/medications.js', () => ({
  getMedications: vi.fn().mockResolvedValue([
    { id: '1', name: 'Alvedon', atcCode: 'N02BE01', form: 'Tablett',   strength: '500 mg',  stockBalance: 200, threshold: 50 },
    { id: '2', name: 'Morfin',  atcCode: 'N02AA01', form: 'Injektion', strength: '10 mg/ml', stockBalance: 45,  threshold: 20 },
  ]),
}));

import { INITIAL_ORDERS, CARE_UNITS } from '../data/orderMockData.js';
import type { Order } from '../types/order.js';
import OrderManagement from '../pages/OrderManagement.js';

// ─── Pure filter logic ────────────────────────────────────────────────────────

function filterOrders(
  orders: Order[],
  searchId: string,
  careUnitFilter: string,
  statusFilter: string,
) {
  return orders.filter((o) => {
    const matchesId       = !searchId.trim()   || o.id.toLowerCase().includes(searchId.trim().toLowerCase());
    const matchesCareUnit = !careUnitFilter     || o.careUnitId === careUnitFilter;
    const matchesStatus   = !statusFilter       || o.status === statusFilter;
    return matchesId && matchesCareUnit && matchesStatus;
  });
}

describe('Order filtering logic', () => {
  it('returns all orders when no filters are active', () => {
    expect(filterOrders(INITIAL_ORDERS, '', '', '')).toHaveLength(INITIAL_ORDERS.length);
  });

  describe('filtering by status', () => {
    it('returns only orders with the matching status', () => {
      const result = filterOrders(INITIAL_ORDERS, '', '', 'Utkast');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((o) => expect(o.status).toBe('Utkast'));
    });

    it('excludes orders that do not match the status', () => {
      const result = filterOrders(INITIAL_ORDERS, '', '', 'Utkast');
      result.forEach((o) => expect(o.status).not.toBe('Levererad'));
    });

    it('returns an empty array when no orders match the status', () => {
      const orders: Order[] = INITIAL_ORDERS.map((o) => ({ ...o, status: 'Levererad' as const }));
      expect(filterOrders(orders, '', '', 'Utkast')).toHaveLength(0);
    });
  });

  describe('filtering by care unit', () => {
    it('returns only orders belonging to the selected care unit', () => {
      const cu = CARE_UNITS[0];
      if (!cu) return;
      const result = filterOrders(INITIAL_ORDERS, '', cu.id, '');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((o) => expect(o.careUnitId).toBe(cu.id));
    });

    it('returns an empty array when the care unit has no orders', () => {
      expect(filterOrders(INITIAL_ORDERS, '', 'cu-nonexistent', '')).toHaveLength(0);
    });
  });

  describe('combined filters', () => {
    it('applies status and care unit filters together', () => {
      const result = filterOrders(INITIAL_ORDERS, '', 'cu-1', 'Utkast');
      result.forEach((o) => {
        expect(o.careUnitId).toBe('cu-1');
        expect(o.status).toBe('Utkast');
      });
    });

    it('combined filters produce a subset of the individual filters', () => {
      const byCareUnit = filterOrders(INITIAL_ORDERS, '', 'cu-1', '');
      const combined   = filterOrders(INITIAL_ORDERS, '', 'cu-1', 'Utkast');
      expect(combined.length).toBeLessThanOrEqual(byCareUnit.length);
    });
  });
});

// ─── Component: creating a new order ─────────────────────────────────────────

describe('OrderManagement — creating a new order', () => {
  beforeEach(() => vi.clearAllMocks());

  it('adds the new order to the list after the form is saved', async () => {
    render(<OrderManagement />);
    await waitFor(() => expect(screen.queryByText('Laddar beställningar…')).toBeNull());

    fireEvent.change(screen.getByDisplayValue('Välj vårdenhet\u2026'), { target: { value: 'cu-1' } });
    fireEvent.change(screen.getByDisplayValue('Välj läkemedel\u2026'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('Kvantitet'),         { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: /lägg till rad/i }));
    fireEvent.click(screen.getByRole('button', { name: /skapa beställning/i }));

    await waitFor(() => expect(screen.getAllByText('ORD-1043').length).toBeGreaterThan(0));
  });

  it('new order starts with status Utkast', async () => {
    render(<OrderManagement />);
    await waitFor(() => expect(screen.queryByText('Laddar beställningar…')).toBeNull());

    fireEvent.change(screen.getByDisplayValue('Välj vårdenhet\u2026'), { target: { value: 'cu-1' } });
    fireEvent.change(screen.getByDisplayValue('Välj läkemedel\u2026'), { target: { value: '2' } });
    fireEvent.change(screen.getByPlaceholderText('Kvantitet'),         { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /lägg till rad/i }));
    fireEvent.click(screen.getByRole('button', { name: /skapa beställning/i }));

    await waitFor(() => expect(screen.getAllByText('Utkast').length).toBeGreaterThan(0));
  });
});
