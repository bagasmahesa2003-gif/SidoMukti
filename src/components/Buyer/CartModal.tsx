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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0
  );

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!buyerName.trim()) return;

    if (deliveryMethod === 'delivery' && (!phone.trim() || !address.trim())) {
      return;
    }

    const deliveryDetails =
      deliveryMethod === 'delivery'
        ? {
            phone,
            address,
            notes,
          }
        : undefined;

    setIsSubmitting(true);

    const success = await createOrder(
      buyerName,
      deliveryMethod,
      deliveryDetails
    );

    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[90vh] overflow-y-auto p-5"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            Keranjang Belanja
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <ShoppingBag size={24} />
            </div>

            <p className="text-sm text-gray-500">
              Keranjang masih kosong.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="space-y-5">
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-white"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-gray-900 truncate">
                          {item.name}
                        </h3>

                        <p className="text-sm text-brand-600 font-semibold">
                          {formatIDR(item.price)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.id, -1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:text-brand-600 transition-colors"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="text-sm font-bold min-w-4 text-center">
                        {item.cartQuantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateCartQty(item.id, 1)}
                        disabled={item.cartQuantity >= item.stock}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:text-brand-600 transition-colors disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Nama Pembeli
              </label>

              <input
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Masukkan nama Anda"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Metode Pengiriman
              </label>

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
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">
                    No HP / WhatsApp
                  </label>

                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812xxxxxxx"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">
                    Alamat Lengkap
                  </label>

                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Detail alamat pengiriman..."
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">
                    Catatan Tambahan
                  </label>

                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: titip di pos satpam"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">Total Harga</span>
              <span className="text-lg font-bold text-gray-900">
                {formatIDR(total)}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Memproses...' : 'Pesan Sekarang'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}