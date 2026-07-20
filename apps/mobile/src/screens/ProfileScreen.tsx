import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, SafeAreaView, ScrollView, Alert,
  StatusBar, Platform, KeyboardAvoidingView, Dimensions,
} from 'react-native';
import {
  LogOut, User, Mail, Phone, ShoppingBag,
  Lock, ChevronRight, Shield,
} from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { loginCustomer, registerCustomer } from '../services/auth';
import { colors } from '../theme/colors';
import { ProfileScreenSkeleton } from '../components/SkeletonLoaders';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.38;

type AuthMode = 'login' | 'register';

/* ── Helper sub-components ── */

function InputField({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: any) {
  return (
    <View style={inputStyles.wrap}>
      <View style={inputStyles.iconWrap}>{icon}</View>
      <View style={inputStyles.divider} />
      <TextInput
        style={inputStyles.field}
        placeholder={placeholder}
        placeholderTextColor="#AAAAAA"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
      />
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    height: 50,
    paddingHorizontal: 12,
  },
  iconWrap: { width: 28, alignItems: 'center', justifyContent: 'center' },
  divider: { width: 1, height: 24, backgroundColor: '#E0E0E0', marginHorizontal: 10 },
  field: { flex: 1, fontSize: 14, color: '#1A1A1A', padding: 0 },
});

function InfoRow({ icon, label, value, border }: { icon: any; label: string; value: string; border?: boolean }) {
  return (
    <View style={[rowStyles.row, border && rowStyles.border]}>
      <View style={rowStyles.iconWrap}>{icon}</View>
      <View style={rowStyles.textWrap}>
        <Text style={rowStyles.label}>{label}</Text>
        <Text style={rowStyles.value}>{value}</Text>
      </View>
      <ChevronRight size={16} color={colors.border} />
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  border: { borderTopWidth: 1, borderTopColor: colors.border },
  iconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F0F7F0', justifyContent: 'center', alignItems: 'center' },
  textWrap: { flex: 1 },
  label: { fontSize: 11, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 14, color: colors.text, fontWeight: '600', marginTop: 1 },
});

/* ── Main Screen ── */

