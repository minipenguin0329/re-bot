import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { getErrorMessage } from '@/src/services/api';
import { useAuth } from '@/src/store/AuthContext';
import { useProfile } from '@/src/store/ProfileContext';
import { colors } from '@/src/theme/tokens';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const { updateProfile } = useProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || password.length < 6) {
      Alert.alert('입력 확인', '이름과 이메일을 입력하고 비밀번호는 6자 이상으로 설정해주세요.');
      return;
    }
    setLoading(true);
    try {
      const result = await signUp(trimmedEmail, password, trimmedName);
      updateProfile({ name: trimmedName, email: trimmedEmail });
      if (result.needsEmailConfirmation) {
        Alert.alert('이메일 확인 필요', '가입 확인 메일의 링크를 누른 뒤 로그인해주세요.', [
          { text: '확인', onPress: () => router.replace('/login') },
        ]);
      } else {
        router.replace('/onboarding/basic');
      }
    } catch (error) {
      Alert.alert('회원가입 실패', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return <Screen><AppHeader title="가입하기" back /><View style={styles.body}><FormField label="이름" icon="person" placeholder="이름을 입력해주세요" value={name} onChangeText={setName} /><FormField label="이메일" icon="mail" placeholder="이메일을 입력해주세요" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} /><FormField label="비밀번호" icon="lock-closed" placeholder="6자 이상 입력해주세요" secureTextEntry value={password} onChangeText={setPassword} /><PrimaryButton label="회원가입" onPress={handleSignup} loading={loading} style={styles.button} /><View style={styles.login}><Text style={styles.muted}>이미 계정이 있으신가요? </Text><Text style={styles.link} onPress={() => router.replace('/login')}>로그인</Text></View></View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 22, gap: 20 }, button: { marginTop: 12 }, login: { marginTop: 'auto', marginBottom: 32, flexDirection: 'row', justifyContent: 'center' }, muted: { color: colors.muted, fontSize: 14 }, link: { color: colors.accent, fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' } });
