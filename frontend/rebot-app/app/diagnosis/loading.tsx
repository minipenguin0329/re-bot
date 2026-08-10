import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { getErrorMessage } from '@/src/services/api';
import { useWellness } from '@/src/store/WellnessContext';
import { colors } from '@/src/theme/tokens';

const SIZE = 104;
const WAVE_W = SIZE * 2.2;
const WAVE_H = 42;

export default function LoadingScreen() {
  const { diagnosisDraft, runPreparedDiagnosis } = useWellness();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);
  const rise = useSharedValue(0);
  const drift = useSharedValue(0);

  useEffect(() => {
    rise.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.cubic) }), -1, true);
    drift.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [drift, rise]);

  const startAnalysis = async () => {
    if (started.current) return;
    if (!diagnosisDraft) {
      setError('분석할 증상 정보가 없습니다. 이전 화면에서 다시 입력해주세요.');
      return;
    }
    started.current = true;
    setError(null);
    try {
      await runPreparedDiagnosis();
      router.replace('/diagnosis/candidates');
    } catch (caught) {
      setError(getErrorMessage(caught));
      started.current = false;
    }
  };

  useEffect(() => {
    void startAnalysis();
    // Run once per mounted analysis screen. startAnalysis is guarded for strict mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liquidStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(rise.value, [0, 1], [SIZE * 0.75, 0]) }],
  }));
  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(drift.value, [0, 1], [-30, 30]) }],
  }));

  return <Screen contentStyle={styles.screen}>
    <Text style={styles.title}>{error ? '분석을 완료하지 못했어요' : '분석 중입니다.'}</Text>
    <Text style={[styles.copy, error && styles.error]}>{error ?? '생활 기록과 입력한 증상을 함께 살펴보고 있어요'}</Text>
    {!error && <View style={styles.vessel}><Animated.View style={[styles.liquid, liquidStyle]}><Animated.View style={[styles.wave, waveStyle]} /><View style={styles.body} /></Animated.View></View>}
    {error && <View style={styles.actions}><PrimaryButton label="다시 시도" onPress={() => void startAnalysis()} /><PrimaryButton label="입력 화면으로" variant="outline" onPress={() => router.back()} /></View>}
  </Screen>;
}

const styles = StyleSheet.create({ screen: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }, title: { fontSize: 24, fontWeight: '800' }, copy: { fontSize: 15, color: colors.muted, marginTop: 18, textAlign: 'center', lineHeight: 22 }, error: { color: '#B42318' }, vessel: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, marginTop: 90, backgroundColor: colors.surfaceStrong, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }, liquid: { position: 'absolute', left: 0, right: 0, bottom: 0, height: SIZE }, body: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, backgroundColor: colors.accent }, wave: { position: 'absolute', left: (SIZE - WAVE_W) / 2, top: -WAVE_H * 0.35, width: WAVE_W, height: WAVE_H, borderRadius: WAVE_H / 2, backgroundColor: colors.accentSoft }, actions: { width: '100%', gap: 12, marginTop: 48 } });
