import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { ChoiceCard } from '@/src/components/ChoiceCard';
import { Screen } from '@/src/components/Screen';
import { colors } from '@/src/theme/tokens';

const candidates = [
  ['수면 부족', '부족한 수면은 피부 건강에 영향을 줄 수 있어요.'],
  ['스트레스 증가', '스트레스가 지속되면 호르몬 변화로 피부 상태에 영향을 줄 수 있어요.'],
  ['호르몬 변화', '호르몬 균형 변화가 피지 분비 증가와 관련될 수 있어요.'],
] as const;

export default function CandidatesScreen() {
  const [selected, setSelected] = useState<number[]>([]);
  const toggle = (index: number) => setSelected((current) => current.includes(index) ? current.filter((value) => value !== index) : [...current, index]);
  return <Screen><AppHeader title="AI 자가진단" back /><View style={styles.body}><Text style={styles.title}>유력 후보</Text><Text style={styles.copy}>해당되는 항목을 모두 선택해주세요</Text><View style={styles.cards}>{candidates.map(([title, description], index) => <ChoiceCard key={title} title={title} description={description} selected={selected.includes(index)} onPress={() => toggle(index)} />)}</View><Pressable style={styles.next} onPress={() => router.push('/diagnosis/result')}><Text style={styles.nextText}>다음</Text><Text style={styles.page}>1/3</Text></Pressable></View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 4 }, title: { fontSize: 20, fontWeight: '800', marginTop: 4 }, copy: { fontSize: 14, color: colors.muted, marginTop: 8 }, cards: { marginTop: 32, gap: 24 }, next: { marginTop: 'auto', marginBottom: 24, alignItems: 'flex-end' }, nextText: { fontSize: 16, fontWeight: '700' }, page: { fontSize: 16, marginTop: 4 } });
