import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { getErrorMessage } from '@/src/services/api';
import { useAuth } from '@/src/store/AuthContext';
import { useProfile } from '@/src/store/ProfileContext';
import { colors } from '@/src/theme/tokens';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { refreshProfile } = useProfile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('입력 확인', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      const me = await refreshProfile();
      router.replace(me.profile ? '/(tabs)/home' : '/onboarding/basic');
    } catch (error) {
      Alert.alert('로그인 실패', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return <Screen contentStyle={styles.screen}>
    <View style={styles.hero}><Text style={styles.title}>안녕하세요{`\n`}다시 만나서 반가워요! 👋</Text><Text style={styles.subtitle}>오늘은 어떤 새로운 경험이 기다릴까?</Text></View>
    <View style={styles.form}>
      <View style={styles.line}><TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="이메일을 입력하세요" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" /><Pressable hitSlop={8} onPress={() => setEmail('')}><Ionicons name="close-circle" size={19} color="#8D8D96" /></Pressable></View>
      <View style={[styles.line, styles.mutedLine]}><TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="비밀번호를 입력하세요" placeholderTextColor="#9CA4AB" secureTextEntry={!passwordVisible} onSubmitEditing={handleLogin} /><Pressable hitSlop={8} onPress={() => setPasswordVisible((current) => !current)}><Ionicons name={passwordVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA4AB" /></Pressable></View>
      <View style={styles.options}><Text style={styles.option}>로그인 상태는 안전하게 유지돼요</Text><Pressable onPress={() => router.push('/forgot-password')}><Text style={styles.forgot}>비밀번호 찾기</Text></Pressable></View>
    </View>
    <PrimaryButton label="로그인" onPress={handleLogin} loading={loading} />
    <Pressable style={styles.kakao} onPress={() => Alert.alert('준비 중', '카카오 로그인을 사용하려면 Supabase OAuth 설정이 추가로 필요해요.')}><View style={styles.kakaoIcon}><Text style={styles.kakaoText}>TALK</Text></View><Text style={styles.kakaoLabel}>카카오 로그인 (준비 중)</Text></Pressable>
    <View style={styles.bottom}><Text style={styles.bottomText}>아직 회원이 아니신가요? </Text><Pressable onPress={() => router.push('/signup')}><Text style={styles.signup}>회원가입</Text></Pressable></View>
  </Screen>;
}

const styles = StyleSheet.create({ screen: { paddingHorizontal: 24 }, hero: { marginTop: 48, marginBottom: 24 }, title: { fontSize: 28, lineHeight: 40, fontWeight: '800', color: colors.text }, subtitle: { fontSize: 16, lineHeight: 30, color: '#767676' }, form: { gap: 0 }, line: { height: 70, borderBottomWidth: 1, borderBottomColor: colors.black, flexDirection: 'row', alignItems: 'center' }, mutedLine: { borderBottomColor: colors.border }, input: { flex: 1, fontSize: 15 }, options: { height: 70, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, option: { fontSize: 13, color: colors.subtle }, forgot: { fontSize: 13, color: colors.subtle, textDecorationLine: 'underline' }, kakao: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }, kakaoIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FEE500', alignItems: 'center', justifyContent: 'center' }, kakaoText: { fontSize: 6, fontWeight: '800' }, kakaoLabel: { fontSize: 16, fontWeight: '500', color: colors.muted }, bottom: { marginTop: 'auto', marginBottom: 34, flexDirection: 'row', justifyContent: 'center' }, bottomText: { fontSize: 14, color: colors.muted }, signup: { fontSize: 14, color: '#C39B00', fontWeight: '700', textDecorationLine: 'underline' } });
