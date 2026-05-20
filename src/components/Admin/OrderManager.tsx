import React, { useMemo } from 'react';
import { useAppStore } from '../../store';
import { formatIDR } from '../../utils';
import { Order } from '../../types';

export function OrderManager() {
  const { orders, updateOrderStatus } = useAppStore();

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">Menunggu Proses</span>;
      case 'processing': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Sedang Diproses</span>;
      case 'completed': return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Selesai</span>;
    }
  };

  const getMethodBadge = (method: string) => {
    return method === 'pickup' ? (
      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md border">Ambil Sendiri</span>
    ) : (
      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-100">Diantar via Kurir</span>
    );
  };

  const groupedOrders = useMemo(() => {
    return orders.reduce((acc, order) => {
      // Extract just the date portion (e.g. from "20/5/2026, 08:36:00")
      const dateKey = order.date.includes(',') 
        ? order.date.split(',')[0] 
        : order.date.split(' ')[0];
        
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(order);
      return acc;
    }, {} as Record<string, Order[]>);
  }, [orders]);

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-6">Kelola Pesanan</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          Belum ada pesanan masuk.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {(Object.entries(groupedOrders) as [string, Order[]][]).map(([date, dayOrders]) => (
            <div key={date}>
              <div className="sticky top-16 z-10 bg-[#f8faf8]/95 backdrop-blur py-2 mb-4 border-b">
                <h3 className="font-bold text-brand-600">Pesanan: {date}</h3>
                <p className="text-xs text-gray-500">{dayOrders.length} Pesanan</p>
              </div>
              <div className="flex flex-col gap-4">
                {dayOrders.map((order) => (
                  <div key={order.id} className="border border-brand-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white hover:border-brand-500">
                    <div className="flex flex-col md:flex-row justify-between gap-4 border-b pb-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm font-bold text-gray-500">#{order.id}</span>
                          {getStatusBadge(order.status)}
                          {getMethodBadge(order.deliveryMethod)}
                        </div>
                        <div className="text-gray-900 font-semibold">{order.buyerName}</div>
                        <div className="text-xs text-gray-400 mt-1">{order.date}</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        >
                          <option value="pending">Set Pending</option>
                          <option value="processing">Proses Pesanan</option>
                          <option value="completed">Tandai Selesai</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div className="text-sm font-medium text-gray-700">Detail Item:</div>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex gap-3 bg-gray-50 p-2 rounded-xl text-sm border-l-2 border-brand-300">
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 line-clamp-1">{item.name}</div>
                              <div className="text-gray-500 mt-0.5">
                                {item.cartQuantity} x {formatIDR(item.price)}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {order.deliveryMethod === 'delivery' && order.deliveryDetails && (
                      <div className="mt-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex flex-col gap-2">
                        <div className="text-sm font-medium text-indigo-900 mb-1">Informasi Pengiriman:</div>
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">No HP:</span> {order.deliveryDetails.phone}
                        </div>
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Alamat:</span> {order.deliveryDetails.address}
                        </div>
                        {order.deliveryDetails.notes && (
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Catatan:</span> {order.deliveryDetails.notes}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-5 pt-4 border-t flex justify-end items-center gap-4">
                      <span className="text-sm text-gray-500 font-medium">Total:</span>
                      <span className="text-brand-600 font-bold text-lg">{formatIDR(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
