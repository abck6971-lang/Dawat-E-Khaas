/**
 * Shared skeleton loading utilities.
 * Import SkeletonBox or pre-built skeletons in any screen.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import { colors } from '../theme/colors';

const { width: SW } = Dimensions.get('window');

// ── BASE PULSING BOX ──────────────────────────────────────────────────────────
export function SkeletonBox({ style }: { style?: any }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 850, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 850, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });

  return (
    <Animated.View style={[styles.box, { opacity }, style]} />
  );
}

// ── CATEGORIES SKELETON ───────────────────────────────────────────────────────
export function CategoriesScreenSkeleton() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <SkeletonBox style={{ width: 40, height: 40, borderRadius: 20 }} />
        <SkeletonBox style={{ width: 120, height: 22, borderRadius: 8 }} />
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.gridWrap}>
        {Array(6).fill(0).map((_, i) => (
          <View key={i} style={styles.gridCard}>
            <SkeletonBox style={{ width: '100%', height: 110, borderRadius: 16, marginBottom: 10 }} />
            <SkeletonBox style={{ width: '60%', height: 13, borderRadius: 6, alignSelf: 'center' }} />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ── MENU SKELETON ─────────────────────────────────────────────────────────────
export function MenuScreenSkeleton() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <SkeletonBox style={{ width: 40, height: 40, borderRadius: 20 }} />
        <SkeletonBox style={{ width: 100, height: 22, borderRadius: 8 }} />
        <View style={{ width: 40 }} />
      </View>
      {/* Search bar */}
      <SkeletonBox style={{ marginHorizontal: 16, height: 50, borderRadius: 14, marginBottom: 16 }} />
      {/* Category filter chips */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 20 }}>
        {[70, 80, 60, 75].map((w, i) => (
          <SkeletonBox key={i} style={{ width: w, height: 36, borderRadius: 20 }} />
        ))}
      </View>
      {/* Item cards */}
      {Array(4).fill(0).map((_, i) => (
        <View key={i} style={styles.menuRow}>
          <SkeletonBox style={{ width: 88, height: 88, borderRadius: 16 }} />
          <View style={{ flex: 1, paddingLeft: 14, gap: 10 }}>
            <SkeletonBox style={{ width: '40%', height: 11, borderRadius: 6 }} />
            <SkeletonBox style={{ width: '80%', height: 16, borderRadius: 6 }} />
            <SkeletonBox style={{ width: '30%', height: 14, borderRadius: 6 }} />
          </View>
        </View>
      ))}
    </SafeAreaView>
  );
}

// ── FAVORITES SKELETON ────────────────────────────────────────────────────────
export function FavoritesScreenSkeleton() {
  const cardW = (SW - 48 - 12) / 2;
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <SkeletonBox style={{ width: 150, height: 24, borderRadius: 8 }} />
      </View>
      <View style={styles.favGrid}>
        {Array(4).fill(0).map((_, i) => (
          <View key={i} style={[styles.favCard, { width: cardW }]}>
            <SkeletonBox style={{ width: '100%', height: 130, borderRadius: 0 }} />
            <View style={{ padding: 12, gap: 8 }}>
              <SkeletonBox style={{ width: '50%', height: 11, borderRadius: 6 }} />
              <SkeletonBox style={{ width: '85%', height: 15, borderRadius: 6 }} />
              <SkeletonBox style={{ width: '40%', height: 13, borderRadius: 6 }} />
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ── PROFILE SKELETON ──────────────────────────────────────────────────────────
export function ProfileScreenSkeleton() {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FAFAFA' }]}>
      <StatusBar barStyle="dark-content" />
      {/* Avatar + name */}
      <View style={styles.profileTop}>
        <SkeletonBox style={{ width: 90, height: 90, borderRadius: 45, marginBottom: 14 }} />
        <SkeletonBox style={{ width: 140, height: 20, borderRadius: 8, marginBottom: 8 }} />
        <SkeletonBox style={{ width: 100, height: 14, borderRadius: 6 }} />
      </View>
      {/* Menu items */}
      {Array(5).fill(0).map((_, i) => (
        <View key={i} style={styles.profileRow}>
          <SkeletonBox style={{ width: 44, height: 44, borderRadius: 14 }} />
          <View style={{ flex: 1, paddingLeft: 14, gap: 8 }}>
            <SkeletonBox style={{ width: '50%', height: 14, borderRadius: 6 }} />
            <SkeletonBox style={{ width: '70%', height: 11, borderRadius: 5 }} />
          </View>
          <SkeletonBox style={{ width: 20, height: 20, borderRadius: 10 }} />
        </View>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#DEDEDE',
    borderRadius: 8,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  // Categories
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    paddingTop: 8,
  },
  gridCard: {
    width: (SW - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  // Menu
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  // Favorites
  favGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    paddingTop: 8,
  },
  favCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  // Profile
  profileTop: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
});
