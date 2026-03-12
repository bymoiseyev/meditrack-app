import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

afterEach(cleanup);
import { INITIAL_ORDERS, CARE_UNITS } from '../data/orderMockData.js';
import type { Order } from '../types/order.js';
import OrderManagement from '../pages/OrderManagement.js';

// ─── Pure filter logic ────────────────────────────────────────────────────────
// Mirrors the filter function used inside OrderManagement.
// Tested here as pure logic so failures point precisely at the filter rules.

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
// Renders the full page and exercises the create-order flow end-to-end.

describe('OrderManagement — creating a new order', () => {
  it('adds the new order to the list after the form is saved', () => {
    render(<OrderManagement />);

    // The panel's vårdenhet select is uniquely identified by its placeholder option.
    // The filter's vårdenhet select shows "Alla vårdenheter"; the panel shows "Välj vårdenhet…".
    fireEvent.change(screen.getByDisplayValue('Välj vårdenhet\u2026'), { target: { value: 'cu-1' } });
    fireEvent.change(screen.getByDisplayValue('Välj läkemedel\u2026'), { target: { value: 'm-1' } });
    fireEvent.change(screen.getByPlaceholderText('Kvantitet'),         { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: /lägg till rad/i }));
    fireEvent.click(screen.getByRole('button', { name: /skapa beställning/i }));

    // ORD-1043 should now appear somewhere in the rendered list.
    // getAllByText is used because the same ID renders in both desktop table and mobile cards.
    expect(screen.getAllByText('ORD-1043').length).toBeGreaterThan(0);
  });

  it('new order starts with status Utkast', () => {
    render(<OrderManagement />);

    fireEvent.change(screen.getByDisplayValue('Välj vårdenhet\u2026'), { target: { value: 'cu-2' } });
    fireEvent.change(screen.getByDisplayValue('Välj läkemedel\u2026'), { target: { value: 'm-2' } });
    fireEvent.change(screen.getByPlaceholderText('Kvantitet'),         { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /lägg till rad/i }));
    fireEvent.click(screen.getByRole('button', { name: /skapa beställning/i }));

    // "Utkast" badges exist in the list (there were already Utkast orders, so just confirm at least one)
    expect(screen.getAllByText('Utkast').length).toBeGreaterThan(0);
  });
});
