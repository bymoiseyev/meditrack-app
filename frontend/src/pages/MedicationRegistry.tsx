import { useState, useEffect } from 'react';
import type { Medication, FormState } from '../types/medication.js';
import { useAuth } from '../context/AuthContext.js';
import { getMedications, createMedication, updateMedication, deleteMedication } from '../api/medications.js';
import SearchFilterBar from '../components/SearchFilterBar.js';
import MedicationTable from '../components/MedicationTable.js';
import MedicationCards from '../components/MedicationCards.js';
import MedicationFormModal from '../components/MedicationFormModal.js';

const emptyForm: FormState = {
  name: '',
  atcCode: '',
  form: '',
  strength: '',
  stockBalance: '',
  threshold: '',
};

interface Props {
  onQuickOrder: (medicationId: string) => void;
}

export default function MedicationRegistry({ onQuickOrder }: Props) {
  const { user } = useAuth();
  const canEdit = user?.role === 'Apotekare' || user?.role === 'Admin';
  const canDelete = user?.role === 'Admin';
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading]         = useState(true);
  const [apiError, setApiError]       = useState<string | null>(null);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [form, setForm]               = useState<FormState>(emptyForm);
  const [errors, setErrors]           = useState<Partial<FormState>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    getMedications()
      .then(setMedications)
      .catch((e: Error) => setApiError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = medications.filter((med) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      med.name.toLowerCase().includes(q) ||
      med.atcCode.toLowerCase().includes(q) ||
      med.form.toLowerCase().includes(q);
    const isLow = med.stockBalance < med.threshold;
    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'low' && isLow) ||
      (statusFilter === 'ok' && !isLow);
    return matchesSearch && matchesStatus;
  });

  function openAdd() {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(med: Medication) {
    setForm({
      name:         med.name,
      atcCode:      med.atcCode,
      form:         med.form,
      strength:     med.strength,
      stockBalance: String(med.stockBalance),
      threshold:    String(med.threshold),
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
    if (!form.name.trim())     e.name     = 'Obligatoriskt';
    if (!form.atcCode.trim())  e.atcCode  = 'Obligatoriskt';
    if (!form.form.trim())     e.form     = 'Obligatoriskt';
    if (!form.strength.trim()) e.strength = 'Obligatoriskt';
    if (form.stockBalance === '' || isNaN(Number(form.stockBalance))) e.stockBalance = 'Måste vara ett tal';
    if (form.threshold    === '' || isNaN(Number(form.threshold)))    e.threshold    = 'Måste vara ett tal';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const payload = {
      name:         form.name.trim(),
      atcCode:      form.atcCode.trim().toUpperCase(),
      form:         form.form.trim(),
      strength:     form.strength.trim(),
      stockBalance: Number(form.stockBalance),
      threshold:    Number(form.threshold),
    };

    try {
      if (editingId) {
        const updated = await updateMedication(editingId, payload);
        setMedications((prev) => prev.map((m) => (m.id === editingId ? updated : m)));
      } else {
        const created = await createMedication(payload);
        setMedications((prev) => [...prev, created]);
      }
      closeModal();
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Något gick fel');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMedication(id);
      setMedications((prev) => prev.filter((m) => m.id !== id));
      setDeleteConfirmId(null);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Något gick fel');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50/50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Laddar läkemedel…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <div className=" mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs text-slate-500 font-medium mb-3">
              <span>MediTrack</span>
              <span className="text-slate-300">•</span>
              <span>Läkemedelsregister</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">Läkemedel</h1>
            <p className="mt-1 text-sm text-slate-500 max-w-lg">
              En tydlig översikt över namn, ATC-kod, form, styrka och aktuellt lagersaldo. Utformad för att vara snabb att skanna i stressiga situationer.
            </p>
          </div>
        </div>

        {apiError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {apiError}
          </div>
        )}

        <div className='flex flex-col gap-4 mb-4 justify-between items-end w-full'>
          <SearchFilterBar
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            openAdd={openAdd}
            canEdit={canEdit}
          />
          {canEdit && <button
            onClick={openAdd}
            className="flex lg:hidden h-fit max-lg:w-full items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer sm:whitespace-nowrap sm:flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Lägg till läkemedel
          </button>}
        </div>

        <MedicationTable
          filtered={filtered}
          deleteConfirmId={deleteConfirmId}
          setDeleteConfirmId={setDeleteConfirmId}
          onEdit={openEdit}
          onDelete={handleDelete}
          onQuickOrder={onQuickOrder}
          canEdit={canEdit}
          canDelete={canDelete}
        />
        <MedicationCards
          filtered={filtered}
          deleteConfirmId={deleteConfirmId}
          setDeleteConfirmId={setDeleteConfirmId}
          onEdit={openEdit}
          onDelete={handleDelete}
          onQuickOrder={onQuickOrder}
          canEdit={canEdit}
          canDelete={canDelete}
        />

        {(search || statusFilter) && (
          <p className="mt-3 text-xs text-slate-400 text-right">
            {filtered.length} av {medications.length} läkemedel
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
