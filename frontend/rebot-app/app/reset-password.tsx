import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { getErrorMessage } from '@/src/services/api';
import { useAuth } from '@/src/store/AuthContext';
import { colors } from '@/src/theme/tokens';

type Status = 'verifying' | 'ready' | 'invalid';

export default function ResetPasswordScreen() {
  const { token_hash: tokenHash } = useLocalSearchParams<{ token_hash?: string; type?: string }>();
  const { verifyRecoveryToken, updateAccount } = useAuth();
  const [status, setStatus] = useState<Status>('verifying');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tokenHash) { setStatus('invalid'); return; }
    verifyRecoveryToken(tokenHash).then(() => setStatus('ready')).catch(() => setStatus('invalid'));
  }, [tokenHash, verifyRecoveryToken]);

  const handleSubmit = async () => {
    if (password.length < 6) return Alert.alert('비밀번호 확인', '비밀번호는 6자 이상이어야 해요.');
    if (password !== confirmPassword) return Alert.alert('비밀번호 확인', '비밀번호가 서로 일치하지 않아요.');
    setLoading(true);
    try {
      await updateAccount({ password });
      Alert.alert('변경 완료', '비밀번호가 변경됐어요.');
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('변경 실패', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (status === 'verifying') {
    return <Screen contentStyle={styles.center}><ActivityIndicator /></Screen>;
  }

  if (status === 'invalid') {
    return <Screen><AppHeader title="비밀번호 재설정" back /><View style={styles.centeredBody}>
      <Ionicons name="alert-circle-outline" size={56} color={colors.text} style={styles.icon} />
      <Text style={styles.title}>링크가 만료됐어요</Text>
      <Text style={styles.desc}>인증 링크가 유효하지 않거나{'\n'}이미 사용됐어요.{'\n'}다시 요청해주세요.</Text>
      <PrimaryButton label="다시 요청하기" onPress={() => router.replace('/forgot-password')} style={styles.button} />
    </View></Screen>;
  }

  return <Screen><AppHeader title="새 비밀번호 설정" back /><View style={styles.formBody}>
    <Text style={styles.formTitle}>새 비밀번호를 입력해주세요</Text>
    <FormField label="새 비밀번호" icon="lock-closed" placeholder="6자 이상 입력해주세요" secureTextEntry value={password} onChangeText={setPassword} />
    <FormField label="비밀번호 확인" icon="lock-closed" placeholder="다시 한번 입력해주세요" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
    <PrimaryButton label="비밀번호 변경" onPress={handleSubmit} loading={loading} style={styles.formButton} />
  </View></Screen>;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  centeredBody: { flex: 1, paddingHorizontal: 24, paddingTop: 40, alignItems: 'center' },
  icon: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12 },
  desc: { fontSize: 15, lineHeight: 24, color: colors.text, textAlign: 'center' },
  button: { marginTop: 32, width: '100%' },
  formBody: { flex: 1, paddingHorizontal: 24, paddingTop: 22, gap: 12 },
  formTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  formButton: { marginTop: 12 },
});
