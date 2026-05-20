import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { motion } from 'motion/react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { formatIDR } from '../../utils';

export function CartModal({ onClose }: { onClose: () => void }) {
  const { cart, updateCartQty, removeFromCart, createOrder } = useAppStore();
  const [buyerName, setBuyerName] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const total = cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) return;
    if (deliveryMethod === 'delivery' && (!phone.trim() || !address.trim())) {
      return; // Basic validation
    }

    const deliveryDetails = deliveryMethod === 'delivery' ? { phone, address, notes } : undefined;
    createOrder(buyerName, deliveryMethod, deliveryDetails);
    onClose();
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
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-gray-900">Keranjang Belanja</h2>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-gray-50/50 flex flex-col items-center justify-center text-gray-400 gap-4">
            <ShoppingBag className="w-16 h-16 opacity-20" />
            <p>Keranjang masih kosong.</p>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto bg-gray-50/50 flex flex-col">
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-gray-100" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-sm text-gray-900 leading-tight pr-4">{item.name}</h3>
                            <button type="button" onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-brand-600 font-bold text-sm mt-1">{formatIDR(item.price)}</div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3 bg-gray-50 border rounded-lg px-2 py-1">
                            <button 
                              type="button"
                              onClick={() => updateCartQty(item.id, -1)}
                              className="hover:text-brand-600 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-medium w-4 text-center">{item.cartQuantity}</span>
                            <button 
                              type="button"
                              onClick={() => updateCartQty(item.id, 1)}
                              className="hover:text-brand-600 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border-t border-gray-100 p-5 sm:p-6 mt-auto">
                <div className="flex flex-col gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pembeli</label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pengiriman</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`flex-1 py-2 border rounded-xl text-xs font-bold transition-colors ${
                      deliveryMethod === 'pickup' 
                        ? 'border-brand-500 text-brand-600 bg-brand-50' 
                        : 'border-gray-200 text-gray-400 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Ambil Sendiri
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`flex-1 py-2 border rounded-xl text-xs font-bold transition-colors ${
                      deliveryMethod === 'delivery' 
                        ? 'border-brand-500 text-brand-600 bg-brand-50' 
                        : 'border-gray-200 text-gray-400 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Diantar
                  </button>
                </div>
              </div>

              {deliveryMethod === 'delivery' && (
                <div className="flex flex-col gap-3 mt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No HP / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0812xxxxxxx"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                    <textarea
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Detail alamat pengiriman..."
                      rows={2}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm resize-none"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Titip di pos satpam"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                    />
                  </div>
                </div>
              )}
                </div>
              </div>
            </div>

            <div className="bg-white border-t border-gray-100 p-5 sm:p-6 shrink-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between font-bold text-lg mb-4">
                <span className="text-gray-900">Total Harga</span>
                <span className="text-brand-600">{formatIDR(total)}</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!buyerName.trim()}
                className="w-full bg-brand-500 text-white font-bold py-3 rounded-xl shadow-[0_4px_14px_0_rgba(76,175,80,0.39)] mt-2 hover:bg-brand-600 transition-colors disabled:opacity-50"
              >
                Pesan Sekarang
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </>
  );
}
