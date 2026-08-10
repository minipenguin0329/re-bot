import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { useWellness } from '@/src/store/WellnessContext';
import { colors } from '@/src/theme/tokens';

export default function ProductPromptScreen() {
  const { setProductConsent } = useWellness();
  const accept = () => {
    setProductConsent(true);
    router.replace('/(tabs)/market');
  };
  return <Screen contentStyle={styles.screen}><Text style={styles.title}>도움되는 제품을{`\n`}추천해 드릴까요?</Text><Text style={styles.copy}>동의한 경우에만 상품 데이터베이스를 조회해요.</Text><View style={styles.product}><Ionicons name="leaf-outline" size={72} color="#999" /></View><View style={styles.buttons}><PrimaryButton label="네, 추천해주세요!" onPress={accept} /><PrimaryButton label="아니요, 괜찮아요" variant="accent" onPress={() => router.replace('/(tabs)/home')} /></View></Screen>;
}

const styles = StyleSheet.create({ screen: { paddingHorizontal: 24, alignItems: 'center' }, title: { marginTop: 140, fontSize: 25, lineHeight: 32, fontWeight: '800', textAlign: 'center' }, copy: { color: colors.muted, fontSize: 13, marginTop: 14 }, product: { width: 208, height: 225, backgroundColor: colors.surfaceStrong, marginTop: 36, alignItems: 'center', justifyContent: 'center' }, buttons: { marginTop: 'auto', marginBottom: 40, width: '100%', gap: 24 } });
