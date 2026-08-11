const CORE_KEYWORDS = [
  '수면', '스트레스', '카페인', '탈수', '자세', '두통', '어지러움', '소화', '식사', '운동',
  '음주', '흡연', '생리', '알레르기', '감기', '몸살', '근육', '피부', '두드러기',
  '발열', '기침', '통증', '피로', '긴장', '불안', '체온', '냉방', '난방', '미세먼지',
  '약물', '두근거림', '메스꺼움', '복통', '설사', '변비', '가려움', '부종', '어깨', '허리',
  '무릎', '손목', '월경', '호르몬', '갑상선', '혈압', '혈당', '체중', '식욕', '눈',
];

export function toBranchWord(text: string, maxLength = 8): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  const keyword = CORE_KEYWORDS.find((candidate) => trimmed.includes(candidate));
  if (keyword) return keyword;

  const firstToken = trimmed.split(/[\s,.:;!?]+/).find(Boolean) ?? trimmed;
  return firstToken.length > maxLength ? `${firstToken.slice(0, maxLength)}…` : firstToken;
}
