import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { colors, radius } from '@/src/theme/tokens';

export default function DiagnosisScreen() {
  return <Screen><AppHeader title="AI 자가진단" back /><View style={styles.body}><Text style={styles.label}>문제 상황을 설명해주세요</Text><FormField multiline placeholder="어떤 증상인지 자세히 입력해주세요" /><Text style={[styles.label, styles.photoLabel]}>사진 첨부 <Text style={styles.optional}>(선택)</Text></Text><Pressable style={styles.photo}><Ionicons name="add" size={32} color="#C9C9CC" /></Pressable><View style={styles.check}><View style={styles.box} /><Text style={styles.checkText}>전에도 동일한 증상이 있었나요?</Text></View><PrimaryButton label="분석하기" onPress={() => router.push('/diagnosis/loading')} style={styles.button} /></View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 10 }, label: { fontSize: 15, fontWeight: '700', margin: 8 }, optional: { color: colors.muted, fontWeight: '400' }, photoLabel: { marginTop: 42 }, photo: { width: 84, height: 84, borderRadius: radius.md, backgroundColor: colors.surfaceStrong, alignItems: 'center', justifyContent: 'center', marginLeft: 6 }, check: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 28, marginLeft: 6 }, box: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#C4C4C8' }, checkText: { color: colors.muted, fontSize: 14 }, button: { marginTop: 'auto', marginBottom: 50 } });
