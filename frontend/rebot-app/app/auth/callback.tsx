import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme/tokens';

WebBrowser.maybeCompleteAuthSession();

export default function AuthCallbackScreen() {
  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.text}>카카오 로그인을 확인하고 있어요.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 15,
    color: colors.muted,
  },
});
