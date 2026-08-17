import { SLEEP_OPTIONS } from '@/src/data/onboarding';

export function sleepOptionToHours(option: string): number | null {
  if (!option || option === '불규칙함') return null;
  const parsed = Number.parseFloat(option);
  return Number.isFinite(parsed) ? parsed : null;
}

export function hoursToSleepOption(hours: number | null | undefined): string {
  if (hours == null) return SLEEP_OPTIONS[0];
  if (hours <= 4) return SLEEP_OPTIONS[1];
  if (hours <= 5) return SLEEP_OPTIONS[2];
  if (hours <= 6) return SLEEP_OPTIONS[3];
  if (hours <= 7) return SLEEP_OPTIONS[4];
  return SLEEP_OPTIONS[5];
}

// 지병/알레르기가 두 개의 백엔드 컬럼(known_conditions/allergies)에 남아있는 과거 데이터를
// 하나의 "특이사항" 필드로 합쳐서 보여줍니다.
export function mergeSpecialNotes(
  knownConditions: string | null | undefined,
  allergies: string | null | undefined,
): string {
  return [knownConditions, allergies].filter(Boolean).join('\n');
}
