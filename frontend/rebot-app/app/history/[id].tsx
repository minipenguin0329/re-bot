import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { backendApi, getErrorMessage } from '@/src/services/api';
import type { AnalysisResponse, ChatMessageResponse } from '@/src/types/api';
import { colors, radius } from '@/src/theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HistoryDetailScreen() {
  const { id, description, recommendationAction, focusChat } = useLocalSearchParams<{
    id: string;
    description?: string;
    recommendationAction?: string;
    focusChat?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { height: viewportHeight } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const hasFocusedChat = useRef(false);

  const toggleExpanded = (candidateId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(candidateId)) next.delete(candidateId);
      else next.add(candidateId);
      return next;
    });
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setChatError(null);
    try {
      const nextAnalysis = await backendApi.getAnalysis(id);
      setAnalysis(nextAnalysis);
      try {
        const chat = await backendApi.getAnalysisChat(id);
        setMessages(chat.messages);
      } catch (caught) {
        // 채팅 조회 실패가 기존 분석 기록 열람까지 막지 않도록 분리합니다.
        setMessages([]);
        setChatError(`이전 대화를 불러오지 못했어요. ${getErrorMessage(caught)}`);
      }
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(Math.min(event.endCoordinates.height, viewportHeight));
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      inputRef.current?.blur();
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [viewportHeight]);

  useEffect(() => {
    if (loading || focusChat !== '1' || hasFocusedChat.current) return;
    hasFocusedChat.current = true;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 350);
    return () => clearTimeout(timer);
  }, [focusChat, loading]);

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || sending) return;

    setDraft('');
    setSending(true);
    setChatError(null);
    try {
      const reply = await backendApi.sendAnalysisChatMessage(id, content);
      setMessages((current) => [...current, reply.user_message, reply.assistant_message]);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    } catch (caught) {
      setDraft(content);
      setChatError(getErrorMessage(caught));
    } finally {
      setSending(false);
    }
  };

  const deleteHistory = () => {
    if (deleting) return;
    Alert.alert(
      '대화 내역을 삭제할까요?',
      '분석 결과와 AI 대화를 포함한 이 기록이 모두 삭제되며 복구할 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setDeleting(true);
            setChatError(null);
            void backendApi.deleteAnalysis(id)
              .then(() => router.replace('/history'))
              .catch((caught) => Alert.alert('삭제 실패', getErrorMessage(caught)))
              .finally(() => setDeleting(false));
          },
        },
      ],
    );
  };

  if (loading) return <Screen contentStyle={styles.center}><ActivityIndicator color={colors.text} /></Screen>;

  if (error || !analysis) {
    return <Screen><AppHeader title="자가진단 상세" back /><View style={styles.state}>
      <Text style={styles.error}>{error ?? '기록을 불러오지 못했어요.'}</Text>
      <PrimaryButton label="다시 시도" onPress={() => void load()} style={styles.retry} />
    </View></Screen>;
  }

  // Android의 resize 모드가 키보드 툴바까지 포함한 실제 IME 높이를 반영합니다.
  // 열린 상태에서는 화면 높이에 비례한 작은 간격만 남기고, 닫히면 시스템 안전영역을 복원합니다.
  const keyboardGap = keyboardHeight > 0
    ? Math.max(8, Math.min(14, Math.round(viewportHeight * 0.015)))
    : Math.max(insets.bottom, 10);
  const keyboardOpen = keyboardHeight > 0;

  return <Screen bottomSafe={false}>
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : keyboardOpen ? 'height' : undefined}
      enabled={Platform.OS === 'ios' || keyboardOpen}
      keyboardVerticalOffset={0}
    >
      <AppHeader
        title="대화 내역"
        back
        rightIcon="trash-outline"
        onRightPress={deleteHistory}
        rightDisabled={deleting}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => messages.length > 0 && scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {description ? <View style={styles.symptomBlock}><Text style={styles.label}>증상</Text><Text style={styles.symptomText}>{description}</Text></View> : null}

        <Text style={styles.label}>유력 후보</Text>
        <View style={styles.cards}>{analysis.candidates.map((candidate) => <View key={candidate.id} style={[styles.candidateCard, candidate.selected && styles.candidateCardSelected]}>
          <View style={styles.candidateHeader}>
            <Text style={styles.candidateTitle}>{candidate.title}</Text>
            {candidate.selected && <Ionicons name="checkmark-circle" size={18} color="#8A6B00" />}
          </View>
          <Text style={styles.candidateReason} numberOfLines={expandedIds.has(candidate.id) ? undefined : 1} onPress={() => toggleExpanded(candidate.id)}>
            {candidate.reason}
          </Text>
        </View>)}</View>
        {analysis.candidates.length === 0 && <Text style={styles.empty}>확인된 후보가 없어요.</Text>}
        {analysis.selection_status === 'none' && <Text style={styles.empty}>제시된 후보 중 해당하는 항목이 없다고 선택했어요.</Text>}

        {recommendationAction && <View style={styles.recommendationBlock}><Text style={styles.label}>추천 해결 방법</Text><Text style={styles.recommendationText}>{recommendationAction}</Text></View>}

        <View style={styles.chatSection}>
          <Text style={styles.chatTitle}>AI와 이어서 대화하기</Text>
          <Text style={styles.chatGuide}>현재 상태를 알려주면 이전 분석을 바탕으로 다른 방법을 함께 찾아볼게요.</Text>
          {messages.length === 0 && <Text style={styles.chatEmpty}>아직 나눈 대화가 없어요.</Text>}
          {messages.map((message) => (
            <View key={message.id} style={[styles.messageRow, message.role === 'user' && styles.userMessageRow]}>
              <View style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.bubbleText, message.role === 'user' && styles.userBubbleText]}>{message.content}</Text>
              </View>
            </View>
          ))}
          {sending && <View style={styles.sendingRow}><ActivityIndicator size="small" color={colors.muted} /><Text style={styles.sendingText}>새로운 해결 방법을 찾고 있어요.</Text></View>}
        </View>
      </ScrollView>
      {chatError && <Text style={styles.chatError}>{chatError}</Text>}
      <View style={[styles.composer, { paddingBottom: keyboardGap }]}>
        <TextInput
          ref={inputRef}
          value={draft}
          onChangeText={setDraft}
          onFocus={() => requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }))}
          placeholder="현재 상태나 궁금한 점을 입력해주세요"
          placeholderTextColor="#A2A2A2"
          style={styles.input}
          multiline
          maxLength={2000}
          editable={!sending}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="메시지 보내기"
          onPress={() => void sendMessage()}
          disabled={!draft.trim() || sending}
          style={[styles.sendButton, (!draft.trim() || sending) && styles.sendButtonDisabled]}
        >
          <Ionicons name="arrow-up" size={21} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  </Screen>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, gap: 8 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
  error: { textAlign: 'center', color: '#B42318', fontSize: 13, lineHeight: 20 },
  retry: { width: '100%' },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, marginTop: 20, marginBottom: 8 },
  symptomBlock: { marginTop: 0 },
  symptomText: { fontSize: 15, lineHeight: 22, color: colors.text },
  cards: { gap: 12 },
  candidateCard: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 16 },
  candidateCardSelected: { backgroundColor: colors.warningSoft, borderColor: '#F4D36A' },
  candidateHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  candidateTitle: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  candidateReason: { marginTop: 6, fontSize: 13, lineHeight: 20, color: colors.muted },
  empty: { fontSize: 13, color: colors.muted },
  recommendationBlock: { borderRadius: radius.md, backgroundColor: colors.warningSoft, padding: 18 },
  recommendationText: { fontSize: 14, lineHeight: 22, color: colors.text },
  chatSection: { marginTop: 24, paddingTop: 22, borderTopWidth: 1, borderTopColor: colors.border },
  chatTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  chatGuide: { marginTop: 6, marginBottom: 18, fontSize: 12, lineHeight: 19, color: colors.muted },
  chatEmpty: { paddingVertical: 18, textAlign: 'center', fontSize: 13, color: colors.muted },
  messageRow: { marginBottom: 12, alignItems: 'flex-start' },
  userMessageRow: { alignItems: 'flex-end' },
  bubble: { maxWidth: '82%', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 17 },
  aiBubble: { backgroundColor: colors.surfaceStrong, borderTopLeftRadius: 5 },
  userBubble: { backgroundColor: colors.text, borderTopRightRadius: 5 },
  bubbleText: { fontSize: 14, lineHeight: 21, color: colors.text },
  userBubbleText: { color: colors.white },
  sendingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 },
  sendingText: { fontSize: 12, color: colors.muted },
  chatError: { paddingHorizontal: 24, paddingVertical: 7, fontSize: 12, color: '#B42318', backgroundColor: '#FFF4F2' },
  composer: { minHeight: 72, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: { flex: 1, minHeight: 46, maxHeight: 110, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 16, backgroundColor: colors.surfaceStrong, fontSize: 14, lineHeight: 20, color: colors.text, textAlignVertical: 'top' },
  sendButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { opacity: 0.3 },
});
