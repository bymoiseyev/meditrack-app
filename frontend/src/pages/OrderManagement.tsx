import { useState } from 'react';
import type { Order, OrderStatus } from '../types/order.js';
import { CARE_UNITS, ORDER_MEDICATIONS, INITIAL_ORDERS } from '../data/orderMockData.js';
import OrderFilters from '../components/OrderFilters.js';
import OrdersList from '../components/OrdersList.js';
import NewOrderPanel from '../components/NewOrderPanel.js';
import OrderDetailsModal from '../components/OrderDetailsModal.js';

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [searchId, setSearchId] = useState('');
  const [careUnitFilter, setCareUnitFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);
  const [orderCounter, setOrderCounter] = useState(1042);

  const nextOrderId = `ORD-${orderCounter + 1}`;

  const filtered = orders.filter((o) => {
    const matchesId       = !searchId.trim()      || o.id.toLowerCase().includes(searchId.trim().toLowerCase());
    const matchesCareUnit = !careUnitFilter        || o.careUnitId === careUnitFilter;
    const matchesStatus   = !statusFilter          || o.status === statusFilter;
    return matchesId && matchesCareUnit && matchesStatus;
  });

  function handleSaveOrder(order: Order) {
    setOrders((prev) => [order, ...prev]);
    setOrderCounter((n) => n + 1);
  }

  function handleAdvanceStatus(orderId: string, newStatus: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  }

  function scrollToPanel() {
    document.getElementById('new-order-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const viewingOrder = orders.find((o) => o.id === viewingOrderId) ?? null;
  const isFiltering  = !!(searchId || careUnitFilter || statusFilter);

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <div className=" mx-auto px-4 sm:px-6 py-6 sm:py-8">

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

        {/* Filters */}
        <div className="mb-5">
          <OrderFilters
            searchId={searchId}
            setSearchId={setSearchId}
            careUnitFilter={careUnitFilter}
            setCareUnitFilter={setCareUnitFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            careUnits={CARE_UNITS}
          />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 2xl:grid-cols-[1fr_380px] gap-6 items-start">

          {/* Left: order history */}
          <div>
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
          <div className="lg:sticky lg:top-6">
            <NewOrderPanel
              careUnits={CARE_UNITS}
              medications={ORDER_MEDICATIONS}
              nextOrderId={nextOrderId}
              onSave={handleSaveOrder}
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
