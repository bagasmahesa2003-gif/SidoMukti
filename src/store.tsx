import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, CartItem, Order, ChatMessage, ToastMessage } from './types';
import { db } from './firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  runTransaction,
} from 'firebase/firestore';

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
  createOrder: (
  buyerName: string,
  deliveryMethod: 'pickup' | 'delivery',
  deliveryDetails?: { phone: string; address: string; notes: string }
) => Promise<boolean>;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), 
      (snapshot) => {
        const productsData: Product[] = [];
        snapshot.forEach((doc) => {
          productsData.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(productsData);
      },
      (error) => {
        console.error("Error fetching products:", error);
      }
    );

    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), 
      (snapshot) => {
        const ordersData: Order[] = [];
        snapshot.forEach((doc) => {
          ordersData.push({ id: doc.id, ...doc.data() } as Order);
        });
        // Sort by date descending (newest first)
        ordersData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(ordersData);
      },
      (error) => {
        console.error("Error fetching orders:", error);
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, []);

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
  const addProduct = async (p: Omit<Product, 'id'>) => {
    try {
      await addDoc(collection(db, 'products'), p);
      addToast('Produk ditambahkan', 'success');
    } catch (error) {
      addToast('Gagal menambahkan produk', 'error');
    }
  };

  const updateProduct = async (updated: Product) => {
    try {
      const { id, ...data } = updated;
      await updateDoc(doc(db, 'products', id), data);
      addToast('Produk diperbarui', 'success');
    } catch (error) {
      addToast('Gagal memperbarui produk', 'error');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      addToast('Produk dihapus', 'success');
    } catch (error) {
      addToast('Gagal menghapus produk', 'error');
    }
  };

  // Cart Actions
const addToCart = (product: Product) => {
  if (product.stock <= 0) {
    addToast('Stok habis!', 'error');
    return;
  }

  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    if (existing.cartQuantity >= product.stock) {
      addToast('Tidak bisa melebihi stok!', 'error');
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === product.id
          ? { ...item, cartQuantity: item.cartQuantity + 1 }
          : item
      )
    );

    addToast('Jumlah ditambah di keranjang', 'success');
    return;
  }

  setCart([...cart, { ...product, cartQuantity: 1 }]);
  addToast('Masuk keranjang!', 'success');
};

  const updateCartQty = (id: string, delta: number) => {
  const item = cart.find((item) => item.id === id);

  if (!item) return;

  const newQty = item.cartQuantity + delta;

  if (newQty > item.stock) {
    addToast('Maksimal stok tercapai', 'error');
    return;
  }

  if (newQty < 1) return;

  setCart(
    cart.map((item) =>
      item.id === id
        ? { ...item, cartQuantity: newQty }
        : item
    )
  );
};

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  // Order Actions
const createOrder = async (
  buyerName: string,
  deliveryMethod: 'pickup' | 'delivery',
  deliveryDetails?: { phone: string; address: string; notes: string }
): Promise<boolean> => {
  if (cart.length === 0) {
    addToast('Keranjang masih kosong', 'error');
    return false;
  }

  try {
    const orderRef = doc(collection(db, 'orders'));
    const newOrderId = orderRef.id;

    const cleanItems = cart.map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price) || 0,
      image: item.image || '',
      stock: Number(item.stock) || 0,
      cartQuantity: Number(item.cartQuantity) || 1,
    }));

    const newOrder = {
      id: newOrderId,
      buyerName: buyerName.trim(),
      items: cleanItems,
      total: cleanItems.reduce(
        (sum, item) => sum + item.price * item.cartQuantity,
        0
      ),
      deliveryMethod,
      ...(deliveryMethod === 'delivery' && deliveryDetails
        ? {
            deliveryDetails: {
              phone: deliveryDetails.phone.trim(),
              address: deliveryDetails.address.trim(),
              notes: deliveryDetails.notes?.trim() || '',
            },
          }
        : {}),
      status: 'pending' as const,
      date: new Date().toLocaleString('id-ID'),
    };

    await runTransaction(db, async (transaction) => {
      for (const item of cleanItems) {
        const productRef = doc(db, 'products', item.id);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error(`Produk "${item.name}" tidak ditemukan.`);
        }

        const currentStock = Number(productSnap.data().stock) || 0;

        if (currentStock < item.cartQuantity) {
          throw new Error(`Stok "${item.name}" tidak cukup.`);
        }

        transaction.update(productRef, {
          stock: currentStock - item.cartQuantity,
        });
      }

      transaction.set(orderRef, newOrder);
    });

    clearCart();
    addToast('Pesanan berhasil dibuat!', 'success');
    return true;
  } catch (error) {
    console.error('Failed to create order:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Gagal membuat pesanan';

    addToast(message || 'Gagal membuat pesanan', 'error');
    return false;
  }
};

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      addToast(`Status pesanan diperbarui`, 'success');
    } catch (error) {
      console.error('Failed to update order status', error);
      addToast('Gagal memperbarui status pesanan', 'error');
    }
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
