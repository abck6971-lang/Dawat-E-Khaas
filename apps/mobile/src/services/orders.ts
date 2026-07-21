import { API_BASE_URL } from '../config/api';
import { CartItem } from '../store/useCartStore';

export interface PlaceOrderPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  totalAmount: number;
  items: Array<{
    id: string;
    qty: number;
    price: number;
  }>;
}

export interface PlaceOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export async function placeOrder(
  cartItems: CartItem[],
  customerName: string,
  email: string,
  phone: string,
  address: string,
  notes: string,
  totalAmount: number,
): Promise<PlaceOrderResult> {
  try {
    const payload: PlaceOrderPayload = {
      name: customerName,
      email,
      phone,
      address,
      notes,
      totalAmount,
      items: cartItems.map((item) => ({
        id: item.id,
        qty: item.quantity,
        price: Number(item.price),
      })),
    };

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to place order.' };
    }

    return { success: true, orderId: data.orderId };
  } catch (error) {
    console.error('Error placing order:', error);
    return { success: false, error: 'Network error. Please check your connection.' };
  }
}

export interface TrackOrderResult {
  success: boolean;
  order?: any;
  error?: string;
}

export async function trackOrder(orderId: string): Promise<TrackOrderResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/track/${orderId}`);
    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to track order' };
    }
    
    return { success: true, order: data };
  } catch (error) {
    console.error('Error tracking order:', error);
    return { success: false, error: 'Network error. Please check your connection.' };
  }
}
