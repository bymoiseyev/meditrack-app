import { request } from './request.js';

export interface AuditLogEntry {
  id:          number;
  userId:      number;
  userName:    string;
  userRole:    string;
  action:      string;
  actionLabel: string;
  entity:      string;
  entityId:    number;
  details:     Record<string, unknown>;
  createdAt:   string;
}

export function getAuditLog(): Promise<AuditLogEntry[]> {
  return request<AuditLogEntry[]>('/api/audit-log');
}
