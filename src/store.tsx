import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, CartItem, Order, ChatMessage, ToastMessage } from './types';
import { initialProducts } from './data';

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  messages: ChatMessage[];
  toasts: ToastMessage[];
  view: 'buyer' | 'admin';
  setView: (view: 'buyer' | 'admin') => void;
  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  // Cart actions
  addToCart: (product: Product) => void;
  updateCartQty: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  // Order actions
  createOrder: (buyerName: string, deliveryMethod: 'pickup' | 'delivery', deliveryDetails?: { phone: string, address: string, notes: string }) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  // Chat actions
  sendMessage: (text: string, sender: 'buyer' | 'admin') => void;
  // Toast actions
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<'buyer' | 'admin'>('buyer');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Helpers
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Product Actions
  const addProduct = (p: Omit<Product, 'id'>) => {
    const newProduct = { ...p, id: Date.now().toString() };
    setProducts((prev) => [...prev, newProduct]);
    addToast('Produk ditambahkan', 'success');
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    addToast('Produk diperbarui', 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('Produk dihapus', 'success');
  };

  // Cart Actions
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      addToast('Stok habis!', 'error');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.stock) {
          addToast('Tidak bisa melebihi stok!', 'error');
          return prev;
        }
        addToast('Jumlah ditambah di keranjang', 'success');
        return prev.map((item) =>
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      }
      addToast('Masuk keranjang!', 'success');
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.cartQuantity + delta;
          if (newQty > item.stock) {
            addToast('Maksimal stok tercapai', 'error');
            return item;
          }
          if (newQty < 1) return item; // Handled by remove
          return { ...item, cartQuantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  // Order Actions
  const createOrder = (buyerName: string, deliveryMethod: 'pickup' | 'delivery', deliveryDetails?: { phone: string, address: string, notes: string }) => {
    if (cart.length === 0) return;
    
    // Decrease stock
    setProducts((prev) => 
      prev.map((p) => {
        const cartItem = cart.find((c) => c.id === p.id);
        if (cartItem) {
          return { ...p, stock: p.stock - cartItem.cartQuantity };
        }
        return p;
      })
    );

    const total = cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);
    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      buyerName,
      items: cart,
      total,
      deliveryMethod,
      deliveryDetails,
      status: 'pending',
      date: new Date().toLocaleString('id-ID'),
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    addToast('Pesanan berhasil dibuat!', 'success');
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    addToast(`Status pesanan diperbarui`, 'success');
  };

  // Chat Actions
  const sendMessage = (text: string, sender: 'buyer' | 'admin') => {
    if (!text.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const value = {
    products, cart, orders, messages, toasts, view, setView,
    addProduct, updateProduct, deleteProduct,
    addToCart, updateCartQty, removeFromCart, clearCart,
    createOrder, updateOrderStatus,
    sendMessage, addToast, removeToast
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
