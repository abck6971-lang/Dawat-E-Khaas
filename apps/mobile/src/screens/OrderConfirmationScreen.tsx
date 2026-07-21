import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Image, ScrollView,
  ActivityIndicator,
  Clipboard,
  Alert
} from 'react-native';
import { Check, Bike, Clock, Flame, Copy, ChefHat, CheckCircle2 } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { trackOrder } from '../services/orders';
import { colors } from '../theme/colors';
import { API_BASE_URL } from '../config/api';

export default function OrderConfirmationScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const orderId = route.params?.orderId;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!orderId) {
      setError('No order ID provided.');
      setLoading(false);
      return;
    }
    const result = await trackOrder(orderId);
    if (result.success && result.order) {
      setOrder(result.order);
      setError(null);
    } else {
      // Don't overwrite existing order if polling fails briefly
      if (!order) setError(result.error || 'Failed to load order.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
    // Poll every 10 seconds
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleBackToHome = () => {
    navigation.navigate('MainTabs' as never);
  };

  const copyOrderId = () => {
    if (orderId) {
      Clipboard.setString(orderId);
      Alert.alert('Copied!', 'Order ID copied to clipboard');
    }
  };

  if (loading && !order) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textMuted }}>Loading your order...</Text>
      </SafeAreaView>
    );
  }

  if (error && !order) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Flame size={40} color={colors.error} />
        <Text style={{ marginTop: 12, color: colors.error }}>{error}</Text>
        <TouchableOpacity style={styles.homeBtn} onPress={handleBackToHome}>
          <Text style={styles.homeBtnText}>Back To Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!order) return null;

  // Calculate totals
  const subtotal = order.orderItems.reduce((sum: number, item: any) => sum + (Number(item.unitPrice) * item.quantity), 0);
  const total = Number(order.totalAmount);
  const deliveryFee = total - subtotal; // Rough calculation, or just display from order if needed
  
  // Status UI mapping
  const getStatusConfig = () => {
    switch (order.status) {
      case 'PENDING':
        return {
          icon: <Clock size={24} color={colors.text} strokeWidth={2} />,
          title: 'Order Received',
          desc: 'Waiting for restaurant to confirm',
        };
      case 'PREPARING':
        return {
          icon: <ChefHat size={24} color={colors.text} strokeWidth={2} />,
          title: 'Preparing your food',
          desc: 'The chef is working on your order',
        };
      case 'COMPLETED':
        return {
          icon: <CheckCircle2 size={24} color={colors.primary} strokeWidth={2} />,
          title: 'Order Completed!',
          desc: 'Enjoy your food!',
        };
      case 'CANCELLED':
        return {
          icon: <Flame size={24} color={colors.error} strokeWidth={2} />,
          title: 'Order Cancelled',
          desc: 'This order was cancelled.',
        };
      default:
        return {
          icon: <Clock size={24} color={colors.text} strokeWidth={2} />,
          title: order.status,
          desc: 'Processing your order',
        };
    }
  };

  const statusConfig = getStatusConfig();

  const baseUrl = API_BASE_URL.replace('/api', '');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#EFEFEF" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Top Success Message */}
        <View style={styles.successHeader}>
          <View style={styles.checkCircle}>
            <Check size={32} color="#FFFFFF" strokeWidth={3} />
          </View>
          <Text style={styles.title}>Track Order</Text>
          <Text style={styles.subtitle}>Order ID: {orderId}</Text>
          <TouchableOpacity onPress={copyOrderId} style={styles.copyBtn}>
            <Copy size={14} color={colors.primary} />
            <Text style={styles.copyText}>Copy ID</Text>
          </TouchableOpacity>
        </View>

        {/* Live Status Card */}
        <View style={[styles.statusCard, { borderColor: colors.primary, borderWidth: 1 }]}>
          <View style={styles.statusIcon}>{statusConfig.icon}</View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>{statusConfig.title}</Text>
            <Text style={styles.statusDesc}>{statusConfig.desc}</Text>
          </View>
          <ActivityIndicator size="small" color={colors.primary} animating={order.status === 'PENDING' || order.status === 'PREPARING'} />
        </View>

        {/* Order Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Details</Text>
          
          {order.orderItems.map((item: any, index: number) => {
            let imgUri = item.menuItem?.imageUrl;
            if (imgUri && imgUri.startsWith('/')) imgUri = `${baseUrl}${imgUri}`;
            return (
            <View key={`${item.id}-${index}`} style={styles.itemRow}>
              <View style={styles.imageBlock}>
                {imgUri ? (
                  <Image source={{ uri: imgUri }} style={styles.itemImage} />
                ) : (
                  <Flame size={20} color={colors.textMuted} strokeWidth={1.5} />
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.menuItem?.name || 'Item'}</Text>
                <Text style={styles.itemQty}>{item.quantity} x Rs. {Number(item.unitPrice).toFixed(0)}</Text>
              </View>
              <Text style={styles.itemTotal}>
                Rs. {(item.quantity * Number(item.unitPrice)).toFixed(0)}
              </Text>
            </View>
          )})}

          <View style={styles.dottedLine} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>Rs. {subtotal.toFixed(0)}</Text>
          </View>
          {deliveryFee > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax/Fees</Text>
              <Text style={styles.summaryValue}>Rs. {deliveryFee.toFixed(0)}</Text>
            </View>
          )}
          
          <View style={styles.dottedLine} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>Rs. {total.toFixed(0)}</Text>
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
    marginBottom: 24,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#FFEADD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  copyText: {
    marginLeft: 6,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
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
