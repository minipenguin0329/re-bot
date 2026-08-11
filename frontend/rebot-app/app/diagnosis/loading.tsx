import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { Screen } from '@/src/components/Screen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { getErrorMessage } from '@/src/services/api';
import { useWellness } from '@/src/store/WellnessContext';
import { colors } from '@/src/theme/tokens';

const SHAPE_SIZE = 108;

// Figma SVG paths normalized into a shared 100 x 100 circular coordinate system.
const FRONT_LOW = [4.7143, 101.1423, 3, 79.4916, 3, 79.4916, 18, 68.6424, 33, 70.1423, 48, 71.6423, 48.3399, 72.8494, 65.5, 79.4916, 82.66, 86.1337, 99, 70.1423, 99, 70.1423, 99.1741, 4.7143, 101.1423];
const FRONT_MID = [4.7143, 101.142, 3, 59.429, 3, 59.429, 18, 38.527, 33, 41.417, 48, 44.307, 48.3399, 46.632, 65.5, 59.429, 82.66, 72.226, 99, 41.417, 99, 41.417, 97.35, 4.7143, 101.142];
const FRONT_FULL = [-2.2679, 101, -5, 23.831, -5, 23.831, 18.9062, -14.839, 42.8125, -9.493, 66.7188, -4.146, 67.2605, 0.156, 94.609, 23.831, 121.958, 47.505, 148, -9.493, 148, -9.493, 93.985, -2.2679, 101];

const BACK_LOW = [14.0714, 118.1423, 12, 96.5905, 12, 96.5905, 30.125, 85.7909, 48.25, 87.284, 66.375, 88.7772, 66.7858, 89.9787, 87.521, 96.5905, 108.256, 103.2023, 128, 87.284, 128, 87.284, 116.1831, 14.0714, 118.1423];
const BACK_MID = [14.0714, 118.142, 12, 80.6, 12, 80.6, 30.125, 61.788, 48.25, 64.389, 66.375, 66.99, 66.7858, 69.083, 87.521, 80.6, 108.256, 92.118, 128, 64.389, 128, 64.389, 114.729, 14.0714, 118.142];
const BACK_FULL = [-86.1071, 118, -90, -5.749, -90, -5.749, -55.9375, -67.76, -21.875, -59.186, 12.1875, -50.613, 12.9594, -43.714, 51.9271, -5.749, 90.895, 32.215, 128, -59.186, 128, -59.186, 106.75, -86.1071, 118];

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

function buildPath(values: number[]) {
  'worklet';
  return `M${values[0]} ${values[1]}L${values[2]} ${values[3]}C${values[4]} ${values[5]} ${values[6]} ${values[7]} ${values[8]} ${values[9]}C${values[10]} ${values[11]} ${values[12]} ${values[13]} ${values[14]} ${values[15]}C${values[16]} ${values[17]} ${values[18]} ${values[19]} ${values[20]} ${values[21]}V${values[22]}L${values[23]} ${values[24]}Z`;
}

function morphPath(low: number[], mid: number[], full: number[], progress: number) {
  'worklet';
  const from = progress <= 0.5 ? low : mid;
  const to = progress <= 0.5 ? mid : full;
  const localProgress = progress <= 0.5 ? progress * 2 : (progress - 0.5) * 2;
  const values = new Array(low.length);
  for (let index = 0; index < low.length; index += 1) {
    values[index] = from[index] + (to[index] - from[index]) * localProgress;
  }
  return buildPath(values);
}

function morphValue(low: number, mid: number, full: number, progress: number) {
  'worklet';
  if (progress <= 0.5) return low + (mid - low) * progress * 2;
  return mid + (full - mid) * (progress - 0.5) * 2;
}

