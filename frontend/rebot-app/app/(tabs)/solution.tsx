import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { colors, radius } from '@/src/theme/tokens';

export default function SolutionScreen() {
  return <Screen><AppHeader title="AI 솔루션" back /><View style={styles.body}><Text style={styles.title}>고민되는 상황을 입력해주세요</Text><Text style={styles.subtitle}>AI가 상황을 분석하고 최선의 선택을 제안해드릴게요</Text><FormField multiline placeholder="예) 회식 때문에 술을 마셔야 하는데 내일 아침 개운하게 일어나고 싶어요." /><View style={styles.tip}><Ionicons name="bulb-outline" size={30} color="#999" /><Text style={styles.tipText}>구체적으로 입력할수록{`\n`}더 정확한 제안을 받을 수 있어요.</Text></View><PrimaryButton label="물어보기" onPress={() => router.push('/solution/suggestion')} style={styles.button} /></View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 24 }, title: { fontSize: 20, fontWeight: '700', marginHorizontal: 8 }, subtitle: { fontSize: 14, color: colors.muted, marginHorizontal: 8, marginTop: 10, marginBottom: 30 }, tip: { height: 78, borderRadius: radius.md, backgroundColor: colors.warningSoft, marginTop: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28 }, tipText: { fontSize: 12, color: colors.muted, lineHeight: 22 }, button: { marginTop: 'auto', marginBottom: 50 } });
