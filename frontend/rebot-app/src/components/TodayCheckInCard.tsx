import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { backendApi, getErrorMessage } from '@/src/services/api';
import { colors, radius } from '@/src/theme/tokens';
import type { DailyLogResponse } from '@/src/types/api';

// toISOString()은 항상 UTC 기준이라, 한국 시간 자정~오전 9시 사이에는 실제 로컬 날짜보다
// 하루 이전 날짜를 돌려줍니다. 이 시간대에 저장하면 다음에 불러올 때 "오늘 기록"을 못 찾고
// 새 기록으로 착각해서 날짜가 밀린 것처럼 보이는 버그가 있었어요 — 그래서 기기의 로컬 날짜를
// 직접 조합해서 씁니다.
function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function clampToStep(raw: number, min: number, max: number, step: number) {
  const stepped = Math.round(raw / step) * step;
  return Math.min(max, Math.max(min, Number(stepped.toFixed(2))));
}

type BarSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  showMaxSuffix?: boolean;
  disabled?: boolean;
};

const THUMB_SIZE = 20;

// 게이지처럼 옆으로 밀어서 값을 조절하는 슬라이더입니다. 트랙 어디를 눌러도, 드래그해도
// 그 위치에 맞는 값으로 바로 반영돼 칩을 여러 줄 늘어놓는 것보다 한 줄로 훨씬 짧게 들어가요.
// disabled일 때는 제스처 자체를 꺼서, 이미 저장된 값을 실수로 건드려 바로 수정해버리는 걸 막습니다.
function BarSlider({ label, value, min, max, step, unit, onChange, showMaxSuffix = true, disabled = false }: BarSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const ratio = trackWidth > 0 ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 0;

  const commitFromX = (x: number) => {
    if (trackWidth <= 0) return;
    const clampedX = Math.min(trackWidth, Math.max(0, x));
    const raw = min + (clampedX / trackWidth) * (max - min);
    onChange(clampToStep(raw, min, max, step));
  };

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onBegin((event) => commitFromX(event.x))
    .onUpdate((event) => commitFromX(event.x))
    .runOnJS(true);

  const displayValue = showMaxSuffix && value >= max ? `${value}${unit} 이상` : `${value}${unit}`;

  return (
    <View style={[styles.sliderField, disabled && styles.sliderFieldDisabled]}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{displayValue}</Text>
      </View>
      <GestureDetector gesture={pan}>
        <View style={styles.sliderTouchArea} onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}>
          <View style={styles.sliderTrackBg} />
          <View style={[styles.sliderTrackFill, { width: `${ratio * 100}%` }]} />
          <View style={[styles.sliderThumb, { left: `${ratio * 100}%`, marginLeft: -THUMB_SIZE / 2 }]} />
        </View>
      </GestureDetector>
    </View>
  );
}

