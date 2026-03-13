import type { Medication } from '../types/medication.js';

interface Props {
  filtered: Medication[];
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
  onEdit: (med: Medication) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}

const isLow = (med: Medication) => med.stockBalance < med.threshold;

const GRID = "grid-cols-[2fr_1fr_1fr_1fr_1.2fr_0.8fr_140px]";

export default function MedicationTable({ filtered, deleteConfirmId, setDeleteConfirmId, onEdit, onDelete, canEdit }: Props) {
  return (
    <div className="hidden lg:block  border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Table header */}
      <div className={`grid ${GRID} items-center gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50`}>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Läkemedel</span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">ATC-kod</span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Form</span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Styrka</span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lagersaldo</span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Åtgärder</span>
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-12 text-center text-slate-400 text-sm">
          Inga läkemedel matchar din sökning.
        </div>
      ) : (
        filtered.map((med, i) => {
          const low = isLow(med);
          return (
            <div
              key={med.id}
              className={`grid ${GRID} items-center gap-4 px-6 py-4 ${
                i < filtered.length - 1 ? 'border-b border-slate-100' : ''
              } hover:bg-slate-50/60 transition-colors`}
            >
              {/* Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`flex-shrink-0 w-2 h-2 rounded-full ${low ? 'bg-red-500' : 'bg-emerald-500'}`} />
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
                  {med.stockBalance} enheter
                </span>
                <div className="text-xs text-slate-400 mt-0.5">Min. {med.threshold} enheter</div>
              </div>

              {/* Status */}
              <div>
                {low ? (
                  <span className="inline-flex items-center text-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                    Lågt lager
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    OK
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {canEdit && (
                  <button
                    onClick={() => onEdit(med)}
                    className="text-xs font-medium text-slate-600 border border-slate-200 hover:border-slate-400 hover:text-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Redigera
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => deleteConfirmId === med.id ? onDelete(med.id) : setDeleteConfirmId(med.id)}
                    onBlur={() => setDeleteConfirmId(null)}
                    className={`text-xs whitespace-nowrap font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      deleteConfirmId === med.id
                        ? 'font-semibold text-white bg-red-500 hover:bg-red-600 border border-red-500'
                        : 'text-red-500 border border-red-200 hover:border-red-400 hover:bg-red-50'
                    }`}
                  >
                    {deleteConfirmId === med.id ? 'Bekräfta?' : 'Ta bort'}
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}