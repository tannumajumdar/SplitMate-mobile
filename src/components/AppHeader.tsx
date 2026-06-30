import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const FAVICON = require('../../assets/icon.png');

interface AppHeaderProps {
  title: string;
  rightSlot?: React.ReactNode;
}

export default function AppHeader({ title, rightSlot }: AppHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isDark, toggle } = useTheme();
  const insets = useSafeAreaInsets();

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  return (
    <View
      className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"
      style={{ paddingTop: insets.top, paddingHorizontal: 14, paddingBottom: 10 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 44 }}>

        {/* Left — favicon logo */}
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={FAVICON}
            style={{ width: 36, height: 36, borderRadius: 8 }}
            resizeMode="contain"
          />
        </View>

        {/* Center — screen title */}
        <Text
          className="text-[15px] font-bold text-slate-900 dark:text-white"
          style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center' }}
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Right — theme toggle + bell + avatar (or custom slot) */}
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
          {rightSlot !== undefined ? rightSlot : (
            <>
              {/* Theme toggle */}
              <TouchableOpacity
                onPress={toggle}
                style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}
              >
                <Ionicons
                  name={isDark ? 'sunny-outline' : 'moon-outline'}
                  size={19}
                  color={isDark ? '#f59e0b' : '#64748b'}
                />
              </TouchableOpacity>

              {/* Notification bell */}
              <TouchableOpacity
                style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}
              >
                <Ionicons name="notifications-outline" size={19} color="#64748b" />
              </TouchableOpacity>

              {/* Avatar */}
              <TouchableOpacity
                onPress={() => router.push('/(app)/profile')}
                style={{
                  width: 32, height: 32, borderRadius: 16,
                  backgroundColor: '#7C5CFF',
                  alignItems: 'center', justifyContent: 'center',
                  marginLeft: 2,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{initials}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}
