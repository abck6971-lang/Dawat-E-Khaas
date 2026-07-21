import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import TabNavigator from './src/navigation/TabNavigator';
import MenuScreen from './src/screens/MenuScreen';
import OrderConfirmationScreen from './src/screens/OrderConfirmationScreen';
import TrackOrderScreen from './src/screens/TrackOrderScreen';
import { useAuthStore } from './src/store/useAuthStore';

const Stack = createNativeStackNavigator();
const { width: SW, height: SH } = Dimensions.get('window');

// ── ANIMATED SPLASH SCREEN ────────────────────────────────────────────────────
function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const logoScale   = useRef(new Animated.Value(0.75)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Phase 1 — logo appears + grows
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Phase 2 — tagline fades in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        // Hold for 1 second, then fade out entire splash
        setTimeout(() => {
          Animated.timing(screenOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => onFinish());
        }, 1000);
      });
    });
  }, []);

  return (
    <Animated.View style={[styles.splash, { opacity: screenOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1C12" />

      {/* Logo */}
      <Animated.View
        style={{
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
          alignItems: 'center',
        }}
      >
        <View style={styles.logoRing}>
          <Image
            source={require('./assets/icon.png')}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>
      </Animated.View>

      {/* Brand name + tagline */}
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center', marginTop: 28 }}>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDot} />
          <View style={styles.dividerLine} />
        </View>
        <Animated.Text style={styles.brandName}>Dawat-E-Khaas</Animated.Text>
        <Animated.Text style={styles.tagline}>Fine Dining · Delivered</Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

function MainApp() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
        <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
      </Stack.Navigator>
      <ExpoStatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Main app renders behind the splash */}
      {splashDone && <MainApp />}

      {/* Splash sits on top until its animation finishes */}
      {!splashDone && (
        <SplashScreen onFinish={() => setSplashDone(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A1C12',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },

  // Decorative curved arcs
  topArc: {
    position: 'absolute',
    top: -SW * 0.4,
    width: SW * 1.4,
    height: SW * 1.4,
    borderRadius: SW * 0.7,
    backgroundColor: 'rgba(200,168,75,0.06)',
  },
  bottomArc: {
    position: 'absolute',
    bottom: -SW * 0.5,
    width: SW * 1.6,
    height: SW * 1.6,
    borderRadius: SW * 0.8,
    backgroundColor: 'rgba(200,168,75,0.04)',
  },

  // Logo ring frame
  logoRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2.5,
    borderColor: 'rgba(200,168,75,0.5)',
    padding: 6,
    backgroundColor: 'rgba(200,168,75,0.08)',
    shadowColor: '#C8A84B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 64,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  dividerLine: {
    height: 1,
    width: 40,
    backgroundColor: 'rgba(200,168,75,0.45)',
  },
  dividerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#C8A84B',
  },

  // Text
  brandName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#C8A84B',
    letterSpacing: 1.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(200,168,75,0.6)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
