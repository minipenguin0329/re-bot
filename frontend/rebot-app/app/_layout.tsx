import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider, useAuth } from '@/src/store/AuthContext';
import { ProfileProvider } from '@/src/store/ProfileContext';
import { WellnessProvider } from '@/src/store/WellnessContext';
import { colors } from '@/src/theme/tokens';

export default function RootLayout() {
  return <GestureHandlerRootView style={styles.root}><AuthProvider><ProfileProvider><WellnessProvider><AppNavigator /></WellnessProvider></ProfileProvider></AuthProvider></GestureHandlerRootView>;
}

function AppNavigator() {
  const { loading, session } = useAuth();

  if (loading) {
    return <View style={styles.loading}><StatusBar style="dark" /><ActivityIndicator color={colors.text} /></View>;
  }

  return <><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: '#fff' } }}>
    <Stack.Protected guard={!session}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="auth/callback" />
    </Stack.Protected>
    <Stack.Protected guard={Boolean(session)}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding/basic" />
      <Stack.Screen name="onboarding/profile" />
      <Stack.Screen name="diagnosis/loading" />
      <Stack.Screen name="diagnosis/candidates" />
      <Stack.Screen name="diagnosis/result" />
      <Stack.Screen name="solution/suggestion" />
      <Stack.Screen name="solution/feedback" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="profile/notifications" />
      <Stack.Screen name="profile/wellness" />
      <Stack.Screen name="profile/support" />
      <Stack.Screen name="profile/support/email" />
      <Stack.Screen name="profile/support/terms" />
    </Stack.Protected>
  </Stack></>;
}

const styles = StyleSheet.create({ root: { flex: 1 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background } });
