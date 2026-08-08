import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { colors } from '@/src/theme/tokens';

const icons = { home: ['home', 'home-outline'], diagnosis: ['analytics', 'analytics-outline'], solution: ['bulb', 'bulb-outline'], market: ['bag-handle', 'bag-handle-outline'], profile: ['person', 'person-outline'] } as const;

export default function TabLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false, tabBarActiveTintColor: colors.accent, tabBarInactiveTintColor: '#9B9B9B', tabBarStyle: { height: Platform.OS === 'ios' ? 86 : 70, paddingTop: 15, borderTopWidth: 0, borderTopLeftRadius: 40, borderTopRightRadius: 40, backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 18, elevation: 8 } }}>
    {Object.entries(icons).map(([name, pair]) => <Tabs.Screen key={name} name={name} options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={pair[focused ? 0 : 1]} size={27} color={color} /> }} />)}
  </Tabs>;
}
