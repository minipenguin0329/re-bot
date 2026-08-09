import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { colors, radius } from '@/src/theme/tokens';

export default function DiagnosisScreen() {
  const [symptom, setSymptom] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [hadBefore, setHadBefore] = useState(false);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);

  const handlePickPhoto = async () => {
    setIsPickingPhoto(true);
    await new Promise((resolve) => setTimeout(resolve, 120));
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert('권한 필요', '사진을 첨부하려면 사진 접근 권한이 필요해요.');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled) setPhotoUri(result.assets[0].uri);
    } finally {
      setIsPickingPhoto(false);
    }
  };

  return <Screen scroll><AppHeader title="AI 자가진단" back /><View style={styles.body}>
    <Text style={styles.label}>문제 상황을 설명해주세요</Text>
    <FormField multiline placeholder="어떤 증상인지 자세히 입력해주세요" value={symptom} onChangeText={setSymptom} />
    <Text style={[styles.label, styles.photoLabel]}>사진 첨부 <Text style={styles.optional}>(선택)</Text></Text>
    <Pressable style={styles.photo} onPress={handlePickPhoto}>
      {photoUri ? <>
        <Image source={{ uri: photoUri }} style={styles.photoImage} />
        <Pressable hitSlop={8} style={styles.photoRemove} onPress={() => setPhotoUri(null)}><Ionicons name="close" size={12} color={colors.white} /></Pressable>
      </> : <Ionicons name="add" size={32} color="#C9C9CC" />}
    </Pressable>
    <Pressable style={styles.check} onPress={() => setHadBefore((current) => !current)}>
      <View style={[styles.box, hadBefore && styles.boxChecked]}>{hadBefore && <Ionicons name="checkmark" size={14} color={colors.white} />}</View>
      <Text style={styles.checkText}>전에도 동일한 증상이 있었나요?</Text>
    </Pressable>
    <PrimaryButton label="분석하기" onPress={() => router.push('/diagnosis/loading')} style={styles.button} />
  </View>
  {isPickingPhoto && <View pointerEvents="auto" style={styles.photoPickerOverlay}><ActivityIndicator size="small" color="#8F8F8F" /></View>}
  </Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 10 }, label: { fontSize: 15, fontWeight: '700', margin: 8 }, optional: { color: colors.muted, fontWeight: '400' }, photoLabel: { marginTop: 42 }, photo: { width: 84, height: 84, borderRadius: radius.md, backgroundColor: colors.surfaceStrong, alignItems: 'center', justifyContent: 'center', marginLeft: 6, overflow: 'visible' }, photoImage: { width: 84, height: 84, borderRadius: radius.md }, photoRemove: { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white }, check: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 28, marginLeft: 6 }, box: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#C4C4C8', alignItems: 'center', justifyContent: 'center' }, boxChecked: { backgroundColor: colors.black, borderColor: colors.black }, checkText: { color: colors.muted, fontSize: 14 }, button: { marginTop: 'auto' }, photoPickerOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.76)' } });
