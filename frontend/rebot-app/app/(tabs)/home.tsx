import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MindMap } from '@/src/components/MindMap';
import { Screen } from '@/src/components/Screen';
import { TodayCheckInCard } from '@/src/components/TodayCheckInCard';
import { WellnessSummaryCard } from '@/src/components/WellnessSummaryCard';
import { useMindMapCauses } from '@/src/hooks/useMindMapCauses';
import { backendApi } from '@/src/services/api';
import { useProfile } from '@/src/store/ProfileContext';
import type { AnalysisHistoryItem } from '@/src/types/api';
import { colors, radius } from '@/src/theme/tokens';

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return '상쾌한 아침이에요';
  if (hour < 17) return '활기찬 오후 보내세요';
  if (hour < 21) return '편안한 저녁이에요';
  return '오늘 하루도 고생 많으셨어요';
}

const FOLLOW_UP_DELAY_MS = 3 * 60 * 60 * 1000;
// Expo Go/개발 빌드에서는 UI를 바로 검증할 수 있도록 3시간 대기를 생략합니다.
// 배포 빌드에서는 false가 되어 기존 3시간 조건이 그대로 적용됩니다.
const FOLLOW_UP_TEST_MODE = __DEV__;
const RESOLVED_NOTIFICATION_KEY = 'rebot.resolved-follow-up-id.v4';
const ANSWERED_NOTIFICATION_KEY = 'rebot.answered-follow-up-id.v1';

// 시연 계정에 분석 기록이 없어도 후속 조치 흐름을 바로 확인할 수 있는 초기 알림입니다.
// 실제 분석 기록이 하나라도 있으면 이 데이터는 사용하지 않습니다.
const DEMO_FOLLOW_UP: AnalysisHistoryItem = {
  id: 'demo-follow-up',
  symptom_id: 'demo-symptom',
  symptom_description: '두통',
  status: 'completed',
  selection_status: 'candidate',
  recommendation_action: null,
  recommendation_created_at: new Date(0).toISOString(),
  created_at: new Date(0).toISOString(),
};

function followUpTitle(description: string) {
  const symptom = description.trim();
  if (!symptom) return '지난번 불편했던 증상, 지금은 어떠신가요?';
  return `지난번 ${symptom}, 지금은 어떠신가요?`;
}

