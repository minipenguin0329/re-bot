import { Ionicons } from '@expo/vector-icons';
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
  ['식습관 불균형', '불규칙한 식사나 자극적인 음식 섭취가 피부 상태에 영향을 줄 수 있어요.'],
  ['흡연', '흡연이 피부 건강과 회복에 영향을 줄 수 있어요.'],
  ['생활 리듬 변화', '불규칙한 생활이 피부 상태에 영향을 줄 수 있어요.'],
  ['피부 관리 부족', '세안 습관이나 피부 관리 방법이 피부 상태에 영향을 줄 수 있어요.'],
  ['마스크, 외부 자극', '마스크 착용이나 마찰 등 외부 자극이 피부 트러블을 유발할 수 있어요.'],
  ['수분 부족', '피부 수분이 부족하면 유수분 균형이 무너져 트러블이 생길 수 있어요.'],
] as const;

const PAGE_SIZE = 3;
const PAGE_COUNT = Math.ceil(candidates.length / PAGE_SIZE);

export default function CandidatesScreen() {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const toggle = (index: number) => setSelected((current) => current.includes(index) ? current.filter((value) => value !== index) : [...current, index]);

  const handleNext = () => {
    if (page < PAGE_COUNT - 1) setPage((current) => current + 1);
    else router.push('/diagnosis/result');
  };
  const handlePrev = () => setPage((current) => Math.max(0, current - 1));

  const pageCandidates = candidates.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return <Screen><AppHeader title="AI 자가진단" back /><View style={styles.body}>
    <Text style={styles.title}>유력 후보</Text>
    <Text style={styles.copy}>해당되는 항목을 모두 선택해주세요</Text>
    <View style={styles.cards}>{pageCandidates.map(([title, description], indexInPage) => {
      const index = page * PAGE_SIZE + indexInPage;
      return <ChoiceCard key={title} number={index + 1} title={title} description={description} selected={selected.includes(index)} onPress={() => toggle(index)} />;
    })}</View>
    <View style={styles.footer}>
      <View style={[styles.nav, page === 0 && styles.navEnd]}>
        {page > 0 && <Pressable style={styles.navButton} onPress={handlePrev}><Ionicons name="chevron-back" size={18} color={colors.text} /><Text style={styles.navText}>이전</Text></Pressable>}
        <Pressable style={styles.navButton} onPress={handleNext}><Text style={styles.navText}>다음</Text><Ionicons name="chevron-forward" size={18} color={colors.text} /></Pressable>
      </View>
      <Text style={styles.page}>{page + 1}/{PAGE_COUNT}</Text>
    </View>
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 4 }, title: { fontSize: 20, fontWeight: '800', marginTop: 4 }, copy: { fontSize: 14, color: colors.muted, marginTop: 8 }, cards: { marginTop: 32, gap: 24 }, footer: { marginTop: 'auto', alignItems: 'center', gap: 4 }, nav: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' }, navEnd: { justifyContent: 'flex-end' }, navButton: { flexDirection: 'row', alignItems: 'center', gap: 2 }, navText: { fontSize: 16, fontWeight: '700', color: colors.text }, page: { fontSize: 13, color: colors.muted } });
