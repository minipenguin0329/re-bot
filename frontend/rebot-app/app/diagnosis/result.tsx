import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { useWellness } from '@/src/store/WellnessContext';
import { colors, radius } from '@/src/theme/tokens';
import { getRecommendationSolutions } from '@/src/utils/recommendation';

export default function ResultScreen() {
  const { recommendation } = useWellness();

  if (!recommendation) {
    return <Screen><AppHeader title="AI 자가진단" back /><View style={styles.missing}><Text style={styles.notice}>추천 결과가 없습니다.</Text><PrimaryButton label="다시 분석하기" onPress={() => router.replace('/(tabs)/diagnosis')} /></View></Screen>;
  }

  const solutions = getRecommendationSolutions(recommendation);
  const supportResources = recommendation.support_resources ?? [];

  return <Screen scroll><AppHeader title="AI 자가진단" back /><View style={styles.body}>
    <Text style={styles.title}>지금 직접 해볼 수 있는 방법</Text>
    {solutions.map((solution, index) => <View key={`${solution.action}-${index}`} style={styles.recommendation}><Text style={styles.action}>{solution.action}</Text><Text style={styles.reason}>{solution.reason}</Text>{solution.duration_minutes && <Text style={styles.meta}>예상 소요 시간 · {solution.duration_minutes}분</Text>}</View>)}
    {supportResources.length > 0 && <View style={styles.supportSection}>
      <Text style={styles.supportTitle}>함께 활용하면 도움 되는 도구·서비스</Text>
      {supportResources.map((resource, index) => <View key={`${resource.category}-${resource.name}-${index}`} style={styles.supportCard}>
        <View style={styles.supportHeader}>
          <Ionicons name={resource.category === 'service' ? 'people-outline' : 'cube-outline'} size={21} color="#8A6B00" />
          <Text style={styles.supportBadge}>{resource.category === 'service' ? '서비스 유형' : '도구 유형'}</Text>
        </View>
        <Text style={styles.supportName}>{resource.name}</Text>
        <Text style={styles.supportBenefit}>{resource.benefit}</Text>
        {resource.selection_tip && <Text style={styles.supportTip}>살펴볼 점 · {resource.selection_tip}</Text>}
      </View>)}
    </View>}
    <Text style={styles.notice}>위 정보는 일반적인 웰니스 정보이며, 의학적 진단을 대체하지 않습니다.</Text>
    <PrimaryButton label="확인했어요" onPress={() => router.replace('/(tabs)/home')} style={styles.button} />
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }, title: { fontSize: 20, fontWeight: '800', paddingBottom: 24, borderBottomWidth: 1, borderColor: colors.border }, recommendation: { marginTop: 16, padding: 20, borderRadius: radius.md, backgroundColor: colors.warningSoft }, action: { fontSize: 17, lineHeight: 25, fontWeight: '700' }, reason: { marginTop: 14, fontSize: 14, lineHeight: 22, color: colors.muted }, meta: { marginTop: 12, fontSize: 12, fontWeight: '600', color: '#8A6B00' }, supportSection: { marginTop: 36, paddingTop: 28, borderTopWidth: 1, borderColor: colors.border }, supportTitle: { fontSize: 20, lineHeight: 28, fontWeight: '800', color: colors.text }, supportCard: { marginTop: 16, padding: 20, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, supportHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 }, supportBadge: { fontSize: 12, fontWeight: '700', color: '#8A6B00' }, supportName: { marginTop: 14, fontSize: 17, lineHeight: 24, fontWeight: '700', color: colors.text }, supportBenefit: { marginTop: 8, fontSize: 14, lineHeight: 22, color: colors.muted }, supportTip: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: colors.border, fontSize: 12, lineHeight: 19, color: colors.text }, notice: { textAlign: 'center', fontSize: 11, lineHeight: 18, color: colors.muted, marginTop: 48 }, button: { marginTop: 24 }, missing: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 24 } });
