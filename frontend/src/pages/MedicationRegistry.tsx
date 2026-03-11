import { useState } from 'react';

interface Medication {
  id: string;
  name: string;
  atcCode: string;
  form: string;
  strength: string;
  stockBalance: number;
  threshold: number;
}

const INITIAL_MEDICATIONS: Medication[] = [
  { id: '1', name: 'Paracetamol', atcCode: 'N02BE01', form: 'Tablet', strength: '500 mg', stockBalance: 24, threshold: 30 },
  { id: '2', name: 'Insulin Aspart', atcCode: 'A10AB05', form: 'Injection solution', strength: '100 E/ml', stockBalance: 62, threshold: 20 },
  { id: '3', name: 'Morphine', atcCode: 'N02AA01', form: 'Injection', strength: '10 mg/ml', stockBalance: 12, threshold: 15 },
  { id: '4', name: 'Amoxicillin', atcCode: 'J01CA04', form: 'Capsule', strength: '500 mg', stockBalance: 118, threshold: 40 },
  { id: '5', name: 'Furosemide', atcCode: 'C03CA01', form: 'Tablet', strength: '40 mg', stockBalance: 39, threshold: 25 },
  { id: '6', name: 'Metformin', atcCode: 'A10BA02', form: 'Tablet', strength: '500 mg', stockBalance: 8, threshold: 50 },
  { id: '7', name: 'Warfarin', atcCode: 'B01AA03', form: 'Tablet', strength: '5 mg', stockBalance: 55, threshold: 20 },
];

const FORM_CHOICES = ['Tablet', 'Capsule', 'Injection', 'Injection solution', 'Oral solution', 'Patch', 'Inhaler'];

interface FormState {
  name: string;
  atcCode: string;
  form: string;
  strength: string;
  stockBalance: string;
  threshold: string;
}

const emptyForm: FormState = {
  name: '',
  atcCode: '',
  form: '',
  strength: '',
  stockBalance: '',
  threshold: '',
};

