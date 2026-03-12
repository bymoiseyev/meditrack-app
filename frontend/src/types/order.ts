export type OrderStatus = 'Utkast' | 'Skickad' | 'Bekräftad' | 'Levererad';

export interface CareUnit {
  id: string;
  name: string;
}

export interface OrderMedication {
  id: string;
  name: string;
  atcCode: string;
  form: string;
  strength: string;
}

export interface OrderLine {
  medicationId: string;
  medicationName: string;
  form: string;
  strength: string;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: string; // ISO datetime string
  careUnitId: string;
  careUnitName: string;
  status: OrderStatus;
  lines: OrderLine[];
}
