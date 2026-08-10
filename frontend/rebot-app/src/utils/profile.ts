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
  return SLEEP_OPTIONS[3];
}
