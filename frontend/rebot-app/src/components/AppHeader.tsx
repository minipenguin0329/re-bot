import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme/tokens';

type Props = { title: string; back?: boolean; leftIcon?: keyof typeof Ionicons.glyphMap; rightIcon?: keyof typeof Ionicons.glyphMap; onRightPress?: () => void };

export function AppHeader({ title, back, leftIcon, rightIcon, onRightPress }: Props) {
  return <View style={styles.header}>
    <View style={styles.side}>{(back || leftIcon) && <Pressable hitSlop={12} onPress={() => back && router.back()}><Ionicons name={back ? 'arrow-back' : leftIcon} size={26} color={colors.text} /></Pressable>}</View>
    <Text style={styles.title}>{title}</Text>
    <View style={[styles.side, styles.right]}>{rightIcon && <Pressable hitSlop={12} onPress={onRightPress}><Ionicons name={rightIcon} size={25} color={colors.text} /></Pressable>}</View>
  </View>;
}

const styles = StyleSheet.create({ header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24 }, side: { width: 44, alignItems: 'flex-start' }, right: { alignItems: 'flex-end' }, title: { flex: 1, textAlign: 'center', fontSize: 20, lineHeight: 32, fontWeight: '700', color: colors.text } });
