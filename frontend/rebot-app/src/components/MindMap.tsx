import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedProps, useAnimatedStyle, useSharedValue, withSpring, ZoomIn, ZoomOut } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { DUMMY_MIND_MAP_CAUSES, MindMapCause, MindMapSymptom } from '@/src/data/mindmap';
import { colors, radius } from '@/src/theme/tokens';

const AnimatedLine = Animated.createAnimatedComponent(Line);

const SIZE = 300;
const CENTER = SIZE / 2;
const NODE_RADIUS = 108;
const NODE_SIZE = 68;
const CENTER_SIZE = 72;
const MAX_ROTATE = 0.3;
const MIN_ANGLE_GAP = 2 * Math.asin(Math.min(1, NODE_SIZE / (2 * NODE_RADIUS)));

function causeSeverityColors(symptomCount: number): { background: string; border: string } {
  if (symptomCount <= 1) return { background: '#FFF3B0', border: '#F0C808' };
  if (symptomCount <= 3) return { background: '#FFDCAE', border: '#F2994A' };
  return { background: '#FFC9C2', border: '#EB5757' };
}

type BranchNode = { id: string; label: string };

type NodeColor<T> = string | ((node: T) => string);

type BranchProps<T extends BranchNode> = {
  node: T;
  baseAngle: number;
  maxRotate: number;
  index: number;
  color: string;
  borderColor: string;
  onPress?: (node: T) => void;
};

