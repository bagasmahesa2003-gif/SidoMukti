export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

export interface CartItem extends Product {
  cartQuantity: number;
}

export interface DeliveryDetails {
  phone: string;
  address: string;
  notes: string;
}

export interface Order {
  id: string;
  buyerName: string;
  items: CartItem[];
  total: number;
  deliveryMethod: 'pickup' | 'delivery';
  deliveryDetails?: DeliveryDetails;
  status: 'pending' | 'processing' | 'completed';
  date: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'buyer' | 'admin';
  timestamp: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
