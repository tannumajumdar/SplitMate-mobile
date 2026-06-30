import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const LOGO = require('../../assets/icon.png');

interface AppHeaderProps {
  /** Screen title shown in the center */
  title?: string;
  /** Called when the bell is pressed. Defaults to an "No notifications" alert. */
  onBellPress?: () => void;
  /** Red dot badge count — shows badge when > 0 */
  unreadCount?: number;
  /** Replaces the right (theme + bell) section entirely */
  rightSlot?: React.ReactNode;
}

function defaultBellHandler() {
  Alert.alert('Notifications', 'You have no new notifications.');
}

export default function AppHeader({
  title = 'SplitMate',
  onBellPress = defaultBellHandler,
  unreadCount = 0,
  rightSlot,
}: AppHeaderProps) {
  const { isDark, toggle } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
        paddingTop: insets.top,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 64,
          paddingHorizontal: 16,
        }}
      >
        {/* ── LEFT — App logo 40×40 ─────────────────────────── */}
        <Image
          source={LOGO}
          style={{ width: 40, height: 40, borderRadius: 8 }}
          resizeMode="contain"
        />

        {/* ── CENTER — Screen title (absolutely centered vs full width) ── */}
        <Text
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 22,
            fontWeight: '700',
            color: isDark ? '#ffffff' : '#0f172a',
          }}
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Spacer pushes right section to the edge */}
        <View style={{ flex: 1 }} />

        {/* ── RIGHT — Theme toggle + Bell (or custom slot) ──── */}
        {rightSlot !== undefined ? (
          rightSlot
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {/* Dark / Light theme toggle */}
            <TouchableOpacity
              onPress={toggle}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={22}
                color={isDark ? '#f59e0b' : '#475569'}
              />
            </TouchableOpacity>

            {/* Notification bell — always has a working handler */}
            <TouchableOpacity
              onPress={onBellPress}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
              style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons
                name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
                size={22}
                color={isDark ? '#94a3b8' : '#475569'}
              />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: 7,
                    right: 7,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: '#ef4444',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 3,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
