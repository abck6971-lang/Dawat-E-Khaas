'use client';
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { MenuItem } from '@/components/Menu/Menu';

export interface CartItem extends MenuItem {
  cartItemId: string; // Unique ID for this specific customized item
  qty: number;
  spiceLevel?: string;
  addOns?: { name: string; price: number }[];
  specialInstructions?: string;
  customPrice: number; // Base price + add-ons
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: MenuItem, customizations?: { spiceLevel?: string; addOns?: {name: string, price: number}[]; specialInstructions?: string; customPrice?: number }) => void;
  changeQty: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  lastOrderId: string | null;
  setLastOrderId: (id: string) => void;
  orderType: 'delivery' | 'pickup' | null;
  setOrderType: (type: 'delivery' | 'pickup' | null) => void;
  location: string;
  setLocation: (loc: string) => void;
  isLocationModalOpen: boolean;
  setLocationModalOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [lastOrderId, setLastOrderIdState] = useState<string | null>(null);
  const [orderType, setOrderTypeState] = useState<'delivery' | 'pickup' | null>(null);
  const [location, setLocationState] = useState('');
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('dawat_cart');
      if (savedCart) setCartItems(JSON.parse(savedCart));

      const savedOrderId = localStorage.getItem('dawat_last_order');
      if (savedOrderId) setLastOrderIdState(savedOrderId);

      const savedType = localStorage.getItem('dawat_order_type') as 'delivery' | 'pickup' | null;
      const savedLoc = localStorage.getItem('dawat_location');
      
      if (savedType) setOrderTypeState(savedType);
      if (savedLoc) setLocationState(savedLoc);

      // If no order type is set on first load, wait for splash screen (2.6s) then open modal
      if (!savedType) {
        setTimeout(() => {
          setLocationModalOpen(true);
        }, 2600);
      }
    } catch {}
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dawat_cart', JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  const addToCart = useCallback((item: MenuItem, cust?: { spiceLevel?: string; addOns?: {name: string, price: number}[]; specialInstructions?: string; customPrice?: number }) => {
    setCartItems(prev => {
      // If no customizations, we can try to stack it with an identical non-customized item
      if (!cust) {
        const existing = prev.find(i => i.id === item.id && !i.spiceLevel && !i.addOns?.length && !i.specialInstructions);
        if (existing) {
          return prev.map(i => i.cartItemId === existing.cartItemId ? { ...i, qty: i.qty + 1 } : i);
        }
        return [...prev, { ...item, cartItemId: item.id + '-' + Date.now(), qty: 1, customPrice: Number(item.price) }];
      }

      // For customized items, we always add them as a new distinct row (unless we want to deep compare, but unique rows is safer)
      const newItem: CartItem = {
        ...item,
        cartItemId: item.id + '-' + Date.now() + Math.floor(Math.random() * 1000),
        qty: 1,
        spiceLevel: cust.spiceLevel,
        addOns: cust.addOns,
        specialInstructions: cust.specialInstructions,
        customPrice: cust.customPrice ?? Number(item.price),
      };
      return [...prev, newItem];
    });
    setCartOpen(true);
  }, []);

  const changeQty = useCallback((cartItemId: string, delta: number) => {
    setCartItems(prev =>
      prev.map(i => i.cartItemId === cartItemId ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setCartItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const setLastOrderId = useCallback((id: string) => {
    setLastOrderIdState(id);
    try { localStorage.setItem('dawat_last_order', id); } catch {}
  }, []);

  const setOrderType = useCallback((type: 'delivery' | 'pickup' | null) => {
    setOrderTypeState(type);
    try { 
      if (type) localStorage.setItem('dawat_order_type', type); 
      else localStorage.removeItem('dawat_order_type');
    } catch {}
  }, []);

  const setLocation = useCallback((loc: string) => {
    setLocationState(loc);
    try { localStorage.setItem('dawat_location', loc); } catch {}
  }, []);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cartItems.reduce((s, i) => s + (i.customPrice || Number(i.price)) * i.qty, 0);

  return (
    <CartContext.Provider value={{
      cartItems, cartCount, cartTotal,
      addToCart, changeQty, removeItem, clearCart,
      isCartOpen, setCartOpen,
      lastOrderId, setLastOrderId,
      orderType, setOrderType,
      location, setLocation,
      isLocationModalOpen, setLocationModalOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
