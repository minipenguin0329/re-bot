import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Screen } from '@/src/components/Screen';
import { colors } from '@/src/theme/tokens';

// A circular vessel frames the target shape. A solid deep-yellow disc rises
// from the bottom to fill it — since the vessel itself is a circle, the
// filled portion always reads as a circle "arriving" from below and ends up
// exactly matching the frame. A paler wave shape sits just behind the fill's
// leading edge and drifts side to side for texture, without needing rotation.
const SIZE = 104;
const WAVE_W = SIZE * 2.2;
const WAVE_H = 42;

export default function LoadingScreen() {
  const rise = useSharedValue(0);
  const drift = useSharedValue(0);
  const bob = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.sin) }), -1, true);
    bob.value = withRepeat(withTiming(1, { duration: 850, easing: Easing.inOut(Easing.sin) }), -1, true);
    rise.value = withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(router.replace)('/diagnosis/candidates');
    });
  }, [rise, drift, bob]);

  const liquidStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(rise.value, [0, 1], [SIZE, 0]) }],
  }));
  // Out-of-phase X drift, Y bob and a slight tilt read as a sloshing wobble
  // rather than a flat left-right slide.
  const waveStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [-30, 30]) },
      { translateY: interpolate(bob.value, [0, 1], [-10, 10]) },
      { rotate: `${interpolate(drift.value, [0, 1], [-14, 14])}deg` },
    ],
  }));

  return <Screen contentStyle={styles.screen}>
    <Text style={styles.title}>분석 중입니다.</Text>
    <Text style={styles.copy}>잠시만 기다려주세요</Text>
    <View style={styles.vessel}>
      <Animated.View style={[styles.liquid, liquidStyle]}>
        <Animated.View style={[styles.wave, waveStyle]} />
        <View style={styles.body} />
      </Animated.View>
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  screen: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800' },
  copy: { fontSize: 15, color: colors.muted, marginTop: 18 },
  vessel: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, marginTop: 90, backgroundColor: colors.surfaceStrong, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  liquid: { position: 'absolute', left: 0, right: 0, bottom: 0, height: SIZE },
  body: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, backgroundColor: colors.accent },
  wave: { position: 'absolute', left: (SIZE - WAVE_W) / 2, top: -WAVE_H * 0.35, width: WAVE_W, height: WAVE_H, borderRadius: WAVE_H / 2, backgroundColor: colors.accentSoft },
});
