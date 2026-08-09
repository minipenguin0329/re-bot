import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/tokens';

const TAB_CONTENT_HEIGHT = 54;

const tabs = [
  { name: 'home', active: 'home', inactive: 'home-outline' },
  { name: 'diagnosis', active: 'analytics', inactive: 'analytics-outline' },
  { name: 'solution', active: 'bulb', inactive: 'bulb-outline' },
  { name: 'profile', active: 'person', inactive: 'person-outline' },
] as const;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarStyle = {
    ...styles.bar,
    height: TAB_CONTENT_HEIGHT + insets.bottom,
    paddingBottom: Math.max(insets.bottom, 8),
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#F4D36A',
        tabBarInactiveTintColor: '#9D9D9D',
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: styles.item,
        tabBarStyle,
      }}>
      {tabs.map(({ name, active, inactive }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            tabBarStyle: name === 'solution' ? { display: 'none' } : tabBarStyle,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? active : inactive} size={29} color={color} />
            ),
          }}
        />
      ))}
      <Tabs.Screen name="market" options={{ href: null }} />
    </Tabs>
  );
}

const styles = {
  bar: {
    paddingTop: 10,
    paddingHorizontal: 22,
    borderTopWidth: 0,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: colors.white,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 16,
  },
  item: {
    height: 44,
    paddingHorizontal: 8,
  },
} as const;
