import { StyleSheet, Switch, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { useProfile } from '@/src/store/ProfileContext';
import { colors } from '@/src/theme/tokens';

const rows = [{ key: 'all', label: '전체 알림', description: '모든 알림을 한번에 켜거나 꺼요' }, { key: 'report', label: '리포트 알림', description: '주간·월간 건강 리포트가 준비되면 알려드려요' }, { key: 'marketing', label: '마케팅 알림', description: '추천 제품·이벤트 소식을 받아요' }] as const;

export default function NotificationSettingsScreen() {
  const { notifications, setNotification } = useProfile();

  return <Screen><AppHeader title="알림 설정" back /><View style={styles.body}>
    {rows.map((row) => <View key={row.key} style={styles.row}>
      <View style={styles.copy}><Text style={styles.label}>{row.label}</Text><Text style={styles.description}>{row.description}</Text></View>
      <Switch value={notifications[row.key]} onValueChange={(value) => setNotification(row.key, value)} disabled={row.key !== 'all' && !notifications.all} trackColor={{ false: colors.border, true: colors.accent }} thumbColor={colors.white} />
    </View>)}
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 20 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 84, borderBottomWidth: 1, borderColor: colors.border }, copy: { flex: 1, gap: 6, paddingRight: 16 }, label: { fontSize: 15, fontWeight: '600' }, description: { fontSize: 12, color: colors.muted, lineHeight: 18 } });
