import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import {
  MapPin,
  Bell,
  Search,
  Flame,
  Soup,
  Wheat,
  Fish,
  Salad,
  Heart,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  Beef,
  Coffee,
  Pizza,
  Sandwich,
  IceCreamCone,
  Cookie,
  Drumstick,
  Utensils,
  LeafyGreen,
  Croissant,
} from 'lucide-react-native';
import { getMenuData } from '../services/menu';
import { Category, MenuItem } from '../types';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFavoriteStore } from '../store/useFavoriteStore';
import { useCartStore } from '../store/useCartStore';
import MenuItemModal from '../components/MenuItemModal';
import LocationModal from '../components/LocationModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;

// Map category names to distinct, contextual icons
const CATEGORY_ICONS: Record<string, any> = {
  // Meat / Grill
  'BBQ':       Flame,
  'Grill':     Flame,
  'Karahi':    Flame,
  // Burgers
  'Burgers':   Beef,
  'Burger':    Beef,
  // Biryani / Rice
  'Biryani':   Wheat,
  'Rice':      Wheat,
  // Desi / Pakistani
  'Desi':      Drumstick,
  'Pakistani': Drumstick,
  // Beverages / Drinks
  'Beverages': Coffee,
  'Drinks':    Coffee,
  'Juices':    Coffee,
  // Pizza
  'Pizza':     Pizza,
  // Wraps / Sandwiches
  'Wraps':     Sandwich,
  'Sandwiches':Sandwich,
  // Seafood
  'Seafood':   Fish,
  // Soups
  'Soups':     Soup,
  'Soup':      Soup,
  // Salads
  'Salads':    LeafyGreen,
  'Salad':     LeafyGreen,
  // Desserts
  'Desserts':  IceCreamCone,
  'Sweets':    IceCreamCone,
  // Snacks
  'Snacks':    Cookie,
  // Pasta
  'Pasta':     Utensils,
  // Bakery
  'Bakery':    Croissant,
  'Breads':    Croissant,
};
const DEFAULT_ICON = Utensils;

const getCategoryIcon = (name: string) => {
  const titleCase = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  return (
    CATEGORY_ICONS[name] ||                  // exact: "BBQ"
    CATEGORY_ICONS[name.toLowerCase()] ||    // lower: "bbq"
    CATEGORY_ICONS[titleCase] ||             // title: "Bbq"
    DEFAULT_ICON
  );
};

// ── SKELETON LOADER ──────────────────────────────────────────────────────────
function SkeletonBox({ style }: { style?: any }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.85] });

  return (
    <Animated.View
      style={[{ backgroundColor: '#E0E0E0', borderRadius: 12, opacity }, style]}
    />
  );
}

