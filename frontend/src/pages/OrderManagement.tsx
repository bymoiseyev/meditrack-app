import { useState, useEffect } from 'react';
import type { Order, CareUnit, OrderMedication } from '../types/order.js';
import type { NewOrderPayload } from '../components/OrderCreatePanel.js';
import { getOrders, createOrder, advanceOrderStatus } from '../api/orders.js';
import { getCareUnits } from '../api/careUnits.js';
import { getMedications } from '../api/medications.js';
import OrderSearchFilters from '../components/OrderSearchFilters.js';
import OrdersList from '../components/OrdersList.js';
import OrderCreatePanel from '../components/OrderCreatePanel.js';
import OrderDetailsModal from '../components/OrderDetailsModal.js';

interface Props {
  quickOrderMedId?: string | null;
  onQuickOrderConsumed?: () => void;
}

export default function OrderManagement({ quickOrderMedId, onQuickOrderConsumed }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [careUnits, setCareUnits] = useState<CareUnit[]>([]);
  const [medications, setMedications] = useState<OrderMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [searchId, setSearchId] = useState('');
  const [careUnitFilter, setCareUnitFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getOrders(), getCareUnits(), getMedications()])
      .then(([fetchedOrders, fetchedCareUnits, fetchedMeds]) => {
        setOrders(fetchedOrders);
        setCareUnits(fetchedCareUnits);
        setMedications(
          fetchedMeds.map((m) => ({
            id:      m.id,
            name:    m.name,
            atcCode: m.atcCode,
            form:    m.form,
            strength: m.strength,
          })),
        );
      })
      .catch((e: Error) => setApiError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    const matchesId       = !searchId.trim()   || o.id.toLowerCase().includes(searchId.trim().toLowerCase());
    const matchesCareUnit = !careUnitFilter     || o.careUnitId === careUnitFilter;
    const matchesStatus   = !statusFilter       || o.status === statusFilter;
    return matchesId && matchesCareUnit && matchesStatus;
  });

  async function handleSaveOrder(payload: NewOrderPayload) {
    const created = await createOrder({
      careUnitId: Number(payload.careUnitId),
      lines: payload.lines.map((l) => ({
        medicationId: Number(l.medicationId),
        quantity:     l.quantity,
      })),
    });
    setOrders((prev) => [created, ...prev]);
  }

  async function handleAdvanceStatus(orderId: string) {
    const updated = await advanceOrderStatus(orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
  }

  const viewingOrder = orders.find((o) => o.id === viewingOrderId) ?? null;
  const isFiltering  = !!(searchId || careUnitFilter || statusFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50/50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Laddar beställningar…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen 2xl:h-screen 2xl:overflow-hidden  2xl:flex 2xl:flex-col bg-zinc-50/50">
      <div className="mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 2xl:flex-1 2xl:overflow-hidden 2xl:flex 2xl:flex-col 2xl:min-h-0">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs text-slate-500 font-medium mb-3">
              <span>MediTrack</span>
              <span className="text-slate-300">•</span>
              <span>Beställningar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">Beställningar</h1>
            <p className="mt-1 text-sm text-slate-500 max-w-lg">
              Hantera och följ upp läkemedelsbeställningar per vårdenhet. Skapa nya beställningar och spåra deras status från utkast till leverans.
            </p>
          </div>
        </div>

        {apiError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {apiError}
          </div>
        )}

        {/* Filters */}
        <div className="mb-5">
          <OrderSearchFilters
            searchId={searchId}
            setSearchId={setSearchId}
            careUnitFilter={careUnitFilter}
            setCareUnitFilter={setCareUnitFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            careUnits={careUnits}
          />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 2xl:grid-cols-[1fr_380px] gap-6 items-start 2xl:flex-1 2xl:min-h-0 2xl:items-stretch">

          {/* Left: order history */}
          <div className="order-2 2xl:order-1 2xl:min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-700">
                Beställningshistorik
              </h2>
              {isFiltering && (
                <span className="text-xs text-slate-400">
                  {filtered.length} av {orders.length}
                </span>
              )}
            </div>
            <OrdersList orders={filtered} onView={setViewingOrderId} />
          </div>

          {/* Right: new order panel */}
          <div className="order-1 2xl:order-2 2xl:self-start">
            <OrderCreatePanel
              careUnits={careUnits}
              medications={medications}
              onSave={handleSaveOrder}
              quickOrderMedId={quickOrderMedId ?? null}
              onQuickOrderConsumed={onQuickOrderConsumed ?? (() => {})}
            />
          </div>

        </div>
      </div>

      {/* Order detail modal */}
      
      {viewingOrder && (
        <OrderDetailsModal
          order={viewingOrder}
          onClose={() => setViewingOrderId(null)}
          onAdvanceStatus={handleAdvanceStatus}
        />
      )}
    </div>
  );
}
