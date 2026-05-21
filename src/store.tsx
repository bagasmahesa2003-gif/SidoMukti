import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  runTransaction,
} from 'firebase/firestore';

import { Product, CartItem, Order, ChatMessage, ToastMessage } from './types';
import { db } from './firebase';

interface DeliveryDetails {
  phone: string;
  address: string;
  notes: string;
}

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  messages: ChatMessage[];
  toasts: ToastMessage[];
  view: 'buyer' | 'admin';
  setView: (view: 'buyer' | 'admin') => void;

  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Cart actions
  addToCart: (product: Product) => void;
  updateCartQty: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;

  // Order actions
  createOrder: (
    buyerName: string,
    deliveryMethod: 'pickup' | 'delivery',
    deliveryDetails?: DeliveryDetails
  ) => Promise<boolean>;

  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;

  // Chat actions
  sendMessage: (text: string, sender: 'buyer' | 'admin') => void;

  // Toast actions
  addToast: (
    message: string,
    type?: 'success' | 'error' | 'info'
  ) => void;
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
    const unsubscribeProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const productsData: Product[] = [];

        snapshot.forEach((productDoc) => {
          productsData.push({
            id: productDoc.id,
            ...productDoc.data(),
          } as Product);
        });

        setProducts(productsData);
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );

    const unsubscribeOrders = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        const ordersData: Order[] = [];

        snapshot.forEach((orderDoc) => {
          ordersData.push({
            id: orderDoc.id,
            ...orderDoc.data(),
          } as Order);
        });

        ordersData.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setOrders(ordersData);
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, []);

  // Toast Actions
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const addToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    const id =
      Date.now().toString() + Math.random().toString(36).substring(2);

    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type,
      },
    ]);

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  // Product Actions
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await addDoc(collection(db, 'products'), product);
      addToast('Produk ditambahkan', 'success');
    } catch (error) {
      console.error('Failed to add product:', error);
      addToast('Gagal menambahkan produk', 'error');
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const { id, ...productData } = updatedProduct;

      await updateDoc(doc(db, 'products', id), productData);

      addToast('Produk diperbarui', 'success');
    } catch (error) {
      console.error('Failed to update product:', error);
      addToast('Gagal memperbarui produk', 'error');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      addToast('Produk dihapus', 'success');
    } catch (error) {
      console.error('Failed to delete product:', error);
      addToast('Gagal menghapus produk', 'error');
    }
  };

  // Cart Actions
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      addToast('Stok habis!', 'error');
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      if (existingItem.cartQuantity >= product.stock) {
        addToast('Tidak bisa melebihi stok!', 'error');
        return;
      }

      const updatedCart = cart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              cartQuantity: item.cartQuantity + 1,
            }
          : item
      );

      setCart(updatedCart);
      addToast('Jumlah ditambah di keranjang', 'success');
      return;
    }

    setCart([
      ...cart,
      {
        ...product,
        cartQuantity: 1,
      },
    ]);

    addToast('Masuk keranjang!', 'success');
  };

  const updateCartQty = (id: string, delta: number) => {
    const selectedItem = cart.find((item) => item.id === id);

    if (!selectedItem) return;

    const newQty = selectedItem.cartQuantity + delta;

    if (newQty > selectedItem.stock) {
      addToast('Maksimal stok tercapai', 'error');
      return;
    }

    if (newQty < 1) return;

    const updatedCart = cart.map((item) =>
      item.id === id
        ? {
            ...item,
            cartQuantity: newQty,
          }
        : item
    );

    setCart(updatedCart);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Order Actions
  const createOrder = async (
    buyerName: string,
    deliveryMethod: 'pickup' | 'delivery',
    deliveryDetails?: DeliveryDetails
  ): Promise<boolean> => {
    if (cart.length === 0) {
      addToast('Keranjang masih kosong', 'error');
      return false;
    }

    if (!buyerName.trim()) {
      addToast('Nama pembeli wajib diisi', 'error');
      return false;
    }

    if (
      deliveryMethod === 'delivery' &&
      (!deliveryDetails?.phone.trim() || !deliveryDetails?.address.trim())
    ) {
      addToast('Nomor HP dan alamat wajib diisi', 'error');
      return false;
    }

    try {
      const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;
      const orderRef = doc(db, 'orders', newOrderId);

      const cleanItems: CartItem[] = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price) || 0,
        image: item.image || '',
        stock: Number(item.stock) || 0,
        cartQuantity: Number(item.cartQuantity) || 1,
      }));

      const total = cleanItems.reduce((sum, item) => {
        return sum + item.price * item.cartQuantity;
      }, 0);

      const newOrder: Order = {
        id: newOrderId,
        buyerName: buyerName.trim(),
        items: cleanItems,
        total,
        deliveryMethod,
        status: 'pending',
        date: new Date().toLocaleString('id-ID'),
        ...(deliveryMethod === 'delivery' && deliveryDetails
          ? {
              deliveryDetails: {
                phone: deliveryDetails.phone.trim(),
                address: deliveryDetails.address.trim(),
                notes: deliveryDetails.notes?.trim() || '',
              },
            }
          : {}),
      };

      await runTransaction(db, async (transaction) => {
        const productSnapshots = await Promise.all(
          cleanItems.map(async (item) => {
            const productRef = doc(db, 'products', item.id);
            const productSnap = await transaction.get(productRef);

            return {
              item,
              productRef,
              productSnap,
            };
          })
        );

        for (const { item, productSnap } of productSnapshots) {
          if (!productSnap.exists()) {
            throw new Error(`Produk "${item.name}" tidak ditemukan.`);
          }

          const currentStock = Number(productSnap.data().stock) || 0;

          if (currentStock < item.cartQuantity) {
            throw new Error(`Stok "${item.name}" tidak cukup.`);
          }
        }

        for (const { item, productRef, productSnap } of productSnapshots) {
          const currentStock = Number(productSnap.data().stock) || 0;

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

      const errorMessage =
        error instanceof Error ? error.message : 'Gagal membuat pesanan';

      addToast(errorMessage || 'Gagal membuat pesanan', 'error');
      return false;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', id), {
        status,
      });

      addToast('Status pesanan diperbarui', 'success');
    } catch (error) {
      console.error('Failed to update order status:', error);
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
      timestamp: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const value: AppContextType = {
    products,
    cart,
    orders,
    messages,
    toasts,
    view,
    setView,
    addProduct,
    updateProduct,
    deleteProduct,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    createOrder,
    updateOrderStatus,
    sendMessage,
    addToast,
    removeToast,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }

  return context;
}