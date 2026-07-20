import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, SafeAreaView, StatusBar, TextInput,
} from 'react-native';
import { Search, Flame, ChevronLeft } from 'lucide-react-native';
import { getMenuData } from '../services/menu';
import { Category, MenuItem } from '../types';
import MenuItemModal from '../components/MenuItemModal';
import { MenuScreenSkeleton } from '../components/SkeletonLoaders';
import { colors } from '../theme/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type MenuRouteParams = {
  Menu: {
    categoryId?: string;
    searchQuery?: string;
  };
};

export default function MenuScreen() {
  const route = useRoute<RouteProp<MenuRouteParams, 'Menu'>>();
  const navigation = useNavigation();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(route.params?.categoryId || null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState(route.params?.searchQuery || '');

  useEffect(() => { fetchData(); }, []);

  // Update when route params change
  useEffect(() => {
    if (route.params?.categoryId) {
      setActiveCategory(route.params.categoryId);
    }
    if (route.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
    }
  }, [route.params]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMenuData();
      if (data) {
        setCategories(data.categories);
        setMenuItems(data.menuItems);
        // If no active category from params, default to "All" (null)
        if (!route.params?.categoryId) {
          setActiveCategory(null);
        }
      } else {
        setError('Failed to load menu data.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchCategory = activeCategory === null || item.categoryId === activeCategory;
    const matchSearch = searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) {
    return <MenuScreenSkeleton />;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Flame size={40} color={colors.secondary} strokeWidth={1.5} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center' }]}>
        <TouchableOpacity 
          style={{ padding: 8, marginRight: 12, marginLeft: -8 }} 
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Our Menu</Text>
          <Text style={styles.headerSub}>Explore our full selection</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Search size={16} color={colors.textMuted} strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dishes..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Pills */}
      <View style={styles.categoriesWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', name: 'All' } as Category, ...categories]}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isActive = item.id === 'all' ? activeCategory === null : activeCategory === item.id;
            return (
              <TouchableOpacity
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setActiveCategory(item.id === 'all' ? null : item.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Items Grid */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Flame size={40} color={colors.textMuted} strokeWidth={1.5} />
            <Text style={styles.emptyText}>No dishes found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setSelectedItem(item)}
            activeOpacity={0.88}
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            ) : (
              <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                <Flame size={28} color={colors.textMuted} strokeWidth={1.5} />
              </View>
            )}
            <View style={styles.cardBody}>
              <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.cardPrice}>Rs. {Number(item.price).toFixed(0)}</Text>
            </View>
            <View style={styles.addBtn}>
              <Text style={styles.addBtnText}>+</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <MenuItemModal
        item={selectedItem}
        visible={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24, backgroundColor: colors.background },
  loadingText: { color: colors.textMuted, fontSize: 15, marginTop: 8 },
  errorText: { color: colors.error, fontSize: 15, textAlign: 'center' },
  retryBtn: { backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24, marginTop: 8 },
  retryText: { color: colors.textInverse, fontWeight: '700', fontSize: 15 },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, padding: 0 },

  categoriesWrap: { backgroundColor: colors.background, paddingBottom: 4 },
  categoriesList: { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  pillTextActive: { color: colors.textInverse },

  grid: { padding: 16, paddingBottom: 100 },
  gridRow: { justifyContent: 'space-between', marginBottom: 16 },
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: { width: '100%', height: 120 },
  cardImagePlaceholder: { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: 10, paddingBottom: 6 },
  cardName: { fontSize: 13, fontWeight: '700', color: colors.text, lineHeight: 18 },
  cardPrice: { fontSize: 14, fontWeight: '800', color: colors.primary, marginTop: 4 },
  addBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { color: colors.primary, fontSize: 18, fontWeight: '800', lineHeight: 22 },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: colors.textMuted, fontSize: 16, fontWeight: '500' },
});
