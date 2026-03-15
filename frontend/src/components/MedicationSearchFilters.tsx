interface Props {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  openAdd: () => void;
  canEdit: boolean;
}

export default function MedicationSearchFilters({ search, setSearch, statusFilter, setStatusFilter, openAdd, canEdit }: Props) {
  return (
    <div className="bg-white w-full border border-slate-200 rounded-xl shadow-sm px-4 sm:px-5 py-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            Sök läkemedel
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              width="15" height="15" viewBox="0 0 15 15" fill="none"
            >
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Sök på namn, ATC-kod eller form…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 sm:py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>
        <div className="flex items-end gap-4">
          <div className="sm:w-44">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Filtrera på status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 sm:py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="">Alla</option>
              <option value="low">Lågt lager</option>
              <option value="ok">OK</option>
            </select>
          </div>

          {canEdit && <div className="hidden lg:block h-10 w-px bg-slate-200"></div>}

          {canEdit && <button
            className="hidden lg:flex h-fit max-lg:w-full items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer sm:whitespace-nowrap sm:flex-shrink-0"
            onClick={openAdd}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Lägg till läkemedel
          </button>}
        </div>
      </div>
    </div>
  );
}
