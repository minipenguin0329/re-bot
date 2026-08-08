import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { colors, radius } from '@/src/theme/tokens';

export default function HomeScreen() {
  return <Screen><AppHeader title="홈화면" leftIcon="menu" rightIcon="notifications-outline" /><View style={styles.body}>
    <View style={styles.greeting}><Text style={styles.eyebrow}>오늘의 RE:BOT</Text><Text style={styles.title}>연주님, 오늘 몸은{`\n`}어떤 신호를 보내고 있나요?</Text></View>
    <View style={styles.weather}><View><Text style={styles.weatherTitle}>서울 · 맑음</Text><Text style={styles.weatherCopy}>기온 27°  ·  자외선 높음</Text></View><Ionicons name="sunny" size={38} color="#F3CC55" /></View>
    <Text style={styles.section}>빠른 시작</Text><View style={styles.cards}><Pressable style={styles.card} onPress={() => router.push('/(tabs)/diagnosis')}><View style={styles.icon}><Ionicons name="analytics-outline" size={24} /></View><Text style={styles.cardTitle}>원인을 모르겠어요</Text><Text style={styles.cardCopy}>증상에서 가능한 원인을 되짚어요</Text></Pressable><Pressable style={styles.card} onPress={() => router.push('/(tabs)/solution')}><View style={[styles.icon, styles.accentIcon]}><Ionicons name="bulb-outline" size={24} /></View><Text style={styles.cardTitle}>원인을 알고 있어요</Text><Text style={styles.cardCopy}>지금 가능한 최선의 행동을 찾아요</Text></Pressable></View>
    <View style={styles.checkin}><Text style={styles.checkinTitle}>오늘 컨디션은 어떤가요?</Text><View style={styles.moods}>{['😣', '😕', '🙂', '😄'].map((mood) => <Pressable key={mood} style={styles.mood}><Text style={styles.moodText}>{mood}</Text></Pressable>)}</View></View>
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 18 }, greeting: { marginBottom: 24 }, eyebrow: { fontSize: 13, color: colors.muted, marginBottom: 8 }, title: { fontSize: 25, lineHeight: 35, fontWeight: '800' }, weather: { height: 86, paddingHorizontal: 20, borderRadius: radius.md, backgroundColor: colors.warningSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, weatherTitle: { fontSize: 16, fontWeight: '700' }, weatherCopy: { fontSize: 13, color: colors.muted, marginTop: 6 }, section: { fontSize: 17, fontWeight: '700', marginTop: 26, marginBottom: 12 }, cards: { flexDirection: 'row', gap: 12 }, card: { flex: 1, minHeight: 160, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16 }, icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }, accentIcon: { backgroundColor: colors.accentSoft }, cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 }, cardCopy: { fontSize: 12, lineHeight: 18, color: colors.muted }, checkin: { marginTop: 24, borderTopWidth: 1, borderColor: colors.border, paddingTop: 20 }, checkinTitle: { fontSize: 15, fontWeight: '700' }, moods: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }, mood: { width: 65, height: 48, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, moodText: { fontSize: 22 } });
