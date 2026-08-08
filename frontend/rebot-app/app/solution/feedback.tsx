import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { colors } from '@/src/theme/tokens';

export default function FeedbackScreen() {
  return <Screen><AppHeader title="AI 솔루션" back /><View style={styles.body}><Text style={styles.title}>이 제안이 도움이 되었나요?</Text><View style={styles.reactions}><Pressable onPress={() => router.replace('/(tabs)/home')}><Ionicons name="thumbs-up" size={48} color="#888" /></Pressable><Pressable onPress={() => router.replace('/(tabs)/home')}><Ionicons name="thumbs-down" size={48} color="#888" /></Pressable></View><Text style={styles.copy}>AI가 더 좋은 답변을 할 수 있도록{`\n`}피드백은 큰 도움이 됩니다!</Text><Text style={styles.notice}>· 저희는 아무런 책임을 질 수 없습니다. 개인 판단에 따라 이용해주세요.</Text></View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, alignItems: 'center' }, title: { marginTop: 180, fontSize: 20, fontWeight: '800' }, reactions: { marginTop: 95, flexDirection: 'row', gap: 90 }, copy: { marginTop: 76, textAlign: 'center', color: '#888', fontSize: 15, lineHeight: 22, fontWeight: '600' }, notice: { position: 'absolute', bottom: 190, fontSize: 10, color: colors.muted } });
