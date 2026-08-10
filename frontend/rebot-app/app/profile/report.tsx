import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { backendApi, getErrorMessage } from '@/src/services/api';
import type { ReportResponse } from '@/src/types/api';
import { colors, radius } from '@/src/theme/tokens';

export default function HealthReportScreen() {
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await backendApi.getWeeklyReport());
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  if (loading) return <Screen><AppHeader title="AI 건강 리포트" back /><View style={styles.center}><ActivityIndicator color={colors.text} /><Text style={styles.loadingText}>이번 주 기록을 정리하고 있어요.</Text></View></Screen>;
  if (!report) return <Screen><AppHeader title="AI 건강 리포트" back /><View style={styles.center}><Text style={styles.error}>{error}</Text><PrimaryButton label="다시 시도" onPress={() => void loadReport()} style={styles.retry} /></View></Screen>;

  const metrics = [
    ['기록한 날', `${report.statistics.recorded_days}일`, Math.min(report.statistics.recorded_days / 7, 1)],
    ['평균 수면', report.statistics.average_sleep_hours == null ? '기록 없음' : `${report.statistics.average_sleep_hours.toFixed(1)}시간`, Math.min((report.statistics.average_sleep_hours ?? 0) / 8, 1)],
    ['운동한 날', `${report.statistics.exercise_days}일`, Math.min(report.statistics.exercise_days / 7, 1)],
  ] as const;

  return <Screen scroll><AppHeader title="AI 건강 리포트" back /><View style={styles.body}><View style={styles.summary}><Text style={styles.kicker}>{report.period_start} ~ {report.period_end}</Text><Text style={styles.score}>{report.statistics.recorded_days}</Text><Text style={styles.unit}>/ 7일 기록</Text><Text style={styles.summaryCopy}>{report.summary.overview}</Text></View><Text style={styles.heading}>생활 패턴</Text>{metrics.map(([label, value, ratio]) => <View style={styles.metric} key={label}><View style={styles.metricTop}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View><View style={styles.track}><View style={[styles.fill, { width: `${Number(ratio) * 100}%` }]} /></View></View>)}<View style={styles.insight}><Text style={styles.insightTitle}>AI 관찰 내용</Text>{report.summary.observations.map((observation) => <Text key={observation} style={styles.insightCopy}>• {observation}</Text>)}</View><Text style={styles.disclaimer}>{report.summary.disclaimer}</Text></View></Screen>;
}

const styles = StyleSheet.create({ body: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 60 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 }, loadingText: { color: colors.muted, fontSize: 14 }, error: { color: '#B42318', textAlign: 'center', lineHeight: 21 }, retry: { width: '100%', marginTop: 10 }, summary: { minHeight: 250, borderRadius: radius.lg, backgroundColor: colors.warningSoft, padding: 24 }, kicker: { fontSize: 13, color: colors.muted }, score: { fontSize: 64, fontWeight: '800', marginTop: 14 }, unit: { position: 'absolute', left: 92, top: 85, color: colors.muted }, summaryCopy: { fontSize: 14, lineHeight: 22, marginTop: 12 }, heading: { fontSize: 18, fontWeight: '800', marginTop: 34, marginBottom: 8 }, metric: { paddingVertical: 18 }, metricTop: { flexDirection: 'row', justifyContent: 'space-between' }, metricLabel: { fontSize: 15, fontWeight: '700' }, metricValue: { fontSize: 13, color: colors.muted }, track: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceStrong, marginTop: 12 }, fill: { height: 8, borderRadius: 4, backgroundColor: colors.accent }, insight: { marginTop: 22, borderRadius: radius.md, padding: 20, backgroundColor: colors.surface }, insightTitle: { fontSize: 15, fontWeight: '800' }, insightCopy: { fontSize: 13, lineHeight: 21, color: colors.muted, marginTop: 10 }, disclaimer: { fontSize: 11, lineHeight: 17, color: colors.muted, textAlign: 'center', marginTop: 24 } });
