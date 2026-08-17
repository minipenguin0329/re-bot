import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { backendApi, getErrorMessage } from '@/src/services/api';
import type { AnalysisHistoryItem } from '@/src/types/api';
import { colors, radius } from '@/src/theme/tokens';

const STATUS_LABEL: Record<AnalysisHistoryItem['status'], string> = {
  pending: '분석 중',
  completed: '완료',
  failed: '분석 실패',
};

function formatDate(iso: string) {
  const date = new Date(iso);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export default function HistoryScreen() {
  const [items, setItems] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await backendApi.listAnalyses());
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return <Screen scroll><AppHeader title="대화 내역" back />
    <View style={styles.body}>
      {loading && <View style={styles.state}><ActivityIndicator color={colors.text} /></View>}
      {!loading && error && <View style={styles.state}><Text style={styles.error}>{error}</Text><PrimaryButton label="다시 시도" onPress={() => void load()} style={styles.retry} /></View>}
      {!loading && !error && items.length === 0 && <View style={styles.state}><Text style={styles.empty}>아직 진행한 자가진단이 없어요.</Text></View>}
      {!loading && !error && items.map((item) => <Pressable key={item.id} style={styles.card} onPress={() => router.push({ pathname: '/history/[id]', params: { id: item.id, description: item.symptom_description } })}>
        <View style={styles.cardHeader}>
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
          <Text style={[styles.status, item.status === 'failed' && styles.statusFailed]}>{STATUS_LABEL[item.status]}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>{item.symptom_description}</Text>
        {item.recommendation_action && <View style={styles.recommendationRow}><Ionicons name="checkmark-circle-outline" size={16} color="#8A6B00" style={styles.recommendationIcon} /><Text style={styles.recommendation} numberOfLines={3}>{item.recommendation_action}</Text></View>}
        <Ionicons name="chevron-forward" size={18} color="#BBB" style={styles.chevron} />
      </Pressable>)}
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40, gap: 14 },
  state: { alignItems: 'center', paddingTop: 60, gap: 16 },
  error: { textAlign: 'center', color: '#B42318', fontSize: 13, lineHeight: 20 },
  retry: { width: '100%' },
  empty: { textAlign: 'center', color: colors.muted, fontSize: 13, lineHeight: 21 },
  card: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 18, paddingRight: 36 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { fontSize: 12, color: colors.muted },
  status: { fontSize: 11, fontWeight: '700', color: '#8A6B00' },
  statusFailed: { color: '#B42318' },
  description: { marginTop: 8, fontSize: 15, fontWeight: '600', lineHeight: 22, color: colors.text },
  recommendationRow: { marginTop: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  recommendationIcon: { marginTop: 2 },
  recommendation: { flex: 1, fontSize: 12, lineHeight: 18, color: colors.muted },
  chevron: { position: 'absolute', right: 14, top: '50%', marginTop: -9 },
});
