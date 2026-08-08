import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { colors } from '@/src/theme/tokens';

export default function LoadingScreen() {
  useEffect(() => { const timer = setTimeout(() => router.replace('/diagnosis/candidates'), 1300); return () => clearTimeout(timer); }, []);
  return <Screen contentStyle={styles.screen}><Text style={styles.title}>분석 중입니다.</Text><Text style={styles.copy}>잠시만 기다려주세요</Text><View style={styles.mark}><View style={styles.waveOne} /><View style={styles.waveTwo} /></View></Screen>;
}

const styles = StyleSheet.create({ screen: { alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 24, fontWeight: '800' }, copy: { fontSize: 15, color: colors.muted, marginTop: 18 }, mark: { width: 110, height: 62, marginTop: 130, justifyContent: 'center' }, waveOne: { position: 'absolute', width: 104, height: 34, borderRadius: 70, backgroundColor: '#FFF0AD', transform: [{ rotate: '-8deg' }] }, waveTwo: { position: 'absolute', width: 88, height: 28, alignSelf: 'center', borderRadius: 70, backgroundColor: colors.accent, transform: [{ rotate: '7deg' }] } });
