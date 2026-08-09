import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { colors } from '@/src/theme/tokens';

export default function LoginScreen() {
  return <Screen scroll contentStyle={styles.screen}>
    <View style={styles.hero}><Text style={styles.title}>안녕하세요{`\n`}다시 만나서 반가워요 !👋</Text><Text style={styles.subtitle}>오늘은 어떤 새로운 경험이 기다릴까?</Text></View>
    <View style={styles.form}><View style={styles.line}><TextInput style={styles.input} defaultValue="design@nave l" /><Ionicons name="close-circle" size={19} color="#8D8D96" /></View><View style={[styles.line, styles.mutedLine]}><TextInput style={styles.input} placeholder="비밀번호를 입력하세요" placeholderTextColor="#9CA4AB" secureTextEntry /><Ionicons name="eye-off-outline" size={20} color="#9CA4AB" /></View><View style={styles.options}><Text style={styles.option}>☑  로그인 상태 유지</Text><Text style={styles.option}>비밀번호 찾기</Text></View></View>
    <PrimaryButton label="로그인" onPress={() => router.replace('/(tabs)/home')} />
    <Pressable style={styles.kakao} onPress={() => router.replace('/(tabs)/home')}><View style={styles.kakaoIcon}><Text style={styles.kakaoText}>TALK</Text></View><Text style={styles.kakaoLabel}>카카오 로그인</Text></Pressable>
    <View style={styles.bottom}><Text style={styles.bottomText}>아직 회원이 아니신가요? </Text><Pressable onPress={() => router.push('/signup')}><Text style={styles.signup}>회원가입</Text></Pressable></View>
  </Screen>;
}

const styles = StyleSheet.create({ screen: { paddingHorizontal: 24 }, hero: { marginTop: 48, marginBottom: 24 }, title: { fontSize: 28, lineHeight: 40, fontWeight: '800', color: colors.text }, subtitle: { fontSize: 16, lineHeight: 30, color: '#767676' }, form: { gap: 0 }, line: { height: 70, borderBottomWidth: 1, borderBottomColor: colors.black, flexDirection: 'row', alignItems: 'center' }, mutedLine: { borderBottomColor: colors.border }, input: { flex: 1, fontSize: 15 }, options: { height: 70, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, option: { fontSize: 13, color: colors.subtle }, kakao: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }, kakaoIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FEE500', alignItems: 'center', justifyContent: 'center' }, kakaoText: { fontSize: 6, fontWeight: '800' }, kakaoLabel: { fontSize: 16, fontWeight: '500' }, bottom: { marginTop: 'auto', marginBottom: 34, flexDirection: 'row', justifyContent: 'center' }, bottomText: { fontSize: 14, color: colors.muted }, signup: { fontSize: 14, color: colors.accent, fontWeight: '700', textDecorationLine: 'underline' } });
