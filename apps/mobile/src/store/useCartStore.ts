import { create } from 'zustand';
import { MenuItem } from '../types';

export interface CartItem extends MenuItem {
  cartItemId: string; // Unique ID for the cart line item
  quantity: number;
}

interface CartState {
  items: CartItem[];
  orderType: 'delivery' | 'pickup';
  location: string;
  setOrderType: (type: 'delivery' | 'pickup') => void;
  setLocation: (location: string) => void;
  addToCart: (item: MenuItem, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => void;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orderType: 'delivery',
  location: '',
  
  setOrderType: (type) => set({ orderType: type }),
  setLocation: (location) => set({ location }),
  
  addToCart: (item, quantity) => set((state) => {
    // Check if exactly same item is already in cart
    const existingItemIndex = state.items.findIndex(i => i.id === item.id);
    
    if (existingItemIndex > -1) {
      const newItems = [...state.items];
      newItems[existingItemIndex].quantity += quantity;
      return { items: newItems };
    }
    
    const newItem: CartItem = {
      ...item,
      cartItemId: Math.random().toString(36).substring(7),
      quantity
    };
    return { items: [...state.items, newItem] };
  }),
  
  removeFromCart: (cartItemId) => set((state) => ({
    items: state.items.filter(item => item.cartItemId !== cartItemId)
  })),
  
  updateQuantity: (cartItemId, newQuantity) => set((state) => ({
    items: state.items.map(item => 
      item.cartItemId === cartItemId 
        ? { ...item, quantity: newQuantity }
        : item
    )
  })),
  
  clearCart: () => set({ items: [] }),
  
  getTotalItems: () => {
    // This is a getter, but Zustand computed properties can just be standard derived state where used,
    // or we return it here. Actually, it's better to calculate in the component or return a value.
    // We'll just return it directly in the component, this function isn't strictly necessary.
  },
  
  getSubtotal: () => {
    return get().items.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
  }
}));