export default function MedicationRegistry() {
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [search, setSearch] = useState('');
  const [formFilter, setFormFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const uniqueForms = Array.from(new Set(medications.map((m) => m.form))).sort();

  const filtered = medications.filter((med) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      med.name.toLowerCase().includes(q) ||
      med.atcCode.toLowerCase().includes(q) ||
      med.form.toLowerCase().includes(q);
    const matchesForm = !formFilter || med.form === formFilter;
    return matchesSearch && matchesForm;
  });

  function openAdd() {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(med: Medication) {
    setForm({
      name: med.name,
      atcCode: med.atcCode,
      form: med.form,
      strength: med.strength,
      stockBalance: String(med.stockBalance),
      threshold: String(med.threshold),
    });
    setErrors({});
    setEditingId(med.id);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  }

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.atcCode.trim()) e.atcCode = 'Required';
    if (!form.form.trim()) e.form = 'Required';
    if (!form.strength.trim()) e.strength = 'Required';
    if (form.stockBalance === '' || isNaN(Number(form.stockBalance))) e.stockBalance = 'Must be a number';
    if (form.threshold === '' || isNaN(Number(form.threshold))) e.threshold = 'Must be a number';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const med: Medication = {
      id: editingId ?? String(Date.now()),
      name: form.name.trim(),
      atcCode: form.atcCode.trim().toUpperCase(),
      form: form.form.trim(),
      strength: form.strength.trim(),
      stockBalance: Number(form.stockBalance),
      threshold: Number(form.threshold),
    };
    if (editingId) {
      setMedications((prev) => prev.map((m) => (m.id === editingId ? med : m)));
    } else {
      setMedications((prev) => [...prev, med]);
    }
    closeModal();
  }

  function handleDelete(id: string) {
    setMedications((prev) => prev.filter((m) => m.id !== id));
    setDeleteConfirmId(null);
  }

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
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 ${
              errors[key] ? 'border-red-400' : 'border-slate-200'
            }`}
          >
            <option value="">Select form…</option>
            {FORM_CHOICES.map((fc) => (
              <option key={fc} value={fc}>{fc}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 placeholder-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 ${
              errors[key] ? 'border-red-400' : 'border-slate-200'
            }`}
          />
        )}
        {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
      </div>
    );
  }

  const isLow = (med: Medication) => med.stockBalance < med.threshold;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs text-slate-500 font-medium mb-3">
              <span>MediTrack</span>
              <span className="text-slate-300">•</span>
              <span>Medication Registry</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 leading-tight">Medications</h1>
            <p className="mt-1 text-sm text-slate-500 max-w-lg">
              A clear overview of name, ATC code, form, strength, and current stock balance. Designed to be fast to scan in stressful situations.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add medication
          </button>
        </div>

        {/* Search & filter card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-5 py-4 mb-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Search medication
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  width="15" height="15" viewBox="0 0 15 15" fill="none"
                >
                  <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, ATC code, or form…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </div>
            <div className="w-52">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Form
              </label>
              <select
                value={formFilter}
                onChange={(e) => setFormFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="">All forms</option>
                {uniqueForms.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            {(search || formFilter) && (
              <button
                onClick={() => { setSearch(''); setFormFilter(''); }}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.2fr_0.8fr_auto] items-center gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Medication</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">ATC Code</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Form</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Strength</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock balance</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide pr-2">Actions</span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-400 text-sm">
              No medications match your search.
            </div>
          ) : (
            filtered.map((med, i) => {
              const low = isLow(med);
              return (
                <div
                  key={med.id}
                  className={`grid grid-cols-[2fr_1fr_1fr_1fr_1.2fr_0.8fr_auto] items-center gap-4 px-6 py-4 ${
                    i < filtered.length - 1 ? 'border-b border-slate-100' : ''
                  } hover:bg-slate-50/60 transition-colors`}
                >
                  {/* Name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`flex-shrink-0 w-2 h-2 rounded-full ${low ? 'bg-red-500' : 'bg-emerald-500'}`}
                    />
                    <span className="font-semibold text-slate-800 truncate">{med.name}</span>
                  </div>

                  {/* ATC code */}
                  <div>
                    <span className="inline-block bg-slate-100 text-slate-600 font-mono text-xs px-2 py-0.5 rounded-md">
                      {med.atcCode}
                    </span>
                  </div>

                  {/* Form */}
                  <div>
                    <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-md font-medium">
                      {med.form}
                    </span>
                  </div>

                  {/* Strength */}
                  <span className="text-sm text-slate-700">{med.strength}</span>

                  {/* Stock balance */}
                  <div>
                    <span className={`text-sm font-semibold ${low ? 'text-red-600' : 'text-slate-800'}`}>
                      {med.stockBalance} units
                    </span>
                    <div className="text-xs text-slate-400 mt-0.5">Min. {med.threshold} units</div>
                  </div>

                  {/* Status */}
                  <div>
                    {low ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                        Low stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                        OK
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(med)}
                      className="text-xs font-medium text-slate-600 border border-slate-200 hover:border-slate-400 hover:text-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    {deleteConfirmId === med.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(med.id)}
                          className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-xs font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(med.id)}
                        className="text-xs font-medium text-red-500 border border-red-200 hover:border-red-400 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Result count */}
        {(search || formFilter) && (
          <p className="mt-3 text-xs text-slate-400 text-right">
            {filtered.length} of {medications.length} medications
          </p>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit medication' : 'Add medication'}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              {field('Name', 'name')}
              <div className="grid grid-cols-2 gap-4">
                {field('ATC Code', 'atcCode')}
                {field('Form', 'form', 'text', true)}
              </div>
              {field('Strength', 'strength')}
              <div className="grid grid-cols-2 gap-4">
                {field('Stock balance', 'stockBalance', 'number')}
                {field('Threshold', 'threshold', 'number')}
              </div>
              <p className="text-xs text-slate-400">
                A low stock warning appears when stock balance falls below the threshold.
              </p>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                {editingId ? 'Save changes' : 'Add medication'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