export default function HomeScreen() {
  const { name, photoUri } = useProfile();
  const { causes, loading: mindMapLoading } = useMindMapCauses();
  const [followUp, setFollowUp] = useState<AnalysisHistoryItem | null>(null);
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [answeredId, setAnsweredId] = useState<string | null>(null);
  const [read, setRead] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      backendApi.listAnalyses(),
      AsyncStorage.getItem(RESOLVED_NOTIFICATION_KEY),
      AsyncStorage.getItem(ANSWERED_NOTIFICATION_KEY),
    ])
      .then(([items, storedResolvedId, storedAnsweredId]) => {
        if (!active) return;
        const now = Date.now();
        const latest = items.find((item) => {
          if (item.status !== 'completed' || item.selection_status === 'unselected') return false;
          if (!item.recommendation_created_at) return false;

          // 개발 중에는 완료된 기록에 한해 3시간 대기만 생략합니다.
          if (FOLLOW_UP_TEST_MODE) return true;

          const recommendationTime = new Date(item.recommendation_created_at).getTime();
          return Number.isFinite(recommendationTime) && now - recommendationTime >= FOLLOW_UP_DELAY_MS;
        });
        const latestId = (latest ?? DEMO_FOLLOW_UP).id;
        setFollowUp(latest ?? DEMO_FOLLOW_UP);
        setResolvedId(storedResolvedId);
        setAnsweredId(storedAnsweredId);
        if (latestId === storedResolvedId || latestId === storedAnsweredId) setRead(true);
      })
      .catch(() => {
        if (active) setFollowUp(DEMO_FOLLOW_UP);
      });
    return () => { active = false; };
  }, []);

  const isResolved = Boolean(followUp && followUp.id === resolvedId);
  const isAnswered = Boolean(followUp && followUp.id === answeredId);
  // 해결됐습니다/아직 안 나았어요 둘 중 하나라도 누르면 홈 화면 카드에서는 사라지고, 알림에서만 다시 볼 수 있습니다.
  const visibleFollowUp = followUp && !isResolved && !isAnswered ? followUp : null;
  const resolveFollowUp = async () => {
    if (!followUp) return;
    setResolvedId(followUp.id);
    setRead(true);
    setNotificationsOpen(false);
    await AsyncStorage.setItem(RESOLVED_NOTIFICATION_KEY, followUp.id);
  };

  const goAnswer = () => {
    if (!followUp) return;
    setAnsweredId(followUp.id);
    setRead(true);
    setNotificationsOpen(false);
    void AsyncStorage.setItem(ANSWERED_NOTIFICATION_KEY, followUp.id);

    if (followUp.id === DEMO_FOLLOW_UP.id) {
      router.push('/history');
      return;
    }

    router.push({
      pathname: '/history/[id]',
      params: {
        id: followUp.id,
        description: followUp.symptom_description,
        focusChat: '1',
      },
    });
  };

  return (
    <Screen bottomSafe={false} scroll>
      <View style={styles.body}>
        <View style={styles.topBar}>
          <Pressable hitSlop={12} onPress={() => setNotificationsOpen((current) => !current)}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {Boolean(visibleFollowUp && !read) && <View style={styles.badge} />}
          </Pressable>
        </View>
        {notificationsOpen && followUp && (
          <View style={styles.notificationPanel}>
            <Text style={styles.notificationTitle}>알림</Text>
            <Pressable style={styles.notificationItem} onPress={isResolved ? undefined : goAnswer}>
              {!read && <View style={styles.notificationDot} />}
              <View style={styles.notificationCopyArea}>
                <Text style={styles.notificationItemTitle} numberOfLines={2}>{followUpTitle(followUp.symptom_description)}</Text>
                <Text style={styles.notificationItemCopy}>{isResolved ? '사용자가 증상이 해결되었다고 응답했어요.' : '이전 대화 내역에서 현재 상태를 확인해 주세요.'}</Text>
                {isResolved && <Text style={styles.resolvedStatus}>해결됨</Text>}
              </View>
            </Pressable>
          </View>
        )}
        <View style={styles.hero}>
          <View style={styles.heroAvatar}>
            {photoUri ? <Image source={{ uri: photoUri }} style={styles.heroAvatarImage} /> : <Ionicons name="person" size={22} color="#9A9A9F" />}
          </View>
          <View style={styles.heroTextArea}>
            <Text style={styles.heroGreeting}>{timeGreeting()}, {name}님 👋</Text>
            <Text style={styles.heroCopy}>오늘 컨디션은 어떠세요? 지금 바로 확인해보세요.</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Pressable style={styles.quickCard} onPress={() => router.push('/(tabs)/diagnosis')}>
            <View style={[styles.quickIcon, styles.quickIconAccent]}><Ionicons name="checkbox-outline" size={18} color="#8A6B00" /></View>
            <Text style={styles.quickTitle} numberOfLines={1}>AI 자가진단</Text>
            <Ionicons name="chevron-forward" size={15} color={colors.muted} />
          </Pressable>
          <Pressable style={styles.quickCard} onPress={() => router.push('/(tabs)/solution')}>
            <View style={[styles.quickIcon, styles.quickIconDark]}><Ionicons name="bulb" size={18} color={colors.white} /></View>
            <Text style={styles.quickTitle} numberOfLines={1}>AI 솔루션</Text>
            <Ionicons name="chevron-forward" size={15} color={colors.muted} />
          </Pressable>
        </View>

        {visibleFollowUp && (
          <View style={styles.followUpCard}>
            <View style={styles.copyArea}>
              <Text style={styles.cardTitle} numberOfLines={2}>{followUpTitle(visibleFollowUp.symptom_description)}</Text>
              <Text style={styles.cardCopy}>현재 상태를 확인해볼게요.</Text>
              <View style={styles.followUpActions}>
                <Pressable style={[styles.followUpButton, styles.resolvedButton]} onPress={() => void resolveFollowUp()}>
                  <Text style={styles.resolvedButtonText}>해결됐습니다</Text>
                </Pressable>
                <Pressable style={[styles.followUpButton, styles.stillUnwellButton]} onPress={goAnswer}>
                  <Text style={styles.stillUnwellButtonText}>아직 안 나았어요</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
        <View style={styles.checkInSection}><TodayCheckInCard /></View>

        <View style={styles.wellnessSection}><WellnessSummaryCard /></View>
        <Text style={styles.mindMapTitle}>원인 마인드맵</Text>
        <Text style={styles.mindMapCopy}>가지를 눌러 어떤 후보가 있었는지 확인해보세요</Text>
        {mindMapLoading ? (
          <View style={styles.mindMapState}><ActivityIndicator color={colors.text} /></View>
        ) : causes && causes.length > 0 ? (
          <MindMap photoUri={photoUri} causes={causes} />
        ) : (
          <View style={styles.mindMapState}>
            <Text style={styles.mindMapEmpty}>아직 분석 기록이 없어요.{'\n'}AI 자가진단을 진행하면 원인 마인드맵이 채워져요.</Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  topBar: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  badge: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F4D36A',
    borderWidth: 1,
    borderColor: colors.white,
  },
  hero: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceStrong,
    overflow: 'hidden',
  },
  heroAvatarImage: {
    width: 50,
    height: 50,
  },
  heroTextArea: {
    flex: 1,
  },
  heroGreeting: {
    fontSize: 19,
    lineHeight: 27,
    fontWeight: '800',
    color: colors.text,
  },
  heroCopy: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    height: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  quickIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIconAccent: {
    backgroundColor: colors.accent,
  },
  quickIconDark: {
    backgroundColor: colors.text,
  },
  quickTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  checkInSection: {
    marginTop: 24,
  },
  wellnessSection: {
    marginTop: 24,
  },
  mindMapTitle: {
    marginTop: 32,
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  mindMapCopy: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 12,
    color: '#A2A2A2',
  },
  mindMapState: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mindMapEmpty: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
  },
  followUpCard: {
    marginTop: 24,
    minHeight: 166,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#FFFAE9',
  },
  copyArea: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    color: colors.text,
  },
  cardCopy: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: '#A2A2A2',
  },
  followUpActions: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  followUpButton: {
    flex: 1,
    minHeight: 43,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  resolvedButton: {
    borderWidth: 1,
    borderColor: '#E7D9BF',
    backgroundColor: colors.white,
  },
  stillUnwellButton: {
    backgroundColor: colors.text,
  },
  resolvedButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9A7D52',
  },
  stillUnwellButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  notificationPanel: {
    position: 'absolute',
    zIndex: 20,
    top: 44,
    right: 24,
    width: 302,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 12,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  notificationItem: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  notificationDot: {
    width: 7,
    height: 7,
    marginTop: 6,
    borderRadius: 4,
    backgroundColor: '#F4D36A',
  },
  notificationCopyArea: { flex: 1 },
  notificationItemTitle: { fontSize: 13, lineHeight: 19, fontWeight: '600', color: colors.text },
  notificationItemCopy: { marginTop: 4, fontSize: 12, lineHeight: 18, color: '#9B9B9B' },
  resolvedStatus: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFF4CC',
    color: '#9A7D52',
    fontSize: 11,
    fontWeight: '700',
  },
});
