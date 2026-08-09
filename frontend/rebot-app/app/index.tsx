import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SPLASH_DURATION = 1050;

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.logo} accessibilityLabel="리봇">
        <Text style={styles.word}>Re</Text>
        <Text style={styles.colon}>:</Text>
        <Text style={styles.word}>Bot</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF5',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  word: {
    fontSize: 42,
    lineHeight: 50,
    fontWeight: '800',
    letterSpacing: -1.4,
    color: '#050505',
  },
  colon: {
    marginHorizontal: 3,
    fontSize: 42,
    lineHeight: 50,
    fontWeight: '800',
    color: '#F6D663',
  },
});
