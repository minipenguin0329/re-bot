import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { MindMap } from '@/src/components/MindMap';
import { Screen } from '@/src/components/Screen';
import { useMindMapCauses } from '@/src/hooks/useMindMapCauses';
import { useProfile } from '@/src/store/ProfileContext';
import { colors } from '@/src/theme/tokens';

export default function HomeScreen() {
  const { photoUri } = useProfile();
  const { causes, loading: mindMapLoading } = useMindMapCauses();
  const [visible, setVisible] = useState(false);
  const [read, setRead] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const dismissCard = () => setVisible(false);

  const goAnswer = () => {
    setRead(true);
    setNotificationsOpen(false);
    router.push('/history');
  };

  return (
    <Screen bottomSafe={false} scroll>
      <AppHeader
        title="홈화면"
        rightIcon="notifications-outline"
        rightBadge={!read}
        onRightPress={() => setNotificationsOpen((current) => !current)}
      />
      {notificationsOpen && (
        <View style={styles.notificationPanel}>
          <Text style={styles.notificationTitle}>알림</Text>
          <Pressable style={styles.notificationItem} onPress={goAnswer}>
            {!read && <View style={styles.notificationDot} />}
            <View style={styles.notificationCopyArea}>
              <Text style={styles.notificationItemTitle}>어제 발생한 두통, 지금은 어떠신가요?</Text>
              <Text style={styles.notificationItemCopy}>현재 상태를 확인해 주세요.</Text>
            </View>
          </Pressable>
        </View>
      )}
      <View style={styles.body}>
        {visible && (
          <View style={styles.followUpCard}>
            <View style={styles.copyArea}>
              <Text style={styles.cardTitle}>어제 발생한 두통, 지금은 어떠신가요?</Text>
              <Text style={styles.cardCopy}>현재 상태를 확인해볼게요.</Text>
              <Pressable hitSlop={10} onPress={goAnswer}>
                <Text style={styles.cardLink}>답변하러가기</Text>
              </Pressable>
            </View>
            <Pressable style={styles.close} hitSlop={12} onPress={dismissCard}>
              <Ionicons name="close-outline" size={31} color="#A1A1A1" />
            </Pressable>
          </View>
        )}
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
    paddingTop: 38,
    paddingBottom: 40,
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
    minHeight: 133,
    paddingVertical: 24,
    paddingLeft: 24,
    paddingRight: 64,
    borderRadius: 16,
    backgroundColor: '#FFFAE9',
    flexDirection: 'row',
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
  cardLink: {
    marginTop: 10,
    alignSelf: 'flex-start',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: '#D7BB91',
    textDecorationLine: 'underline',
  },
  close: {
    position: 'absolute',
    top: 52,
    right: 22,
  },
  notificationPanel: {
    position: 'absolute',
    zIndex: 20,
    top: 54,
    right: 20,
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
});
