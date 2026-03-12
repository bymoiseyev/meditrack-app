import { useState } from 'react';
import type { CareUnit, OrderMedication, Order, OrderLine } from '../types/order.js';

interface FormErrors {
  medication?: string;
  quantity?: string;
}

interface Props {
  careUnits: CareUnit[];
  medications: OrderMedication[];
  nextOrderId: string;
  onSave: (order: Order) => void;
}

export default function NewOrderPanel({ careUnits, medications, nextOrderId, onSave }: Props) {
  const [careUnitId, setCareUnitId] = useState('');
  const [medicationId, setMedicationId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [rows, setRows] = useState<OrderLine[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const canSave = careUnitId !== '' && rows.length > 0;

  function validateRow(): boolean {
    const e: FormErrors = {};
    if (!medicationId) e.medication = 'Välj ett läkemedel';
    const qty = Number(quantity);
    if (!quantity.trim() || isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      e.quantity = 'Ange ett heltal större än 0';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleAddRow() {
    if (!validateRow()) return;
    const med = medications.find((m) => m.id === medicationId)!;
    setRows((prev) => [
      ...prev,
      {
        medicationId: med.id,
        medicationName: med.name,
        form: med.form,
        strength: med.strength,
        quantity: Number(quantity),
      },
    ]);
    setMedicationId('');
    setQuantity('');
    setErrors({});
  }

  function handleRemoveRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSave() {
    if (!canSave) return;
    const cu = careUnits.find((c) => c.id === careUnitId)!;
    const order: Order = {
      id: nextOrderId,
      createdAt: new Date().toISOString(),
      careUnitId: cu.id,
      careUnitName: cu.name,
      status: 'Utkast',
      lines: rows,
    };
    onSave(order);
    setCareUnitId('');
    setMedicationId('');
    setQuantity('');
    setRows([]);
    setErrors({});
  }

  return (
    <div>


      <div className="flex items-center  mb-3">
        <h2 className="text-sm font-semibold text-slate-700">
          Ny order
        </h2>

      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm" id="new-order-panel">

        {/* Panel header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Ny beställning</h2>
              <p className="text-xs text-slate-400 mt-0.5">Fyll i uppgifter och lägg till läkemedelsrader</p>
            </div>
            <span className="font-mono text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
              {nextOrderId}
            </span>
          </div>
        </div>

        <div className="px-5 py-5 space-y-5">

          {/* Vårdenhet */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Vårdenhet
            </label>
            <select
              value={careUnitId}
              onChange={(e) => setCareUnitId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="">Välj vårdenhet…</option>
              {careUnits.map((cu) => (
                <option key={cu.id} value={cu.id}>{cu.name}</option>
              ))}
            </select>
          </div>

          {/* Add row section */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Lägg till rad</p>

            {/* Medication select */}
            <div>
              <select
                value={medicationId}
                onChange={(e) => setMedicationId(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 ${errors.medication ? 'border-red-400' : 'border-slate-200'
                  }`}
              >
                <option value="">Välj läkemedel…</option>
                {medications.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} · {m.strength} ({m.form})
                  </option>
                ))}
              </select>
              {errors.medication && (
                <p className="mt-1 text-xs text-red-500">{errors.medication}</p>
              )}
            </div>

            {/* Quantity + add button */}
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  placeholder="Kvantitet"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddRow(); }}
                  className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 ${errors.quantity ? 'border-red-400' : 'border-slate-200'
                    }`}
                />
                {errors.quantity && (
                  <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>
                )}
              </div>
              <button
                onClick={handleAddRow}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-600 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Lägg till rad
              </button>
            </div>
          </div>

          {/* Added rows */}
          {rows.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Tillagda rader ({rows.length})
              </p>
              {rows.map((row, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5">
                  <div className="min-w-0 mr-3">
                    <p className="text-sm font-semibold text-slate-800 truncate">{row.medicationName}</p>
                    <p className="text-xs text-slate-400">{row.form} · {row.strength}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-bold text-slate-900">{row.quantity} st</span>
                    <button
                      onClick={() => handleRemoveRow(idx)}
                      className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer p-0.5 rounded"
                      title="Ta bort"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          {!canSave && (
            <p className="text-xs text-slate-400 mb-2">
              {!careUnitId && rows.length === 0
                ? 'Välj en vårdenhet och lägg till minst en rad.'
                : !careUnitId
                  ? 'Välj en vårdenhet.'
                  : 'Lägg till minst en rad.'}
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Skapa beställning
          </button>
        </div>

      </div>
    </div>
  );
}
