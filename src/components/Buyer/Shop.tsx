import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { ShoppingCart, Search, Plus, Minus, X, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatIDR } from '../../utils';
import { CartModal } from './CartModal';
import { BuyerOrdersModal } from './BuyerOrdersModal';
import { ChatWidget } from '../ChatWidget';

export function Shop() {
  const { products, cart, addToCart, updateCartQty } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartItemsCount = cart.reduce((acc, item) => acc + item.cartQuantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sayuran Segar Hari Ini</h1>
          <p className="text-gray-500 mt-1 text-sm">Pilih langsung dari petani lokal</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari sayuran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-50 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
            />
          </div>
          <button
            onClick={() => setIsOrdersOpen(true)}
            title="Status Pesanan"
            className="relative p-2.5 bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ClipboardList className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
              >
                {cartItemsCount}
              </motion.span>
            )}
          </button>
        </div>
      </div>

      {/* Grid Products */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Sayuran tidak ditemukan.</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => {
            const cartItem = cart.find(item => item.id === product.id);
            return (
            <motion.div
              layout
              key={product.id}
              className="bg-white rounded-[16px] border border-brand-100 overflow-hidden hover:border-brand-500 hover:shadow-[0_8px_16px_rgba(76,175,80,0.08)] transition-all duration-200 group flex flex-col"
            >
              <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Habis
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 leading-tight mb-1">{product.name}</h3>
                  <div className="text-brand-600 font-bold">{formatIDR(product.price)}</div>
                  <div className="text-xs text-gray-500 mt-2">Sisa stok: {product.stock}</div>
                </div>
                
                {cartItem ? (
                  <div className="mt-4 flex items-center justify-center gap-4 h-10 w-full">
                    <button 
                      onClick={() => updateCartQty(product.id, -1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold font-sans cursor-pointer border border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-sm text-[#2d3436] px-1">{cartItem.cartQuantity}</span>
                    <button 
                      onClick={() => updateCartQty(product.id, 1)}
                      disabled={cartItem.cartQuantity >= product.stock}
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold font-sans cursor-pointer border border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-brand-500"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className="mt-4 w-full py-2 bg-brand-500 text-white font-bold text-xs rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:bg-gray-300 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Tambah ke Keranjang
                  </motion.button>
                )}
              </div>
            </motion.div>
          )})}
        </div>
      )}

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && <CartModal onClose={() => setIsCartOpen(false)} />}
        {isOrdersOpen && <BuyerOrdersModal onClose={() => setIsOrdersOpen(false)} />}
      </AnimatePresence>
      <ChatWidget sender="buyer" title="Chat dengan Penjual" />
    </div>
  );
}
