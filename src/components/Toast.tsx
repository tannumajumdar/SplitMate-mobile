import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { Toast } from '../hooks/useToast';

const colors: Record<string, string> = {
  success: 'bg-emerald-500',
  error:   'bg-rose-500',
  warning: 'bg-amber-500',
  info:    'bg-primary-500',
};

export default function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (!toasts.length) return null;
  return (
    <View className="absolute top-14 left-4 right-4 z-50 gap-2">
      {toasts.map((t) => (
        <TouchableOpacity
          key={t.id}
          onPress={() => onRemove(t.id)}
          className={`${colors[t.type] ?? colors.info} px-4 py-3 rounded-xl flex-row items-center justify-between shadow-lg`}
        >
          <Text className="text-white text-sm font-medium flex-1">{t.message}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
