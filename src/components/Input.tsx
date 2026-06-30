import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export default function Input({ label, error, isPassword, style, ...props }: Props) {
  const [show, setShow] = useState(false);

  return (
    <View className="gap-1.5">
      {label && <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</Text>}
      <View className={`flex-row items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-3 h-12 border ${error ? 'border-rose-400' : 'border-transparent'}`}>
        <TextInput
          className="flex-1 text-slate-900 dark:text-white text-sm"
          placeholderTextColor="#94a3b8"
          secureTextEntry={isPassword && !show}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShow((s) => !s)} className="p-1">
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-xs text-rose-500">{error}</Text>}
    </View>
  );
}
