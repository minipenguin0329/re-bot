import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { useProfile } from '@/src/store/ProfileContext';
import { colors } from '@/src/theme/tokens';

export default function EditProfileScreen() {
  const { name, bio, photoUri, updateProfile } = useProfile();
  const [draftName, setDraftName] = useState(name);
  const [draftBio, setDraftBio] = useState(bio);
  const [draftPhoto, setDraftPhoto] = useState(photoUri);

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('권한 필요', '프로필 사진을 바꾸려면 사진 접근 권한이 필요해요.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) setDraftPhoto(result.assets[0].uri);
  };

  const handleSave = () => { updateProfile({ name: draftName.trim() || name, bio: draftBio.trim(), photoUri: draftPhoto }); router.back(); };

  return <Screen scroll><AppHeader title="회원정보 수정" back /><View style={styles.body}>
    <Pressable style={styles.avatarWrap} onPress={handlePickPhoto}>
      <View style={styles.avatar}>{draftPhoto ? <Image source={{ uri: draftPhoto }} style={styles.avatarImage} /> : <Ionicons name="person" size={40} color="#9A9A9F" />}</View>
      <View style={styles.editBadge}><Ionicons name="camera" size={14} color={colors.white} /></View>
    </Pressable>
    <FormField label="아이디" value={draftName} onChangeText={setDraftName} placeholder="닉네임을 입력하세요" maxLength={20} />
    <FormField label="한줄 소개" value={draftBio} onChangeText={setDraftBio} placeholder="나를 소개하는 한마디" multiline maxLength={60} />
    <PrimaryButton label="저장" onPress={handleSave} style={styles.button} />
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 24, gap: 20, paddingBottom: 40 }, avatarWrap: { alignSelf: 'center', marginBottom: 12 }, avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.surfaceStrong, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, avatarImage: { width: 96, height: 96 }, editBadge: { position: 'absolute', right: 0, bottom: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white }, button: { marginTop: 12 } });
