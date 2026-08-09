import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { WheelPicker } from '@/src/components/WheelPicker';
import { DEFAULT_SLEEP_INDEX, SLEEP_OPTIONS } from '@/src/data/onboarding';
import { useProfile } from '@/src/store/ProfileContext';
import { colors, radius } from '@/src/theme/tokens';

export default function ProfileSurveyScreen() {
  const { name, updateProfile } = useProfile();
  const [nickname, setNickname] = useState(name);
  const [sleepHours, setSleepHours] = useState<string>(SLEEP_OPTIONS[DEFAULT_SLEEP_INDEX]);

  const handleStart = () => {
    updateProfile({ name: nickname.trim() || name, sleepHours });
    router.replace('/(tabs)/home');
  };

  return <Screen><AppHeader title="기본 정보 입력" back /><View style={styles.body}>
    <Text style={styles.label}>닉네임을 입력해주세요</Text><TextInput style={styles.input} placeholder="한글/영문 2~10자" placeholderTextColor="#B9B9BE" value={nickname} onChangeText={setNickname} maxLength={10} />
    <View style={styles.sleepBlock}><Text style={styles.label}>평소 수면 시간을 선택해주세요</Text><WheelPicker items={SLEEP_OPTIONS} initialIndex={DEFAULT_SLEEP_INDEX} pillWidth={200} onChange={(_, value) => setSleepHours(value as string)} /></View>
    <PrimaryButton label="시작하기" onPress={handleStart} style={styles.button} />
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 16 }, label: { fontSize: 15, fontWeight: '600', margin: 8 }, input: { height: 60, backgroundColor: colors.surfaceStrong, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 20, fontSize: 14 }, sleepBlock: { marginTop: 30 }, button: { marginTop: 'auto' } });
