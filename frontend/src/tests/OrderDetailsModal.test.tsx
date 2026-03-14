import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

// Mock AuthContext — tests don't run inside AuthProvider
vi.mock('../context/AuthContext.js', () => ({
  useAuth: () => ({ user: { id: 1, name: 'Test User', email: 'test@test.com', role: 'Apotekare' } }),
}));

afterEach(cleanup);
import OrderDetailsModal from '../components/OrderDetailsModal.js';
import type { Order, OrderStatus } from '../types/order.js';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const baseOrder: Order = {
  id: 'ORD-TEST',
  createdAt: '2026-03-01T09:00:00',
  careUnitId: 'cu-1',
  careUnitName: 'Avdelning 1A',
  status: 'Utkast',
  lines: [
    { medicationId: 'm-1', medicationName: 'Alvedon', form: 'Tablett', strength: '500 mg', quantity: 100 },
  ],
};

function orderWithStatus(status: OrderStatus): Order {
  return { ...baseOrder, status };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('OrderDetailsModal', () => {
  describe('status transitions — advance button label', () => {
    it('shows "Skicka beställning" when status is Utkast', () => {
      render(<OrderDetailsModal order={orderWithStatus('Utkast')} onClose={vi.fn()} onAdvanceStatus={vi.fn().mockResolvedValue(undefined)} />);
      screen.getByRole('button', { name: /skicka beställning/i });
    });

    it('shows "Bekräfta beställning" when status is Skickad', () => {
      render(<OrderDetailsModal order={orderWithStatus('Skickad')} onClose={vi.fn()} onAdvanceStatus={vi.fn().mockResolvedValue(undefined)} />);
      screen.getByRole('button', { name: /bekräfta beställning/i });
    });

    it('shows "Markera som levererad" when status is Bekräftad', () => {
      render(<OrderDetailsModal order={orderWithStatus('Bekräftad')} onClose={vi.fn()} onAdvanceStatus={vi.fn().mockResolvedValue(undefined)} />);
      screen.getByRole('button', { name: /markera som levererad/i });
    });
  });

  describe('Levererad — terminal status', () => {
    it('does not show an advance button when status is Levererad', () => {
      render(<OrderDetailsModal order={orderWithStatus('Levererad')} onClose={vi.fn()} onAdvanceStatus={vi.fn().mockResolvedValue(undefined)} />);
      expect(screen.queryByRole('button', { name: /skicka beställning/i })).toBeNull();
      expect(screen.queryByRole('button', { name: /bekräfta beställning/i })).toBeNull();
      expect(screen.queryByRole('button', { name: /markera som levererad/i })).toBeNull();
    });

    it('still shows the close button when status is Levererad', () => {
      render(<OrderDetailsModal order={orderWithStatus('Levererad')} onClose={vi.fn()} onAdvanceStatus={vi.fn().mockResolvedValue(undefined)} />);
      screen.getByRole('button', { name: /stäng/i });
    });
  });

  describe('advancing status', () => {
    it('calls onAdvanceStatus with the correct orderId', async () => {
      const onAdvanceStatus = vi.fn().mockResolvedValue(undefined);
      render(<OrderDetailsModal order={orderWithStatus('Utkast')} onClose={vi.fn()} onAdvanceStatus={onAdvanceStatus} />);
      fireEvent.click(screen.getByRole('button', { name: /skicka beställning/i }));
      await waitFor(() => expect(onAdvanceStatus).toHaveBeenCalledWith('ORD-TEST'));
    });

    it('does not close the modal after advancing the status', async () => {
      const onClose = vi.fn();
      const onAdvanceStatus = vi.fn().mockResolvedValue(undefined);
      render(<OrderDetailsModal order={orderWithStatus('Utkast')} onClose={onClose} onAdvanceStatus={onAdvanceStatus} />);
      fireEvent.click(screen.getByRole('button', { name: /skicka beställning/i }));
      await waitFor(() => expect(onAdvanceStatus).toHaveBeenCalled());
      expect(onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when the Stäng button is clicked without advancing', () => {
      const onClose = vi.fn();
      const onAdvanceStatus = vi.fn().mockResolvedValue(undefined);
      render(<OrderDetailsModal order={orderWithStatus('Utkast')} onClose={onClose} onAdvanceStatus={onAdvanceStatus} />);
      fireEvent.click(screen.getByRole('button', { name: /stäng/i }));
      expect(onClose).toHaveBeenCalledOnce();
      expect(onAdvanceStatus).not.toHaveBeenCalled();
    });
  });

  describe('order content', () => {
    it('displays the order ID and care unit name', () => {
      render(<OrderDetailsModal order={baseOrder} onClose={vi.fn()} onAdvanceStatus={vi.fn().mockResolvedValue(undefined)} />);
      screen.getByText('ORD-TEST');
      screen.getByText('Avdelning 1A');
    });

    it('displays all order line items with name and quantity', () => {
      render(<OrderDetailsModal order={baseOrder} onClose={vi.fn()} onAdvanceStatus={vi.fn().mockResolvedValue(undefined)} />);
      screen.getByText('Alvedon');
      screen.getByText('100');
    });
  });
});
