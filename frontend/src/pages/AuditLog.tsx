import { useState, useEffect } from 'react';
import { getAuditLog, type AuditLogEntry } from '../api/auditLog.js';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('sv-SE', { dateStyle: 'medium', timeStyle: 'short' });
}

const ROLE_LABEL: Record<string, string> = {
  Sjukskoterska: 'Sjuksköterska',
  Apotekare:     'Apotekare',
  Admin:         'Administratör',
};

const ACTION_COLOR: Record<string, string> = {
  ORDER_CREATED:         'bg-blue-50 text-blue-700 border border-blue-200',
  ORDER_STATUS_ADVANCED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  MEDICATION_CREATED:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  MEDICATION_DELETED:    'bg-red-50 text-red-600 border border-red-200',
};

function DetailsSummary({ entry }: { entry: AuditLogEntry }) {
  const d = entry.details;
  if (entry.action === 'ORDER_STATUS_ADVANCED') {
    return <span className="text-slate-500">{String(d.from)} → {String(d.to)}</span>;
  }
  if (entry.action === 'ORDER_CREATED') {
    return <span className="text-slate-500">{String(d.lineCount)} rad{Number(d.lineCount) === 1 ? '' : 'er'}</span>;
  }
  if (entry.action === 'MEDICATION_CREATED' || entry.action === 'MEDICATION_DELETED') {
    return <span className="text-slate-500">{String(d.name)} · {String(d.atcCode)}</span>;
  }
  return null;
}

export default function AuditLog() {
  const [logs, setLogs]       = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    getAuditLog()
      .then(setLogs)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="p-6 lg:p-8 pt-20 lg:pt-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Granskningslogg</h1>
        <p className="text-sm text-slate-400 mt-0.5">Spårning av alla kritiska händelser i systemet</p>
      </div>

      {loading && (
        <div className="text-sm text-slate-400">Laddar…</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {!loading && !error && logs.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-6 py-16 text-center text-slate-400 text-sm">
          Inga händelser loggade ännu.
        </div>
      )}

      {!loading && logs.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Händelse</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Detaljer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Utförd av</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Datum</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ACTION_COLOR[log.action] ?? 'bg-slate-100 text-slate-600'}`}>
                        {log.actionLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <DetailsSummary entry={log} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-700">{log.userName}</p>
                      <p className="text-xs text-slate-400">{ROLE_LABEL[log.userRole] ?? log.userRole}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ACTION_COLOR[log.action] ?? 'bg-slate-100 text-slate-600'}`}>
                    {log.actionLabel}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(log.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-500 mb-2"><DetailsSummary entry={log} /></p>
                <p className="text-sm font-medium text-slate-700">{log.userName}</p>
                <p className="text-xs text-slate-400">{ROLE_LABEL[log.userRole] ?? log.userRole}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
