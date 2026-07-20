import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Image, ScrollView
} from 'react-native';
import { Check, Bike, Clock, Flame } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../store/useCartStore';
import { colors } from '../theme/colors';
import { CartItem } from '../types';

export default function OrderConfirmationScreen() {
  const navigation = useNavigation();
  const { items, orderType, clearCart } = useCartStore();
  
  // We snapshot the cart items into local state when the screen loads
  // so that if we clear the global cart, the screen still shows what was ordered.
  const [orderedItems] = useState<CartItem[]>(items);
  const [snapshotOrderType] = useState(orderType);
  
  const subtotal = orderedItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const deliveryFee = orderedItems.length > 0 && snapshotOrderType === 'delivery' ? 15 : 0;
  const total = subtotal + deliveryFee;

  const handleBackToHome = () => {
    // Navigate back to the tab navigator (Home tab)
    navigation.navigate('MainTabs' as never);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#EFEFEF" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Top Success Message */}
        <View style={styles.successHeader}>
          <View style={styles.checkCircle}>
            <Check size={32} color="#FFFFFF" strokeWidth={3} />
          </View>
          <Text style={styles.title}>Order Confirmed!</Text>
          <Text style={styles.subtitle}>Thank you! Your order has been{"\n"}placed Successfully.</Text>
        </View>

        {/* Order Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Details</Text>
          
          {orderedItems.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.itemRow}>
              <View style={styles.imageBlock}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                ) : (
                  <Flame size={20} color={colors.textMuted} strokeWidth={1.5} />
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>{item.quantity} x Rs. {Number(item.price).toFixed(0)}</Text>
              </View>
              <Text style={styles.itemTotal}>
                Rs. {(item.quantity * Number(item.price)).toFixed(0)}
              </Text>
            </View>
          ))}

          <View style={styles.dottedLine} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>Rs. {subtotal.toFixed(0)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{snapshotOrderType === 'delivery' ? 'Delivery Fee' : 'Pickup'}</Text>
            <Text style={styles.summaryValue}>{snapshotOrderType === 'pickup' ? 'Free' : `Rs. ${deliveryFee.toFixed(0)}`}</Text>
          </View>
          
          <View style={styles.dottedLine} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>Rs. {total.toFixed(0)}</Text>
          </View>
        </View>

        {/* Status Cards */}
        <View style={styles.statusCard}>
          <Bike size={24} color={colors.text} strokeWidth={2} style={styles.statusIcon} />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>Your order is on its way!</Text>
            <Text style={styles.statusDesc}>We'll notify you when your rider is in nearby</Text>
          </View>
        </View>

        <View style={styles.statusCard}>
          <Clock size={24} color={colors.text} strokeWidth={2} style={styles.statusIcon} />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>Estimated Delivery Time</Text>
            <Text style={styles.statusDesc}>25 - 35 min</Text>
          </View>
        </View>

        {/* Back To Home Button */}
        <TouchableOpacity 
          style={styles.homeBtn} 
          activeOpacity={0.9}
          onPress={handleBackToHome}
        >
          <Text style={styles.homeBtnText}>Back To Home</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EFEFEF', // Match body background
  },
  container: {
    padding: 16,
    paddingTop: 40,
    paddingBottom: 100, // Room for bottom tab
  },

  // Success Header
  successHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4A4A4A', // Dark gray from reference
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Details Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageBlock: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  dottedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    marginVertical: 12,
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

  // Status Cards
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statusIcon: {
    marginRight: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusDesc: {
    fontSize: 13,
    color: '#888888',
  },

  // Bottom Button
  homeBtn: {
    backgroundColor: '#4A4A4A', // Dark gray matching reference
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  homeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
