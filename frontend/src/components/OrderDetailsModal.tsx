import { Fragment } from 'react';
import type { Order, OrderStatus } from '../types/order.js';
import OrderStatusBadge from './OrderStatusBadge.js';

const STATUSES: OrderStatus[] = ['Utkast', 'Skickad', 'Bekräftad', 'Levererad'];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  Utkast:    'Skickad',
  Skickad:   'Bekräftad',
  Bekräftad: 'Levererad',
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  Utkast:    'Skicka beställning',
  Skickad:   'Bekräfta beställning',
  Bekräftad: 'Markera som levererad',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('sv-SE', { dateStyle: 'medium', timeStyle: 'short' });
}

interface Props {
  order: Order;
  onClose: () => void;
  onAdvanceStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export default function OrderDetailsModal({ order, onClose, onAdvanceStatus }: Props) {
  const nextStatus = NEXT_STATUS[order.status];
  const nextLabel  = NEXT_LABEL[order.status];
  const currentIdx = STATUSES.indexOf(order.status);

  function handleAdvance() {
    if (!nextStatus) return;
    onAdvanceStatus(order.id, nextStatus);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{order.id}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{formatDate(order.createdAt)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Vårdenhet</p>
              <p className="text-sm font-medium text-slate-800">{order.careUnitName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Status</p>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          {/* Status flow */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2.5">Statusflöde</p>
            <div className="flex items-center gap-1">
              {STATUSES.map((s, i) => {
                const isDone    = i < currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <Fragment key={s}>
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        isCurrent ? 'bg-slate-900 text-white' :
                        isDone    ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isDone && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {s}
                    </div>
                    {i < STATUSES.length - 1 && (
                      <div className={`h-px w-3 flex-shrink-0 ${i < currentIdx ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>

          {/* Order lines */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Läkemedelsrader ({order.lines.length})
            </p>
            <div className="space-y-2">
              {order.lines.map((line, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{line.medicationName}</p>
                    <p className="text-xs text-slate-400">{line.form} · {line.strength}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{line.quantity}</p>
                    <p className="text-xs text-slate-400">enheter</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Stäng
          </button>
          {nextStatus && nextLabel && (
            <button
              onClick={handleAdvance}
              className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              {nextLabel}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
