import { PropsWithChildren } from 'react';
import { ScrollView, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/tokens';

type Props = PropsWithChildren<{ scroll?: boolean; bottomSafe?: boolean; contentStyle?: StyleProp<ViewStyle> }>;

export function Screen({ children, scroll = false, bottomSafe = true, contentStyle }: Props) {
  const edges = bottomSafe ? (['top', 'bottom'] as const) : (['top'] as const);
  if (scroll) {
    return <SafeAreaView style={styles.safe} edges={edges}><ScrollView contentContainerStyle={[styles.content, contentStyle]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{children}</ScrollView></SafeAreaView>;
  }
  return <SafeAreaView style={[styles.safe, styles.content, contentStyle]} edges={edges}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, content: { flexGrow: 1, backgroundColor: colors.background } });
