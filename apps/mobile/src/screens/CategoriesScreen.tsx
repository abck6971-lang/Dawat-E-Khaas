import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, Dimensions, ActivityIndicator
} from 'react-native';
import { ChevronLeft, Coffee, Utensils, Pizza, Beef, Leaf } from 'lucide-react-native';
import { getMenuData } from '../services/menu';
import { Category } from '../types';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { CategoriesScreenSkeleton } from '../components/SkeletonLoaders';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Calculate card width for a 2-column grid with padding
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;
// Taller pill shape
const CARD_HEIGHT = CARD_WIDTH * 1.5;

// Helper to pick an icon based on category name
const getCategoryIcon = (name: string, color: string, size: number) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('burger')) return <Utensils color={color} size={size} strokeWidth={1.5} />;
  if (lowerName.includes('pizza')) return <Pizza color={color} size={size} strokeWidth={1.5} />;
  if (lowerName.includes('bbq') || lowerName.includes('meat') || lowerName.includes('mutton') || lowerName.includes('beef')) return <Beef color={color} size={size} strokeWidth={1.5} />;
  if (lowerName.includes('salad') || lowerName.includes('veg')) return <Leaf color={color} size={size} strokeWidth={1.5} />;
  if (lowerName.includes('drink') || lowerName.includes('beverage') || lowerName.includes('tea') || lowerName.includes('coffee')) return <Coffee color={color} size={size} strokeWidth={1.5} />;
  
  // Default fallback icon
  return <Utensils color={color} size={size} strokeWidth={1.5} />;
};

export default function CategoriesScreen() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await getMenuData();
        if (data && data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={[styles.card, { width: CARD_WIDTH, height: CARD_HEIGHT }]} 
      activeOpacity={0.88}
      onPress={() => navigation.navigate('Menu' as never, { categoryId: item.id } as never)}
    >
      <View style={styles.iconCircle}>
        {getCategoryIcon(item.name, colors.text, 36)}
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>
        {item.name.toUpperCase()}
      </Text>
    </TouchableOpacity>
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
           <Text style={styles.headerTitle}>Categories</Text>
           {/* Empty view for flex balancing */}
           <View style={{ width: 40 }} /> 
        </View>

        {loading ? (
          <CategoriesScreenSkeleton />
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            columnWrapperStyle={styles.rowWrapper}
            showsVerticalScrollIndicator={false}
            renderItem={renderCategoryItem}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>No categories found.</Text>
              </View>
            }
          />
        )}
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
    backgroundColor: '#EFEFEF', // Light gray body background
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Space for bottom tab bar
  },
  rowWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 40, // Pill shape
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24, // Push text to bottom
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  }
});