function Branch<T extends BranchNode>({ node, baseAngle, maxRotate, index, color, borderColor, onPress }: BranchProps<T>) {
  const dragAngle = useSharedValue(0);

  const springBack = () => {
    dragAngle.value = withSpring(0, { damping: 7, stiffness: 180, mass: 0.5 });
  };

  const pan = Gesture.Pan()
    .minDistance(4)
    .onChange((event) => {
      const tangentialDelta = event.changeX * -Math.sin(baseAngle) + event.changeY * Math.cos(baseAngle);
      const next = dragAngle.value + tangentialDelta / NODE_RADIUS;
      dragAngle.value = Math.max(-maxRotate, Math.min(maxRotate, next));
    })
    .onFinalize(() => runOnJS(springBack)());

  const gesture = onPress
    ? Gesture.Race(Gesture.Tap().onEnd(() => runOnJS(onPress)(node)), pan)
    : pan;

  const nodeAnimatedStyle = useAnimatedStyle(() => {
    const angle = baseAngle + dragAngle.value;
    return {
      transform: [
        { translateX: NODE_RADIUS * Math.cos(angle) - NODE_RADIUS * Math.cos(baseAngle) },
        { translateY: NODE_RADIUS * Math.sin(angle) - NODE_RADIUS * Math.sin(baseAngle) },
      ],
    };
  });

  const lineAnimatedProps = useAnimatedProps(() => {
    const angle = baseAngle + dragAngle.value;
    return { x2: CENTER + NODE_RADIUS * Math.cos(angle), y2: CENTER + NODE_RADIUS * Math.sin(angle) };
  });

  const anchorX = CENTER + NODE_RADIUS * Math.cos(baseAngle);
  const anchorY = CENTER + NODE_RADIUS * Math.sin(baseAngle);

  return (
    <>
      <Svg style={StyleSheet.absoluteFill} width={SIZE} height={SIZE} pointerEvents="none">
        <AnimatedLine x1={CENTER} y1={CENTER} animatedProps={lineAnimatedProps} stroke={colors.border} strokeWidth={2} />
      </Svg>
      <GestureDetector gesture={gesture}>
        <Animated.View
          entering={ZoomIn.delay(index * 40).duration(220)}
          exiting={ZoomOut.duration(150)}
          style={[
            styles.nodeAnchor,
            { left: anchorX - NODE_SIZE / 2, top: anchorY - NODE_SIZE / 2 },
          ]}
        >
          <Animated.View
            style={[
              styles.node,
              { backgroundColor: color, borderColor },
              nodeAnimatedStyle,
            ]}
          >
            <Text style={styles.nodeText} numberOfLines={2}>{node.label}</Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

type CircularBranchesProps<T extends BranchNode> = {
  nodes: T[];
  onNodePress?: (node: T) => void;
  centerContent: ReactNode;
  centerColor: string;
  centerBorderColor: string;
  nodeColor: NodeColor<T>;
  nodeBorderColor: NodeColor<T>;
};

function resolveNodeColor<T>(color: NodeColor<T>, node: T): string {
  return typeof color === 'function' ? color(node) : color;
}

function CircularBranches<T extends BranchNode>({
  nodes, onNodePress, centerContent, centerColor, centerBorderColor, nodeColor, nodeBorderColor,
}: CircularBranchesProps<T>) {
  const angularStep = (2 * Math.PI) / nodes.length;
  const maxRotate = nodes.length > 1 ? Math.max(0, Math.min(MAX_ROTATE, (angularStep - MIN_ANGLE_GAP) / 2)) : MAX_ROTATE;
  const branches = nodes.map((node, index) => ({ node, baseAngle: angularStep * index - Math.PI / 2 }));

  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <View
        style={[
          styles.centerSlot,
          {
            left: CENTER - CENTER_SIZE / 2,
            top: CENTER - CENTER_SIZE / 2,
            width: CENTER_SIZE,
            height: CENTER_SIZE,
            borderRadius: CENTER_SIZE / 2,
            backgroundColor: centerColor,
            borderColor: centerBorderColor,
          },
        ]}
      >
        {centerContent}
      </View>
      {branches.map(({ node, baseAngle }, index) => (
        <Branch
          key={node.id}
          node={node}
          baseAngle={baseAngle}
          maxRotate={maxRotate}
          index={index}
          color={resolveNodeColor(nodeColor, node)}
          borderColor={resolveNodeColor(nodeBorderColor, node)}
          onPress={onNodePress}
        />
      ))}
    </View>
  );
}

type Props = { photoUri?: string | null; causes?: MindMapCause[] };

export function MindMap({ photoUri = null, causes = DUMMY_MIND_MAP_CAUSES }: Props) {
  const [selectedCause, setSelectedCause] = useState<MindMapCause | null>(null);

  const goBackToCauses = () => setSelectedCause(null);

  const handleCausePress = (node: BranchNode) => {
    setSelectedCause(causes.find((current) => current.id === node.id) ?? null);
  };

  return (
    <View style={styles.wrap}>
      <CircularBranches
        nodes={selectedCause ? selectedCause.symptoms : causes}
        onNodePress={selectedCause ? undefined : handleCausePress}
        nodeColor={selectedCause ? colors.surface : (item: MindMapCause | MindMapSymptom) => causeSeverityColors('symptoms' in item ? item.symptoms.length : 0).background}
        nodeBorderColor={selectedCause ? colors.border : (item: MindMapCause | MindMapSymptom) => causeSeverityColors('symptoms' in item ? item.symptoms.length : 0).border}
        centerColor={selectedCause ? colors.accent : colors.surfaceStrong}
        centerBorderColor={selectedCause ? colors.accent : colors.white}
        centerContent={
          <Pressable style={styles.centerPressable} onPress={goBackToCauses} disabled={!selectedCause}>
            <Animated.View
              key={selectedCause ? selectedCause.id : 'root'}
              entering={ZoomIn.duration(220)}
              exiting={ZoomOut.duration(160)}
              style={styles.centerPressable}
            >
              {selectedCause ? (
                <Text style={styles.causeBubbleText} numberOfLines={2}>{selectedCause.label}</Text>
              ) : photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={32} color="#9A9A9F" />
              )}
            </Animated.View>
          </Pressable>
        }
      />
      {selectedCause && (
        <View style={styles.detailSection}>
          {selectedCause.symptoms.flatMap((symptom) =>
            symptom.details.map((detail, index) => (
              <View key={`${symptom.id}-${index}`} style={styles.detailItem}>
                <Text style={styles.detailTitle}>{detail.title}</Text>
                <Text style={styles.detailReason}>{detail.reason}</Text>
              </View>
            )),
          )}
        </View>
      )}
      {selectedCause && (
        <Pressable hitSlop={8} style={styles.backHint} onPress={goBackToCauses}>
          <Ionicons name="arrow-back" size={13} color={colors.muted} />
          <Text style={styles.backHintText}>원인 목록으로</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  centerSlot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    zIndex: 2,
  },
  centerPressable: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: CENTER_SIZE, height: CENTER_SIZE },
  causeBubbleText: { fontSize: 12, fontWeight: '800', color: colors.text, textAlign: 'center', paddingHorizontal: 4 },
  nodeAnchor: {
    position: 'absolute',
    width: NODE_SIZE,
    height: NODE_SIZE,
    zIndex: 1,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  nodeText: { fontSize: 12, fontWeight: '700', color: colors.text, textAlign: 'center' },
  detailSection: {
    marginTop: 20,
    width: '100%',
    maxWidth: 320,
    gap: 10,
  },
  detailItem: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 4,
  },
  detailTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  detailReason: { fontSize: 13, lineHeight: 20, color: colors.muted },
  backHint: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 4 },
  backHintText: { fontSize: 12, color: colors.muted },
});
