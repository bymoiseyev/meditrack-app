import { useState } from 'react';
import type { CareUnit, OrderMedication, OrderLine } from '../types/order.js';
import { parseOrderText } from '../api/ai.js';

interface FormErrors {
  medication?: string;
  quantity?: string;
}

export interface NewOrderPayload {
  careUnitId: string;
  lines: { medicationId: string; quantity: number }[];
}

interface Props {
  careUnits: CareUnit[];
  medications: OrderMedication[];
  onSave: (payload: NewOrderPayload) => Promise<void>;
}

export default function NewOrderPanel({ careUnits, medications, onSave }: Props) {
  const [careUnitId, setCareUnitId] = useState('');
  const [medicationId, setMedicationId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [rows, setRows] = useState<OrderLine[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiPreview, setAiPreview] = useState<{ rows: OrderLine[]; careUnitId: string | null; careUnitName: string | null } | null>(null);

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

  async function handleAiParse() {
    if (!aiText.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const { lines, careUnitId: parsedCareUnitId } = await parseOrderText(aiText);
      if (lines.length === 0) {
        setAiError('Inga läkemedel hittades. Försök med ett annat ord.');
        return;
      }
      const newRows: OrderLine[] = lines.flatMap((line) => {
        const med = medications.find((m) => m.id === String(line.medicationId));
        if (!med) return [];
        return [{
          medicationId: med.id,
          medicationName: med.name,
          form: med.form,
          strength: med.strength,
          quantity: line.quantity,
        }];
      });
      if (newRows.length === 0) {
        setAiError('Inga matchande läkemedel i registret.');
        return;
      }
      const matchedCareUnit = parsedCareUnitId
        ? careUnits.find((c) => c.id === String(parsedCareUnitId)) ?? null
        : null;
      setAiPreview({
        rows: newRows,
        careUnitId: matchedCareUnit ? String(parsedCareUnitId) : null,
        careUnitName: matchedCareUnit?.name ?? null,
      });
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Något gick fel');
    } finally {
      setAiLoading(false);
    }
  }

  function handleAiConfirm() {
    if (!aiPreview) return;
    setRows((prev) => [...prev, ...aiPreview.rows]);
    if (aiPreview.careUnitId) setCareUnitId(aiPreview.careUnitId);
    setAiPreview(null);
    setAiText('');
  }

  function handleAiCancel() {
    setAiPreview(null);
    setAiError(null);
  }

  async function handleSave() {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await onSave({
        careUnitId,
        lines: rows.map((r) => ({ medicationId: r.medicationId, quantity: r.quantity })),
      });
      setCareUnitId('');
      setMedicationId('');
      setQuantity('');
      setRows([]);
      setErrors({});
    } finally {
      setSaving(false);
    }
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
          <div>
            <h2 className="text-base font-bold text-slate-900">Ny beställning</h2>
            <p className="text-xs text-slate-400 mt-0.5">Fyll i uppgifter och lägg till läkemedelsrader</p>
          </div>
        </div>

        {/* AI input */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5 mb-2">
            <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 1L8.5 4.5H12L9.5 6.5L10.5 10L7.5 8L4.5 10L5.5 6.5L3 4.5H6.5L7.5 1Z" fill="#3b82f6"/>
              <path d="M12.5 7L13 8.5H14.5L13.5 9.5L14 11L12.5 10L11 11L11.5 9.5L10.5 8.5H12L12.5 7Z" fill="#93c5fd"/>
              <path d="M2.5 9L3 10.5H4.5L3.5 11.5L4 13L2.5 12L1 13L1.5 11.5L0.5 10.5H2L2.5 9Z" fill="#93c5fd"/>
            </svg>
            <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
              Beskriv din beställning
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="T.ex. '40 Alvedon och 20 Ipren till Akutmottagningen'"
              value={aiText}
              onChange={(e) => { setAiText(e.target.value); setAiError(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAiParse(); }}
              disabled={aiLoading}
              className="flex-1 border border-blue-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            />
            <button
              onClick={handleAiParse}
              disabled={!aiText.trim() || aiLoading}
              className="flex justify-center items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {aiLoading && (
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="white" strokeWidth="1.5" strokeDasharray="20 10" />
                </svg>
              )}
              {aiLoading ? 'Fyller i…' : 'Fyll i automatiskt'}
            </button>
          </div>
          {aiError && (
            <p className="mt-1.5 text-xs text-red-500">{aiError}</p>
          )}

          {/* AI preview */}
          {aiPreview && (
            <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-xs font-semibold text-blue-600 mb-2">Hittade följande – stämmer det?</p>

              {aiPreview.careUnitName && (
                <p className="text-xs text-blue-500 mb-2">
                  Vårdenhet: <span className="font-semibold text-blue-700">{aiPreview.careUnitName}</span>
                </p>
              )}

              <div className="space-y-1 mb-3">
                {aiPreview.rows.map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-blue-100">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{row.medicationName}</p>
                      <p className="text-xs text-slate-400">{row.form} · {row.strength}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{row.quantity} st</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAiConfirm}
                  className="flex-1 py-1.5 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors cursor-pointer"
                >
                  Lägg till
                </button>
                <button
                  onClick={handleAiCancel}
                  className="flex-1 py-1.5 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Avbryt
                </button>
              </div>
            </div>
          )}
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
            disabled={!canSave || saving}
            className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {saving ? 'Sparar…' : 'Skapa beställning'}
          </button>
        </div>

      </div>
    </div>
  );
}
