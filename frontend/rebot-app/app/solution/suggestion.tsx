import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ChoiceCard } from '@/src/components/ChoiceCard';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { colors } from '@/src/theme/tokens';

const suggestions = [
  ['술을 마시기 전 물 한 컵 마시기', '알코올 흡수를 늦춰 숙취를 줄여줘요.'],
  ['안주로 단백질, 채소 먼저 먹기', '혈당 상승을 완화하고 속을 보호해줘요.'],
  ['자기전 물을 충분히 섭취하기', '수분 보충으로 숙취를 완화해줘요.'],
] as const;

export default function SuggestionScreen() {
  return <Screen><View style={styles.body}><Text style={styles.title}>술자리 전, 이런 방법은 어때요?</Text><Text style={styles.copy}>실행 가능 여부에 따라 다른 대안을 제안해드릴게요</Text><View style={styles.cards}>{suggestions.map(([title, description], index) => <ChoiceCard key={title} title={title} description={description} number={index + 1} />)}</View><View style={styles.buttons}><PrimaryButton label="실행할게요" onPress={() => router.push('/solution/feedback')} style={styles.flex} /><PrimaryButton label="어려워요" variant="accent" onPress={() => router.push('/solution/feedback')} style={styles.flex} /></View></View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 38 }, title: { fontSize: 21, fontWeight: '800' }, copy: { fontSize: 14, color: colors.muted, marginTop: 10 }, cards: { marginTop: 40, gap: 24 }, buttons: { marginTop: 'auto', marginBottom: 28, flexDirection: 'row', gap: 14 }, flex: { flex: 1 } });
