import { create } from 'zustand';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface POSOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  tableNumber?: string;
  totalAmount: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  type: 'PICKUP' | 'DELIVERY' | 'DINE_IN';
  items: OrderItem[];
  isSynced: boolean;
  createdAt: string;
  source: 'WALK_IN' | 'APP' | 'WEB';
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  iconName: string;
  available: boolean;
}

export interface POSSettings {
  restaurantName: string;
  restaurantPhone: string;
  restaurantAddress: string;
  apiUrl: string;
  taxPercent: number;
  selectedPrinter: string;
  autoPrint: boolean;
  paperWidth: '58mm' | '80mm';
  showLogo: boolean;
  footerMessage: string;
}

interface POSState {
  orders: POSOrder[];
  menuItems: MenuItem[];
  settings: POSSettings;
  isOnline: boolean;
  // Orders
  setOrders: (orders: POSOrder[]) => void;
  addOrder: (order: POSOrder) => void;
  updateOrderStatus: (id: string, status: POSOrder['status']) => void;
  // Menu
  setMenuItems: (items: MenuItem[]) => void;
  toggleItemAvailability: (id: string) => void;
  // Settings
  updateSettings: (s: Partial<POSSettings>) => void;
  // Online
  setOnline: (status: boolean) => void;
}

const DEFAULT_MENU: MenuItem[] = [];

const DEFAULT_SETTINGS: POSSettings = {
  restaurantName: 'Dawat-E-Khaas',
  restaurantPhone: '+92 300 0000000',
  restaurantAddress: 'Main Boulevard, Your City',
  apiUrl: 'https://dawat-e-khaas-web.vercel.app',
  taxPercent: 0,
  selectedPrinter: '',
  autoPrint: false,
  paperWidth: '80mm',
  showLogo: true,
  footerMessage: 'Thank you for dining with us!',
};

export const usePOSStore = create<POSState>((set) => ({
  orders: [],
  menuItems: DEFAULT_MENU,
  settings: DEFAULT_SETTINGS,
  isOnline: navigator.onLine,

  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),

  setMenuItems: (items) => set({ menuItems: items }),
  toggleItemAvailability: (id) =>
    set((state) => ({
      menuItems: state.menuItems.map((m) =>
        m.id === id ? { ...m, available: !m.available } : m
      ),
    })),

  updateSettings: (s) =>
    set((state) => ({ settings: { ...state.settings, ...s } })),

  setOnline: (status) => set({ isOnline: status }),
}));
