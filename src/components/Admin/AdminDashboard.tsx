import React, { useState, useEffect } from 'react';
import { Package, ClipboardList, LogOut, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { ProductManager } from './ProductManager';
import { OrderManager } from './OrderManager';
import { ChatWidget } from '../ChatWidget';
import { auth } from '../../firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useAppStore } from '../../store';
import { formatIDR } from '../../utils';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('orders');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { orders } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getIsToday = (dateString: string) => {
    const todayStr = new Date().toLocaleString('id-ID');
    const todayKey = todayStr.includes(',') ? todayStr.split(',')[0] : todayStr.split(' ')[0];
    const orderKey = dateString.includes(',') ? dateString.split(',')[0] : dateString.split(' ')[0];
    return todayKey === orderKey;
  };

  const todayIncome = orders
    .filter(o => o.status === 'completed' && getIsToday(o.date))
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google', error);
      alert('Gagal login: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.email !== 'bagasmahesa2003@gmail.com') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Terbatas</h2>
          <p className="text-gray-500 mb-8">
            {user 
              ? 'Akun Anda tidak memiliki akses ke halaman Admin. Silakan login dengan akun yang memiliki izin.'
              : 'Silakan login menggunakan akun Google Anda untuk mengakses halaman Admin Penjual.'}
          </p>
          <button
            onClick={user ? handleLogout : handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
          >
            {!user && (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            {user ? 'Logout' : 'Login dengan Google'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Penjual</h1>
          <p className="text-gray-500 mt-1 text-sm">Kelola produk dan pesanan yang masuk.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'Admin'} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold text-sm">
                {(user.displayName || user.email || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-gray-900 leading-tight">{user.displayName || 'Admin'}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-200 mx-1"></div>
          <button 
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
            title="Keluar"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium">Pendapatan Hari Ini</div>
            <div className="text-xl font-bold text-gray-900">{formatIDR(todayIncome)}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium">Total Pesanan</div>
            <div className="text-xl font-bold text-gray-900">{totalOrders}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium">Menunggu Konfirmasi</div>
            <div className="text-xl font-bold text-gray-900">{pendingOrders}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium">Pesanan Selesai</div>
            <div className="text-xl font-bold text-gray-900">{completedOrders}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
            activeTab === 'orders'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Pesanan Masuk
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
            activeTab === 'products'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Package className="w-4 h-4" />
          Kelola Produk
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8 min-h-[500px]">
        {activeTab === 'orders' ? <OrderManager /> : <ProductManager />}
      </div>

      <ChatWidget sender="admin" title="Chat dengan Pelanggan" />
    </div>
  );
}
