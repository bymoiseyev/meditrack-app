import { useState } from 'react';
import type { Page } from './types/navigation.js';
import Sidebar from './components/Sidebar.js';
import MedicationRegistry from './pages/MedicationRegistry.js';
import OrderManagement from './pages/OrderManagement.js';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('medications');

  return (
    <div className="min-h-screen flex bg-zinc-50/50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 min-w-0">
        {currentPage === 'medications' && <MedicationRegistry />}
        {currentPage === 'orders' && <OrderManagement />}
      </div>
    </div>
  );
}

export default App;
