import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { ChoiceCard } from '@/src/components/ChoiceCard';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { getErrorMessage } from '@/src/services/api';
import { useWellness } from '@/src/store/WellnessContext';
import { colors } from '@/src/theme/tokens';
import { getRecommendationSolutions } from '@/src/utils/recommendation';

export default function SuggestionScreen() {
  const { recommendation, requestAlternative } = useWellness();
  const [loadingAlternative, setLoadingAlternative] = useState(false);

  const handleAlternative = async () => {
    setLoadingAlternative(true);
    try {
      await requestAlternative('현재 상황에서는 실행하기 어려워요.');
    } catch (error) {
      Alert.alert('대안 생성 실패', getErrorMessage(error));
    } finally {
      setLoadingAlternative(false);
    }
  };

  if (!recommendation) {
    return <Screen><View style={styles.missing}><Text style={styles.copy}>표시할 제안이 없습니다.</Text><PrimaryButton label="다시 입력하기" onPress={() => router.replace('/(tabs)/solution')} /></View></Screen>;
  }

  const solutions = getRecommendationSolutions(recommendation);

  return <Screen scroll><View style={styles.body}><Text style={styles.title}>지금은 이런 방법이 좋아요</Text><Text style={styles.copy}>현재 상황에서 시도할 수 있는 방법만 골라 최대 5개까지 안내해드려요.</Text><View style={styles.cards}>{solutions.map((solution, index) => <ChoiceCard key={`${solution.action}-${index}`} title={solution.action} description={solution.reason} number={index + 1} />)}</View><View style={styles.buttons}><PrimaryButton label="실행할게요" onPress={() => router.push('/solution/feedback')} style={styles.flex} /><PrimaryButton label="다른 대안" variant="accent" onPress={handleAlternative} loading={loadingAlternative} style={styles.flex} /></View></View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 38, paddingBottom: 28 }, title: { fontSize: 21, fontWeight: '800' }, copy: { fontSize: 14, color: colors.muted, marginTop: 10, lineHeight: 21 }, cards: { marginTop: 40, gap: 24 }, meta: { marginTop: 18, color: colors.muted, fontSize: 12 }, buttons: { marginTop: 'auto', paddingTop: 36, flexDirection: 'row', gap: 14 }, flex: { flex: 1 }, missing: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 24 } });
