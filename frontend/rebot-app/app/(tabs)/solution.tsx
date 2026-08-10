import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/src/components/AppHeader';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { getErrorMessage } from '@/src/services/api';
import { useWellness } from '@/src/store/WellnessContext';
import { colors, radius } from '@/src/theme/tokens';

export default function SolutionScreen() {
  const { requestKnownCauseSolution } = useWellness();
  const [situation, setSituation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const value = situation.trim();
    if (value.length < 5) {
      Alert.alert('입력 확인', '상황을 5자 이상 구체적으로 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await requestKnownCauseSolution(value);
      router.push('/solution/suggestion');
    } catch (error) {
      Alert.alert('제안 생성 실패', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return <Screen><AppHeader title="AI 솔루션" /><View style={styles.body}><Text style={styles.title}>고민되는 상황을 입력해주세요</Text><Text style={styles.subtitle}>AI가 최근 기록과 상황을 살펴보고 실행 가능한 행동을 제안해드릴게요</Text><FormField multiline placeholder="예) 회식 때문에 술을 마셔야 하는데 내일 아침 개운하게 일어나고 싶어요." value={situation} onChangeText={setSituation} maxLength={4000} /><View style={styles.tip}><Ionicons name="bulb-outline" size={30} color="#999" /><Text style={styles.tipText}>구체적으로 입력할수록{`\n`}더 정확한 제안을 받을 수 있어요.</Text></View><PrimaryButton label={loading ? '제안 준비 중' : '물어보기'} onPress={handleSubmit} loading={loading} style={styles.button} /></View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 24 }, title: { fontSize: 20, fontWeight: '700', marginHorizontal: 8 }, subtitle: { fontSize: 14, lineHeight: 21, color: colors.muted, marginHorizontal: 8, marginTop: 10, marginBottom: 30 }, tip: { height: 78, borderRadius: radius.md, backgroundColor: colors.warningSoft, marginTop: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28 }, tipText: { fontSize: 12, color: colors.muted, lineHeight: 22 }, button: { marginTop: 'auto', marginBottom: 50 } });
