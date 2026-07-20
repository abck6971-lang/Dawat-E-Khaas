import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, SafeAreaView, StatusBar, Alert, ActivityIndicator, Platform
} from 'react-native';
import { ChevronLeft, Minus, Plus, Flame, ShoppingCart, Trash2 } from 'lucide-react-native';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { placeOrder } from '../services/orders';
import { CartItem } from '../types';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import LocationModal from '../components/LocationModal';

export default function CartScreen() {
  const navigation = useNavigation();
  const { items, orderType, location, updateQuantity, removeFromCart, clearCart } = useCartStore();
  const { customer } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const deliveryFee = items.length > 0 && orderType === 'delivery' ? 15 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    if (orderType === 'delivery' && (!location || !location.trim())) {
      setLocationModalVisible(true);
      return;
    }
    
    setLoading(true);
    const result = await placeOrder(
      items,
      customer?.name || 'Guest User',
      customer?.phone || '0000000000',
      orderType === 'delivery' ? location : 'Pickup from Restaurant',
      `Order Type: ${orderType.toUpperCase()}`,
      total
    );
    setLoading(false);

    if (result.success && result.orderId) {
      // Navigate first so OrderConfirmationScreen can snapshot the cart items
      navigation.navigate('OrderConfirmation' as never);
      // Then clear cart after a tiny delay to let the screen mount
      setTimeout(() => clearCart(), 100);
    } else {
      const errMsg = result.error || 'Something went wrong.';
      if (Platform.OS === 'web') {
        window.alert('Checkout Failed: ' + errMsg);
      } else {
        Alert.alert('Checkout Failed', errMsg);
      }
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartCard}>
      {/* Image Block */}
      <View style={styles.imageBlock}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Flame size={24} color={colors.textMuted} strokeWidth={1.5} />
          </View>
        )}
      </View>

      {/* Info Block */}
      <View style={styles.infoBlock}>
        {/* Top row: name + delete */}
        <View style={styles.rowBetween}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => removeFromCart(item.cartItemId)}
            activeOpacity={0.7}
          >
            <Trash2 size={14} color='#EF4444' strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Category tag */}
        <Text style={styles.itemCategory}>
          {item.category?.name || 'Dish'}
        </Text>

        {/* Bottom row: price + qty */}
        <View style={[styles.rowBetween, { marginTop: 10 }]}>
          <Text style={styles.itemPrice}>Rs. {(Number(item.price) * item.quantity).toFixed(0)}</Text>
          {/* Quantity Selector */}
          <View style={styles.qtySelector}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => {
                if (item.quantity <= 1) removeFromCart(item.cartItemId);
                else updateQuantity(item.cartItemId, item.quantity - 1);
              }}
              activeOpacity={0.7}
            >
              <Minus color={colors.text} size={12} strokeWidth={3} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQuantity(item.cartItemId, item.quantity + 1)}
              activeOpacity={0.7}
            >
              <Plus color={colors.text} size={12} strokeWidth={3} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        
        {/* Curved Header */}
        <View style={styles.header}>
           <TouchableOpacity 
             style={styles.backButton} 
             onPress={() => navigation.goBack()}
             activeOpacity={0.8}
           >
             <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>Cart</Text>
           {/* Empty view for flex balancing */}
           <View style={{ width: 40 }} />
        </View>

        {/* Cart Items List */}
        <FlatList
          data={items}
          keyExtractor={(item) => item.cartItemId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <ShoppingCart size={48} color={colors.textMuted} strokeWidth={1.5} />
              <Text style={styles.emptyText}>Your cart is empty.</Text>
            </View>
          }
        />

        {/* Bottom Checkout Card - Pinned to bottom, outside of FlatList */}
        {items.length > 0 && (
            <View style={styles.bottomCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>Rs. {subtotal.toFixed(0)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{orderType === 'delivery' ? 'Delivery Fee' : 'Pickup'}</Text>
                <Text style={styles.summaryValue}>
                  {orderType === 'pickup' ? 'Free' : `Rs. ${deliveryFee.toFixed(0)}`}
                </Text>
              </View>
              
              <View style={styles.dottedLine} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalValue}>Rs. {total.toFixed(0)}</Text>
              </View>

              <TouchableOpacity 
                style={styles.confirmBtn} 
                activeOpacity={0.9}
                onPress={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>CONFIRM ORDER</Text>
                )}
              </TouchableOpacity>
            </View>
        )}

        <LocationModal
          visible={locationModalVisible}
          onClose={() => setLocationModalVisible(false)}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Header background color
  },
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF', // Gray body background
  },
  
  // Header
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 200, // Plenty of room so last item scrolls above the summary card
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  },

  // Cart Item Card
  cartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  imageBlock: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoBlock: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  
  // Qty Selector Mini
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 12,
  },

  // Bottom Checkout Card
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 100, // Extra padding for tab bar clearance
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999, // Guarantee it sits above EVERYTHING else
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A4A4A',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  dottedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  confirmBtn: {
    backgroundColor: colors.text, // Dark gray matching reference
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
