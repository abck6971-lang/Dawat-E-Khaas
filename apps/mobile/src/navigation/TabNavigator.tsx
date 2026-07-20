import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Heart, ShoppingCart, LayoutGrid, User } from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import MenuScreen from '../screens/MenuScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CartStack from './CartStack';
import ProfileScreen from '../screens/ProfileScreen';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

// Custom floating Cart button in the center
function CustomTabBarButton({ children, onPress }: any) {
  return (
    <TouchableOpacity
      style={styles.floatingButtonWrapper}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.floatingButton}>
        {children}
      </View>
    </TouchableOpacity>
  );
}

export default function TabNavigator() {
  const cartItemsCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );
  // Read auth state to conditionally hide tab bar on Profile screen
  const customer = useAuthStore((state) => state.customer);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Favorite',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View style={{ position: 'relative' }}>
              <ShoppingCart color={colors.textInverse} size={26} />
              {cartItemsCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartItemsCount}</Text>
                </View>
              )}
            </View>
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size - 2} />,
          // Hide tab bar when user is not logged in so auth screen is full-screen
          tabBarStyle: customer ? styles.tabBar : { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
}


const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 12,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 16,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  floatingButtonWrapper: {
    top: -24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
