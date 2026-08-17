const CORE_KEYWORDS = [
  '수면', '스트레스', '카페인', '탈수', '자세', '두통', '어지러움', '소화', '식사', '운동',
  '음주', '흡연', '생리', '알레르기', '감기', '몸살', '근육', '피부', '두드러기',
  '발열', '기침', '통증', '피로', '긴장', '불안', '체온', '냉방', '난방', '미세먼지',
  '약물', '두근거림', '메스꺼움', '복통', '설사', '변비', '가려움', '부종', '어깨', '허리',
  '무릎', '손목', '월경', '호르몬', '갑상선', '혈압', '혈당', '체중', '식욕', '눈',
  '허기', '포만감', '졸음', '답답함', '우울감', '초조함', '예민함', '무기력감', '나른함',
  '오한', '열감', '갈증', '소화불량', '불면', '인후통', '근육통', '요통', '슬관절통',
  '어깨통증', '손목통증', '관절통', '치통', '속쓰림', '호흡곤란', '멀미', '숙취', '생리통',
];

// 통증 표현("OO가 아파요")은 부위 + 통증 동사 조합을 병명 명사로 매핑합니다.
const PAIN_VERBS = ['아프', '아파', '아팠', '쑤시', '쑤셔', '쑤셨', '결리', '결려', '결렸'];
const BODY_PART_PAIN_NOUNS: [string, string][] = [
  ['머리', '두통'], ['배', '복통'], ['허리', '요통'], ['목', '인후통'],
  ['무릎', '슬관절통'], ['어깨', '어깨통증'], ['손목', '손목통증'],
  ['근육', '근육통'], ['관절', '관절통'], ['이빨', '치통'], ['이', '치통'],
];

function matchPainCondition(compact: string): string | null {
  if (!PAIN_VERBS.some((verb) => compact.includes(verb))) return null;
  const match = BODY_PART_PAIN_NOUNS.find(([part]) => compact.includes(part));
  return match ? match[1] : null;
}

// 형용사/동사의 흔한 활용형을 실제 증상·병명 명사로 매핑합니다 (예: 배고파요 → 허기).
// 어간 활용이 불규칙한 표현이 많아 접미사 제거만으로는 명사가 되지 않아 별도 사전을 둡니다.
const CONDITION_PATTERNS: { patterns: string[]; noun: string }[] = [
  { patterns: ['배고프', '배고파', '배고팠'], noun: '허기' },
  { patterns: ['배불러', '배부르', '배불렀'], noun: '포만감' },
  { patterns: ['졸리', '졸려', '졸렸'], noun: '졸음' },
  { patterns: ['피곤하', '피곤해', '피곤했'], noun: '피로' },
  { patterns: ['어지럽', '어지러워', '어지러웠'], noun: '어지러움' },
  { patterns: ['메스껍', '메스꺼워', '메스꺼웠', '구역질'], noun: '메스꺼움' },
  { patterns: ['답답하', '답답해', '답답했'], noun: '답답함' },
  { patterns: ['우울하', '우울해', '우울했'], noun: '우울감' },
  { patterns: ['불안하', '불안해', '불안했'], noun: '불안' },
  { patterns: ['긴장되', '긴장돼', '긴장됐'], noun: '긴장' },
  { patterns: ['초조하', '초조해', '초조했'], noun: '초조함' },
  { patterns: ['예민하', '예민해', '예민했'], noun: '예민함' },
  { patterns: ['무기력하', '무기력해', '무기력했'], noun: '무기력감' },
  { patterns: ['나른하', '나른해', '나른했'], noun: '나른함' },
  { patterns: ['춥', '추워', '추웠'], noun: '오한' },
  { patterns: ['덥', '더워', '더웠'], noun: '열감' },
  { patterns: ['가렵', '가려워', '가려웠'], noun: '가려움' },
  { patterns: ['부었', '부어', '붓는', '부은'], noun: '부종' },
  { patterns: ['저리', '저려', '저렸'], noun: '저림' },
  { patterns: ['목말라', '목마르', '목말랐'], noun: '갈증' },
  { patterns: ['소화안되', '소화가안되', '소화가안돼', '체한', '체했'], noun: '소화불량' },
  { patterns: ['잠이안오', '잠못자', '잠을못자', '잠을못잤', '잠이안와', '잠이안왔'], noun: '불면' },
  { patterns: ['열나', '열이나', '열이났'], noun: '발열' },
  { patterns: ['속쓰리', '속이쓰리', '속쓰려'], noun: '속쓰림' },
  { patterns: ['숨차', '숨이차', '숨가쁘'], noun: '호흡곤란' },
  { patterns: ['두근거리', '두근두근'], noun: '두근거림' },
  { patterns: ['쑤시', '쑤셔', '쑤셨'], noun: '쑤심' },
];

// 문장형 어미/조사를 제거해 명사(어간)에 가깝게 다듬습니다. 위 사전에도 없는 표현을 위한 최후의 근사치입니다.
const TRAILING_PARTICLES = [
  '스러워요', '스러웠어요', '했습니다', '했어요', '였습니다', '였어요', '입니다', '이에요',
  '거려요', '거렸어요', '되었어요', '됐어요', '있어요', '없어요', '해서',
  '습니다', '이예요', '예요', '해요', '어요', '아요', '네요', '군요',
  '으로', '에서', '에게', '한테', '까지', '부터', '이나', '이랑', '와서',
  '는', '은', '이', '가', '을', '를', '의', '도', '만', '에', '로',
];
// 위 사전 매칭에도 실패했을 때, 남아있는 문장형 종결 어미를 한 글자씩 정리하는 최종 안전장치입니다.
const TERMINAL_ENDINGS = ['다', '요', '음', '함', '네', '지', '고', '며', '서', '니', '죠'];

