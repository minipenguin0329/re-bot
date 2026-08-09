import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { colors } from '@/src/theme/tokens';

export default function HomeScreen() {
  const [visible, setVisible] = useState(true);

  return (
    <Screen>
      <AppHeader title="홈화면" rightIcon="notifications-outline" />
      <View style={styles.body}>
        {visible && (
          <View style={styles.followUpCard}>
            <View style={styles.copyArea}>
              <Text style={styles.cardTitle}>어제 발생한 두통, 지금은 어떠신가요?</Text>
              <Text style={styles.cardCopy}>현재 상태를 확인해볼게요.</Text>
              <Pressable hitSlop={10}>
                <Text style={styles.cardLink}>답변하러가기</Text>
              </Pressable>
            </View>
            <Pressable style={styles.close} hitSlop={12} onPress={() => setVisible(false)}>
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
    paddingVertical: 31,
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
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.text,
  },
  cardCopy: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#A2A2A2',
  },
  cardLink: {
    marginTop: 10,
    alignSelf: 'flex-start',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    color: '#D7BB91',
    textDecorationLine: 'underline',
  },
  close: {
    position: 'absolute',
    top: 52,
    right: 22,
  },
});
