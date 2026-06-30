import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  Modal, TextInput, Linking,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../../src/context/AuthContext';
import { ratingApi } from '../../src/services/api';
import AppHeader from '../../src/components/AppHeader';

// ─── Shared primitives ────────────────────────────────────────────────────────

function BottomSheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity className="flex-1 bg-black/50" activeOpacity={1} onPress={onClose} />
      <View className="bg-white dark:bg-slate-900 rounded-t-3xl px-5 pt-5 pb-10"
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-base font-bold text-slate-900 dark:text-white">{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color="#94a3b8" />
          </TouchableOpacity>
        </View>
        {children}
      </View>
    </Modal>
  );
}

function Row({ icon, label, sublabel, onPress, danger }: {
  icon: string; label: string; sublabel?: string; onPress: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-70">
      <View className={`w-9 h-9 rounded-xl items-center justify-center ${danger ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
        <Ionicons name={icon as never} size={18} color={danger ? '#f43f5e' : '#7C5CFF'} />
      </View>
      <View className="flex-1">
        <Text className={`text-sm font-medium ${danger ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{label}</Text>
        {sublabel && <Text className="text-xs text-slate-400 mt-0.5">{sublabel}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View className="h-px bg-slate-100 dark:bg-slate-700 mx-4" />;
}

// ─── Rate SplitMate Modal ─────────────────────────────────────────────────────

function RateModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (stars === 0) { Alert.alert('Select a rating', 'Please select at least 1 star.'); return; }
    setLoading(true);
    try {
      await ratingApi.submit(stars, review.trim() || undefined);
      setSubmitted(true);
    } catch (e: unknown) {
      Alert.alert('Error', (e as Error).message ?? 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStars(0); setReview(''); setSubmitted(false);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Rate SplitMate">
      {submitted ? (
        <View className="items-center gap-3 py-4">
          <View className="w-16 h-16 rounded-full bg-emerald-100 items-center justify-center">
            <Ionicons name="checkmark-circle" size={40} color="#10b981" />
          </View>
          <Text className="text-lg font-bold text-slate-900 dark:text-white">Thank you!</Text>
          <Text className="text-sm text-slate-400 text-center">Your feedback helps us improve SplitMate for everyone.</Text>
          <TouchableOpacity onPress={handleClose}
            className="mt-2 h-12 w-full rounded-2xl items-center justify-center"
            style={{ backgroundColor: '#7C5CFF' }}>
            <Text className="text-white font-semibold">Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text className="text-sm text-slate-400 text-center mb-4">How would you rate your experience?</Text>
          <View className="flex-row justify-center gap-2 mb-5">
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setStars(s)} className="p-1">
                <Ionicons
                  name={s <= stars ? 'star' : 'star-outline'}
                  size={36}
                  color={s <= stars ? '#f59e0b' : '#94a3b8'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            {stars === 0 ? 'Tap a star to rate' : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][stars]}
          </Text>
          <TextInput
            className="bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-3 text-slate-900 dark:text-white text-sm mb-4"
            placeholder="Write a review (optional)"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
            value={review}
            onChangeText={setReview}
            maxLength={500}
            style={{ textAlignVertical: 'top', minHeight: 80 }}
          />
          <TouchableOpacity onPress={handleSubmit} disabled={loading || stars === 0}
            className="h-12 rounded-2xl items-center justify-center"
            style={{ backgroundColor: '#7C5CFF', opacity: loading || stars === 0 ? 0.5 : 1 }}>
            <Text className="text-white font-semibold">{loading ? 'Submitting…' : 'Submit Rating'}</Text>
          </TouchableOpacity>
        </>
      )}
    </BottomSheet>
  );
}

// ─── Contact Support Modal ────────────────────────────────────────────────────

function SupportModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const SUPPORT_EMAIL = 'support@splitmate.com';

  const copyEmail = async () => {
    await Clipboard.setStringAsync(SUPPORT_EMAIL);
    Alert.alert('Copied!', 'Support email copied to clipboard.');
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Contact Support">
      {/* Email */}
      <View className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-xs text-slate-400 mb-0.5">Email us at</Text>
          <Text className="text-sm font-semibold text-slate-900 dark:text-white">{SUPPORT_EMAIL}</Text>
        </View>
        <TouchableOpacity onPress={copyEmail}
          className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 items-center justify-center shadow-sm">
          <Ionicons name="copy-outline" size={18} color="#7C5CFF" />
        </TouchableOpacity>
      </View>

      {/* Options */}
      {[
        { icon: 'bug-outline', label: 'Report a Bug', sub: 'Found something broken?', action: () => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Bug Report`) },
        { icon: 'bulb-outline', label: 'Feature Request', sub: 'Have an idea? Tell us!', action: () => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Feature Request`) },
        { icon: 'help-circle-outline', label: 'FAQ', sub: 'Common questions answered', action: () => Linking.openURL('https://splimate.vercel.app/faq') },
      ].map((item) => (
        <TouchableOpacity key={item.label} onPress={item.action}
          className="flex-row items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-700">
          <View className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 items-center justify-center">
            <Ionicons name={item.icon as never} size={18} color="#7C5CFF" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</Text>
            <Text className="text-xs text-slate-400">{item.sub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
        </TouchableOpacity>
      ))}
    </BottomSheet>
  );
}

// ─── About Modal ──────────────────────────────────────────────────────────────

function AboutModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="About SplitMate">
      {/* Logo block */}
      <View className="items-center gap-2 py-3 mb-4">
        <View className="w-16 h-16 rounded-2xl items-center justify-center" style={{ backgroundColor: '#7C5CFF' }}>
          <Ionicons name="wallet-outline" size={32} color="#fff" />
        </View>
        <Text className="text-xl font-bold text-slate-900 dark:text-white">SplitMate</Text>
        <Text className="text-sm text-slate-400">Version 1.0.0</Text>
      </View>

      {/* Info rows */}
      {[
        { label: 'Developer', value: 'Tannu Majumdar' },
        { label: 'Category', value: 'Finance · Expense Sharing' },
        { label: 'Platform', value: 'iOS · Android · Web' },
      ].map((item) => (
        <View key={item.label} className="flex-row justify-between py-2.5 border-b border-slate-100 dark:border-slate-700">
          <Text className="text-sm text-slate-400">{item.label}</Text>
          <Text className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</Text>
        </View>
      ))}

      <View className="flex-row gap-3 mt-5">
        <TouchableOpacity
          onPress={() => Linking.openURL('https://splimate.vercel.app/privacy-policy')}
          className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-600 items-center justify-center">
          <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://splimate.vercel.app/terms-of-use')}
          className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-600 items-center justify-center">
          <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">Terms of Use</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

// ─── Main Profile Screen ───────────────────────────────────────────────────────

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [rateVisible, setRateVisible] = useState(false);
  const [supportVisible, setSupportVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: () => { logout(); router.replace('/(auth)'); },
      },
    ]);
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <AppHeader title="Profile" rightSlot={<View />} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Hero */}
        <View className="bg-white dark:bg-slate-900 px-4 pt-6 pb-6 items-center gap-3 border-b border-slate-100 dark:border-slate-800">
          <View className="w-20 h-20 rounded-full items-center justify-center" style={{ backgroundColor: '#7C5CFF' }}>
            <Text className="text-3xl font-bold text-white">{initials}</Text>
          </View>
          <View className="items-center gap-1">
            <Text className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</Text>
            <Text className="text-sm text-slate-400">{user?.email}</Text>
          </View>
          <View className="flex-row gap-2 mt-1">
            <View className="bg-primary-100 dark:bg-primary-900/20 px-3 py-1 rounded-full flex-row items-center gap-1.5"
              style={{ backgroundColor: '#ede9fe' }}>
              <Ionicons name="mail-outline" size={12} color="#7C5CFF" />
              <Text className="text-xs font-medium" style={{ color: '#7C5CFF' }}>Email Account</Text>
            </View>
            <View className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
              <Text className="text-xs font-medium text-slate-600 dark:text-slate-300">INR</Text>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <View className="mt-4 mx-4 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 pt-3 pb-1">Preferences</Text>
          <Row icon="lock-closed-outline" label="Change Password" sublabel="Update your password" onPress={() => {}} />
          <Divider />
          <Row icon="mail-outline" label="Email" sublabel={user?.email ?? ''} onPress={() => {}} />
        </View>

        {/* Feedback */}
        <View className="mt-4 mx-4 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 pt-3 pb-1">Feedback</Text>
          <Row
            icon="star-outline"
            label="Rate SplitMate"
            sublabel="Love it? Leave a review"
            onPress={() => setRateVisible(true)}
          />
          <Divider />
          <Row
            icon="chatbubble-outline"
            label="Contact Support"
            sublabel="Get help or report a bug"
            onPress={() => setSupportVisible(true)}
          />
          <Divider />
          <Row
            icon="information-circle-outline"
            label="About SplitMate"
            sublabel="v1.0.0 · Developer info"
            onPress={() => setAboutVisible(true)}
          />
        </View>

        {/* Logout */}
        <View className="mt-4 mx-4 mb-10 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
          <Row icon="log-out-outline" label="Log Out" onPress={handleLogout} danger />
        </View>
      </ScrollView>

      <RateModal visible={rateVisible} onClose={() => setRateVisible(false)} />
      <SupportModal visible={supportVisible} onClose={() => setSupportVisible(false)} />
      <AboutModal visible={aboutVisible} onClose={() => setAboutVisible(false)} />
    </View>
  );
}