export function TodayCheckInCard() {
  const [existingLog, setExistingLog] = useState<DailyLogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sleepHours, setSleepHours] = useState(7);
  const [caffeineCount, setCaffeineCount] = useState(0);
  const [breakfast, setBreakfast] = useState(false);
  const [lunch, setLunch] = useState(false);
  const [dinner, setDinner] = useState(false);
  const [saved, setSaved] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  // 오늘 이미 기록이 있으면 슬라이드를 잠가서, "수정하기"를 눌러야만 값을 바꿀 수 있게 합니다.
  const [editing, setEditing] = useState(true);
  const justSavedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (justSavedTimer.current) clearTimeout(justSavedTimer.current);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const logs = await backendApi.listDailyLogs(1);
      const today = logs.find((log) => log.date === todayIso()) ?? null;
      setExistingLog(today);
      setSleepHours(today?.sleep_hours ?? 7);
      setCaffeineCount(today?.caffeine_count ?? 0);
      setBreakfast(today?.breakfast ?? false);
      setLunch(today?.lunch ?? false);
      setDinner(today?.dinner ?? false);
      setSaved(Boolean(today));
      setEditing(!today);
    } catch {
      // 오늘 기록 조회 실패는 조용히 무시하고 새로 기록할 수 있게 둡니다.
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const markDirty = () => {
    setSaved(false);
    setJustSaved(false);
    if (justSavedTimer.current) clearTimeout(justSavedTimer.current);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      date: todayIso(),
      sleep_hours: sleepHours,
      caffeine_count: caffeineCount,
      breakfast,
      lunch,
      dinner,
    };
    try {
      const result = existingLog
        ? await backendApi.updateDailyLog(existingLog.id, payload)
        : await backendApi.createDailyLog(payload);
      setExistingLog(result);
      setSaved(true);
      setEditing(false);
      setJustSaved(true);
      if (justSavedTimer.current) clearTimeout(justSavedTimer.current);
      justSavedTimer.current = setTimeout(() => setJustSaved(false), 1800);
    } catch (error) {
      Alert.alert('저장 실패', getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleButtonPress = () => {
    if (!editing) {
      setEditing(true);
      return;
    }
    void handleSave();
  };

  if (loading) {
    return <View style={[styles.card, styles.loadingCard]}><ActivityIndicator color={colors.text} /></View>;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>오늘의 컨디션</Text>
        {saved && (
          <View style={styles.savedBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#8A6B00" />
            <Text style={styles.savedText}>기록됨</Text>
          </View>
        )}
      </View>
      <Text style={styles.hint}>
        지금 가볍게 기록해두시면, 다음 자가진단에서 더 정확한 진단을 받으실 수 있도록 도와드려요.
      </Text>

      <BarSlider label="수면 시간" value={sleepHours} min={0} max={12} step={0.5} unit="시간" disabled={!editing} onChange={(v) => { setSleepHours(v); markDirty(); }} />
      <BarSlider label="카페인" value={caffeineCount} min={0} max={5} step={1} unit="잔" disabled={!editing} onChange={(v) => { setCaffeineCount(v); markDirty(); }} />

      <View style={styles.mealsField}>
        <Text style={styles.sliderLabel}>오늘 챙겨 드신 끼니</Text>
        <View style={styles.mealChipsRow}>
          {([
            { key: 'breakfast', label: '아침', value: breakfast, onToggle: () => setBreakfast((current) => !current) },
            { key: 'lunch', label: '점심', value: lunch, onToggle: () => setLunch((current) => !current) },
            { key: 'dinner', label: '저녁', value: dinner, onToggle: () => setDinner((current) => !current) },
          ] as const).map((meal) => (
            <Pressable
              key={meal.key}
              disabled={!editing}
              style={[styles.mealChip, meal.value && styles.mealChipActive, !editing && styles.mealChipDisabled]}
              onPress={() => { meal.onToggle(); markDirty(); }}
            >
              <Text style={[styles.mealChipText, meal.value && styles.mealChipTextActive]}>{meal.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.footerRow}>
        <Pressable
          style={[styles.saveButton, justSaved && styles.saveButtonSuccess, saving && styles.saveButtonDisabled]}
          onPress={handleButtonPress}
          disabled={saving}
        >
          {justSaved ? (
            <View style={styles.saveButtonSuccessRow}>
              <Ionicons name="checkmark" size={15} color={colors.white} />
              <Text style={styles.saveButtonText}>기록 완료</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>{saving ? '저장 중' : !editing ? '수정하기' : existingLog ? '저장하기' : '기록하기'}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 18,
  },
  loadingCard: {
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: {
    marginTop: 3,
    marginBottom: 12,
    fontSize: 11,
    color: colors.muted,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.warningSoft,
  },
  savedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A6B00',
  },
  sliderField: {
    marginTop: 10,
  },
  sliderFieldDisabled: {
    opacity: 0.5,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  sliderValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  sliderTouchArea: {
    height: 28,
    justifyContent: 'center',
  },
  sliderTrackBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface,
  },
  sliderTrackFill: {
    position: 'absolute',
    top: 11,
    left: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  sliderThumb: {
    position: 'absolute',
    top: 4,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.muted,
  },
  mealsField: {
    marginTop: 14,
  },
  mealChipsRow: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 8,
  },
  mealChip: {
    flex: 1,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  mealChipActive: {
    backgroundColor: colors.accent,
  },
  mealChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  mealChipTextActive: {
    color: '#5C4900',
  },
  mealChipDisabled: {
    opacity: 0.5,
  },
  footerRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  saveButton: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonSuccess: {
    backgroundColor: '#3DA35D',
  },
  saveButtonSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
});
