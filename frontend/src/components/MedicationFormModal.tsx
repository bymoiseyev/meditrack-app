import type { Dispatch, SetStateAction } from 'react';
import type { FormState } from '../types/medication.js';

const FORM_CHOICES = ['Tablett', 'Kapsel', 'Injektion', 'Injektionslösning', 'Oral lösning', 'Plåster', 'Inhalator'];

interface Props {
  editingId: string | null;
  form: FormState;
  errors: Partial<FormState>;
  setForm: Dispatch<SetStateAction<FormState>>;
  onClose: () => void;
  onSave: () => void;
}

export default function MedicationFormModal({ editingId, form, errors, setForm, onClose, onSave }: Props) {
  function field(
    label: string,
    key: keyof FormState,
    type: 'text' | 'number' = 'text',
    isSelect = false,
  ) {
    return (
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          {label}
        </label>
        {isSelect ? (
          <select
            value={form[key]}
            onChange={(e) => setForm((f: FormState) => ({ ...f, [key]: e.target.value }))}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 ${
              errors[key] ? 'border-red-400' : 'border-slate-200'
            }`}
          >
            <option value="">Välj form…</option>
            {FORM_CHOICES.map((fc) => (
              <option key={fc} value={fc}>{fc}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={form[key]}
            onChange={(e) => setForm((f: FormState) => ({ ...f, [key]: e.target.value }))}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 placeholder-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 ${
              errors[key] ? 'border-red-400' : 'border-slate-200'
            }`}
          />
        )}
        {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {editingId ? 'Redigera läkemedel' : 'Lägg till läkemedel'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5 space-y-4">
          {field('Namn', 'name')}
          <div className="grid grid-cols-2 gap-4">
            {field('ATC-kod', 'atcCode')}
            {field('Form', 'form', 'text', true)}
          </div>
          {field('Styrka', 'strength')}
          <div className="grid grid-cols-2 gap-4">
            {field('Lagersaldo', 'stockBalance', 'number')}
            {field('Tröskel', 'threshold', 'number')}
          </div>
          <p className="text-xs text-slate-400">
            En varning om lågt lager visas när lagersaldot understiger tröskelvärdet.
          </p>
        </div>

        {/* Modal footer */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Avbryt
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            {editingId ? 'Spara ändringar' : 'Lägg till läkemedel'}
          </button>
        </div>
      </div>
    </div>
  );
}
