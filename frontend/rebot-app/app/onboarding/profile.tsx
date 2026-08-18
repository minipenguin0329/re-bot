import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { WheelPicker } from '@/src/components/WheelPicker';
import { DEFAULT_SLEEP_INDEX, SLEEP_OPTIONS } from '@/src/data/onboarding';
import { getErrorMessage } from '@/src/services/api';
import { useProfile } from '@/src/store/ProfileContext';
import { colors, radius } from '@/src/theme/tokens';

export default function ProfileSurveyScreen() {
  const { name, updateProfile, persistProfile } = useProfile();
  const [nickname, setNickname] = useState(name);
  const [sleepHours, setSleepHours] = useState<string>(SLEEP_OPTIONS[DEFAULT_SLEEP_INDEX]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < 2) {
      Alert.alert('입력 확인', '닉네임을 2자 이상 입력해주세요.');
      return;
    }
    const finalValues = {
      name: trimmedNickname || name,
      sleepHours,
      specialNotes: specialNotes.trim(),
    };
    updateProfile(finalValues);
    setLoading(true);
    try {
      await persistProfile(finalValues);
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('프로필 저장 실패', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return <Screen><AppHeader title="기본 정보 입력" back />
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <Text style={styles.label}>닉네임을 입력해주세요</Text>
        <TextInput style={styles.input} placeholder="한글/영문 2~10자" placeholderTextColor="#B9B9BE" value={nickname} onChangeText={setNickname} maxLength={10} />
        <View style={styles.sleepBlock}>
          <Text style={styles.label}>평소 수면 시간을 선택해주세요</Text>
          <WheelPicker items={SLEEP_OPTIONS} initialIndex={DEFAULT_SLEEP_INDEX} pillWidth={200} onChange={(_, value) => setSleepHours(value as string)} />
        </View>
        <View style={styles.healthBlock}>
          <Text style={styles.label}>특이사항 <Text style={styles.helper}>(지병, 알레르기 등 알고 계신 사항이 있다면 입력해 주세요)</Text></Text>
          <TextInput
            style={styles.textArea}
            placeholder="예) 고혈압, 당뇨, 땅콩 알레르기 등"
            placeholderTextColor="#B9B9BE"
            value={specialNotes}
            onChangeText={setSpecialNotes}
            multiline
            textAlignVertical="top"
            maxLength={2000}
          />
          <Text style={styles.optional}>질병과 알레르기를 나눠 적지 않아도 AI가 입력한 내용만 자동으로 분류해요. 모든 항목은 선택 사항이며 나중에 내 정보에서 수정할 수 있습니다.</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}><PrimaryButton label="시작하기" onPress={handleStart} loading={loading} /></View>
    </KeyboardAvoidingView>
  </Screen>;
}

const styles = StyleSheet.create({ flex: { flex: 1 }, content: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 24 }, label: { fontSize: 15, fontWeight: '600', marginHorizontal: 8, marginBottom: 8, color: colors.text }, helper: { color: colors.muted, fontSize: 12, fontWeight: '400' }, input: { height: 60, backgroundColor: colors.surfaceStrong, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 20, fontSize: 14 }, sleepBlock: { marginTop: 30 }, healthBlock: { marginTop: 24 }, allergyLabel: { marginTop: 18 }, textArea: { minHeight: 88, backgroundColor: colors.background, borderRadius: 6, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, lineHeight: 19 }, optional: { marginTop: 8, color: colors.muted, fontSize: 10, lineHeight: 15 }, footer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16, backgroundColor: colors.background } });
