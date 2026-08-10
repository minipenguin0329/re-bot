import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { getErrorMessage } from '@/src/services/api';
import { useAuth } from '@/src/store/AuthContext';
import { colors } from '@/src/theme/tokens';

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { resendConfirmation } = useAuth();
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setTimeout(() => setCooldown((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || sending || cooldown > 0) return;
    setSending(true);
    try {
      await resendConfirmation(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      Alert.alert('다시 보냈어요', '인증 메일을 다시 보냈어요. 메일함을 확인해주세요.');
    } catch (error) {
      Alert.alert('재전송 실패', getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return <Screen><AppHeader title="이메일 인증" back /><View style={styles.body}>
    <Ionicons name="mail-unread-outline" size={56} color={colors.text} style={styles.icon} />
    <Text style={styles.title}>이메일을 확인해주세요</Text>
    <Text style={styles.desc}>{email ? `${email}로` : '가입하신 이메일로'}{'\n'}인증 메일을 보냈어요.{'\n'}메일함에서 인증을 완료한 후{'\n'}로그인해주세요.</Text>
    <Text style={styles.notice}>메일이 보이지 않는다면 스팸함도 확인해보세요.</Text>
    <Pressable onPress={handleResend} disabled={sending || cooldown > 0} hitSlop={8}>
      <Text style={[styles.resend, (sending || cooldown > 0) && styles.resendDisabled]}>
        {cooldown > 0 ? `인증 메일 다시 보내기 (${cooldown}초 후 가능)` : sending ? '보내는 중...' : '인증 메일 다시 보내기'}
      </Text>
    </Pressable>
    <PrimaryButton label="로그인하러 가기" onPress={() => router.replace('/login')} style={styles.button} />
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 40, alignItems: 'center' }, icon: { marginBottom: 20 }, title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12 }, desc: { fontSize: 15, lineHeight: 24, color: colors.text, textAlign: 'center' }, notice: { fontSize: 12, color: colors.muted, marginTop: 16, marginBottom: 'auto' }, resend: { fontSize: 14, color: colors.accent, fontWeight: '700', textDecorationLine: 'underline', marginBottom: 20 }, resendDisabled: { color: colors.muted, textDecorationLine: 'none' }, button: { marginBottom: 32, width: '100%' } });
