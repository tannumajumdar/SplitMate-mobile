import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#7C5CFF',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="room"
        options={{ title: 'Rooms', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="expenses"
        options={{ title: 'Expenses', tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="settlements"
        options={{ title: 'Settle', tabBarIcon: ({ color, size }) => <Ionicons name="swap-horizontal-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen name="add-expense" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
    </Tabs>
  );
}
