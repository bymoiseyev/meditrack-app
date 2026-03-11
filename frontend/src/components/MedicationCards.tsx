import type { Medication } from '../types/medication';

interface Props {
  filtered: Medication[];
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
  onEdit: (med: Medication) => void;
  onDelete: (id: string) => void;
}

const isLow = (med: Medication) => med.stockBalance < med.threshold;

export default function MedicationCards({ filtered, deleteConfirmId, setDeleteConfirmId, onEdit, onDelete }: Props) {
  return (
    <div className="lg:hidden space-y-3">
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl px-6 py-12 text-center text-slate-400 text-sm">
          No medications match your search.
        </div>
      ) : (
        filtered.map((med) => {
          const low = isLow(med);
          return (
            <div
              key={med.id}
              className={`bg-white rounded-xl border overflow-hidden ${
                low ? 'border-2 border-red-400' : 'border-slate-200'
              }`}
            >
              {/* Card body */}
              <div className="p-4">
                {/* Name row */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${low ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    <span className="font-bold text-slate-900 text-base leading-tight truncate">{med.name}</span>
                  </div>
                  {low && (
                    <span className="flex-shrink-0 ml-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                      Low stock
                    </span>
                  )}
                </div>

                {/* Form + strength pills */}
                <div className="flex flex-wrap gap-1.5 mb-4 pl-5">
                  <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-md">
                    {med.form}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-md">
                    {med.strength}
                  </span>
                </div>

                {/* ATC + Minimum grid */}
                <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">ATC Code</div>
                    <div className="text-sm font-mono font-semibold text-slate-700">{med.atcCode}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Minimum</div>
                    <div className="text-sm font-semibold text-slate-700">{med.threshold} units</div>
                  </div>
                </div>

                {/* Stock balance */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Stock balance</div>
                  <div className={`text-2xl font-bold ${low ? 'text-red-600' : 'text-slate-900'}`}>
                    {med.stockBalance} units
                  </div>
                </div>
              </div>

              {/* Card actions */}
              <div className="border-t border-slate-100 flex">
                {deleteConfirmId === med.id ? (
                  <>
                    <button
                      onClick={() => onDelete(med.id)}
                      className="flex-1 py-3 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      Confirm delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="flex-1 py-3 text-sm font-medium text-slate-500 border-l border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onEdit(med)}
                      className="flex-1 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-100 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(med.id)}
                      className="flex-1 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
