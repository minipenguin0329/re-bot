import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { colors } from '@/src/theme/tokens';

export default function HomeScreen() {
  const [visible, setVisible] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const archiveFollowUp = () => {
    setVisible(false);
    setNotificationsOpen(false);
  };

  const openFollowUp = () => {
    setVisible(true);
    setNotificationsOpen(false);
  };

  return (
    <Screen bottomSafe={false}>
      <AppHeader
        title="홈화면"
        rightIcon="notifications-outline"
        rightBadge={!visible}
        onRightPress={() => setNotificationsOpen((current) => !current)}
      />
      {notificationsOpen && (
        <View style={styles.notificationPanel}>
          <Text style={styles.notificationTitle}>알림</Text>
          <Pressable style={styles.notificationItem} onPress={openFollowUp}>
            <View style={styles.notificationDot} />
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
              <Pressable hitSlop={10} onPress={() => router.push('/history')}>
                <Text style={styles.cardLink}>답변하러가기</Text>
              </Pressable>
            </View>
            <Pressable style={styles.close} hitSlop={12} onPress={archiveFollowUp}>
              <Ionicons name="close-outline" size={31} color="#A1A1A1" />
            </Pressable>
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