export default function ProfileScreen() {
  const { customer, login, logout, isLoading } = useAuthStore();

  // ── All useState hooks ──
  const [mode, setMode] = useState<AuthMode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAuth = async () => {
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    if (mode === 'register') {
      if (!firstName) { setError('First name is required.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
      if (!agreedToTerms) { setError('Please agree to Terms & Conditions.'); return; }
    }
    setSubmitting(true);
    const fullName = `${firstName} ${lastName}`.trim();
    const result = mode === 'login'
      ? await loginCustomer(email, password)
      : await registerCustomer(fullName, email, phone, password);
    setSubmitting(false);
    if (result.success && result.token && result.customer) {
      await login(result.token, result.customer);
      setFirstName(''); setLastName(''); setEmail('');
      setPhone(''); setPassword(''); setConfirmPassword('');
    } else {
      setError(result.error || 'Something went wrong.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (isLoading) {
    return <ProfileScreenSkeleton />;
  }

  /* ── LOGGED IN ── */
  if (customer) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.loggedHero}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{customer.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.customerName}>{customer.name}</Text>
            <Text style={styles.customerEmail}>{customer.email}</Text>
          </View>
          <View style={styles.infoCard}>
            <InfoRow icon={<Mail size={16} color={colors.primary} strokeWidth={2} />} label="Email" value={customer.email} />
            {customer.phone && <InfoRow icon={<Phone size={16} color={colors.primary} strokeWidth={2} />} label="Phone" value={customer.phone} border />}
            <InfoRow icon={<ShoppingBag size={16} color={colors.primary} strokeWidth={2} />} label="Member Since" value={`${new Date().getFullYear()}`} border />
            <InfoRow icon={<Shield size={16} color={colors.primary} strokeWidth={2} />} label="Account Security" value="Password & Privacy" border />
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <LogOut color={colors.error} size={18} strokeWidth={2} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ── AUTH SCREEN ── */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Full background */}
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

        {/* Top hero area — deep green with gold brand name */}
        <View style={[styles.heroArea, { height: HERO_HEIGHT }]}>
          <Text style={styles.brandName}>Dawat-E-Khaas</Text>
          <Text style={styles.brandTagline}>Authentic flavors at your doorstep</Text>
        </View>

        {/* Bottom white card — scroll for register */}
        <ScrollView
          style={styles.cardScroll}
          contentContainerStyle={styles.cardContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Card title */}
          {mode === 'login' ? (
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Welcome Back!</Text>
              <Text style={styles.cardSubtitle}>Sign in to continue</Text>
            </View>
          ) : (
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Create your account</Text>
              <Text style={styles.cardSubtitle}>Sign up to get started</Text>
            </View>
          )}

          {/* ── INPUTS ── */}
          <View style={styles.form}>
            {mode === 'register' && (
              <View style={styles.nameRow}>
                <View style={[inputStyles.wrap, { flex: 1, marginRight: 8 }]}>
                  <View style={inputStyles.iconWrap}>
                    <User size={15} color="#AAAAAA" strokeWidth={1.8} />
                  </View>
                  <View style={inputStyles.divider} />
                  <TextInput
                    style={inputStyles.field}
                    placeholder="First Name"
                    placeholderTextColor="#AAAAAA"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
                <View style={[inputStyles.wrap, { flex: 1 }]}>
                  <TextInput
                    style={[inputStyles.field, { paddingLeft: 2 }]}
                    placeholder="Last Name"
                    placeholderTextColor="#AAAAAA"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>
            )}

            <InputField
              icon={<Mail size={15} color="#AAAAAA" strokeWidth={1.8} />}
              placeholder="Email or Phone Number"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <InputField
              icon={<Lock size={15} color="#AAAAAA" strokeWidth={1.8} />}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {mode === 'register' && (
              <InputField
                icon={<Lock size={15} color="#AAAAAA" strokeWidth={1.8} />}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            )}

            {/* Terms */}
            {mode === 'register' && (
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                  {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.termsLink}>Term & Conditions</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            )}

            {/* Error */}
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              onPress={handleAuth}
              disabled={submitting}
              activeOpacity={0.88}
            >
              {submitting
                ? <ActivityIndicator color={colors.textInverse} />
                : <Text style={styles.submitBtnText}>{mode === 'login' ? 'Sign In' : 'Sign Up'}</Text>
              }
            </TouchableOpacity>

            {/* OR divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google */}
            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.googleText}>Continue With Google</Text>
            </TouchableOpacity>

            {/* Switch */}
            <Text style={styles.switchText}>
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <Text
                style={styles.switchLink}
                onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EFEFEF' },

  /* Logged-in */
  loggedHero: {
    backgroundColor: colors.primary, alignItems: 'center',
    paddingTop: 56, paddingBottom: 48,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.secondary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarLetter: { color: colors.primary, fontSize: 34, fontWeight: '800' },
  customerName: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  customerEmail: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  infoCard: {
    backgroundColor: colors.surface, borderRadius: 16, margin: 20,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 20, backgroundColor: colors.surface,
    paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 14, borderWidth: 1.5, borderColor: '#FECACA',
    justifyContent: 'center', marginBottom: 32,
  },
  logoutText: { color: colors.error, fontWeight: '700', fontSize: 15 },

  /* Auth screen */
  screen: { flex: 1, backgroundColor: colors.primary },

  heroArea: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 14,
    color: 'rgba(200, 168, 75, 0.7)',
    textAlign: 'center',
  },

  /* White card */
  cardScroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 16,
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  cardHeader: { marginBottom: 24 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#888888' },

  form: { gap: 14 },
  nameRow: { flexDirection: 'row', gap: 0 },

  /* Terms */
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#CCCCCC',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: colors.secondary, fontSize: 11, fontWeight: '800' },
  termsText: { flex: 1, fontSize: 12, color: '#888888', lineHeight: 18 },
  termsLink: { color: colors.secondary, fontWeight: '700' },

  /* Error */
  errorBox: {
    backgroundColor: '#FEF2F2', borderRadius: 8,
    padding: 10, borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { color: colors.error, fontSize: 13 },

  /* Submit */
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  /* Divider */
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8E8E8' },
  dividerText: { fontSize: 12, color: '#AAAAAA' },

  /* Google */
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 10, height: 50,
    borderWidth: 1.5, borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  googleG: { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  googleText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },

  /* Switch */
  switchText: { fontSize: 13, color: '#888888', textAlign: 'center', marginTop: 4 },
  switchLink: { color: colors.secondary, fontWeight: '700' },
});
