import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { expenseApi } from '../../src/services/api';
import type { ExpenseCategory } from '../../src/types';

const CATEGORIES: { key: ExpenseCategory; label: string; icon: string }[] = [
  { key: 'food', label: 'Food', icon: 'fast-food-outline' },
  { key: 'rent', label: 'Rent', icon: 'home-outline' },
  { key: 'utilities', label: 'Utilities', icon: 'flash-outline' },
  { key: 'groceries', label: 'Groceries', icon: 'cart-outline' },
  { key: 'transport', label: 'Transport', icon: 'car-outline' },
  { key: 'entertainment', label: 'Fun', icon: 'game-controller-outline' },
  { key: 'health', label: 'Health', icon: 'medical-outline' },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export default function AddExpense() {
  const router = useRouter();
  const { activeRoomId, activeRoomMembers, addExpense } = useApp();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [paidBy, setPaidBy] = useState(activeRoomMembers[0]?.id ?? '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!title.trim()) { setError('Enter a title'); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return; }
    if (!activeRoomId) { setError('No active room selected'); return; }
    if (!paidBy) { setError('Select who paid'); return; }

    const paidByMember = activeRoomMembers.find((m) => m.id === paidBy);
    const splitAmt = amt / (activeRoomMembers.length || 1);
    const splits = activeRoomMembers.map((m) => ({
      userId: m.id,
      memberName: m.name,
      amount: Math.round(splitAmt * 100) / 100,
      isPaid: m.id === paidBy,
    }));

    setError(''); setLoading(true);
    try {
      const expense = await expenseApi.create(activeRoomId, {
        title: title.trim(),
        amount: amt,
        category,
        paidBy,
        paidByName: paidByMember?.name,
        splitMethod: 'equal',
        splits,
        date: new Date().toISOString().slice(0, 10),
        notes: notes.trim() || undefined,
      });
      addExpense(expense);
      router.back();
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <View className="bg-white dark:bg-slate-900 px-4 pt-12 pb-4 flex-row items-center gap-3 border-b border-slate-100 dark:border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center">
          <Ionicons name="arrow-back" size={18} color="#94a3b8" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-900 dark:text-white flex-1">Add Expense</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}
          className={`bg-primary-500 h-9 px-4 rounded-xl items-center justify-center ${loading ? 'opacity-60' : ''}`}>
          <Text className="text-white font-semibold text-sm">{loading ? 'Saving…' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-4" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {error ? <Text className="text-rose-500 text-sm">{error}</Text> : null}

        {/* Amount */}
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 items-center gap-2">
          <Text className="text-xs font-medium text-slate-400 uppercase tracking-wide">Amount (₹)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="decimal-pad"
            className="text-4xl font-bold text-slate-900 dark:text-white text-center w-full"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Title */}
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 gap-2">
          <Text className="text-xs font-medium text-slate-400 uppercase tracking-wide">What's it for?</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Dinner, Netflix, Electricity bill"
            className="text-sm text-slate-900 dark:text-white"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Category */}
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 gap-3">
          <Text className="text-xs font-medium text-slate-400 uppercase tracking-wide">Category</Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <TouchableOpacity key={c.key} onPress={() => setCategory(c.key)}
                className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${category === c.key ? 'bg-primary-500 border-primary-500' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}>
                <Ionicons name={c.icon as never} size={14} color={category === c.key ? '#fff' : '#64748b'} />
                <Text className={`text-xs font-medium ${category === c.key ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Paid By */}
        {activeRoomMembers.length > 0 && (
          <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 gap-3">
            <Text className="text-xs font-medium text-slate-400 uppercase tracking-wide">Paid By</Text>
            <View className="flex-row flex-wrap gap-2">
              {activeRoomMembers.map((m) => (
                <TouchableOpacity key={m.id} onPress={() => setPaidBy(m.id)}
                  className={`px-3 py-2 rounded-xl border ${paidBy === m.id ? 'bg-primary-500 border-primary-500' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}>
                  <Text className={`text-xs font-medium ${paidBy === m.id ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>{m.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Split preview */}
        {activeRoomMembers.length > 0 && amount && parseFloat(amount) > 0 && (
          <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 gap-3">
            <Text className="text-xs font-medium text-slate-400 uppercase tracking-wide">Split (Equal)</Text>
            {activeRoomMembers.map((m) => (
              <View key={m.id} className="flex-row items-center justify-between">
                <Text className="text-sm text-slate-700 dark:text-slate-300">{m.name}</Text>
                <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                  ₹{(parseFloat(amount) / activeRoomMembers.length).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 gap-2">
          <Text className="text-xs font-medium text-slate-400 uppercase tracking-wide">Notes (optional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add a note…"
            multiline
            numberOfLines={3}
            className="text-sm text-slate-900 dark:text-white"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
