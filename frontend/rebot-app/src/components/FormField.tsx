import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius } from '@/src/theme/tokens';

type Props = TextInputProps & { label?: string; icon?: keyof typeof Ionicons.glyphMap };

export function FormField({ label, icon, multiline, ...props }: Props) {
  return <View style={styles.block}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View style={[styles.field, multiline && styles.multiline]}>
      {icon && <Ionicons name={icon} size={21} color="#B9B9BE" />}
      <TextInput placeholderTextColor="#B9B9BE" style={[styles.input, multiline && styles.multilineInput]} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} {...props} />
    </View>
  </View>;
}

const styles = StyleSheet.create({ block: { gap: 8 }, label: { fontSize: 14, color: colors.muted, marginLeft: 8 }, field: { minHeight: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surfaceStrong, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md }, input: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 0 }, multiline: { minHeight: 268, alignItems: 'flex-start', paddingTop: 18, backgroundColor: colors.white }, multilineInput: { minHeight: 230, lineHeight: 24 } });
