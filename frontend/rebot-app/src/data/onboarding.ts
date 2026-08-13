export const BIRTH_YEARS = Array.from({ length: 2026 - 1965 + 1 }, (_, index) => 1965 + index);
export const DEFAULT_BIRTH_YEAR = 2000;

export const SLEEP_OPTIONS = ['불규칙함', '4시간 이하', '5시간', '6시간', '7시간', '8시간 이상'] as const;
export const DEFAULT_SLEEP_INDEX = 1;

export const GENDERS = ['남성', '여성'] as const;
