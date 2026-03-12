import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(cleanup);
import NewOrderPanel from '../components/NewOrderPanel.js';
import type { CareUnit, OrderMedication } from '../types/order.js';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const careUnits: CareUnit[] = [
  { id: 'cu-1', name: 'Avdelning 1A' },
  { id: 'cu-2', name: 'Avdelning 2B' },
];

const medications: OrderMedication[] = [
  { id: 'm-1', name: 'Alvedon', atcCode: 'N02BE01', form: 'Tablett', strength: '500 mg' },
  { id: 'm-2', name: 'Morfin',  atcCode: 'N02AA01', form: 'Injektion', strength: '10 mg/ml' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderPanel(onSave = vi.fn()) {
  render(
    <NewOrderPanel
      careUnits={careUnits}
      medications={medications}
      nextOrderId="ORD-1043"
      onSave={onSave}
    />,
  );
}

// When only NewOrderPanel is rendered, comboboxes are in DOM order:
//   [0] = vårdenhet (care unit)
//   [1] = läkemedel (medication)
function getCareUnitSelect() {
  return screen.getAllByRole('combobox')[0] as HTMLSelectElement;
}
function getMedicationSelect() {
  return screen.getAllByRole('combobox')[1] as HTMLSelectElement;
}
function getSaveButton() {
  return screen.getByRole('button', { name: /skapa beställning/i }) as HTMLButtonElement;
}
function getQuantityInput() {
  return screen.getByPlaceholderText('Kvantitet') as HTMLInputElement;
}

function addRow(medicationId: string, qty: string) {
  fireEvent.change(getMedicationSelect(), { target: { value: medicationId } });
  fireEvent.change(getQuantityInput(),    { target: { value: qty } });
  fireEvent.click(screen.getByRole('button', { name: /lägg till rad/i }));
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('NewOrderPanel', () => {
  describe('save button disabled state', () => {
    it('is disabled initially when no care unit and no rows exist', () => {
      renderPanel();
      expect(getSaveButton().disabled).toBe(true);
    });

    it('remains disabled after selecting a care unit but adding no rows', () => {
      renderPanel();
      fireEvent.change(getCareUnitSelect(), { target: { value: 'cu-1' } });
      expect(getSaveButton().disabled).toBe(true);
    });

    it('becomes enabled once a care unit is selected and at least one row is added', () => {
      renderPanel();
      fireEvent.change(getCareUnitSelect(), { target: { value: 'cu-1' } });
      addRow('m-1', '10');
      expect(getSaveButton().disabled).toBe(false);
    });
  });

  describe('adding a row', () => {
    it('displays the medication name and quantity after a valid row is added', () => {
      renderPanel();
      addRow('m-1', '50');
      screen.getByText('Alvedon'); // throws if not in DOM
      screen.getByText('50 st');
    });

    it('clears the medication select and quantity input after the row is added', () => {
      renderPanel();
      addRow('m-1', '50');
      expect(getMedicationSelect().value).toBe('');
      expect(getQuantityInput().value).toBe('');
    });

    it('shows a validation error when no medication is selected', () => {
      renderPanel();
      fireEvent.change(getQuantityInput(), { target: { value: '10' } });
      fireEvent.click(screen.getByRole('button', { name: /lägg till rad/i }));
      screen.getByText('Välj ett läkemedel');
    });

    it('shows a validation error when quantity is zero', () => {
      renderPanel();
      fireEvent.change(getMedicationSelect(), { target: { value: 'm-1' } });
      fireEvent.change(getQuantityInput(), { target: { value: '0' } });
      fireEvent.click(screen.getByRole('button', { name: /lägg till rad/i }));
      screen.getByText('Ange ett heltal större än 0');
    });

    it('shows a validation error when quantity is empty', () => {
      renderPanel();
      fireEvent.change(getMedicationSelect(), { target: { value: 'm-1' } });
      fireEvent.click(screen.getByRole('button', { name: /lägg till rad/i }));
      screen.getByText('Ange ett heltal större än 0');
    });
  });

  describe('removing a row', () => {
    it('removes the row from the list when Ta bort is clicked', () => {
      renderPanel();
      addRow('m-1', '50');
      screen.getByText('Alvedon');
      fireEvent.click(screen.getByTitle('Ta bort'));
      expect(screen.queryByText('Alvedon')).toBeNull();
    });

    it('disables the save button again after the last row is removed', () => {
      renderPanel();
      fireEvent.change(getCareUnitSelect(), { target: { value: 'cu-1' } });
      addRow('m-1', '10');
      expect(getSaveButton().disabled).toBe(false);
      fireEvent.click(screen.getByTitle('Ta bort'));
      expect(getSaveButton().disabled).toBe(true);
    });
  });

  describe('saving an order', () => {
    it('calls onSave with status Utkast and the correct order shape', () => {
      const onSave = vi.fn();
      renderPanel(onSave);
      fireEvent.change(getCareUnitSelect(), { target: { value: 'cu-1' } });
      addRow('m-1', '100');
      fireEvent.click(getSaveButton());

      expect(onSave).toHaveBeenCalledOnce();
      const order = onSave.mock.calls[0][0];
      expect(order.id).toBe('ORD-1043');
      expect(order.status).toBe('Utkast');
      expect(order.careUnitId).toBe('cu-1');
      expect(order.lines).toHaveLength(1);
      expect(order.lines[0].quantity).toBe(100);
    });

    it('resets the form after saving', () => {
      const onSave = vi.fn();
      renderPanel(onSave);
      fireEvent.change(getCareUnitSelect(), { target: { value: 'cu-1' } });
      addRow('m-1', '100');
      fireEvent.click(getSaveButton());

      expect(getCareUnitSelect().value).toBe('');
      expect(screen.queryByText('Alvedon')).toBeNull();
    });
  });
});
