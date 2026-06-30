import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../src/context/AppContext';
import { useAuth } from '../../src/context/AuthContext';
import { expenseApi } from '../../src/services/api';
import AppHeader from '../../src/components/AppHeader';

function formatCurrency(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const CATEGORY_ICONS: Record<string, string> = {
  food: 'fast-food-outline', rent: 'home-outline', utilities: 'flash-outline',
  groceries: 'cart-outline', transport: 'car-outline', entertainment: 'game-controller-outline',
  health: 'medical-outline', shopping: 'bag-outline', travel: 'airplane-outline', other: 'receipt-outline',
};

const CATEGORY_COLORS: Record<string, { icon: string; bg: string }> = {
  food:          { icon: '#f59e0b', bg: '#fffbeb' },
  rent:          { icon: '#6366f1', bg: '#eef2ff' },
  utilities:     { icon: '#0ea5e9', bg: '#f0f9ff' },
  groceries:     { icon: '#10b981', bg: '#ecfdf5' },
  transport:     { icon: '#8b5cf6', bg: '#f5f3ff' },
  entertainment: { icon: '#ec4899', bg: '#fdf2f8' },
  health:        { icon: '#ef4444', bg: '#fef2f2' },
  shopping:      { icon: '#f97316', bg: '#fff7ed' },
  travel:        { icon: '#14b8a6', bg: '#f0fdfa' },
  other:         { icon: '#64748b', bg: '#f8fafc' },
};

export default function Expenses() {
  const { expenses, expensesLoading, deleteExpense, activeRoomId } = useApp();
  const { user } = useAuth();
  const router = useRouter();

  const stats = useMemo(() => {
    const total = expenses.reduce((a, e) => a + e.amount, 0);
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthTotal = expenses.filter((e) => e.date.startsWith(thisMonth)).reduce((a, e) => a + e.amount, 0);
    return { total, monthTotal, count: expenses.length };
  }, [expenses]);

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Expense', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await expenseApi.delete(activeRoomId, id);
            deleteExpense(id);
          } catch (e: unknown) {
            Alert.alert('Error', (e as Error).message ?? 'Failed to delete');
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <AppHeader title="Expenses" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold text-slate-900 dark:text-white">Expense History</Text>
            <Text className="text-sm text-slate-400 mt-0.5">{stats.count} expenses total</Text>
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

        {/* Summary hero */}
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 24, padding: 20, overflow: 'hidden' }}
        >
          <View style={{ position: 'absolute', right: -24, top: -24, width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <View style={{ position: 'absolute', right: -4, bottom: -32, width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' }}>Total Expenses</Text>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 4, letterSpacing: -1 }}>
            {formatCurrency(stats.total)}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>
            {formatCurrency(stats.monthTotal)} this month
          </Text>
        </LinearGradient>

        {/* List */}
        {expensesLoading ? (
          <View className="flex-1 items-center justify-center py-16">
            <Text className="text-slate-400">Loading…</Text>
          </View>
        ) : expenses.length === 0 ? (
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
        ) : (
          <View style={{ gap: 10 }}>
            {expenses.map((exp) => {
              const color = CATEGORY_COLORS[exp.category] ?? CATEGORY_COLORS.other;
              const isOwner = exp.paidBy === user?.id;
              return (
                <View
                  key={exp.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex-row items-center gap-3"
                  style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}
                >
                  <View
                    className="w-11 h-11 rounded-xl items-center justify-center"
                    style={{ backgroundColor: color.bg }}
                  >
                    <Ionicons name={(CATEGORY_ICONS[exp.category] ?? 'receipt-outline') as never} size={20} color={color.icon} />
                  </View>
                  <View className="flex-1" style={{ gap: 2 }}>
                    <Text className="text-sm font-semibold text-slate-900 dark:text-white">{exp.title}</Text>
                    <Text className="text-xs text-slate-400">
                      Paid by {exp.paidByName ?? 'Unknown'} · {exp.date}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-0.5">
                      <View className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                        <Text className="text-[10px] font-medium text-slate-500 capitalize">{exp.category}</Text>
                      </View>
                      <View className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                        <Text className="text-[10px] font-medium text-slate-500 capitalize">{exp.splitMethod}</Text>
                      </View>
                    </View>
                  </View>
                  <View className="items-end gap-2">
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(exp.amount)}</Text>
                    {isOwner && (
                      <TouchableOpacity
                        onPress={() => handleDelete(exp.id, exp.title)}
                        className="w-7 h-7 rounded-lg bg-rose-50 items-center justify-center"
                      >
                        <Ionicons name="trash-outline" size={14} color="#f43f5e" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
