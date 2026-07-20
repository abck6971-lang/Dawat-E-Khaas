import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, SafeAreaView, StatusBar, Dimensions
} from 'react-native';
import { ChevronLeft, Heart, Flame } from 'lucide-react-native';
import { getMenuData } from '../services/menu';
import { MenuItem } from '../types';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { useFavoriteStore } from '../store/useFavoriteStore';
import MenuItemModal from '../components/MenuItemModal';
import { FavoritesScreenSkeleton } from '../components/SkeletonLoaders';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Calculate card width for a 2-column grid with padding
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  
  const { favoriteIds, isFavorite, toggleFavorite } = useFavoriteStore();

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const data = await getMenuData();
        if (data && data.menuItems) {
          setMenuItems(data.menuItems);
        }
      } catch (error) {
        console.error("Failed to load menu", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Filter items to only show favorites
  const favorites = menuItems.filter(item => favoriteIds.includes(item.id));

  const renderFavoriteItem = ({ item }: { item: MenuItem }) => {
    const isFav = isFavorite(item.id);
    return (
      <TouchableOpacity 
        style={[styles.card, { width: CARD_WIDTH }]} 
        activeOpacity={0.88}
        onPress={() => setSelectedItem(item)}
      >
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, styles.placeholderImage]}>
               <Flame size={32} color={colors.textMuted} strokeWidth={1.5} />
            </View>
          )}
          <TouchableOpacity 
            style={styles.heartIconWrap} 
            activeOpacity={0.8}
            onPress={() => toggleFavorite(item.id)}
          >
            <Heart 
              size={20} 
              color={isFav ? colors.secondary : colors.textMuted} 
              fill={isFav ? colors.secondary : 'transparent'} 
              strokeWidth={1.5} 
            />
          </TouchableOpacity>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.itemMeta}>
            <Text style={styles.itemCategory}>{item.category?.name?.toUpperCase() || 'DISH'}</Text>
            <Text style={styles.itemPrice}>Rs. {Number(item.price).toFixed(0)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
           <Text style={styles.headerTitle}>Favorite</Text>
           {/* Empty view for flex balancing */}
           <View style={{ width: 40 }} /> 
        </View>

        {loading ? (
          <FavoritesScreenSkeleton />
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            columnWrapperStyle={styles.rowWrapper}
            showsVerticalScrollIndicator={false}
            renderItem={renderFavoriteItem}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Heart size={48} color={colors.textMuted} strokeWidth={1.5} />
                <Text style={styles.emptyText}>No favorites yet.</Text>
              </View>
            }
          />
        )}
      </View>

      <MenuItemModal
        item={selectedItem}
        visible={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
      />
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
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIconWrap: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    padding: 4,
  },
  cardInfo: {
    gap: 4,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCategory: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  }
});
