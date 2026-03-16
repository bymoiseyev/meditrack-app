import type { Order } from '../types/order.js';
import OrderStatusBadge from './OrderStatusBadge.js';

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' });
}

interface Props {
  orders: Order[];
  onView: (orderId: string) => void;
}

export default function OrdersList({ orders, onView }: Props) {
  if (orders.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-6 py-16 text-center">
        <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-slate-400">
            <rect x="3" y="2" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 6h6M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600">Inga beställningar hittades</p>
        <p className="text-xs text-slate-400 mt-1">Justera sökfilter eller skapa en ny beställning.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table — hidden on mobile */}
      <div className="hidden lg:block bg-white border h-full border-slate-200 rounded-xl shadow-sm 2xl:max-h-[calc(100vh-22rem)] 2xl:overflow-y-auto 2xl:pr-2">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Order-ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Datum</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Vårdenhet</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Rader</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => onView(order.id)}
                className="border-b cursor-pointer border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{order.id}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{formatDateShort(order.createdAt)}</td>
                <td className="px-4 py-3 text-slate-700">{order.careUnitName}</td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{order.lines.length} läkemedel</td>
                <td className="px-4 py-3 text-right">
                  <button

                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:border-slate-400 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Visa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards — hidden on lg+ */}
      <div className="lg:hidden space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-mono text-xs font-bold text-slate-800">{order.id}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatDateShort(order.createdAt)}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm font-medium text-slate-700 mb-1">{order.careUnitName}</p>
            <p className="text-xs text-slate-400 mb-3">{order.lines.length} läkemedel</p>
            <button
              onClick={() => onView(order.id)}
              className="w-full py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Visa detaljer
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
