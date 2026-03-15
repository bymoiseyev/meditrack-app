import type { CareUnit, OrderStatus } from '../types/order.js';

const STATUSES: Array<{ value: OrderStatus | ''; label: string }> = [
  { value: '',          label: 'Alla statusar' },
  { value: 'Utkast',    label: 'Utkast' },
  { value: 'Skickad',   label: 'Skickad' },
  { value: 'Bekräftad', label: 'Bekräftad' },
  { value: 'Levererad', label: 'Levererad' },
];

interface Props {
  searchId: string;
  setSearchId: (v: string) => void;
  careUnitFilter: string;
  setCareUnitFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  careUnits: CareUnit[];
}

export default function OrderSearchFilters({
  searchId,
  setSearchId,
  careUnitFilter,
  setCareUnitFilter,
  statusFilter,
  setStatusFilter,
  careUnits,
}: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 sm:px-5 py-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">

        {/* Search by order ID */}
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            Sök beställning
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
              placeholder="Sök på beställnings-ID…"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 sm:py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>

        {/* Vårdenhet filter */}
        <div className="sm:w-56">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            Vårdenhet
          </label>
          <select
            value={careUnitFilter}
            onChange={(e) => setCareUnitFilter(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 sm:py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="">Alla vårdenheter</option>
            {careUnits.map((cu) => (
              <option key={cu.id} value={cu.id}>{cu.name}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="sm:w-44">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 sm:py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}
