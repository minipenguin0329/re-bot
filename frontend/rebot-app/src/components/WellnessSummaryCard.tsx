import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useWellnessProfile } from '@/src/hooks/useWellnessProfile';
import { colors, radius } from '@/src/theme/tokens';
import { mergeSpecialNotes } from '@/src/utils/profile';

// 마인드맵과 동일한 심각도 색 기준(1회=노랑, 2~3회=주황, 4회 이상=빨강)을 재사용해서
// 앱 전체에서 "이 색 = 이 정도 반복 빈도"라는 의미가 일관되게 통하도록 합니다.
function severityColor(count: number): { background: string; border: string; text: string } {
  if (count <= 1) return { background: '#FFF3B0', border: '#F0C808', text: '#8A6B00' };
  if (count <= 3) return { background: '#FFDCAE', border: '#F2994A', text: '#B15E00' };
  return { background: '#FFC9C2', border: '#EB5757', text: '#C0392B' };
}

// 목록 안에서 가장 큰 값에 상대적으로 맞추면 항목이 하나뿐이거나 다들 비슷할 때 항상 꽉 찬
// 막대만 보여서 "늘어나는" 느낌이 없어요. 그래서 고정된 절대 기준(8회)으로 길이를 정합니다.
const BAR_MAX_COUNT = 8;

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value));
}

export function WellnessSummaryCard() {
  const { profile, loading, reload } = useWellnessProfile();

  if (loading && !profile) {
    return <View style={[styles.card, styles.stateCard]}><ActivityIndicator color="#8A6B00" /></View>;
  }
  if (!profile) return null;

  const specialNotes = profile.special_notes ?? mergeSpecialNotes(profile.known_conditions, profile.allergies);
  const symptoms = profile.symptom_frequencies;
  const periodStart = formatDate(profile.period_start);
  const periodEnd = formatDate(profile.period_end);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>웰니스 프로필</Text>
          <Text style={styles.subtitle}>나의 건강 기록 요약</Text>
        </View>
        <View style={styles.totalBadge}><Text style={styles.total}>{profile.total_symptom_records}회 기록</Text></View>
      </View>

      <View style={styles.notesChip}>
        <Text style={styles.notesLabel}>특이사항</Text>
        <Text style={[styles.notesValue, !specialNotes && styles.notesEmpty]}>
          {specialNotes || '등록되지 않음'}
        </Text>
      </View>

      <Text style={styles.sectionLabel}>반복 증상</Text>

      {symptoms.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}><Ionicons name="bar-chart-outline" size={20} color={colors.subtle} /></View>
          <Text style={styles.emptyText}>같은 증상이 두 번 이상 기록되면{'\n'}여기서 반복 빈도를 확인할 수 있어요.</Text>
        </View>
      ) : (
        <View style={styles.symptomList}>
          {symptoms.map((item, index) => {
            const severity = severityColor(item.occurrence_count);
            return (
              <View key={item.symptom_name} style={styles.symptomRow}>
                <View style={[styles.rankBadge, { backgroundColor: severity.border }]}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.symptomBody}>
                  <View style={styles.symptomTop}>
                    <Text style={styles.symptomName} numberOfLines={1}>{item.symptom_name}</Text>
                    <Text style={[styles.symptomCount, { color: severity.text }]}>{item.occurrence_count}회</Text>
                  </View>
                  <View style={styles.track}>
                    <View
                      style={[
                        styles.fill,
                        {
                          width: `${Math.min(100, (item.occurrence_count / BAR_MAX_COUNT) * 100)}%`,
                          backgroundColor: severity.border,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.lastDate}>최근 {formatDate(item.last_occurred_at)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {profile.medical_guidance_recommended && (
        <View style={styles.guidance}>
          <Ionicons name="medical-outline" size={16} color="#8A6B00" />
          <Text style={styles.guidanceText}>같은 증상이 반복되고 있어요. 계속되면 의료기관에서 확인해보세요.</Text>
        </View>
      )}

      <View style={styles.periodRow}>
        <Text style={styles.periodLabel}>조회 기간</Text>
        <Text style={styles.periodValue}>{periodStart && periodEnd ? `${periodStart} ~ ${periodEnd}` : '기록 없음'}</Text>
      </View>
      <Text style={styles.disclaimer}>웰니스 프로필은 사용자가 입력한 기록만 집계하며 질병을 확정하거나 의료적 처방을 제공하지 않습니다.</Text>
      <Pressable onPress={() => void reload()} disabled={loading} style={styles.refresh}>
        <Ionicons name="refresh" size={14} color={colors.muted} />
        <Text style={styles.refreshText}>{loading ? '새로고침 중' : '최신 기록으로 새로고침'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  stateCard: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {},
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    color: colors.muted,
  },
  totalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.warningSoft,
  },
  total: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6B00',
  },
  notesChip: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
  },
  notesValue: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text,
  },
  notesEmpty: {
    color: colors.subtle,
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 12,
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: 14,
  },
  emptyIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceStrong,
  },
  emptyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
  symptomList: {
    gap: 16,
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  rankBadge: {
    marginTop: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
  },
  symptomBody: {
    flex: 1,
  },
  symptomTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  symptomName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  track: {
    height: 7,
    marginTop: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: colors.surfaceStrong,
  },
  fill: {
    minWidth: 6,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  symptomCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6B00',
  },
  lastDate: {
    marginTop: 6,
    fontSize: 11,
    color: colors.muted,
  },
  guidance: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.md,
    backgroundColor: colors.warningSoft,
    padding: 12,
  },
  guidanceText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#8A6B00',
  },
  periodRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  periodLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
  },
  periodValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 11,
    color: colors.muted,
  },
  disclaimer: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 16,
    color: colors.subtle,
  },
  refresh: {
    marginTop: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
  },
  refreshText: {
    fontSize: 11,
    color: colors.muted,
  },
});
