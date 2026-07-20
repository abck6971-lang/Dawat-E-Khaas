import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  SafeAreaView, TextInput, Animated
} from 'react-native';
import { X, MapPin, Navigation, Truck, ShoppingBag, CheckCircle2 } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useCartStore } from '../store/useCartStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function LocationModal({ visible, onClose }: Props) {
  const { orderType, location, setOrderType, setLocation } = useCartStore();

  const [selectedType, setSelectedType] = useState<'delivery' | 'pickup'>(orderType);
  const [address, setAddress] = useState(location);

  useEffect(() => {
    if (visible) {
      setSelectedType(orderType);
      setAddress(location);
    }
  }, [visible, orderType, location]);

  const handleSave = () => {
    setOrderType(selectedType);
    setLocation(address);
    onClose();
  };

  const isDelivery = selectedType === 'delivery';
  const canSave = isDelivery ? !!address.trim() : true;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>

          {/* ── HEADER ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerEyebrow}>WHERE TO?</Text>
              <Text style={styles.headerTitle}>Order Details</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <X size={20} color={colors.text} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>

            {/* ── MODE TOGGLE ── */}
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeCard, isDelivery && styles.modeCardActive]}
                onPress={() => setSelectedType('delivery')}
                activeOpacity={0.85}
              >
                <View style={[styles.modeIconWrap, isDelivery && styles.modeIconWrapActive]}>
                  <Truck size={22} color={isDelivery ? '#FFFFFF' : colors.textMuted} strokeWidth={2} />
                </View>
                <Text style={[styles.modeLabel, isDelivery && styles.modeLabelActive]}>Delivery</Text>
                <Text style={[styles.modeSub, isDelivery && styles.modeSubActive]}>To your door</Text>
                {isDelivery && (
                  <View style={styles.modeCheck}>
                    <CheckCircle2 size={16} color={colors.secondary} strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeCard, !isDelivery && styles.modeCardActive]}
                onPress={() => setSelectedType('pickup')}
                activeOpacity={0.85}
              >
                <View style={[styles.modeIconWrap, !isDelivery && styles.modeIconWrapActive]}>
                  <ShoppingBag size={22} color={!isDelivery ? '#FFFFFF' : colors.textMuted} strokeWidth={2} />
                </View>
                <Text style={[styles.modeLabel, !isDelivery && styles.modeLabelActive]}>Takeaway</Text>
                <Text style={[styles.modeSub, !isDelivery && styles.modeSubActive]}>No delivery fee</Text>
                {!isDelivery && (
                  <View style={styles.modeCheck}>
                    <CheckCircle2 size={16} color={colors.secondary} strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* ── DELIVERY ADDRESS ── */}
            {isDelivery ? (
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>DELIVERY ADDRESS</Text>
                <View style={[styles.inputWrap, address.trim() && styles.inputWrapFilled]}>
                  <MapPin size={18} color={address.trim() ? colors.secondary : colors.textMuted} strokeWidth={2.5} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full delivery address"
                    placeholderTextColor={colors.textMuted}
                    value={address}
                    onChangeText={setAddress}
                    multiline={false}
                  />
                </View>

                <TouchableOpacity style={styles.gpsBtn} activeOpacity={0.8}>
                  <View style={styles.gpsBtnIcon}>
                    <Navigation size={14} color={colors.secondary} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.gpsBtnText}>Use my current location</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* ── PICKUP INFO ── */
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>PICKUP LOCATION</Text>
                <View style={styles.pickupCard}>
                  <View style={styles.pickupPinWrap}>
                    <MapPin size={20} color={colors.secondary} strokeWidth={2.5} />
                  </View>
                  <View style={styles.pickupTextWrap}>
                    <Text style={styles.pickupTitle}>Dawat-E-Khaas Restaurant</Text>
                    <Text style={styles.pickupAddress}>123 Main Street, Food District</Text>
                  </View>
                  <View style={styles.pickupBadge}>
                    <Text style={styles.pickupBadgeText}>Free</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoText}>⏱  Ready in ~15 min · No delivery charges</Text>
                </View>
              </View>
            )}
          </View>

          {/* ── FOOTER ── */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!canSave}
              activeOpacity={0.9}
            >
              <Text style={styles.saveBtnText}>
                {isDelivery ? 'Confirm Address' : 'Confirm Takeaway'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1, backgroundColor: '#FAFAFA' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.secondary,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Mode Cards
  modeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  modeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    alignItems: 'flex-start',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  modeCardActive: {
    borderColor: colors.secondary,
    backgroundColor: '#FFFDF4',
  },
  modeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modeIconWrapActive: {
    backgroundColor: colors.primary,
  },
  modeLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textMuted,
    marginBottom: 2,
  },
  modeLabelActive: {
    color: colors.primary,
  },
  modeSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#BBBBBB',
  },
  modeSubActive: {
    color: colors.secondary,
  },
  modeCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
  },

  // Form
  formSection: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 58,
    borderWidth: 2,
    borderColor: '#EEEEEE',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrapFilled: {
    borderColor: colors.secondary,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#F0E8D0',
  },
  gpsBtnIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },

  // Pickup Card
  pickupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.secondary,
    gap: 12,
  },
  pickupPinWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupTextWrap: { flex: 1 },
  pickupTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 3,
  },
  pickupAddress: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  pickupBadge: {
    backgroundColor: '#D4EDDA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pickupBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A7A3B',
  },
  infoRow: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 14,
  },
  infoText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Footer
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  saveBtnDisabled: {
    backgroundColor: '#DDDDDD',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
