import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme/tokens';

type Props = { title: string; back?: boolean; leftIcon?: keyof typeof Ionicons.glyphMap; rightIcon?: keyof typeof Ionicons.glyphMap; onRightPress?: () => void; rightBadge?: boolean; rightDisabled?: boolean };

export function AppHeader({ title, back, leftIcon, rightIcon, onRightPress, rightBadge, rightDisabled }: Props) {
  return <View style={styles.header}>
    <View style={styles.side}>{(back || leftIcon) && <Pressable hitSlop={12} onPress={() => back && router.back()}><Ionicons name={back ? 'arrow-back' : leftIcon} size={26} color={colors.text} /></Pressable>}</View>
    <Text style={styles.title}>{title}</Text>
    <View style={[styles.side, styles.right]}>{rightIcon && <Pressable hitSlop={12} onPress={onRightPress} disabled={rightDisabled} style={rightDisabled && styles.disabled}><Ionicons name={rightIcon} size={25} color={colors.text} />{rightBadge && <View style={styles.badge} />}</Pressable>}</View>
  </View>;
}

const styles = StyleSheet.create({ header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24 }, side: { width: 44, alignItems: 'flex-start' }, right: { alignItems: 'flex-end' }, disabled: { opacity: 0.3 }, title: { flex: 1, textAlign: 'center', fontSize: 20, lineHeight: 32, fontWeight: '700', color: colors.text }, badge: { position: 'absolute', top: 0, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#F4D36A', borderWidth: 1, borderColor: colors.white } });