export default function LoadingScreen() {
  const { diagnosisDraft, runPreparedDiagnosis } = useWellness();
  const progress = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    setError(null);
    try {
      await Promise.all([
        runPreparedDiagnosis(),
        new Promise((resolve) => setTimeout(resolve, 3230)),
      ]);
      router.replace('/diagnosis/candidates');
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  }, [runPreparedDiagnosis]);

  useEffect(() => {
    if (!reduceMotion) {
      progress.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 600, easing: Easing.inOut(Easing.cubic) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.cubic) }),
          withTiming(0, { duration: 700, easing: Easing.inOut(Easing.cubic) }),
        ),
        -1,
        false,
      );
    } else {
      progress.value = 0;
    }

    return () => {
      cancelAnimation(progress);
    };
  }, [progress, reduceMotion]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!diagnosisDraft) {
      setError('분석할 증상 정보가 없습니다.');
      return;
    }
    void runAnalysis();
  }, [diagnosisDraft, runAnalysis]);

  const frontProps = useAnimatedProps(() => ({
    d: morphPath(FRONT_LOW, FRONT_MID, FRONT_FULL, progress.value),
  }));
  const backProps = useAnimatedProps(() => ({
    d: morphPath(BACK_LOW, BACK_MID, BACK_FULL, progress.value),
  }));
  const frontGradientProps = useAnimatedProps(() => ({
    x1: morphValue(51, 51, 71.5, progress.value),
    x2: morphValue(51, 51, 71.5, progress.value),
    y1: morphValue(70.1251, 41.383, -9.554, progress.value),
    y2: morphValue(101.1423, 101.142, 101, progress.value),
  }));
  const backGradientProps = useAnimatedProps(() => ({
    x1: morphValue(70, 70, 19, progress.value),
    x2: morphValue(70, 70, 19, progress.value),
    y1: morphValue(87.2668, 64.359, -59.285, progress.value),
    y2: morphValue(118.1423, 118.142, 118, progress.value),
  }));

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.message}>
        <Text style={styles.title}>분석 중입니다.</Text>
        <Text style={styles.copy}>잠시만 기다려주세요</Text>
      </View>

      <View style={styles.loaderArea}>
        <Svg width={SHAPE_SIZE} height={SHAPE_SIZE} viewBox="0 0 100 100">
          <Defs>
            <ClipPath id="liquidCircle">
              <Circle cx="50" cy="50" r="50" />
            </ClipPath>
            <AnimatedLinearGradient id="frontGradient" animatedProps={frontGradientProps} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#FFF4CC" />
              <Stop offset="1" stopColor="#FDE68A" />
            </AnimatedLinearGradient>
            <AnimatedLinearGradient id="backGradient" animatedProps={backGradientProps} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#E6D180" />
              <Stop offset="1" stopColor="#FDE68A" />
            </AnimatedLinearGradient>
          </Defs>
          <G clipPath="url(#liquidCircle)">
            <AnimatedPath animatedProps={frontProps} fill="url(#frontGradient)" />
            <AnimatedPath animatedProps={backProps} fill="url(#backGradient)" opacity={0.7} />
          </G>
        </Svg>
      </View>
      {error && <View style={styles.errorArea}>
        <Text style={styles.errorText}>{error}</Text>
        <PrimaryButton label="다시 시도" onPress={() => void runAnalysis()} style={styles.retryButton} />
        <PrimaryButton label="입력 화면으로" variant="outline" onPress={() => router.replace('/(tabs)/diagnosis')} style={styles.retryButton} />
      </View>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: 'center' },
  message: { position: 'absolute', top: '31%', alignItems: 'center' },
  title: { fontSize: 16, lineHeight: 24, fontWeight: '700', color: colors.text },
  copy: { marginTop: 7, fontSize: 11, lineHeight: 17, color: '#A5A5A5' },
  loaderArea: { position: 'absolute', top: '45%', width: SHAPE_SIZE, height: SHAPE_SIZE },
  errorArea: { position: 'absolute', left: 24, right: 24, bottom: 36, gap: 10 },
  errorText: { textAlign: 'center', color: colors.muted, fontSize: 13, lineHeight: 20 },
  retryButton: { height: 52 },
});
