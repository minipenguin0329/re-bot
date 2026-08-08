import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { colors } from '@/src/theme/tokens';

export default function ProductPromptScreen() {
  return <Screen contentStyle={styles.screen}><Text style={styles.title}>도움되는 제품을{`\n`}추천해 드릴까요?</Text><View style={styles.product}><Ionicons name="leaf-outline" size={72} color="#999" /></View><View style={styles.buttons}><PrimaryButton label="네, 추천해주세요!" onPress={() => router.replace('/(tabs)/market')} /><PrimaryButton label="아니요, 괜찮아요" variant="accent" onPress={() => router.replace('/(tabs)/home')} /></View></Screen>;
}

const styles = StyleSheet.create({ screen: { paddingHorizontal: 24, alignItems: 'center' }, title: { marginTop: 180, fontSize: 25, lineHeight: 32, fontWeight: '800', textAlign: 'center' }, product: { width: 208, height: 225, backgroundColor: colors.surfaceStrong, marginTop: 44, alignItems: 'center', justifyContent: 'center' }, buttons: { marginTop: 'auto', marginBottom: 40, width: '100%', gap: 24 } });
