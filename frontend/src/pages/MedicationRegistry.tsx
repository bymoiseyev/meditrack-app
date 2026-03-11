import { useState } from 'react';
import type { Medication, FormState } from '../types/medication.js';
import SearchFilterBar from '../components/SearchFilterBar.js';
import MedicationTable from '../components/MedicationTable.js';
import MedicationCards from '../components/MedicationCards.js';
import MedicationFormModal from '../components/MedicationFormModal.js';
import Sidebar from '../components/Sidebar.js';

const INITIAL_MEDICATIONS: Medication[] = [
  { id: '1', name: 'Paracetamol', atcCode: 'N02BE01', form: 'Tablet', strength: '500 mg', stockBalance: 24, threshold: 30 },
  { id: '2', name: 'Insulin Aspart', atcCode: 'A10AB05', form: 'Injection solution', strength: '100 E/ml', stockBalance: 62, threshold: 20 },
  { id: '3', name: 'Morphine', atcCode: 'N02AA01', form: 'Injection', strength: '10 mg/ml', stockBalance: 12, threshold: 15 },
  { id: '4', name: 'Amoxicillin', atcCode: 'J01CA04', form: 'Capsule', strength: '500 mg', stockBalance: 118, threshold: 40 },
  { id: '5', name: 'Furosemide', atcCode: 'C03CA01', form: 'Tablet', strength: '40 mg', stockBalance: 39, threshold: 25 },
  { id: '6', name: 'Metformin', atcCode: 'A10BA02', form: 'Tablet', strength: '500 mg', stockBalance: 8, threshold: 50 },
  { id: '7', name: 'Warfarin', atcCode: 'B01AA03', form: 'Tablet', strength: '5 mg', stockBalance: 55, threshold: 20 },
];

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

  return (
    <div className="min-h-screen flex bg-zinc-50/50">
      <Sidebar />
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header row — stacks on mobile, side-by-side on sm+ */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs text-slate-500 font-medium mb-3">
              <span>MediTrack</span>
              <span className="text-slate-300">•</span>
              <span>Medication Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">Medications</h1>
            <p className="mt-1 text-sm text-slate-500 max-w-lg">
              A clear overview of name, ATC code, form, strength, and current stock balance. Designed to be fast to scan in stressful situations.
            </p>
          </div>

        </div>

        <div className=' flex flex-col gap-4 mb-4   justify-between items-end w-full  '>
          <SearchFilterBar
            search={search}
            setSearch={setSearch}
            formFilter={formFilter}
            setFormFilter={setFormFilter}
            uniqueForms={uniqueForms}
            openAdd={openAdd}
          />
          <button
            onClick={openAdd}
            className="flex lg:hidden h-fit max-lg:w-full items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer sm:whitespace-nowrap sm:flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add medication
          </button>
        </div>

        <MedicationTable
          filtered={filtered}
          deleteConfirmId={deleteConfirmId}
          setDeleteConfirmId={setDeleteConfirmId}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
        <MedicationCards
          filtered={filtered}
          deleteConfirmId={deleteConfirmId}
          setDeleteConfirmId={setDeleteConfirmId}
          onEdit={openEdit}
          onDelete={handleDelete}
        />

        {/* Result count */}
        {(search || formFilter) && (
          <p className="mt-3 text-xs text-slate-400 text-right">
            {filtered.length} of {medications.length} medications
          </p>
        )}
      </div>

      {modalOpen && (
        <MedicationFormModal
          editingId={editingId}
          form={form}
          errors={errors}
          setForm={setForm}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
