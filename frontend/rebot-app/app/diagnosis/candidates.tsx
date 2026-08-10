import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/src/components/AppHeader';
import { ChoiceCard } from '@/src/components/ChoiceCard';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { getErrorMessage } from '@/src/services/api';
import { useWellness } from '@/src/store/WellnessContext';
import { colors } from '@/src/theme/tokens';

export default function CandidatesScreen() {
  const { analysis, chooseCandidate } = useWellness();
  const [selected, setSelected] = useState<string | 'none' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!selected) {
      Alert.alert('선택 확인', '가장 가까운 후보를 하나 선택하거나 해당 없음을 선택해주세요.');
      return;
    }
    setLoading(true);
    try {
      await chooseCandidate(selected === 'none' ? null : selected);
      router.push('/diagnosis/result');
    } catch (error) {
      Alert.alert('추천 생성 실패', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (!analysis) {
    return <Screen><AppHeader title="AI 자가진단" back /><View style={styles.missing}><Text style={styles.copy}>분석 결과가 없습니다.</Text><PrimaryButton label="다시 입력하기" onPress={() => router.replace('/(tabs)/diagnosis')} /></View></Screen>;
  }

  return <Screen scroll><AppHeader title="AI 자가진단" back /><View style={styles.body}>
    <Text style={styles.title}>가능한 원인 후보</Text>
    <Text style={styles.copy}>AI가 정리한 후보 중 가장 가까운 항목 하나를 선택해주세요.</Text>
    <View style={styles.cards}>{analysis.candidates.map((candidate, index) => <ChoiceCard key={candidate.id} number={index + 1} title={candidate.title} description={candidate.reason} selected={selected === candidate.id} onPress={() => setSelected(candidate.id)} />)}
      <ChoiceCard title="해당되는 후보가 없어요" description="현재 후보를 선택하지 않고 일반적인 행동 제안을 받아볼게요." selected={selected === 'none'} onPress={() => setSelected('none')} />
    </View>
    <PrimaryButton label="행동 추천 받기" onPress={handleNext} loading={loading} style={styles.button} />
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 4, paddingBottom: 30 }, title: { fontSize: 20, fontWeight: '800', marginTop: 4 }, copy: { fontSize: 14, color: colors.muted, marginTop: 8, lineHeight: 21 }, cards: { marginTop: 26, gap: 16 }, button: { marginTop: 28 }, missing: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 24 } });
