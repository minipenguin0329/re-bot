import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { getErrorMessage } from '@/src/services/api';
import { useWellness } from '@/src/store/WellnessContext';
import { colors } from '@/src/theme/tokens';

export default function FeedbackScreen() {
  const { sendFeedback, resetWellnessFlow } = useWellness();
  const [loading, setLoading] = useState<'positive' | 'negative' | null>(null);

  const handleFeedback = async (feedback: 'positive' | 'negative') => {
    setLoading(feedback);
    try {
      await sendFeedback(feedback);
      resetWellnessFlow();
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('피드백 저장 실패', getErrorMessage(error));
    } finally {
      setLoading(null);
    }
  };

  return <Screen><AppHeader title="AI 솔루션" back /><View style={styles.body}><Text style={styles.title}>이 제안이 도움이 되었나요?</Text><View style={styles.reactions}><Pressable disabled={Boolean(loading)} onPress={() => void handleFeedback('positive')} style={loading && styles.disabled}><Ionicons name="thumbs-up" size={48} color="#888" /><Text style={styles.reactionText}>{loading === 'positive' ? '저장 중' : '도움됐어요'}</Text></Pressable><Pressable disabled={Boolean(loading)} onPress={() => void handleFeedback('negative')} style={loading && styles.disabled}><Ionicons name="thumbs-down" size={48} color="#888" /><Text style={styles.reactionText}>{loading === 'negative' ? '저장 중' : '아쉬워요'}</Text></Pressable></View><Text style={styles.copy}>피드백은 다음 제안을 더 현실적으로{`\n`}만드는 데 사용돼요.</Text><Text style={styles.notice}>이 정보는 의료 진단이나 처방을 대체하지 않습니다.</Text></View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, alignItems: 'center' }, title: { marginTop: 150, fontSize: 20, fontWeight: '800' }, reactions: { marginTop: 80, flexDirection: 'row', gap: 70 }, reactionText: { marginTop: 10, fontSize: 12, color: colors.muted, textAlign: 'center' }, disabled: { opacity: 0.5 }, copy: { marginTop: 70, textAlign: 'center', color: '#888', fontSize: 15, lineHeight: 22, fontWeight: '600' }, notice: { position: 'absolute', bottom: 120, fontSize: 11, color: colors.muted } });
