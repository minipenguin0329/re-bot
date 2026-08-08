import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/tokens';

export default function SplashScreen() {
  return <SafeAreaView style={styles.screen}><Pressable style={styles.center} onPress={() => router.replace('/login')}><View style={styles.logo}><Text style={styles.re}>Re</Text><Text style={styles.colon}>:</Text><Text style={styles.bot}>Bot</Text></View><Text style={styles.hint}>화면을 눌러 시작하기</Text></Pressable></SafeAreaView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.white }, center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, logo: { flexDirection: 'row', alignItems: 'baseline' }, re: { fontSize: 68, fontWeight: '800' }, colon: { fontSize: 68, fontWeight: '800', color: colors.accent }, bot: { fontSize: 68, fontWeight: '800' }, hint: { position: 'absolute', bottom: 40, color: colors.subtle, fontSize: 13 } });
