import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { colors } from '@/src/theme/tokens';

export default function SolutionScreen() {
  return (
    <Screen>
      <AppHeader title="AI 솔루션" back />
      <View style={styles.body}>
        <View style={styles.intro}>
          <Text style={styles.title}>고민되는 상황을 입력해주세요</Text>
          <Text style={styles.subtitle}>AI가 상황을 분석하고 최선의 선택을 제안해드릴게요</Text>
        </View>

        <View style={styles.inputCard}>
          <TextInput
            multiline
            textAlignVertical="top"
            placeholder="예) 회식 때문에 술을 마셔야 하는데 내일 아침 개운하게 일어나고 싶어요."
            placeholderTextColor="#A2A2A2"
            style={styles.input}
          />
        </View>

        <View style={styles.flexGap} />
        <View style={styles.tip}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb-outline" size={28} color="#969696" />
          </View>
          <Text style={styles.tipText}>구체적으로 입력할수록{`\n`}더 정확한 제안을 받을 수 있어요.</Text>
        </View>
        <View style={styles.bottomGap} />
        <PrimaryButton
          label="물어보기"
          onPress={() => router.push('/solution/suggestion')}
          style={styles.button}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
  },
  intro: { flexShrink: 0 },
  title: {
    marginHorizontal: 8,
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    marginHorizontal: 8,
    marginTop: 7,
    fontSize: 14,
    lineHeight: 22,
    color: '#9B9B9B',
  },
  inputCard: {
    flex: 1,
    minHeight: 180,
    maxHeight: 318,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    padding: 0,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
  },
  tip: {
    height: 78,
    flexShrink: 0,
    paddingHorizontal: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 30,
    borderRadius: 16,
    backgroundColor: '#FFF8DC',
  },
  flexGap: { flex: 1, minHeight: 12, maxHeight: 56 },
  bottomGap: { flex: 1, minHeight: 12, maxHeight: 56 },
  tipIcon: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '500',
    color: '#8D8D8D',
  },
  button: {
    height: 60,
    flexShrink: 0,
    borderRadius: 16,
  },
});
