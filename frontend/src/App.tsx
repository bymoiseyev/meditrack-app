import { useState } from 'react';
import type { Page } from './types/navigation.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import Sidebar from './components/Sidebar.js';
import MedicationRegistry from './pages/MedicationRegistry.js';
import OrderManagement from './pages/OrderManagement.js';
import AuditLog from './pages/AuditLog.js';
import Login from './pages/Login.js';

function AppShell() {
  const { user, loading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('medications');
  const [quickOrderMedId, setQuickOrderMedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50/50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Laddar…</p>
      </div>
    );
  }

  if (!user) return <Login />;

  function handleQuickOrder(medicationId: string) {
    setQuickOrderMedId(medicationId);
    setCurrentPage('orders');
  }

  return (
    <div className="min-h-screen flex bg-zinc-50/50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} user={user} onLogout={logout} />
      <div className="flex-1 min-w-0">
        {currentPage === 'medications' && (
          <MedicationRegistry onQuickOrder={handleQuickOrder} />
        )}
        {currentPage === 'orders' && (
          <OrderManagement quickOrderMedId={quickOrderMedId} onQuickOrderConsumed={() => setQuickOrderMedId(null)} />
        )}
        {currentPage === 'auditLog' && (
          <AuditLog />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
