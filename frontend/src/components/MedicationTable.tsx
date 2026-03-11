import type { Medication } from '../types/medication';

interface Props {
  filtered: Medication[];
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
  onEdit: (med: Medication) => void;
  onDelete: (id: string) => void;
}

const isLow = (med: Medication) => med.stockBalance < med.threshold;

export default function MedicationTable({ filtered, deleteConfirmId, setDeleteConfirmId, onEdit, onDelete }: Props) {
  return (
    <div className="hidden lg:block bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
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
                  onClick={() => onEdit(med)}
                  className="text-xs font-medium text-slate-600 border border-slate-200 hover:border-slate-400 hover:text-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Edit
                </button>
                {deleteConfirmId === med.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDelete(med.id)}
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
  );
}
