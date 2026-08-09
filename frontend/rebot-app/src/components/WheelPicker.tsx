import { useCallback, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/src/theme/tokens';

type Item = string | number;

type Props = {
  items: readonly Item[];
  initialIndex?: number;
  onChange?: (index: number, value: Item) => void;
  itemHeight?: number;
  pillWidth?: number;
};

export function WheelPicker({ items, initialIndex = 0, onChange, itemHeight = 65, pillWidth = 150 }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const lastIndex = useRef(initialIndex);
  const viewportHeight = itemHeight * 3;

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const raw = event.nativeEvent.contentOffset.y / itemHeight;
    const nextIndex = Math.min(items.length - 1, Math.max(0, Math.round(raw)));
    if (nextIndex !== lastIndex.current) {
      lastIndex.current = nextIndex;
      setIndex(nextIndex);
      onChange?.(nextIndex, items[nextIndex]);
    }
  }, [items, itemHeight, onChange]);

  return <View style={[styles.wheel, { height: viewportHeight }]}>
    <View pointerEvents="none" style={[styles.pill, { top: itemHeight + 5, height: itemHeight - 10, width: pillWidth }]} />
    <ScrollView
      style={{ height: viewportHeight, width: '100%' }}
      showsVerticalScrollIndicator={false}
      snapToInterval={itemHeight}
      decelerationRate="fast"
      scrollEventThrottle={16}
      onScroll={handleScroll}
      onMomentumScrollEnd={handleScroll}
      contentOffset={{ x: 0, y: initialIndex * itemHeight }}
      contentContainerStyle={{ paddingVertical: itemHeight }}
    >
      {items.map((item, itemIndex) => <View key={`${item}-${itemIndex}`} style={{ height: itemHeight, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={itemIndex === index ? styles.selected : styles.faded}>{item}</Text>
      </View>)}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  wheel: { width: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pill: { position: 'absolute', alignSelf: 'center', borderRadius: radius.md, backgroundColor: colors.warningSoft },
  selected: { fontSize: 21, color: '#88888E', fontWeight: '600' },
  faded: { fontSize: 20, color: '#D4D4D7' },
});
