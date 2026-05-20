import { useAppStore } from '../store';
import { Leaf, Store, UserCircle2 } from 'lucide-react';

export function Navbar() {
  const { view, setView } = useAppStore();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 text-brand-500">
            <img src="/logogoro.png" alt="Logo Sayur SidoMukti" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-contain" />
            <span className="font-bold text-xl sm:text-2xl tracking-tight">Sayur SidoMukti</span>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-full border shadow-inner">
            <button
              onClick={() => setView('buyer')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-colors ${
                view === 'buyer' ? 'bg-white shadow-sm text-brand-600 border border-gray-200/50' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <UserCircle2 className="w-4 h-4" />
              <span className="hidden sm:inline">Pembeli</span>
            </button>
            <button
              onClick={() => setView('admin')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-colors ${
                view === 'admin' ? 'bg-white shadow-sm text-brand-600 border border-gray-200/50' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Penjual (Admin)</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
