import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Screen } from '@/src/components/Screen';
import { colors } from '@/src/theme/tokens';

const SHAPE_SIZE = 64;
const MORPH_DURATION = 1450;

export default function LoadingScreen() {
  const morph = useSharedValue(0);
  const navigation = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!reduceMotion) {
      morph.value = withRepeat(
        withTiming(1, {
          duration: MORPH_DURATION,
          easing: Easing.inOut(Easing.cubic),
        }),
        -1,
        true,
      );
    }

    navigation.value = withTiming(1, { duration: 2400 }, (finished) => {
      if (finished) runOnJS(router.replace)('/diagnosis/candidates');
    });
  }, [morph, navigation, reduceMotion]);

  const morphStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: interpolate(morph.value, [0, 1], [0.92, 1]) },
      { scaleY: interpolate(morph.value, [0, 1], [0.26, 1]) },
      { rotate: `${interpolate(morph.value, [0, 1], [-5, 0])}deg` },
    ],
  }));

  const cutoutStyle = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 0.72, 1], [1, 0.9, 0]),
    transform: [
      { translateX: interpolate(morph.value, [0, 1], [4, 18]) },
      { translateY: interpolate(morph.value, [0, 1], [4, -14]) },
      { scale: interpolate(morph.value, [0, 1], [1, 0.72]) },
    ],
  }));

  const highlightStyle = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 0.65, 1], [0.9, 0.55, 0.25]),
    transform: [
      { translateY: interpolate(morph.value, [0, 1], [7, -3]) },
      { scaleX: interpolate(morph.value, [0, 1], [1.15, 0.92]) },
    ],
  }));

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.message}>
        <Text style={styles.title}>분석 중입니다.</Text>
        <Text style={styles.copy}>잠시만 기다려주세요</Text>
      </View>

      <View style={styles.loaderArea}>
        <Animated.View style={[styles.morphShape, morphStyle]}>
          <Animated.View style={[styles.highlight, highlightStyle]} />
          <Animated.View style={[styles.cutout, cutoutStyle]} />
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
  },
  message: {
    position: 'absolute',
    top: '31%',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.text,
  },
  copy: {
    marginTop: 7,
    fontSize: 11,
    lineHeight: 17,
    color: '#A5A5A5',
  },
  loaderArea: {
    position: 'absolute',
    top: '51%',
    width: SHAPE_SIZE + 20,
    height: SHAPE_SIZE + 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  morphShape: {
    width: SHAPE_SIZE,
    height: SHAPE_SIZE,
    borderRadius: SHAPE_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#F9DC70',
  },
  highlight: {
    position: 'absolute',
    left: -8,
    top: 7,
    width: SHAPE_SIZE + 12,
    height: SHAPE_SIZE * 0.48,
    borderRadius: SHAPE_SIZE / 2,
    backgroundColor: '#FFF0AD',
  },
  cutout: {
    position: 'absolute',
    right: -22,
    top: -34,
    width: SHAPE_SIZE * 0.92,
    height: SHAPE_SIZE * 0.92,
    borderRadius: SHAPE_SIZE / 2,
    backgroundColor: colors.white,
  },
});
