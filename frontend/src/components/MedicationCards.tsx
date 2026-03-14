import type { Medication } from '../types/medication.js';

interface Props {
  filtered: Medication[];
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
  onEdit: (med: Medication) => void;
  onDelete: (id: string) => void;
  onQuickOrder: (medicationId: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const isLow = (med: Medication) => med.stockBalance < med.threshold;

export default function MedicationCards({ filtered, deleteConfirmId, setDeleteConfirmId, onEdit, onDelete, onQuickOrder, canEdit, canDelete }: Props) {
  return (
    <div className="lg:hidden space-y-3">
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-6 py-12 text-center text-slate-400 text-sm">
          Inga läkemedel matchar din sökning.
        </div>
      ) : (
        filtered.map((med) => {
          const low = isLow(med);
          const confirming = deleteConfirmId === med.id;

          return (
            <div key={med.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
              {/* Top row: name + status badge */}
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-sm text-slate-800 leading-tight truncate">{med.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{med.atcCode}</p>
                </div>
                {low ? (
                  <span className="flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                    Lågt lager
                  </span>
                ) : (
                  <span className="flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    OK
                  </span>
                )}
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-1.5 mb-3">
                <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-md">{med.form}</span>
                <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-md">{med.strength}</span>
              </div>

              {/* Stock line */}
              <p className="text-xs text-slate-400 mb-3">
                <span className={`font-semibold ${low ? 'text-red-600' : 'text-slate-700'}`}>{med.stockBalance} enheter</span>
                {' '}i lager · min. {med.threshold} enheter
              </p>

              {/* Actions */}
              {!confirming ? (
                <div className="flex gap-2">
                  {low && (
                    <button
                      onClick={() => onQuickOrder(med.id)}
                      className="flex-1 py-2 text-sm font-semibold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      Beställ
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => onEdit(med)}
                      className="flex-1 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Redigera
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setDeleteConfirmId(med.id)}
                      className="flex-1 py-2 text-sm font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Ta bort
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => onDelete(med.id)}
                    className="flex-1 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors cursor-pointer"
                  >
                    Bekräfta borttagning
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Avbryt
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
