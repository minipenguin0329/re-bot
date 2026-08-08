import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/src/theme/tokens';

type Props = { title: string; description?: string; selected?: boolean; onPress?: () => void; number?: number };

export function ChoiceCard({ title, description, selected, onPress, number }: Props) {
  return <Pressable onPress={onPress} style={[styles.card, selected && styles.selected]}>{number ? <Text style={styles.number}>{number}</Text> : null}<View style={styles.copy}><Text style={styles.title}>{title}</Text>{description ? <Text style={styles.description}>{description}</Text> : null}</View></Pressable>;
}

const styles = StyleSheet.create({ card: { minHeight: 120, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, justifyContent: 'center' }, selected: { backgroundColor: colors.warningSoft, borderColor: colors.accent }, number: { fontSize: 14, fontWeight: '700', marginBottom: 10 }, copy: { gap: 6 }, title: { fontSize: 16, fontWeight: '600', color: colors.text }, description: { fontSize: 12, lineHeight: 20, color: colors.muted } });
