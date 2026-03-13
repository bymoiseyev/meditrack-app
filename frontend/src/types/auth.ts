export type UserRole = 'Sjukskoterska' | 'Apotekare' | 'Admin';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
