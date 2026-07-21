import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MapPin, Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

export default function TrackOrderScreen() {
  const navigation = useNavigation<any>();
  const [orderId, setOrderId] = useState('');

  const handleTrack = () => {
    if (orderId.trim()) {
      navigation.navigate('OrderConfirmation', { orderId: orderId.trim() });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <MapPin size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Track Your Order</Text>
          <Text style={styles.subtitle}>
            Enter your Order ID below to check the real-time status of your food.
          </Text>

          <View style={styles.inputContainer}>
            <Search size={20} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. cm0abc1234567..."
              placeholderTextColor="#9ca3af"
              value={orderId}
              onChangeText={setOrderId}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.trackBtn, !orderId.trim() && styles.trackBtnDisabled]}
            onPress={handleTrack}
            disabled={!orderId.trim()}
          >
            <Text style={styles.trackBtnText}>Track Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.text,
  },
  trackBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  trackBtnDisabled: {
    backgroundColor: '#d1d5db',
  },
  trackBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    padding: 8,
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
});
