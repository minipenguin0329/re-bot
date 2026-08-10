import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { ChoiceCard } from '@/src/components/ChoiceCard';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { getErrorMessage } from '@/src/services/api';
import { useWellness } from '@/src/store/WellnessContext';
import { colors } from '@/src/theme/tokens';

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

  return <Screen scroll><View style={styles.body}><Text style={styles.title}>지금은 이런 방법이 좋아요</Text><Text style={styles.copy}>실행하기 어렵다면 다른 대안을 다시 만들 수 있어요.</Text><View style={styles.cards}><ChoiceCard title={recommendation.action} description={recommendation.reason} number={1} />{recommendation.alternative && <ChoiceCard title="함께 고려할 대안" description={recommendation.alternative} number={2} />}</View>{recommendation.duration_minutes && <Text style={styles.meta}>예상 소요 시간 · {recommendation.duration_minutes}분</Text>}<View style={styles.buttons}><PrimaryButton label="실행할게요" onPress={() => router.push('/solution/feedback')} style={styles.flex} /><PrimaryButton label="다른 대안" variant="accent" onPress={handleAlternative} loading={loadingAlternative} style={styles.flex} /></View></View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 38, paddingBottom: 28 }, title: { fontSize: 21, fontWeight: '800' }, copy: { fontSize: 14, color: colors.muted, marginTop: 10, lineHeight: 21 }, cards: { marginTop: 40, gap: 24 }, meta: { marginTop: 18, color: colors.muted, fontSize: 12 }, buttons: { marginTop: 'auto', paddingTop: 36, flexDirection: 'row', gap: 14 }, flex: { flex: 1 }, missing: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 24 } });
