import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Image, SafeAreaView, ScrollView, Dimensions,
} from 'react-native';
import { ChevronLeft, Minus, Plus, Flame, CheckSquare, Square } from 'lucide-react-native';
import { MenuItem } from '../types';
import { useCartStore } from '../store/useCartStore';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH * 0.6;

interface Props {
  item: MenuItem | null;
  visible: boolean;
  onClose: () => void;
}

export default function MenuItemModal({ item, visible, onClose }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const addToCart = useCartStore((state) => state.addToCart);

  if (!item) return null;

  const handleAddToCart = () => {
    // In a real app, you would pass selectedOptions to the cart
    addToCart(item, quantity);
    setQuantity(1);
    setSelectedOptions([]);
    onClose();
  };

  const toggleOption = (optionLabel: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionLabel) 
        ? prev.filter(o => o !== optionLabel)
        : [...prev, optionLabel]
    );
  };

  const lineTotal = (Number(item.price) * quantity).toFixed(0);

  // Options are rendered dynamically from item.modifiers if they exist

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          
          {/* Curved Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={onClose}
              activeOpacity={0.8}
            >
              <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Details</Text>
            {/* Spacer for centering */}
            <View style={{ width: 40 }} />
          </View>

          {/* Image Area */}
          <View style={styles.imageContainer}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="contain" />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <Flame size={64} color={colors.textMuted} strokeWidth={1.2} />
              </View>
            )}
          </View>

          {/* Bottom Card */}
          <View style={styles.sheet}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={styles.scrollContent}>
              
              {/* Title & Price */}
              <View style={styles.titleRow}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemPrice}>Rs. {Number(item.price).toFixed(0)}</Text>
              </View>

              {/* Details Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Details</Text>
                <Text style={styles.description}>
                  {item.description || 'A delicious dish prepared with the finest ingredients and authentic spices.'}
                </Text>
              </View>

              {/* Options Section */}
              {item.modifiers && Array.isArray(item.modifiers) && item.modifiers.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Add Options:</Text>
                  <View style={styles.optionsList}>
                    {item.modifiers.map((modifierGroup: any, groupIndex: number) => (
                      <View key={groupIndex} style={{ marginBottom: 12 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
                          {modifierGroup.name}
                        </Text>
                        {modifierGroup.options?.map((option: any, index: number) => {
                          const optionId = `${groupIndex}-${index}`;
                          const isSelected = selectedOptions.includes(optionId);
                          return (
                            <TouchableOpacity 
                              key={optionId}
                              style={styles.optionRow} 
                              activeOpacity={0.7}
                              onPress={() => toggleOption(optionId)}
                            >
                              <Text style={styles.optionText}>
                                {option.label} {option.price ? `(+Rs. ${option.price})` : ''}
                              </Text>
                              {isSelected ? (
                                <CheckSquare size={20} color={colors.text} strokeWidth={2} />
                              ) : (
                                <Square size={20} color={colors.text} strokeWidth={2} />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.qtySelector}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  activeOpacity={0.8}
                >
                  <Minus color={colors.text} size={16} strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(quantity + 1)}
                  activeOpacity={0.8}
                >
                  <Plus color={colors.text} size={16} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAddToCart}
                activeOpacity={0.88}
              >
                <Text style={styles.addBtnText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
          
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // For the curved header
  },
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF', // Gray background for image area
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },

  // Image Area
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
    borderRadius: 20,
  },

  // Bottom Sheet
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  
  // Details Content
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  itemName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    paddingRight: 16,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    fontWeight: '500',
  },
  
  // Options
  optionsList: {
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32, // Extra padding for safe area bottom
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    gap: 16,
  },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 6,
    height: 50,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 16,
  },
  addBtn: {
    flex: 1,
    backgroundColor: colors.text, // Dark gray / black from reference
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
