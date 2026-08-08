import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { colors, radius } from '@/src/theme/tokens';

export default function BasicSurveyScreen() {
  return <Screen><AppHeader title="기본 정보 입력" back /><View style={styles.body}>
    <View><Text style={styles.label}>직업을 입력해주세요</Text><TextInput style={styles.input} placeholder="예) 학생, 회사원, 프리랜서 등" placeholderTextColor="#B9B9BE" /></View>
    <View style={styles.group}><Text style={styles.label}>성별을 선택해주세요</Text>{['남성', '여성'].map((item) => <Pressable key={item} style={styles.radioRow}><View style={styles.radio} /><Text style={styles.radioLabel}>{item}</Text></Pressable>)}</View>
    <View><Text style={styles.label}>나이를 선택해주세요 <Text style={styles.muted}>(년생)</Text></Text><View style={styles.wheel}><Text style={styles.faded}>1966</Text><View style={styles.selected}><Text style={styles.year}>1967</Text></View><Text style={styles.faded}>1968</Text></View></View>
    <PrimaryButton label="다음" onPress={() => router.push('/onboarding/profile')} style={styles.button} />
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 20 }, label: { fontSize: 15, fontWeight: '600', margin: 8, color: colors.text }, input: { height: 60, backgroundColor: colors.surfaceStrong, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 20, fontSize: 14 }, group: { marginTop: 34, gap: 16 }, radioRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 20 }, radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#D9D9DE' }, radioLabel: { fontSize: 14, fontWeight: '600' }, muted: { color: colors.muted, fontWeight: '400' }, wheel: { alignItems: 'center', marginTop: 42, gap: 14 }, selected: { width: 130, height: 65, borderRadius: 16, backgroundColor: colors.warningSoft, alignItems: 'center', justifyContent: 'center' }, year: { fontSize: 21, color: '#88888E', fontWeight: '600' }, faded: { fontSize: 20, color: '#D4D4D7' }, button: { marginTop: 'auto', marginBottom: 50 } });
