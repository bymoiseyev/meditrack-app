export interface Medication {
  id: string;
  name: string;
  atcCode: string;
  form: string;
  strength: string;
  stockBalance: number;
  threshold: number;
}

export interface FormState {
  name: string;
  atcCode: string;
  form: string;
  strength: string;
  stockBalance: string;
  threshold: string;
}
