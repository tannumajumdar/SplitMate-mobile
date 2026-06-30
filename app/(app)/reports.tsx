import { View, Text, ScrollView } from 'react-native';
import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';

function formatCurrency(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food', rent: 'Rent', utilities: 'Utilities', groceries: 'Groceries',
  transport: 'Transport', entertainment: 'Entertainment', health: 'Health',
  shopping: 'Shopping', travel: 'Travel', other: 'Other',
};

export default function Reports() {
  const { expenses } = useApp();

  const { categoryBreakdown, totalAmount } = useMemo(() => {
    const catMap: Record<string, number> = {};
    let total = 0;
    expenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] ?? 0) + e.amount;
      total += e.amount;
    });
    const breakdown = Object.entries(catMap)
      .map(([cat, amt]) => ({ cat, amt, pct: total > 0 ? (amt / total) * 100 : 0 }))
      .sort((a, b) => b.amt - a.amt);
    return { categoryBreakdown: breakdown, totalAmount: total };
  }, [expenses]);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="bg-white dark:bg-slate-900 px-4 pt-12 pb-4 border-b border-slate-100 dark:border-slate-800">
        <Text className="text-lg font-bold text-slate-900 dark:text-white">Reports</Text>
        <Text className="text-sm text-slate-400 mt-0.5">Spending breakdown</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-4" showsVerticalScrollIndicator={false}>
        {/* Total */}
        <View className="bg-primary-500 rounded-2xl p-5">
          <Text className="text-white/80 text-sm">Total Spent</Text>
          <Text className="text-white text-3xl font-bold mt-1">{formatCurrency(totalAmount)}</Text>
          <Text className="text-white/70 text-xs mt-1">{expenses.length} expenses</Text>
        </View>

        {/* Category breakdown */}
        {categoryBreakdown.length === 0 ? (
          <View className="bg-white dark:bg-slate-800 rounded-2xl p-10 items-center gap-3">
            <Ionicons name="bar-chart-outline" size={40} color="#94a3b8" />
            <Text className="text-slate-400 text-sm">No expenses to analyze yet</Text>
          </View>
        ) : (
          <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 gap-4">
            <Text className="text-sm font-semibold text-slate-900 dark:text-white">By Category</Text>
            {categoryBreakdown.map(({ cat, amt, pct }) => (
              <View key={cat} className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-slate-700 dark:text-slate-300">{CATEGORY_LABELS[cat] ?? cat}</Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs text-slate-400">{pct.toFixed(0)}%</Text>
                    <Text className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(amt)}</Text>
                  </View>
                </View>
                <View className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <View className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
