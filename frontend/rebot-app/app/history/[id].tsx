import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { backendApi, getErrorMessage } from '@/src/services/api';
import type { AnalysisResponse } from '@/src/types/api';
import { colors, radius } from '@/src/theme/tokens';

export default function HistoryDetailScreen() {
  const { id, description, recommendationAction } = useLocalSearchParams<{ id: string; description?: string; recommendationAction?: string }>();
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAnalysis(await backendApi.getAnalysis(id));
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <Screen contentStyle={styles.center}><ActivityIndicator color={colors.text} /></Screen>;

  if (error || !analysis) {
    return <Screen><AppHeader title="자가진단 상세" back /><View style={styles.state}>
      <Text style={styles.error}>{error ?? '기록을 불러오지 못했어요.'}</Text>
      <PrimaryButton label="다시 시도" onPress={() => void load()} style={styles.retry} />
    </View></Screen>;
  }

  return <Screen scroll><AppHeader title="자가진단 상세" back /><View style={styles.body}>
    {description ? <View style={styles.symptomBlock}><Text style={styles.label}>증상</Text><Text style={styles.symptomText}>{description}</Text></View> : null}

    <Text style={styles.label}>유력 후보</Text>
    <View style={styles.cards}>{analysis.candidates.map((candidate) => <View key={candidate.id} style={[styles.candidateCard, candidate.id === analysis.selected_candidate_id && styles.candidateCardSelected]}>
      <View style={styles.candidateHeader}>
        <Text style={styles.candidateTitle}>{candidate.title}</Text>
        {candidate.id === analysis.selected_candidate_id && <Ionicons name="checkmark-circle" size={18} color="#8A6B00" />}
      </View>
      <Text style={styles.candidateReason}>{candidate.reason}</Text>
    </View>)}</View>
    {analysis.candidates.length === 0 && <Text style={styles.empty}>확인된 후보가 없어요.</Text>}
    {analysis.selection_status === 'none' && <Text style={styles.empty}>제시된 후보 중 해당하는 항목이 없다고 선택했어요.</Text>}

    {recommendationAction && <View style={styles.recommendationBlock}><Text style={styles.label}>추천 해결 방법</Text><Text style={styles.recommendationText}>{recommendationAction}</Text></View>}
  </View></Screen>;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40, gap: 8 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
  error: { textAlign: 'center', color: '#B42318', fontSize: 13, lineHeight: 20 },
  retry: { width: '100%' },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, marginTop: 20, marginBottom: 8 },
  symptomBlock: { marginTop: 0 },
  symptomText: { fontSize: 15, lineHeight: 22, color: colors.text },
  cards: { gap: 12 },
  candidateCard: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 16 },
  candidateCardSelected: { backgroundColor: colors.warningSoft, borderColor: '#F4D36A' },
  candidateHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  candidateTitle: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  candidateReason: { marginTop: 6, fontSize: 13, lineHeight: 20, color: colors.muted },
  empty: { fontSize: 13, color: colors.muted },
  recommendationBlock: { borderRadius: radius.md, backgroundColor: colors.warningSoft, padding: 18 },
  recommendationText: { fontSize: 14, lineHeight: 22, color: colors.text },
});
