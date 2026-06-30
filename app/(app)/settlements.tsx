import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../src/context/AppContext';
import { useAuth } from '../../src/context/AuthContext';
import AppHeader from '../../src/components/AppHeader';

function formatCurrency(n: number) {
  return `₹${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Settlements() {
  const { expenses, activeRoomMembers } = useApp();
  const { user } = useAuth();

  const balances = useMemo(() => {
    const net: Record<string, number> = {};
    activeRoomMembers.forEach((m) => (net[m.id] = 0));
    expenses.forEach((exp) => {
      if (net[exp.paidBy] !== undefined) net[exp.paidBy] += exp.amount;
      exp.splits.forEach((s) => {
        if (net[s.userId] !== undefined) net[s.userId] -= s.amount;
      });
    });
    return activeRoomMembers.map((m) => ({
      member: m,
      balance: Math.round((net[m.id] ?? 0) * 100) / 100,
      isMe: m.email === user?.email,
    }));
  }, [expenses, activeRoomMembers, user]);

  const totalOwed = balances.filter((b) => b.balance > 0).reduce((a, b) => a + b.balance, 0);
  const totalOwing = balances.filter((b) => b.balance < 0).reduce((a, b) => a + Math.abs(b.balance), 0);
  const settled = balances.filter((b) => b.balance === 0).length;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <AppHeader title="Settlements" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">Settlements</Text>
          <Text className="text-sm text-slate-400 mt-0.5">Who owes whom</Text>
        </View>

        {/* Summary hero */}
        <LinearGradient
          colors={['#10b981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 24, padding: 20, overflow: 'hidden' }}
        >
          <View style={{ position: 'absolute', right: -24, top: -24, width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <View style={{ position: 'absolute', right: -4, bottom: -32, width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' }}>Total to Settle</Text>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 4, letterSpacing: -1 }}>
            {formatCurrency(totalOwing)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Gets back</Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>{formatCurrency(totalOwed)}</Text>
            </View>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Settled</Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>{settled} of {balances.length}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Balance cards */}
        {balances.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-3 py-16">
            <View className="w-16 h-16 rounded-full items-center justify-center" style={{ backgroundColor: '#f1f5f9' }}>
              <Ionicons name="swap-horizontal-outline" size={32} color="#94a3b8" />
            </View>
            <Text className="text-slate-400 font-medium">No members in this room</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Balances</Text>
            {balances.map(({ member, balance, isMe }) => (
              <View
                key={member.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex-row items-center gap-3"
                style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}
              >
                {/* Avatar */}
                <LinearGradient
                  colors={isMe ? ['#6366f1', '#8b5cf6'] : ['#94a3b8', '#64748b']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{initials(member.name)}</Text>
                </LinearGradient>

                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-sm font-semibold text-slate-900 dark:text-white">{member.name}</Text>
                    {isMe && (
                      <View className="bg-indigo-100 px-1.5 py-0.5 rounded-full">
                        <Text className="text-[10px] font-bold" style={{ color: '#6366f1' }}>you</Text>
                      </View>
                    )}
                  </View>
                  <Text className={`text-xs mt-0.5 font-medium ${balance > 0 ? 'text-emerald-500' : balance < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                    {balance > 0 ? 'gets back' : balance < 0 ? 'owes' : 'all settled ✓'}
                  </Text>
                </View>

                {balance !== 0 && (
                  <View className={`px-3 py-1.5 rounded-xl ${balance > 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                    <Text className={`text-sm font-bold ${balance > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(balance)}
                    </Text>
                  </View>
                )}
                {balance === 0 && (
                  <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                    <Ionicons name="checkmark" size={16} color="#94a3b8" />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
