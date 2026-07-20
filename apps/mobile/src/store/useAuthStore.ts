import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthCustomer } from '../services/auth';

const TOKEN_KEY = 'dek_token';
const CUSTOMER_KEY = 'dek_customer';

interface AuthState {
  token: string | null;
  customer: AuthCustomer | null;
  isLoading: boolean;
  login: (token: string, customer: AuthCustomer) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  customer: null,
  isLoading: true,

  login: async (token, customer) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
    set({ token, customer });
  },

  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(CUSTOMER_KEY);
    set({ token: null, customer: null });
  },

  loadFromStorage: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const customerJson = await AsyncStorage.getItem(CUSTOMER_KEY);
      if (token && customerJson) {
        set({ token, customer: JSON.parse(customerJson) });
      }
    } catch {
      // ignore storage errors
    } finally {
      set({ isLoading: false });
    }
  },
}));
