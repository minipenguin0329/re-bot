import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { colors } from '@/src/theme/tokens';

const actions = ['저자극 클렌저 사용', '충분한 수분 섭취', '보습제 꾸준히 바르기', '증상 지속 시 병원 방문'];

export default function ResultScreen() {
  return <Screen><AppHeader title="AI 자가진단" back /><View style={styles.body}><Text style={styles.title}>추천 해결 방법</Text><View style={styles.list}>{actions.map((action) => <View key={action} style={styles.row}><Ionicons name="checkmark" size={24} /><Text style={styles.action}>{action}</Text></View>)}</View><Text style={styles.notice}>· 위 정보는 일반적인 정보이며, 의학적 진단을 대체할 수 없습니다</Text><PrimaryButton label="확인했어요" onPress={() => router.push('/diagnosis/product')} style={styles.button} /></View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 34 }, title: { fontSize: 20, fontWeight: '800', paddingBottom: 38, borderBottomWidth: 1, borderColor: colors.border }, list: { borderBottomWidth: 1, borderColor: colors.border }, row: { minHeight: 86, flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 16 }, action: { fontSize: 16, fontWeight: '500' }, notice: { textAlign: 'center', fontSize: 11, color: colors.muted, marginTop: 90 }, button: { marginTop: 'auto', marginBottom: 50 } });
