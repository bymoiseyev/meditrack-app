import type { OrderStatus } from '../types/order.js';

interface Props {
  status: OrderStatus;
}

const CONFIG: Record<OrderStatus, string> = {
  Utkast:    'bg-amber-50   text-amber-700   border border-amber-200',
  Skickad:   'bg-blue-50    text-blue-700    border border-blue-200',
  Bekräftad: 'bg-indigo-50  text-indigo-700  border border-indigo-200',
  Levererad: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

export default function OrderStatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${CONFIG[status]}`}>
      {status}
    </span>
  );
}
