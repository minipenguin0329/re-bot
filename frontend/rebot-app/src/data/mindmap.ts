export type MindMapSymptomDetail = { title: string; reason: string };
export type MindMapSymptom = { id: string; label: string; details: MindMapSymptomDetail[] };
export type MindMapCause = { id: string; label: string; symptoms: MindMapSymptom[] };

export const DUMMY_MIND_MAP_CAUSES: MindMapCause[] = [
  {
    id: 'sleep',
    label: '수면부족',
    symptoms: [
      { id: 'sleep-1', label: '늦은취침', details: [{ title: '늦은 취침', reason: '평소보다 2시간 늦게 잠들어 수면 시간이 부족했어요.' }] },
      { id: 'sleep-2', label: '얕은수면', details: [{ title: '얕은 수면', reason: '자주 깨어나 깊은 잠을 자지 못했어요.' }] },
    ],
  },
  {
    id: 'stress',
    label: '스트레스',
    symptoms: [
      { id: 'stress-1', label: '업무압박', details: [{ title: '업무 압박', reason: '마감이 겹치며 긴장 상태가 이어졌어요.' }] },
      { id: 'stress-2', label: '대인관계', details: [{ title: '대인관계', reason: '갈등 상황으로 스트레스 지수가 높아졌어요.' }] },
    ],
  },
  {
    id: 'caffeine',
    label: '카페인',
    symptoms: [
      { id: 'caffeine-1', label: '과다섭취', details: [{ title: '과다 섭취', reason: '평소보다 커피를 2잔 더 마셨어요.' }] },
    ],
  },
  {
    id: 'posture',
    label: '자세불량',
    symptoms: [
      { id: 'posture-1', label: '장시간앉음', details: [{ title: '장시간 앉아있음', reason: '5시간 이상 같은 자세로 앉아 있었어요.' }] },
    ],
  },
  {
    id: 'dehydration',
    label: '탈수',
    symptoms: [
      { id: 'dehydration-1', label: '수분부족', details: [{ title: '수분 섭취 부족', reason: '평소보다 물을 적게 마셨어요.' }] },
    ],
  },
];
