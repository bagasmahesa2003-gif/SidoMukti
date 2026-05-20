import React from 'react';
import { useAppStore } from '../../store';
import { motion } from 'motion/react';
import { X, ClipboardList } from 'lucide-react';
import { formatIDR } from '../../utils';
import { Order } from '../../types';

export function BuyerOrdersModal({ onClose }: { onClose: () => void }) {
  const { orders } = useAppStore();

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">Menunggu Proses</span>;
      case 'processing': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Sedang Diproses</span>;
      case 'completed': return <span className="px-2.5 py-1 bg-brand-100 text-brand-700 text-xs font-semibold rounded-full">Selesai</span>;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
      >
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-gray-900">Status Pesanan</h2>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-gray-50/50">
          {orders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
              <ClipboardList className="w-16 h-16 opacity-20" />
              <p>Belum ada pesanan.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-brand-300 transition-colors">
                  <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-gray-500 block mb-1">#{order.id}</span>
                      <span className="text-gray-900 font-semibold">{order.buyerName}</span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1 mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Waktu Order:</span>
                      <span className="font-medium text-gray-900">{order.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Metode Pengiriman:</span>
                      <span className="font-medium text-gray-900">
                        {order.deliveryMethod === 'pickup' ? 'Ambil Sendiri' : 'Diantar'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
                    <div className="text-xs font-semibold text-gray-500">Item:</div>
                    <div className="flex flex-wrap gap-1">
                      {order.items.map(item => (
                        <span key={item.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                          {item.name} x{item.cartQuantity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between font-bold mt-4 pt-4 border-t border-gray-100 text-lg">
                    <span>Total Harga:</span>
                    <span className="text-brand-600">{formatIDR(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
