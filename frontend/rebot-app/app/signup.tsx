import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { useProfile } from '@/src/store/ProfileContext';
import { colors } from '@/src/theme/tokens';

export default function SignupScreen() {
  const { updateProfile } = useProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    const trimmedName = name.trim();
    updateProfile({ ...(trimmedName ? { name: trimmedName } : {}), email: email.trim(), password });
    router.push('/onboarding/basic');
  };

  return <Screen><AppHeader title="가입하기" back /><View style={styles.body}><FormField label="이름" icon="person" placeholder="이름을 입력해주세요" value={name} onChangeText={setName} /><FormField label="이메일" icon="mail" placeholder="이메일을 입력해주세요" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} /><FormField label="비밀번호" icon="lock-closed" placeholder="비밀번호를 입력해주세요" secureTextEntry value={password} onChangeText={setPassword} /><PrimaryButton label="회원가입" onPress={handleSignup} style={styles.button} /><View style={styles.login}><Text style={styles.muted}>이미 계정이 있으신가요? </Text><Text style={styles.link} onPress={() => router.replace('/login')}>로그인</Text></View></View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 22, gap: 20 }, button: { marginTop: 12 }, login: { marginTop: 'auto', marginBottom: 32, flexDirection: 'row', justifyContent: 'center' }, muted: { color: colors.muted, fontSize: 14 }, link: { color: colors.accent, fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' } });
