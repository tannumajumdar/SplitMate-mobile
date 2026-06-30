import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { useApp } from '../../src/context/AppContext';
import AppHeader from '../../src/components/AppHeader';

function formatCurrency(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function StatCard({
  label, value, sub, iconName, iconColor, iconBg,
}: {
  label: string; value: string; sub?: string;
  iconName: string; iconColor: string; iconBg: string;
}) {
  return (
    <View className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-4"
      style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</Text>
          <Text className="text-xl font-bold text-slate-900 dark:text-white mt-1">{value}</Text>
          {sub && <Text className="text-xs text-slate-400 mt-0.5">{sub}</Text>}
        </View>
        <View className="w-9 h-9 rounded-xl items-center justify-center ml-2" style={{ backgroundColor: iconBg }}>
          <Ionicons name={iconName as never} size={17} color={iconColor} />
        </View>
      </View>
    </View>
  );
}

const QUICK_ACTIONS = [
  { icon: 'add-circle-outline', label: 'Add Expense', to: '/(app)/add-expense', colors: ['#6366f1', '#8b5cf6'] as const },
  { icon: 'swap-horizontal-outline', label: 'Settle Up', to: '/(app)/settlements', colors: ['#10b981', '#059669'] as const },
  { icon: 'receipt-outline', label: 'History', to: '/(app)/expenses', colors: ['#8b5cf6', '#7c3aed'] as const },
  { icon: 'bar-chart-outline', label: 'Reports', to: '/(app)/reports', colors: ['#f59e0b', '#d97706'] as const },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { expenses, expensesLoading, activeRoomMembers } = useApp();
  const router = useRouter();

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const thisMonthTotal = expenses.filter((e) => e.date.startsWith(thisMonth)).reduce((a, e) => a + e.amount, 0);
    const lastMonthTotal = expenses.filter((e) => e.date.startsWith(lastMonth)).reduce((a, e) => a + e.amount, 0);
    const totalAmount = expenses.reduce((a, e) => a + e.amount, 0);
    const monthChange = lastMonthTotal > 0
      ? (((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(0)
      : null;

    return {
      thisMonthTotal, totalAmount,
      count: expenses.length,
      members: activeRoomMembers.length,
      monthChange,
      monthUp: thisMonthTotal >= lastMonthTotal,
    };
  }, [expenses, activeRoomMembers]);

  const recent = expenses.slice(0, 4);

  const CATEGORY_ICONS: Record<string, string> = {
    food: 'fast-food-outline', rent: 'home-outline', utilities: 'flash-outline',
    groceries: 'cart-outline', transport: 'car-outline', entertainment: 'game-controller-outline',
    health: 'medical-outline', shopping: 'bag-outline', travel: 'airplane-outline', other: 'receipt-outline',
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <AppHeader title="Dashboard" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold text-slate-900 dark:text-white">
              Hey, {user?.name?.split(' ')[0]}
            </Text>
            <Text className="text-sm text-slate-400 mt-0.5">Here's your financial overview</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(app)/add-expense')}
            style={{ backgroundColor: '#7C5CFF' }}
            className="h-10 px-4 rounded-xl flex-row items-center gap-1.5"
          >
            <Ionicons name="add-circle-outline" size={16} color="#fff" />
            <Text className="text-white font-semibold text-sm">Add</Text>
          </TouchableOpacity>
        </View>

        {/* Hero gradient card */}
        <LinearGradient
          colors={['#6366f1', '#8b5cf6', '#9333ea']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 24, padding: 20, overflow: 'hidden' }}
        >
          {/* Decorative circles */}
          <View style={{
            position: 'absolute', right: -32, top: -32,
            width: 128, height: 128, borderRadius: 64,
            backgroundColor: 'rgba(255,255,255,0.1)',
          }} />
          <View style={{
            position: 'absolute', right: -8, bottom: -40,
            width: 96, height: 96, borderRadius: 48,
            backgroundColor: 'rgba(255,255,255,0.1)',
          }} />
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' }}>This Month</Text>
          <Text style={{ color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 4, letterSpacing: -1 }}>
            {formatCurrency(stats.thisMonthTotal)}
          </Text>
          {stats.monthChange !== null ? (
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>
              {stats.monthUp ? '▲' : '▼'} {Math.abs(Number(stats.monthChange))}% vs last month
            </Text>
          ) : (
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>No previous month data</Text>
          )}
        </LinearGradient>

        {/* Stat grid */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatCard
            label="Total Spent" value={formatCurrency(stats.totalAmount)} sub="all time"
            iconName="wallet-outline" iconColor="#6366f1" iconBg="#eef2ff"
          />
          <StatCard
            label="Expenses" value={String(stats.count)} sub="all time"
            iconName="receipt-outline" iconColor="#8b5cf6" iconBg="#f5f3ff"
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatCard
            label="This Month" value={formatCurrency(stats.thisMonthTotal)}
            iconName="trending-up-outline" iconColor="#10b981" iconBg="#ecfdf5"
          />
          <StatCard
            label="Members" value={String(stats.members)} sub="in room"
            iconName="people-outline" iconColor="#f59e0b" iconBg="#fffbeb"
          />
        </View>

        {/* Quick Actions */}
        <View
          className="bg-white dark:bg-slate-800 rounded-2xl p-4"
          style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}
        >
          <Text className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Quick Actions</Text>
          <View className="flex-row justify-around">
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.label}
                onPress={() => router.push(a.to as never)}
                className="items-center gap-1.5"
              >
                <LinearGradient
                  colors={a.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name={a.icon as never} size={22} color="#fff" />
                </LinearGradient>
                <Text className="text-[11px] font-medium text-slate-500 dark:text-slate-400 text-center">{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Expenses */}
        {recent.length > 0 && (
          <View style={{ gap: 8 }}>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-slate-900 dark:text-white">Recent Expenses</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/expenses')} className="flex-row items-center gap-0.5">
                <Text className="text-xs font-medium" style={{ color: '#7C5CFF' }}>See all</Text>
                <Ionicons name="arrow-forward" size={12} color="#7C5CFF" />
              </TouchableOpacity>
            </View>
            {recent.map((exp) => (
              <View
                key={exp.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-3 flex-row items-center gap-3"
                style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
              >
                <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: '#eef2ff' }}>
                  <Ionicons name={(CATEGORY_ICONS[exp.category] ?? 'receipt-outline') as never} size={18} color="#6366f1" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-slate-900 dark:text-white">{exp.title}</Text>
                  <Text className="text-xs text-slate-400 mt-0.5">
                    Paid by {exp.paidByName ?? 'Unknown'} · {exp.date}
                  </Text>
                </View>
                <Text className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(exp.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Empty state */}
        {expenses.length === 0 && !expensesLoading && (
          <View
            className="bg-white dark:bg-slate-800 rounded-2xl p-10 items-center"
            style={{ gap: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}
          >
            <View className="w-16 h-16 rounded-full items-center justify-center" style={{ backgroundColor: '#f1f5f9' }}>
              <Ionicons name="receipt-outline" size={32} color="#94a3b8" />
            </View>
            <View className="items-center gap-1">
              <Text className="text-slate-900 dark:text-white font-semibold">No expenses yet</Text>
              <Text className="text-slate-400 text-xs text-center">Start tracking your room expenses</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(app)/add-expense')}
              className="flex-row items-center gap-2 h-11 px-5 rounded-xl"
              style={{ backgroundColor: '#7C5CFF' }}
            >
              <Ionicons name="add-circle-outline" size={16} color="#fff" />
              <Text className="text-white font-semibold text-sm">Add First Expense</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
