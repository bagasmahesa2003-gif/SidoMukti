import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Product } from '../../types';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import { formatIDR } from '../../utils';
import { motion, AnimatePresence } from 'motion/react';

export function ProductManager() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    image: '',
  });

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormData({ name: '', price: '', stock: '', image: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingItem(p);
    setFormData({
      name: p.name,
      price: p.price.toString(),
      stock: p.stock.toString(),
      image: p.image,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      price: parseInt(formData.price) || 0,
      stock: parseInt(formData.stock) || 0,
      image: formData.image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
    };

    if (editingItem) {
      updateProduct({ ...payload, id: editingItem.id });
    } else {
      addProduct(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">Daftar Sayuran</h2>
        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah 
        </button>
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b">
            <tr>
              <th className="px-4 py-3">Produk</th>
              <th className="px-4 py-3">Harga</th>
              <th className="px-4 py-3">Stok</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                  <span className="font-medium text-gray-900">{p.name}</span>
                </td>
                <td className="px-4 py-3 text-brand-600 font-medium">{formatIDR(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                    p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenEdit(p)} className="p-1.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  Belum ada produk. Silakan tambahkan produk baru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold">{editingItem ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sayuran</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                    <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                    <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar (Opsional)</label>
                  <input type="url" placeholder="https://..." value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 text-sm" />
                </div>

                <div className="mt-4 pt-4 border-t flex justify-end">
                  <button type="submit" className="bg-brand-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-brand-600">
                    Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
