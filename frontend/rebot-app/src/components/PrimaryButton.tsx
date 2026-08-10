import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius } from '@/src/theme/tokens';

type Props = { label: string; onPress?: () => void; variant?: 'dark' | 'accent' | 'outline'; style?: ViewStyle; loading?: boolean; disabled?: boolean };

export function PrimaryButton({ label, onPress, variant = 'dark', style, loading = false, disabled = false }: Props) {
  const isDisabled = disabled || loading;
  return <Pressable disabled={isDisabled} onPress={onPress} style={({ pressed }) => [styles.base, styles[variant], isDisabled && styles.disabled, pressed && styles.pressed, style]}>{loading ? <ActivityIndicator color={variant === 'dark' ? colors.white : colors.text} /> : <Text style={[styles.label, variant !== 'dark' && styles.darkLabel]}>{label}</Text>}</Pressable>;
}

const styles = StyleSheet.create({ base: { height: 60, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' }, dark: { backgroundColor: colors.black }, accent: { backgroundColor: colors.accentSoft }, outline: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border }, label: { fontSize: 18, fontWeight: '700', color: colors.white }, darkLabel: { color: colors.text }, pressed: { opacity: 0.72 }, disabled: { opacity: 0.5 } });
