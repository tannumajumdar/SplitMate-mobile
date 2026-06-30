import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

type Variant = 'primary' | 'outline' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const variantClass: Record<Variant, { bg: string; text: string; border: string }> = {
  primary: { bg: 'bg-primary-500', text: 'text-white', border: '' },
  outline: { bg: 'bg-transparent', text: 'text-slate-700', border: 'border border-slate-300' },
  danger:  { bg: 'bg-rose-500', text: 'text-white', border: '' },
  ghost:   { bg: 'bg-transparent', text: 'text-primary-500', border: '' },
};

const sizeClass: Record<Size, { height: string; text: string; px: string }> = {
  sm: { height: 'h-10', text: 'text-sm', px: 'px-4' },
  md: { height: 'h-12', text: 'text-base', px: 'px-5' },
  lg: { height: 'h-14', text: 'text-base', px: 'px-6' },
};

export default function Button({
  onPress, children, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = false, icon,
}: Props) {
  const v = variantClass[variant];
  const s = sizeClass[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={`${v.bg} ${v.border} ${s.height} ${s.px} rounded-2xl flex-row items-center justify-center gap-2 ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : '#7C5CFF'} size="small" />
      ) : (
        <>
          {icon && <View>{icon}</View>}
          <Text className={`${v.text} ${s.text} font-semibold`}>{children}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
