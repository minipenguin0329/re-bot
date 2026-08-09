import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { WheelPicker } from '@/src/components/WheelPicker';
import { BIRTH_YEARS, DEFAULT_BIRTH_YEAR, GENDERS } from '@/src/data/onboarding';
import { useProfile } from '@/src/store/ProfileContext';
import { colors, radius } from '@/src/theme/tokens';

const DEFAULT_YEAR_INDEX = BIRTH_YEARS.indexOf(DEFAULT_BIRTH_YEAR);

export default function BasicSurveyScreen() {
  const { updateProfile } = useProfile();
  const [job, setJob] = useState('');
  const [gender, setGender] = useState<'남성' | '여성' | null>(null);
  const [birthYear, setBirthYear] = useState(BIRTH_YEARS[DEFAULT_YEAR_INDEX]);

  const handleNext = () => {
    updateProfile({ job: job.trim(), gender, birthYear });
    router.push('/onboarding/profile');
  };

  return <Screen><AppHeader title="기본 정보 입력" back /><View style={styles.body}>
    <View><Text style={styles.label}>직업을 입력해주세요</Text><TextInput style={styles.input} placeholder="예) 학생, 회사원, 프리랜서 등" placeholderTextColor="#B9B9BE" value={job} onChangeText={setJob} /></View>
    <View style={styles.group}><Text style={styles.label}>성별을 선택해주세요</Text>{GENDERS.map((item) => <Pressable key={item} style={styles.radioRow} onPress={() => setGender(item)}><View style={[styles.radio, gender === item && styles.radioSelected]}>{gender === item && <View style={styles.radioDot} />}</View><Text style={styles.radioLabel}>{item}</Text></Pressable>)}</View>
    <View style={styles.ageBlock}><Text style={styles.label}>나이를 선택해주세요 <Text style={styles.muted}>(년생)</Text></Text><WheelPicker items={BIRTH_YEARS} initialIndex={DEFAULT_YEAR_INDEX} pillWidth={130} onChange={(_, value) => setBirthYear(value as number)} /></View>
    <PrimaryButton label="다음" onPress={handleNext} style={styles.button} />
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 20 }, label: { fontSize: 15, fontWeight: '600', margin: 8, color: colors.text }, input: { height: 60, backgroundColor: colors.surfaceStrong, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 20, fontSize: 14 }, group: { marginTop: 34, gap: 16 }, radioRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 20 }, radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#D9D9DE', alignItems: 'center', justifyContent: 'center' }, radioSelected: { borderColor: colors.black }, radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.black }, radioLabel: { fontSize: 14, fontWeight: '600' }, muted: { color: colors.muted, fontWeight: '400' }, ageBlock: { marginTop: 20 }, button: { marginTop: 'auto', marginBottom: 50 } });
