import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { useWellness } from '@/src/store/WellnessContext';
import { colors, radius } from '@/src/theme/tokens';

export default function ResultScreen() {
  const { recommendation } = useWellness();

  if (!recommendation) {
    return <Screen><AppHeader title="AI 자가진단" back /><View style={styles.missing}><Text style={styles.notice}>추천 결과가 없습니다.</Text><PrimaryButton label="다시 분석하기" onPress={() => router.replace('/(tabs)/diagnosis')} /></View></Screen>;
  }

  return <Screen scroll><AppHeader title="AI 자가진단" back /><View style={styles.body}>
    <Text style={styles.title}>추천 해결 방법</Text>
    <View style={styles.recommendation}><View style={styles.row}><Ionicons name="checkmark-circle" size={26} color="#8A6B00" /><Text style={styles.action}>{recommendation.action}</Text></View><Text style={styles.reason}>{recommendation.reason}</Text>{recommendation.duration_minutes && <Text style={styles.meta}>예상 소요 시간 · {recommendation.duration_minutes}분</Text>}</View>
    {recommendation.alternative && <View style={styles.alternative}><Text style={styles.alternativeTitle}>대안</Text><Text style={styles.reason}>{recommendation.alternative}</Text></View>}
    <Text style={styles.notice}>위 정보는 일반적인 웰니스 정보이며, 의학적 진단을 대체하지 않습니다.</Text>
    <PrimaryButton label="확인했어요" onPress={() => router.replace('/(tabs)/home')} style={styles.button} />
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }, title: { fontSize: 20, fontWeight: '800', paddingBottom: 24, borderBottomWidth: 1, borderColor: colors.border }, recommendation: { marginTop: 24, padding: 20, borderRadius: radius.md, backgroundColor: colors.warningSoft }, row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 }, action: { flex: 1, fontSize: 17, lineHeight: 25, fontWeight: '700' }, reason: { marginTop: 14, fontSize: 14, lineHeight: 22, color: colors.muted }, meta: { marginTop: 12, fontSize: 12, fontWeight: '600', color: '#8A6B00' }, alternative: { marginTop: 16, padding: 20, borderRadius: radius.md, backgroundColor: colors.surface }, alternativeTitle: { fontSize: 14, fontWeight: '800' }, notice: { textAlign: 'center', fontSize: 11, lineHeight: 18, color: colors.muted, marginTop: 48 }, button: { marginTop: 24 }, missing: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 24 } });
