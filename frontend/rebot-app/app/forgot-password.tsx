import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { getErrorMessage } from '@/src/services/api';
import { useAuth } from '@/src/store/AuthContext';
import { colors } from '@/src/theme/tokens';

export default function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return Alert.alert('입력 필요', '이메일을 입력해주세요.');
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (error) {
      Alert.alert('요청 실패', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return <Screen><AppHeader title="비밀번호 찾기" back /><View style={styles.centeredBody}>
      <Ionicons name="mail-unread-outline" size={56} color={colors.text} style={styles.icon} />
      <Text style={styles.title}>이메일을 확인해주세요</Text>
      <Text style={styles.desc}>{email.trim()}로{'\n'}비밀번호 재설정 메일을 보냈어요.{'\n'}메일 속 링크를 눌러{'\n'}새 비밀번호를 설정해주세요.</Text>
      <Text style={styles.notice}>메일이 보이지 않는다면 스팸함도 확인해보세요.</Text>
      <PrimaryButton label="로그인으로 돌아가기" onPress={() => router.replace('/login')} style={styles.button} />
    </View></Screen>;
  }

  return <Screen><AppHeader title="비밀번호 찾기" back /><View style={styles.formBody}>
    <Text style={styles.formTitle}>가입하신 이메일을 입력해주세요</Text>
    <Text style={styles.formDesc}>비밀번호 재설정 링크를 보내드릴게요.</Text>
    <FormField label="이메일" icon="mail" placeholder="이메일을 입력해주세요" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} />
    <PrimaryButton label="재설정 메일 보내기" onPress={handleSubmit} loading={loading} style={styles.formButton} />
  </View></Screen>;
}

const styles = StyleSheet.create({
  centeredBody: { flex: 1, paddingHorizontal: 24, paddingTop: 40, alignItems: 'center' },
  icon: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12 },
  desc: { fontSize: 15, lineHeight: 24, color: colors.text, textAlign: 'center' },
  notice: { fontSize: 12, color: colors.muted, marginTop: 16, marginBottom: 'auto' },
  button: { marginBottom: 32, width: '100%' },
  formBody: { flex: 1, paddingHorizontal: 24, paddingTop: 22, gap: 12 },
  formTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  formDesc: { fontSize: 14, color: colors.muted, marginBottom: 8 },
  formButton: { marginTop: 12 },
});
