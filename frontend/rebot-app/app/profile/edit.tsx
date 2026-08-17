import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { getErrorMessage } from '@/src/services/api';
import { useAuth } from '@/src/store/AuthContext';
import { useProfile } from '@/src/store/ProfileContext';
import { colors } from '@/src/theme/tokens';

export default function EditProfileScreen() {
  const { updateAccount } = useAuth();
  const { name, bio, photoUri, email, job, sleepHours, specialNotes, updateProfile, persistProfile } = useProfile();
  const [draftName, setDraftName] = useState(name);
  const [draftBio, setDraftBio] = useState(bio);
  const [draftPhoto, setDraftPhoto] = useState(photoUri);
  const [draftEmail, setDraftEmail] = useState(email);
  const [draftPassword, setDraftPassword] = useState('');
  const [draftJob, setDraftJob] = useState(job);
  const initialSleepHours = Number.parseFloat(sleepHours);
  const [draftSleepHours, setDraftSleepHours] = useState<string>(
    Number.isFinite(initialSleepHours) ? String(initialSleepHours) : '',
  );
  const [draftSpecialNotes, setDraftSpecialNotes] = useState(specialNotes);
  const [loading, setLoading] = useState(false);

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('권한 필요', '프로필 사진을 바꾸려면 사진 접근 권한이 필요해요.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) setDraftPhoto(result.assets[0].uri);
  };

  const handleSave = async () => {
    const trimmedSleepHours = draftSleepHours.trim();
    if (trimmedSleepHours) {
      const parsedSleepHours = Number.parseFloat(trimmedSleepHours);
      if (!Number.isFinite(parsedSleepHours) || parsedSleepHours < 0 || parsedSleepHours > 24) {
        return Alert.alert('입력 확인', '평소 수면 시간은 0~24 사이의 숫자로 입력해주세요.');
      }
    }
    const values = {
      name: draftName.trim() || name,
      bio: draftBio.trim(),
      photoUri: draftPhoto,
      email: draftEmail.trim(),
      job: draftJob.trim(),
      sleepHours: trimmedSleepHours,
      specialNotes: draftSpecialNotes.trim(),
    };
    setLoading(true);
    try {
      if (values.email !== email || draftPassword) {
        await updateAccount({
          ...(values.email !== email ? { email: values.email } : {}),
          ...(draftPassword ? { password: draftPassword } : {}),
        });
      }
      updateProfile(values);
      await persistProfile(values);
      Alert.alert('저장 완료', values.email !== email ? '프로필을 저장했어요. 이메일 변경 확인 메일이 발송될 수 있어요.' : '프로필을 저장했어요.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('저장 실패', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return <Screen scroll><AppHeader title="회원정보 수정" back /><View style={styles.body}>
    <Pressable style={styles.avatarWrap} onPress={handlePickPhoto}>
      <View style={styles.avatar}>{draftPhoto ? <Image source={{ uri: draftPhoto }} style={styles.avatarImage} /> : <Ionicons name="person" size={40} color="#9A9A9F" />}</View>
      <View style={styles.editBadge}><Ionicons name="camera" size={14} color={colors.white} /></View>
    </Pressable>
    <FormField label="아이디" value={draftName} onChangeText={setDraftName} placeholder="닉네임을 입력하세요" maxLength={20} />
    <FormField label="한줄 소개" value={draftBio} onChangeText={setDraftBio} placeholder="나를 소개하는 한마디" multiline maxLength={60} />
    <FormField label="이메일" value={draftEmail} onChangeText={setDraftEmail} placeholder="이메일을 입력하세요" keyboardType="email-address" autoCapitalize="none" />
    <FormField label="비밀번호" value={draftPassword} onChangeText={setDraftPassword} placeholder="새 비밀번호로 변경하려면 입력하세요" secureTextEntry />
    <FormField label="직업" value={draftJob} onChangeText={setDraftJob} placeholder="예) 학생, 회사원, 프리랜서 등" />

    <FormField label="평소 수면 시간 (시간)" value={draftSleepHours} onChangeText={setDraftSleepHours} placeholder="예) 7" keyboardType="decimal-pad" />

    <FormField label="특이사항" value={draftSpecialNotes} onChangeText={setDraftSpecialNotes} placeholder="지병, 알레르기 등 특이사항을 입력해 주세요" multiline maxLength={2000} />

    <Text style={styles.localNotice}>프로필 사진과 한줄 소개는 현재 기기에만 표시돼요.</Text>
    <PrimaryButton label="저장" onPress={handleSave} loading={loading} style={styles.button} />
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 24, gap: 20, paddingBottom: 40 }, avatarWrap: { alignSelf: 'center', marginBottom: 12 }, avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.surfaceStrong, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, avatarImage: { width: 96, height: 96 }, editBadge: { position: 'absolute', right: 0, bottom: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white }, localNotice: { fontSize: 11, lineHeight: 17, color: colors.muted, textAlign: 'center' }, button: { marginTop: 12 } });
