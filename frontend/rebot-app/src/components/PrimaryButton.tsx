import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius } from '@/src/theme/tokens';

type Props = { label: string; onPress?: () => void; variant?: 'dark' | 'accent' | 'outline'; style?: ViewStyle };

export function PrimaryButton({ label, onPress, variant = 'dark', style }: Props) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, style]}><Text style={[styles.label, variant !== 'dark' && styles.darkLabel]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({ base: { height: 60, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' }, dark: { backgroundColor: colors.black }, accent: { backgroundColor: colors.accentSoft }, outline: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border }, label: { fontSize: 18, fontWeight: '700', color: colors.white }, darkLabel: { color: colors.text }, pressed: { opacity: 0.72 } });
