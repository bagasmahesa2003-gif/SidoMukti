import React from 'react';
import { AppProvider, useAppStore } from './store';
import { Navbar } from './components/Navbar';
import { Shop } from './components/Buyer/Shop';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ToastContainer } from './components/Toast';

// Component that switches based on View state
function AppContent() {
  const { view } = useAppStore();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {view === 'buyer' ? <Shop /> : <AdminDashboard />}
      </main>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
