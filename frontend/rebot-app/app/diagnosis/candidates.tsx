import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { ChoiceCard } from '@/src/components/ChoiceCard';
import { Screen } from '@/src/components/Screen';
import { getErrorMessage } from '@/src/services/api';
import { useWellness } from '@/src/store/WellnessContext';
import { colors } from '@/src/theme/tokens';

const PAGE_SIZE = 3;

export default function CandidatesScreen() {
  const { analysis, chooseCandidate } = useWellness();
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string | null | 'none'>(null);
  const [loading, setLoading] = useState(false);
  const available = analysis?.candidates ?? [];
  const items = [...available, { id: 'none', title: '해당 없음', reason: '제시된 원인 후보 중 해당하는 항목이 없어요.' }];
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  const handleNext = async () => {
    if (page < pageCount - 1) return setPage((current) => current + 1);
    if (selected === null) return Alert.alert('선택 확인', '가장 가까운 원인 후보 또는 해당 없음을 선택해주세요.');
    setLoading(true);
    try {
      await chooseCandidate(selected === 'none' ? null : selected);
      router.push('/diagnosis/result');
    } catch (error) {
      Alert.alert('결과 생성 실패', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const handlePrev = () => setPage((current) => Math.max(0, current - 1));

  const pageCandidates = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  if (!analysis) return <Screen><View style={styles.missing}><Text style={styles.copy}>완료된 분석 정보가 없습니다.</Text><Pressable onPress={() => router.replace('/(tabs)/diagnosis')}><Text style={styles.navText}>다시 입력하기</Text></Pressable></View></Screen>;

  return <Screen scroll><AppHeader title="AI 자가진단" back /><View style={styles.body}>
    <Text style={styles.title}>유력 후보</Text>
    <Text style={styles.copy}>해당되는 항목을 모두 선택해주세요</Text>
    <View style={styles.cards}>{pageCandidates.map((candidate, indexInPage) => {
      const index = page * PAGE_SIZE + indexInPage;
      return <ChoiceCard key={candidate.id} number={index + 1} title={candidate.title} description={candidate.reason} selected={selected === candidate.id} onPress={() => setSelected(candidate.id)} />;
    })}</View>
    <View style={styles.footer}>
      <View style={[styles.nav, page === 0 && styles.navEnd]}>
        {page > 0 && <Pressable style={styles.navButton} onPress={handlePrev}><Ionicons name="chevron-back" size={18} color={colors.text} /><Text style={styles.navText}>이전</Text></Pressable>}
        <Pressable disabled={loading} style={[styles.navButton, loading && styles.disabled]} onPress={() => void handleNext()}><Text style={styles.navText}>{loading ? '생성 중' : '다음'}</Text><Ionicons name="chevron-forward" size={18} color={colors.text} /></Pressable>
      </View>
      <Text style={styles.page}>{page + 1}/{pageCount}</Text>
    </View>
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 4 }, title: { fontSize: 20, fontWeight: '800', marginTop: 4 }, copy: { fontSize: 14, color: colors.muted, marginTop: 8 }, cards: { marginTop: 32, gap: 24 }, footer: { marginTop: 'auto', alignItems: 'center', gap: 4 }, nav: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' }, navEnd: { justifyContent: 'flex-end' }, navButton: { flexDirection: 'row', alignItems: 'center', gap: 2 }, navText: { fontSize: 16, fontWeight: '700', color: colors.text }, page: { fontSize: 13, color: colors.muted }, disabled: { opacity: 0.5 }, missing: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20, paddingHorizontal: 24 } });
