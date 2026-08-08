import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { useProfile } from '@/src/store/ProfileContext';
import { colors } from '@/src/theme/tokens';

const menus = [{ label: '회원정보 수정', icon: 'person-outline', route: '/profile/edit' }, { label: 'AI 건강 리포트', icon: 'document-text-outline', route: '/profile/report' }, { label: '알림 설정', icon: 'notifications-outline', route: '/profile/notifications' }, { label: '고객센터', icon: 'help-circle-outline', route: '/profile/support' }] as const;

export default function ProfileScreen() {
  const { name, bio, photoUri } = useProfile();

  const handleLogout = () => Alert.alert('로그아웃', '로그아웃 하시겠어요?', [{ text: '취소', style: 'cancel' }, { text: '로그아웃', style: 'destructive', onPress: () => router.replace('/login') }]);

  return <Screen><AppHeader title="마이페이지" /><View style={styles.body}>
    <View style={styles.profile}>
      <View style={styles.avatar}>{photoUri ? <Image source={{ uri: photoUri }} style={styles.avatarImage} /> : <Ionicons name="person" size={34} color="#9A9A9F" />}</View>
      <View><Text style={styles.name}>{name}</Text><Text style={styles.copy}>{bio}</Text></View>
    </View>
    <View style={styles.menu}>{menus.map((item) => <Pressable key={item.label} onPress={() => router.push(item.route)} style={styles.menuRow}><Ionicons name={item.icon} size={22} color="#777" /><Text style={styles.menuText}>{item.label}</Text><Ionicons name="chevron-forward" size={20} color="#BBB" /></Pressable>)}</View>
    <Pressable style={styles.logout} onPress={handleLogout}><Ionicons name="log-out-outline" size={22} /><Text style={styles.logoutText}>로그아웃</Text></Pressable>
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 30 }, profile: { flexDirection: 'row', alignItems: 'center', gap: 20, marginHorizontal: 20, marginBottom: 42 }, avatar: { width: 65, height: 65, borderRadius: 33, backgroundColor: colors.surfaceStrong, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, avatarImage: { width: 65, height: 65 }, name: { fontSize: 16, fontWeight: '700' }, copy: { fontSize: 13, color: colors.muted, marginTop: 8 }, menu: { borderTopWidth: 1, borderColor: colors.border }, menuRow: { height: 70, borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 10 }, menuText: { flex: 1, fontSize: 16, fontWeight: '500' }, logout: { marginTop: 68, height: 70, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 10 }, logoutText: { fontSize: 16, fontWeight: '500' } });
