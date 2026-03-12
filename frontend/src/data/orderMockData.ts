import type { CareUnit, OrderMedication, Order } from '../types/order.js';

export const CARE_UNITS: CareUnit[] = [
  { id: 'cu-1', name: 'Avdelning 1A – Medicin' },
  { id: 'cu-2', name: 'Avdelning 2B – Kirurgi' },
  { id: 'cu-3', name: 'Akutmottagningen' },
  { id: 'cu-4', name: 'Intensivvårdsavdelningen' },
  { id: 'cu-5', name: 'Barnmedicin' },
];

export const ORDER_MEDICATIONS: OrderMedication[] = [
  { id: 'm-1', name: 'Alvedon',     atcCode: 'N02BE01', form: 'Tablett',          strength: '500 mg' },
  { id: 'm-2', name: 'Morfin',      atcCode: 'N02AA01', form: 'Injektion',         strength: '10 mg/ml' },
  { id: 'm-3', name: 'Ipren',       atcCode: 'M01AE01', form: 'Tablett',          strength: '400 mg' },
  { id: 'm-4', name: 'Kåvepenin',   atcCode: 'J01CE01', form: 'Oral lösning',     strength: '125 mg/5 ml' },
  { id: 'm-5', name: 'Fragmin',     atcCode: 'B01AB04', form: 'Injektionslösning', strength: '2 500 IE/0,2 ml' },
  { id: 'm-6', name: 'Metformin',   atcCode: 'A10BA02', form: 'Tablett',          strength: '500 mg' },
  { id: 'm-7', name: 'Furosemid',   atcCode: 'C03CA01', form: 'Tablett',          strength: '40 mg' },
  { id: 'm-8', name: 'Warfarin',    atcCode: 'B01AA03', form: 'Tablett',          strength: '5 mg' },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-1001',
    createdAt: '2026-03-01T09:12:00',
    careUnitId: 'cu-1',
    careUnitName: 'Avdelning 1A – Medicin',
    status: 'Levererad',
    lines: [
      { medicationId: 'm-1', medicationName: 'Alvedon',   form: 'Tablett',          strength: '500 mg',          quantity: 200 },
      { medicationId: 'm-3', medicationName: 'Ipren',     form: 'Tablett',          strength: '400 mg',          quantity: 100 },
    ],
  },
  {
    id: 'ORD-1002',
    createdAt: '2026-03-03T13:45:00',
    careUnitId: 'cu-2',
    careUnitName: 'Avdelning 2B – Kirurgi',
    status: 'Bekräftad',
    lines: [
      { medicationId: 'm-2', medicationName: 'Morfin',    form: 'Injektion',         strength: '10 mg/ml',        quantity: 30 },
      { medicationId: 'm-5', medicationName: 'Fragmin',   form: 'Injektionslösning', strength: '2 500 IE/0,2 ml', quantity: 50 },
    ],
  },
  {
    id: 'ORD-1003',
    createdAt: '2026-03-05T08:30:00',
    careUnitId: 'cu-3',
    careUnitName: 'Akutmottagningen',
    status: 'Skickad',
    lines: [
      { medicationId: 'm-1', medicationName: 'Alvedon',   form: 'Tablett',      strength: '500 mg',          quantity: 300 },
      { medicationId: 'm-4', medicationName: 'Kåvepenin', form: 'Oral lösning', strength: '125 mg/5 ml',     quantity: 20  },
      { medicationId: 'm-7', medicationName: 'Furosemid', form: 'Tablett',      strength: '40 mg',           quantity: 60  },
    ],
  },
  {
    id: 'ORD-1004',
    createdAt: '2026-03-08T11:00:00',
    careUnitId: 'cu-1',
    careUnitName: 'Avdelning 1A – Medicin',
    status: 'Utkast',
    lines: [
      { medicationId: 'm-8', medicationName: 'Warfarin',  form: 'Tablett',      strength: '5 mg',            quantity: 90 },
    ],
  },
  {
    id: 'ORD-1005',
    createdAt: '2026-03-10T14:22:00',
    careUnitId: 'cu-4',
    careUnitName: 'Intensivvårdsavdelningen',
    status: 'Utkast',
    lines: [
      { medicationId: 'm-2', medicationName: 'Morfin',    form: 'Injektion', strength: '10 mg/ml', quantity: 15  },
      { medicationId: 'm-6', medicationName: 'Metformin', form: 'Tablett',   strength: '500 mg',   quantity: 120 },
    ],
  },
  {
    id: 'ORD-1006',
    createdAt: '2026-03-11T09:05:00',
    careUnitId: 'cu-5',
    careUnitName: 'Barnmedicin',
    status: 'Skickad',
    lines: [
      { medicationId: 'm-4', medicationName: 'Kåvepenin', form: 'Oral lösning', strength: '125 mg/5 ml', quantity: 40  },
      { medicationId: 'm-1', medicationName: 'Alvedon',   form: 'Tablett',      strength: '500 mg',      quantity: 150 },
    ],
  },
];
