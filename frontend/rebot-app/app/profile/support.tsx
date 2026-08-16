import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { colors } from '@/src/theme/tokens';

const menus = [
  { label: '이메일로 문의', icon: 'mail-outline' as const, action: 'route' as const, pathname: '/profile/support/email' as const, params: undefined },
  { label: '이용약관', icon: 'document-text-outline' as const, action: 'route' as const, pathname: '/profile/support/terms' as const, params: { tab: 'terms' } },
  { label: '주의사항', icon: 'alert-circle-outline' as const, action: 'route' as const, pathname: '/profile/support/terms' as const, params: { tab: 'notice' } },
];

export default function SupportScreen() {
  const handlePress = (menu: (typeof menus)[number]) => {
    router.push({ pathname: menu.pathname, params: menu.params });
  };

  return <Screen><AppHeader title="고객센터" back /><View style={styles.menu}>
    {menus.map((menu) => <Pressable key={menu.label} style={styles.row} onPress={() => handlePress(menu)}><Ionicons name={menu.icon} size={22} color="#777" /><Text style={styles.label}>{menu.label}</Text><Ionicons name="chevron-forward" size={20} color="#BBB" /></Pressable>)}
  </View></Screen>;
}

const styles = StyleSheet.create({ menu: { marginTop: 12, borderTopWidth: 1, borderColor: colors.border }, row: { height: 70, borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 24 }, label: { flex: 1, fontSize: 16, fontWeight: '500' } });
