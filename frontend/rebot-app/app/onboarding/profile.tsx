import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { colors, radius } from '@/src/theme/tokens';

export default function ProfileSurveyScreen() {
  return <Screen><AppHeader title="기본 정보 입력" back /><View style={styles.body}>
    <Text style={styles.label}>닉네임을 입력해주세요</Text><TextInput style={styles.input} placeholder="한글/영문 2~10자" placeholderTextColor="#B9B9BE" />
    <Text style={[styles.label, styles.sleepLabel]}>평소 수면 시간을 선택해주세요</Text><View style={styles.wheel}><Text style={styles.faded}>불규칙함</Text><View style={styles.selected}><Text style={styles.time}>4시간 이하</Text></View><Text style={styles.faded}>5시간</Text><Text style={styles.faded}>6시간</Text></View>
    <PrimaryButton label="시작하기" onPress={() => router.replace('/(tabs)/home')} style={styles.button} />
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 28 }, label: { fontSize: 15, fontWeight: '600', margin: 8 }, input: { height: 60, backgroundColor: colors.surfaceStrong, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 20, fontSize: 14 }, sleepLabel: { marginTop: 30 }, wheel: { alignItems: 'center', marginTop: 34, gap: 12 }, selected: { width: 200, height: 65, borderRadius: 16, backgroundColor: colors.warningSoft, alignItems: 'center', justifyContent: 'center' }, time: { fontSize: 20, color: '#88888E', fontWeight: '600' }, faded: { fontSize: 20, color: '#D4D4D7' }, button: { marginTop: 'auto', marginBottom: 50 } });
