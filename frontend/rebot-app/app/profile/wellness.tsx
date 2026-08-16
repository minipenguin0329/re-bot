import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { backendApi, getErrorMessage } from '@/src/services/api';
import { colors, radius } from '@/src/theme/tokens';
import type { WellnessProfileResponse } from '@/src/types/api';

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export default function WellnessProfileScreen() {
  const [profile, setProfile] = useState<WellnessProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProfile(await backendApi.getWellnessProfile());
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadProfile();
  }, [loadProfile]));

  if (loading && !profile) {
    return <Screen><AppHeader title="웰니스 프로필" back /><View style={styles.center}><ActivityIndicator color={colors.text} /><Text style={styles.loadingText}>누적 기록을 확인하고 있어요.</Text></View></Screen>;
  }

  if (!profile) {
    return <Screen><AppHeader title="웰니스 프로필" back /><View style={styles.center}><Ionicons name="alert-circle-outline" size={38} color={colors.muted} /><Text style={styles.errorTitle}>프로필을 불러오지 못했어요</Text><Text style={styles.errorCopy}>{error}</Text><PrimaryButton label="다시 시도" onPress={() => void loadProfile()} style={styles.retry} /></View></Screen>;
  }

  const maxCount = Math.max(...profile.symptom_frequencies.map((item) => item.occurrence_count), 1);
  const periodStart = formatDate(profile.period_start);
  const periodEnd = formatDate(profile.period_end);

  return <Screen scroll><AppHeader title="웰니스 프로필" back /><View style={styles.body}>
    <View style={styles.healthContext}>
      <View style={styles.contextHeading}><Text style={styles.sectionTitle}>등록된 건강 정보</Text><Ionicons name="shield-checkmark-outline" size={20} color="#8A6B00" /></View>
      <View style={styles.contextRow}><Text style={styles.contextLabel}>지병</Text><Text style={[styles.contextValue, !profile.known_conditions && styles.emptyValue]}>{profile.known_conditions || '등록되지 않음'}</Text></View>
      <View style={styles.divider} />
      <View style={styles.contextRow}><Text style={styles.contextLabel}>알레르기</Text><Text style={[styles.contextValue, !profile.allergies && styles.emptyValue]}>{profile.allergies || '등록되지 않음'}</Text></View>
    </View>

    <View style={styles.sectionHeader}>
      <View><Text style={styles.sectionTitle}>반복 증상</Text><Text style={styles.sectionCopy}>직접 입력한 증상이 반복된 횟수예요.</Text></View>
      <Text style={styles.total}>{profile.total_symptom_records}회 기록</Text>
    </View>

    {profile.symptom_frequencies.length === 0 ? <View style={styles.emptyCard}>
      <Ionicons name="bar-chart-outline" size={34} color={colors.subtle} />
      <Text style={styles.emptyTitle}>아직 반복 증상이 확인되지 않았어요</Text>
      <Text style={styles.emptyCopy}>같은 증상이 두 번 이상 기록되면 이곳에서 발생 빈도를 확인할 수 있어요.</Text>
    </View> : <View style={styles.chart}>
      {profile.symptom_frequencies.map((item) => <View key={item.symptom_name} style={styles.chartRow}>
        <View style={styles.chartTop}><Text numberOfLines={1} style={styles.symptomName}>{item.symptom_name}</Text><Text style={styles.count}>{item.occurrence_count}회</Text></View>
        <View style={styles.track}><View style={[styles.fill, { flex: item.occurrence_count }]} /><View style={{ flex: Math.max(maxCount - item.occurrence_count, 0) }} /></View>
        <Text style={styles.lastDate}>최근 {formatDate(item.last_occurred_at)}</Text>
      </View>)}
    </View>}

    {profile.medical_guidance_recommended && <View style={styles.guidance}>
      <Ionicons name="medical-outline" size={22} color="#8A6B00" />
      <View style={styles.guidanceCopy}><Text style={styles.guidanceTitle}>같은 증상이 반복되고 있어요</Text><Text style={styles.guidanceText}>이 안내는 의료 진단이 아니며, 증상이 계속되거나 악화되면 의료기관에서 확인해보세요.</Text></View>
    </View>}

    <View style={styles.periodRow}><Text style={styles.periodLabel}>조회 기간</Text><Text style={styles.periodValue}>{periodStart && periodEnd ? `${periodStart} ~ ${periodEnd}` : '기록 없음'}</Text></View>
    <Text style={styles.disclaimer}>웰니스 프로필은 사용자가 입력한 기록만 집계하며 질병을 확정하거나 의료적 처방을 제공하지 않습니다.</Text>
    <Pressable onPress={() => void loadProfile()} disabled={loading} style={styles.refresh}><Ionicons name="refresh" size={16} color={colors.muted} /><Text style={styles.refreshText}>{loading ? '새로고침 중' : '최신 기록으로 새로고침'}</Text></Pressable>
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 48 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 12 }, loadingText: { fontSize: 14, color: colors.muted }, errorTitle: { marginTop: 6, fontSize: 18, fontWeight: '800', color: colors.text }, errorCopy: { textAlign: 'center', fontSize: 13, lineHeight: 20, color: colors.muted }, retry: { width: '100%', marginTop: 14 }, healthContext: { borderRadius: radius.lg, padding: 22, backgroundColor: colors.warningSoft }, contextHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }, sectionTitle: { fontSize: 19, lineHeight: 27, fontWeight: '800', color: colors.text }, contextRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14, gap: 18 }, contextLabel: { width: 66, fontSize: 14, fontWeight: '700', color: colors.muted }, contextValue: { flex: 1, fontSize: 14, lineHeight: 21, color: colors.text }, emptyValue: { color: colors.subtle }, divider: { height: 1, backgroundColor: 'rgba(138,107,0,0.12)' }, sectionHeader: { marginTop: 34, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }, sectionCopy: { marginTop: 6, fontSize: 13, lineHeight: 19, color: colors.muted }, total: { marginTop: 4, fontSize: 12, fontWeight: '700', color: '#8A6B00' }, emptyCard: { marginTop: 20, minHeight: 210, borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }, emptyTitle: { marginTop: 16, fontSize: 16, fontWeight: '700', color: colors.text }, emptyCopy: { marginTop: 8, textAlign: 'center', fontSize: 13, lineHeight: 20, color: colors.muted }, chart: { marginTop: 20, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 20, paddingVertical: 8 }, chartRow: { paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, chartTop: { flexDirection: 'row', alignItems: 'center', gap: 12 }, symptomName: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text }, count: { fontSize: 13, fontWeight: '800', color: '#8A6B00' }, track: { height: 10, marginTop: 12, flexDirection: 'row', overflow: 'hidden', borderRadius: 5, backgroundColor: colors.surfaceStrong }, fill: { minWidth: 10, borderRadius: 5, backgroundColor: colors.accent }, lastDate: { marginTop: 8, fontSize: 11, color: colors.muted }, guidance: { marginTop: 22, flexDirection: 'row', gap: 12, borderRadius: radius.md, padding: 18, backgroundColor: colors.warningSoft }, guidanceCopy: { flex: 1 }, guidanceTitle: { fontSize: 14, fontWeight: '800', color: colors.text }, guidanceText: { marginTop: 6, fontSize: 12, lineHeight: 19, color: colors.muted }, periodRow: { marginTop: 26, flexDirection: 'row', justifyContent: 'space-between', gap: 14 }, periodLabel: { fontSize: 12, fontWeight: '700', color: colors.muted }, periodValue: { flex: 1, textAlign: 'right', fontSize: 12, color: colors.muted }, disclaimer: { marginTop: 18, textAlign: 'center', fontSize: 11, lineHeight: 18, color: colors.muted }, refresh: { marginTop: 18, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8 }, refreshText: { fontSize: 12, color: colors.muted } });
