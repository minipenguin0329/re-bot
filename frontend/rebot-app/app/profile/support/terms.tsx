import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { colors, radius } from '@/src/theme/tokens';

const docs = {
  terms: { title: '이용약관', body: '본 문서는 데모용 자리표시 텍스트입니다.\n\n제1조 (목적) 이 약관은 RE:BOT 서비스 이용과 관련하여 회사와 회원의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.\n\n제2조 (서비스의 성격) RE:BOT은 생활 기록을 바탕으로 참고용 후보와 행동 제안을 제공하며, 의료 진단이나 처방을 대체하지 않습니다.\n\n실제 서비스 약관은 추후 반영될 예정입니다.' },
  notice: { title: '주의사항', body: '본 문서는 데모용 자리표시 텍스트입니다.\n\n• RE:BOT이 제공하는 정보는 의료적 진단이나 처방이 아니며, 증상이 지속되거나 악화되면 전문 의료기관을 방문해주세요.\n\n• 제품 추천은 참고용이며 구매를 강제하지 않습니다.\n\n• 서비스 이용 중 수집되는 정보는 더 나은 제안을 위한 목적으로만 사용됩니다.' },
} as const;

export default function SupportTermsScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [active, setActive] = useState<keyof typeof docs>(tab === 'notice' ? 'notice' : 'terms');
  const doc = docs[active];

  return <Screen scroll><AppHeader title="이용약관·주의사항" back /><View style={styles.body}>
    <View style={styles.tabs}>{(Object.keys(docs) as (keyof typeof docs)[]).map((key) => <Pressable key={key} style={[styles.tab, active === key && styles.tabActive]} onPress={() => setActive(key)}><Text style={[styles.tabLabel, active === key && styles.tabLabelActive]}>{docs[key].title}</Text></Pressable>)}</View>
    <Text style={styles.docTitle}>{doc.title}</Text>
    <Text style={styles.docBody}>{doc.body}</Text>
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }, tabs: { flexDirection: 'row', gap: 8, marginBottom: 24 }, tab: { flex: 1, height: 44, borderRadius: radius.md, backgroundColor: colors.surfaceStrong, alignItems: 'center', justifyContent: 'center' }, tabActive: { backgroundColor: colors.black }, tabLabel: { fontSize: 13, fontWeight: '600', color: colors.muted }, tabLabelActive: { color: colors.white }, docTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 }, docBody: { fontSize: 13, lineHeight: 22, color: colors.text } });
