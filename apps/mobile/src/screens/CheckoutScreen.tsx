import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useCartStore } from '../store/useCartStore';
import { placeOrder } from '../services/orders';

export default function CheckoutScreen({ navigation }: any) {
  const { items, getSubtotal, clearCart } = useCartStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderType, setOrderType] = useState<'Pickup' | 'Delivery'>('Pickup');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!phone.trim()) { setError('Please enter your phone number.'); return; }
    if (orderType === 'Delivery' && !address.trim()) { setError('Please enter your delivery address.'); return; }

    setError(null);
    setLoading(true);

    const result = await placeOrder(
      items,
      name.trim(),
      phone.trim(),
      orderType === 'Pickup' ? 'Pickup' : address.trim(),
      notes.trim(),
      total,
    );

    setLoading(false);

    if (result.success && result.orderId) {
      clearCart();
      navigation.replace('OrderConfirmation', { orderId: result.orderId });
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number *"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* Order Type Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Type</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, orderType === 'Pickup' && styles.toggleBtnActive]}
              onPress={() => setOrderType('Pickup')}
            >
              <Text style={[styles.toggleText, orderType === 'Pickup' && styles.toggleTextActive]}>
                🏃 Pickup
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, orderType === 'Delivery' && styles.toggleBtnActive]}
              onPress={() => setOrderType('Delivery')}
            >
              <Text style={[styles.toggleText, orderType === 'Delivery' && styles.toggleTextActive]}>
                🚗 Delivery
              </Text>
            </TouchableOpacity>
          </View>

          {orderType === 'Delivery' && (
            <TextInput
              style={[styles.input, styles.inputAddress]}
              placeholder="Delivery Address *"
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={2}
              value={address}
              onChangeText={setAddress}
            />
          )}
        </View>

        {/* Special Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <TextInput
            style={[styles.input, styles.inputNotes]}
            placeholder="E.g. Extra spicy, no onions..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map((item) => (
            <View key={item.cartItemId} style={styles.summaryItem}>
              <Text style={styles.summaryItemName} numberOfLines={1}>
                {item.quantity}× {item.name}
              </Text>
              <Text style={styles.summaryItemPrice}>
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (10%)</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer CTA */}
      <SafeAreaView style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderBtn, loading && styles.placeOrderBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderText}>
              Place Order · ${total.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 12,
  },
  inputAddress: {
    marginTop: 12,
    height: 70,
    textAlignVertical: 'top',
  },
  inputNotes: {
    height: 80,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#ea580c',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  toggleTextActive: {
    color: '#fff',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryItemName: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    marginRight: 8,
  },
  summaryItemPrice: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 15,
    color: '#0f172a',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ea580c',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  placeOrderBtn: {
    backgroundColor: '#ea580c',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  placeOrderBtnDisabled: {
    backgroundColor: '#fdba74',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