function toNounStem(token: string): string {
  let result = token;
  let changed = true;
  while (changed && result.length > 1) {
    changed = false;
    for (const particle of TRAILING_PARTICLES) {
      if (result.length > particle.length && result.endsWith(particle)) {
        result = result.slice(0, -particle.length);
        changed = true;
        break;
      }
    }
  }
  // 3글자 넘게 남았는데 문장형 종결 어미로 끝나면, 명사처럼 보이도록 한 글자 더 정리합니다.
  while (result.length > 3 && TERMINAL_ENDINGS.includes(result.slice(-1))) {
    result = result.slice(0, -1);
  }
  return result || token;
}

// 사전에 등록된 병명/증상 단어만 찾습니다. 못 찾으면 억지로 만들어내지 않고 null을 돌려줘서,
// 상위 로직(toBranchWord)이 최후의 안전장치(어미 제거)로 넘어갈지 판단할 수 있게 합니다.
function findKnownConditionWord(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const compact = trimmed.replace(/\s+/g, '');

  // "허리가 쑤셔요"처럼 부위+통증 표현이면, 막연한 부위 명사(허리)보다 구체적인 병명(요통)을 우선합니다.
  const painNoun = matchPainCondition(compact);
  if (painNoun) return painNoun;

  // 문장에 키워드가 여러 개 섞여 있으면, 사전 배열 순서가 아니라 문장에서 실제로 먼저 등장하는 단어를 고릅니다.
  let bestKeyword: string | null = null;
  let bestIndex = Infinity;
  for (const keyword of CORE_KEYWORDS) {
    const index = trimmed.indexOf(keyword);
    if (index !== -1 && index < bestIndex) {
      bestIndex = index;
      bestKeyword = keyword;
    }
  }
  if (bestKeyword) return bestKeyword;

  let bestConditionNoun: string | null = null;
  bestIndex = Infinity;
  for (const entry of CONDITION_PATTERNS) {
    for (const pattern of entry.patterns) {
      const index = compact.indexOf(pattern);
      if (index !== -1 && index < bestIndex) {
        bestIndex = index;
        bestConditionNoun = entry.noun;
      }
    }
  }
  return bestConditionNoun;
}

export function toBranchWord(text: string, maxLength = 8): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  const known = findKnownConditionWord(trimmed);
  if (known) return known;

  const firstToken = trimmed.split(/[\s,.:;!?]+/).find(Boolean) ?? trimmed;
  const nounStem = toNounStem(firstToken);
  return nounStem.length > maxLength ? `${nounStem.slice(0, maxLength)}…` : nounStem;
}

// symptomDescription 안에 실제로 들어있는 병명/증상 단어를 전부(문장에 등장하는 순서대로) 찾습니다.
// candidateReason이 그 단어를 직접 언급하는지로 후보를 구분하는 데 씁니다 — reason 문장에는
// "식사량 변화" 같은 원인 설명용 단어도 섞여 있어서, reason 단독으로는 후보를 못 찾습니다.
function findAllKnownConditionWords(text: string, exclude?: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const compact = trimmed.replace(/\s+/g, '');

  const hits: { noun: string; index: number }[] = [];

  for (const keyword of CORE_KEYWORDS) {
    if (keyword === exclude) continue;
    const index = trimmed.indexOf(keyword);
    if (index !== -1) hits.push({ noun: keyword, index });
  }

  for (const entry of CONDITION_PATTERNS) {
    if (entry.noun === exclude) continue;
    for (const pattern of entry.patterns) {
      const index = compact.indexOf(pattern);
      if (index !== -1) {
        hits.push({ noun: entry.noun, index });
        break;
      }
    }
  }

  if (PAIN_VERBS.some((verb) => compact.includes(verb))) {
    for (const [part, noun] of BODY_PART_PAIN_NOUNS) {
      if (noun === exclude) continue;
      const index = trimmed.indexOf(part);
      if (index !== -1) hits.push({ noun, index });
    }
  }

  hits.sort((a, b) => a.index - b.index);
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const hit of hits) {
    if (seen.has(hit.noun)) continue;
    seen.add(hit.noun);
    ordered.push(hit.noun);
  }
  return ordered;
}

// 한 번의 증상 입력에 두 가지 이상의 문제가 섞여 있을 때("두통이 있고 체중도 늘었어요"),
// 마인드맵 가지 단어가 항상 같은 단어(맨 처음 매칭된 것)로 뭉뚱그려지지 않도록,
// 이 원인 후보의 reason이 실제로 어떤 증상 단어를 언급하는지 보고 후보별로 다른 단어를 고릅니다.
// causeWord(이 후보의 원인 단어)는 후보 목록에서 제외해서, "스트레스로 인해 두통이..." 같은
// 설명에서 원인 단어(스트레스)가 증상 자리로 다시 뽑히지 않게 합니다.
export function toBranchWordForCandidate(
  symptomDescription: string,
  candidateReason: string,
  causeWord: string,
  maxLength = 8,
): string {
  const pool = findAllKnownConditionWords(symptomDescription, causeWord);
  if (pool.length === 0) return toBranchWord(symptomDescription, maxLength);
  if (pool.length === 1) return pool[0];

  const mentionedInReason = pool.find((word) => candidateReason.includes(word));
  return mentionedInReason ?? pool[0];
}