function SkeletonLoader() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
        scrollEnabled={false}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
          <View>
            <SkeletonBox style={{ width: 90, height: 11, marginBottom: 8, borderRadius: 6 }} />
            <SkeletonBox style={{ width: 180, height: 22, borderRadius: 8 }} />
          </View>
          <SkeletonBox style={{ width: 44, height: 44, borderRadius: 22 }} />
        </View>

        {/* Search Bar */}
        <SkeletonBox style={{ marginHorizontal: 20, height: 56, borderRadius: 16, marginBottom: 24 }} />

        {/* Hero Banner */}
        <SkeletonBox style={{ marginHorizontal: 20, height: 160, borderRadius: 20, marginBottom: 24 }} />

        {/* Section title */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 14 }}>
          <SkeletonBox style={{ width: 130, height: 18, borderRadius: 8 }} />
          <SkeletonBox style={{ width: 50, height: 16, borderRadius: 8 }} />
        </View>

        {/* Category Pills */}
        <View style={{ flexDirection: 'row', paddingLeft: 20, gap: 12, marginBottom: 28 }}>
          {[80, 70, 85, 75].map((w, i) => (
            <View key={i} style={{ alignItems: 'center', gap: 8 }}>
              <SkeletonBox style={{ width: 72, height: 72, borderRadius: 18 }} />
              <SkeletonBox style={{ width: w * 0.7, height: 11, borderRadius: 6 }} />
            </View>
          ))}
        </View>

        {/* Section title */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 14 }}>
          <SkeletonBox style={{ width: 110, height: 18, borderRadius: 8 }} />
          <SkeletonBox style={{ width: 50, height: 16, borderRadius: 8 }} />
        </View>

        {/* Featured Cards Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 }}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={{ width: (SCREEN_WIDTH - 52) / 2, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <SkeletonBox style={{ width: '100%', height: 130, borderRadius: 0 }} />
              <View style={{ padding: 12, gap: 8 }}>
                <SkeletonBox style={{ width: '50%', height: 11, borderRadius: 6 }} />
                <SkeletonBox style={{ width: '85%', height: 15, borderRadius: 6 }} />
                <SkeletonBox style={{ width: '40%', height: 13, borderRadius: 6 }} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<any>>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const { orderType, location } = useCartStore();
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMenuData();
      if (data) {
        setCategories(data.categories);
        setFeaturedItems(data.menuItems.slice(0, 6)); // Display first 6 as popular
      } else {
        setError('Failed to load menu data.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Menu' as never, { searchQuery: searchQuery.trim() } as never);
      setSearchQuery(''); // clear it so coming back it's clean
    }
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderCategory = ({ item }: { item: Category }) => {
    const IconComponent = getCategoryIcon(item.name);
    return (
      <TouchableOpacity 
        style={styles.categoryCard} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Menu' as never, { categoryId: item.id } as never)}
      >
        <View style={styles.categoryIconWrap}>
          <IconComponent size={28} color={colors.primary} strokeWidth={1.5} />
        </View>
        <Text style={styles.categoryLabel} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFeaturedItem = ({ item }: { item: MenuItem }) => {
    const isFav = isFavorite(item.id);
    return (
      <TouchableOpacity 
        style={[styles.featuredCard, { width: CARD_WIDTH }]} 
        activeOpacity={0.88}
        onPress={() => setSelectedItem(item)}
      >
        <View style={styles.featuredImageWrap}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.featuredImage} />
          ) : (
            <View style={[styles.featuredImage, styles.imagePlaceholder]}>
              <Flame size={32} color={colors.textMuted} strokeWidth={1.5} />
            </View>
          )}
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => toggleFavorite(item.id)}
            activeOpacity={0.8}
          >
            <Heart
              size={16}
              color={isFav ? colors.secondary : colors.textMuted}
              fill={isFav ? colors.secondary : 'transparent'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.featuredContent}>
          <Text style={styles.featuredCategory} numberOfLines={1}>
            {item.category?.name ?? 'Special'}
          </Text>
          <Text style={styles.featuredName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.featuredPrice}>Rs. {Number(item.price).toFixed(0)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerLeft} 
            activeOpacity={0.7}
            onPress={() => setLocationModalVisible(true)}
          >
            <Text style={styles.locationLabel}>{orderType === 'delivery' ? 'Delivering to' : 'Pickup from'}</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationValue} numberOfLines={1}>
                {orderType === 'delivery' ? (location || 'Set your location') : 'Dawat-E-Khaas'}
              </Text>
              <ChevronDown size={18} color={colors.secondary} style={{ marginLeft: 4, marginTop: 2 }} strokeWidth={3} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>
            <Bell size={20} color={colors.primary} strokeWidth={2} />
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>

        {/* ── SEARCH BAR ── */}
        <View style={styles.searchBar}>
          <Search size={20} color={colors.textMuted} strokeWidth={2.5} />
          <TextInput
            style={styles.searchInput}
            placeholder="What are you craving?"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <View style={styles.searchDivider} />
          <TouchableOpacity activeOpacity={0.7}>
            <SlidersHorizontal size={20} color={colors.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* ── HERO BANNER ── */}
        <View style={styles.heroBanner}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?q=80&w=1200&auto=format&fit=crop' }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTag}>LIMITED OFFER</Text>
            <Text style={styles.heroTitle}>20% Off Today</Text>
            <Text style={styles.heroSub}>On all Karahi & BBQ dishes</Text>
            <TouchableOpacity style={styles.heroBtn} activeOpacity={0.85}>
              <Text style={styles.heroBtnText}>Order Now</Text>
              <ChevronRight size={14} color={colors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── MAIN CATEGORIES ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Main Categories</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Categories' as never)}>
              <Text style={styles.sectionMore}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={renderCategory}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* ── POPULAR NOW ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Now</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Menu' as never)}>
              <Text style={styles.sectionMore}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={featuredItems}
            keyExtractor={(item) => item.id}
            renderItem={renderFeaturedItem}
            contentContainerStyle={styles.featuredList}
          />
        </View>
      </ScrollView>

        <MenuItemModal
          item={selectedItem}
          visible={selectedItem !== null}
          onClose={() => setSelectedItem(null)}
        />
        <LocationModal
          visible={locationModalVisible}
          onClose={() => setLocationModalVisible(false)}
        />
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
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 12,
    padding: 24,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  retryText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },

  // ── HEADER ──
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: { flex: 1, justifyContent: 'center' },
  locationLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  // ── SEARCH ──
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(10, 28, 18, 0.08)', // subtle green border
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
    marginLeft: 10,
    height: '100%',
  },
  searchDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 12,
  },

  // ── HERO BANNER ──
  heroBanner: {
    marginHorizontal: 20,
    marginBottom: 4,
    borderRadius: 20,
    overflow: 'hidden',
    height: 160,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 28, 18, 0.62)',
    padding: 20,
    justifyContent: 'center',
  },
  heroTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: 1.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textInverse,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 12,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
  },
  heroBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },

  // ── SECTIONS ──
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  sectionMore: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondary,
  },

  // ── CATEGORIES ──
  categoryList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    alignItems: 'center',
    gap: 8,
    marginRight: 12,
  },
  categoryIconWrap: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: 'rgba(200, 168, 75, 0.12)', // Light gold tint
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(200, 168, 75, 0.25)', // Subtle gold border
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    maxWidth: 70,
  },

  // ── FEATURED CARDS ──
  featuredList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  featuredCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  featuredImageWrap: {
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: 140,
  },
  imagePlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredContent: {
    padding: 12,
    gap: 2,
  },
  featuredCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  featuredName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 19,
  },
  featuredPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
  },
});
