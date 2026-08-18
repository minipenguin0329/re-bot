import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/src/components/AppHeader';
import { ChoiceCard } from '@/src/components/ChoiceCard';
import { Screen } from '@/src/components/Screen';
import { getErrorMessage } from '@/src/services/api';
import { useWellness } from '@/src/store/WellnessContext';
import { colors } from '@/src/theme/tokens';

const PAGE_SIZE = 3;
const MAX_CANDIDATES = 8;

const CUSTOM_ID = 'custom';

export default function CandidatesScreen() {
  const { analysis, chooseCandidate } = useWellness();
  const insets = useSafeAreaInsets();
  const { height: viewportHeight } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const customInputRef = useRef<TextInput>(null);
  const currentScrollOffsetRef = useRef(0);
  const restingScrollOffsetRef = useRef(0);
  const customInputFocusedRef = useRef(false);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customCause, setCustomCause] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const available = (analysis?.candidates ?? []).slice(0, MAX_CANDIDATES);
  const items = [...available, { id: CUSTOM_ID, title: '직접 입력', reason: '직접 의심되는 원인이 있다면 입력해주세요.' }];
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(Math.min(event.endCoordinates.height, viewportHeight));
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      customInputRef.current?.blur();
      customInputFocusedRef.current = false;

      // 키보드로 인해 끝까지 이동했던 목록을 입력 전 위치로 복원합니다.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({
            y: restingScrollOffsetRef.current,
            animated: false,
          });
        });
      });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [viewportHeight]);

  const toggleSelected = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNext = async () => {
    if (page < pageCount - 1) return setPage((current) => current + 1);
    const normalizedCustomCause = customCause.trim();
    if (selected.size === 0 && !normalizedCustomCause) return Alert.alert('선택 확인', '가장 가까운 원인 후보를 선택하거나 의심되는 원인을 직접 입력해주세요.');
    setLoading(true);
    try {
      await chooseCandidate(Array.from(selected), normalizedCustomCause || undefined);
      router.push('/diagnosis/result');
    } catch (error) {
      Alert.alert('결과 생성 실패', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const handlePrev = () => setPage((current) => Math.max(0, current - 1));

  const isLastPage = page === pageCount - 1;
  const pageCandidates = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const keyboardOpen = keyboardHeight > 0;
  const keyboardGap = keyboardOpen
    ? Math.max(8, Math.min(14, Math.round(viewportHeight * 0.015)))
    : Math.max(insets.bottom, 10);

  if (!analysis) return <Screen><View style={styles.missing}><Text style={styles.copy}>완료된 분석 정보가 없습니다.</Text><Pressable onPress={() => router.replace('/(tabs)/diagnosis')}><Text style={styles.navText}>다시 입력하기</Text></Pressable></View></Screen>;

  return <Screen bottomSafe={false}>
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : keyboardOpen ? 'height' : undefined}
      enabled={Platform.OS === 'ios' || keyboardOpen}
      keyboardVerticalOffset={0}
    >
      <AppHeader title="AI 자가진단" back />
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: keyboardGap }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(event) => {
          const nextOffset = event.nativeEvent.contentOffset.y;
          currentScrollOffsetRef.current = nextOffset;
          if (!customInputFocusedRef.current) {
            restingScrollOffsetRef.current = nextOffset;
          }
        }}
        onContentSizeChange={() => {
          if (keyboardOpen) scrollRef.current?.scrollToEnd({ animated: true });
        }}
      >
      <View style={styles.body}>
      <Text style={styles.title}>예상되는 원인</Text>
      <Text style={styles.copy}>해당되는 항목을 모두 선택해주세요</Text>
      <View style={styles.cards}>{pageCandidates.map((candidate, indexInPage) => {
      const index = page * PAGE_SIZE + indexInPage;
      if (candidate.id === CUSTOM_ID) {
        return <View key={candidate.id} style={styles.customCard}>
          <Text style={styles.customNumber}>{index + 1}</Text>
          <Text style={styles.customTitle}>의심되는 다른 원인이 있나요?</Text>
          <Text style={styles.customDescription}>AI가 제시하지 않은 원인을 직접 작성할 수 있어요.</Text>
          <TextInput
            ref={customInputRef}
            value={customCause}
            onChangeText={setCustomCause}
            placeholder="예) 최근 야근, 장시간 마스크 착용"
            placeholderTextColor={colors.muted}
            maxLength={500}
            multiline
            style={styles.customInput}
            onFocus={() => {
              restingScrollOffsetRef.current = currentScrollOffsetRef.current;
              customInputFocusedRef.current = true;
              requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
            }}
          />
        </View>;
      }
      return <ChoiceCard key={candidate.id} number={index + 1} title={candidate.title} description={candidate.reason} selected={selected.has(candidate.id)} onPress={() => toggleSelected(candidate.id)} />;
    })}</View>
    {!keyboardOpen && <View style={styles.footer}>
      <View style={[styles.nav, page === 0 && styles.navEnd]}>
        {page > 0 && <Pressable style={styles.navButton} onPress={handlePrev}><Ionicons name="chevron-back" size={18} color={colors.text} /><Text style={styles.navText}>이전</Text></Pressable>}
        <Pressable disabled={loading} style={[styles.navButton, loading && styles.disabled]} onPress={() => void handleNext()}>
          {loading ? (
            <>
              <ActivityIndicator size="small" color={colors.text} />
              <Text style={styles.navText}>분석 중</Text>
            </>
          ) : (
            <>
              <Text style={styles.navText}>{isLastPage ? 'AI 분석하기' : '다음'}</Text>
              <Ionicons name={isLastPage ? 'sparkles' : 'chevron-forward'} size={18} color={colors.text} />
            </>
          )}
        </Pressable>
      </View>
      <Text style={styles.page}>{page + 1}/{pageCount}</Text>
    </View>}
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
  </Screen>;
}

const styles = StyleSheet.create({ flex: { flex: 1 }, scrollContent: { flexGrow: 1 }, body: { flex: 1, paddingHorizontal: 24, paddingTop: 4 }, title: { fontSize: 20, fontWeight: '800', marginTop: 4 }, copy: { fontSize: 14, color: colors.muted, marginTop: 8 }, cards: { marginTop: 32, gap: 24 }, customCard: { minHeight: 190, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 20 }, customNumber: { fontSize: 13, fontWeight: '800', color: colors.muted }, customTitle: { marginTop: 8, fontSize: 17, fontWeight: '700', color: colors.text }, customDescription: { marginTop: 8, fontSize: 13, lineHeight: 20, color: colors.muted }, customInput: { marginTop: 16, minHeight: 64, borderRadius: 14, backgroundColor: colors.background, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, lineHeight: 20, color: colors.text, textAlignVertical: 'top' }, footer: { marginTop: 'auto', alignItems: 'center', gap: 4 }, nav: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' }, navEnd: { justifyContent: 'flex-end' }, navButton: { flexDirection: 'row', alignItems: 'center', gap: 6 }, navText: { fontSize: 16, fontWeight: '700', color: colors.text }, page: { fontSize: 13, color: colors.muted }, disabled: { opacity: 0.5 }, missing: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20, paddingHorizontal: 24 } });
