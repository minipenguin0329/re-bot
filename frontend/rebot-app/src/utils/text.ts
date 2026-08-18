const CORE_KEYWORDS = [
  // 생활 요인
  '수면', '스트레스', '카페인', '탈수', '자세', '체온', '냉방', '난방', '미세먼지', '약물',
  '음주', '흡연', '식사', '운동', '식욕', '시차', '소음', '운동부족', '카페인금단',
  // 수면/에너지
  '불면', '불면증', '수면부족', '수면장애', '가위눌림', '낮잠', '무기력감', '나른함', '피로', '졸음',
  // 소화기
  '소화', '소화불량', '위경련', '위염', '역류성식도염', '복부팽만', '트림', '헛배부름',
  '장트러블', '과민성대장증후군', '식중독', '복통', '설사', '변비', '속쓰림', '메스꺼움',
  '허기', '포만감', '갈증',
  // 호흡기/이비인후과
  '기침', '가래', '코막힘', '콧물', '재채기', '목쉼', '쉰목소리', '편도염', '축농증',
  '비염', '중이염', '이명', '귀먹먹함', '코피', '인후통', '호흡곤란', '발열', '오한', '몸살', '감기',
  // 근골격계
  '통증', '두통', '근육', '근육통', '근육경련', '쥐', '담걸림', '디스크', '척추측만증',
  '손목터널증후군', '오십견', '발목염좌', '골절', '타박상', '멍', '어깨', '어깨통증',
  '허리', '요통', '무릎', '슬관절통', '손목', '손목통증', '관절', '관절통', '저림', '쑤심',
  // 피부
  '피부', '두드러기', '여드름', '뾰루지', '아토피', '건선', '습진', '각질', '피부건조',
  '다크서클', '기미', '주근깨', '땀띠', '화상', '동상', '가려움', '부종',
  // 정신/기분
  '긴장', '불안', '답답함', '우울감', '초조함', '예민함', '번아웃', '공황', '강박', '조급함',
  '짜증', '신경과민', '집중력저하', '건망증', '두근거림',
  // 여성 건강
  '생리', '생리통', '생리불순', '갱년기', '폐경', '임신', '입덧', '자궁근종', '월경', '호르몬',
  // 대사/내분비
  '갑상선', '혈압', '저혈압', '고혈압', '혈당', '고지혈증', '체중', '비만', '저체중',
  // 눈
  '안구건조', '눈충혈', '시력저하', '눈밑떨림', '결막염', '다래끼',
  // 구강
  '치통', '잇몸염증', '구내염', '입냄새', '사랑니',
  // 전신/기타
  '어지러움', '알레르기', '열감', '냉증', '식은땀', '멀미', '숙취',
  // 병명(자주 언급되는 진단명)
  '편두통', '위산과다', '위궤양', '대상포진', '방광염', '요로감염', '빈혈', '저혈당',
  '당뇨', '당뇨병', '통풍', '천식', '기관지염', '폐렴', '독감', '인플루엔자', '담석', '신장결석',
  '요실금', '냉방병', '열사병', '일사병', '저체온증', '알레르기비염', '아토피피부염',
  '지루성피부염', '무좀', '무좀균', '티눈', '대사증후군', '골다공증', '관절염',
  '류마티스관절염', '섬유근육통', '수족냉증', '하지정맥류', '치질', '탈모', '다한증',
];

// 통증 표현("OO가 아파요")은 부위 + 통증 동사 조합을 병명 명사로 매핑합니다.
const PAIN_VERBS = ['아프', '아파', '아팠', '쑤시', '쑤셔', '쑤셨', '결리', '결려', '결렸'];
const BODY_PART_PAIN_NOUNS: [string, string][] = [
  ['머리', '두통'], ['배', '복통'], ['허리', '요통'], ['목', '인후통'],
  ['무릎', '슬관절통'], ['어깨', '어깨통증'], ['손목', '손목통증'],
  ['근육', '근육통'], ['관절', '관절통'], ['이빨', '치통'],
  ['속', '위경련'], ['위', '위경련'], ['손가락', '관절통'],
  ['발목', '관절통'], ['다리', '근육통'], ['등', '근육통'], ['잇몸', '잇몸염증'],
];

function matchPainCondition(compact: string): string | null {
  if (!PAIN_VERBS.some((verb) => compact.includes(verb))) return null;
  // "발목"이 "목"을 부분 문자열로 포함하는 것처럼 부위 이름끼리 겹칠 수 있어,
  // 가장 길게(구체적으로) 일치하는 부위를 우선합니다.
  let best: [string, string] | null = null;
  for (const entry of BODY_PART_PAIN_NOUNS) {
    if (compact.includes(entry[0]) && (!best || entry[0].length > best[0].length)) {
      best = entry;
    }
  }
  return best ? best[1] : null;
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
  { patterns: ['소화안되', '소화가안되', '소화가안돼', '체한', '체했', '더부룩', '속이불편'], noun: '소화불량' },
  { patterns: ['잠이안오', '잠못자', '잠을못자', '잠을못잤', '잠이안와', '잠이안왔'], noun: '불면' },
  { patterns: ['열나', '열이나', '열이났'], noun: '발열' },
  { patterns: ['속쓰리', '속이쓰리', '속쓰려'], noun: '속쓰림' },
  { patterns: ['숨차', '숨이차', '숨가쁘'], noun: '호흡곤란' },
  { patterns: ['두근거리', '두근두근'], noun: '두근거림' },
  { patterns: ['쑤시', '쑤셔', '쑤셨'], noun: '쑤심' },
  { patterns: ['코막혀', '코가막혀', '코막혔'], noun: '코막힘' },
  { patterns: ['몸이떨려', '으슬으슬', '오슬오슬'], noun: '오한' },
  { patterns: ['목쉬', '목이쉬', '목이잠겨'], noun: '목쉼' },
  { patterns: ['눈이건조', '눈이뻑뻑', '눈이시려'], noun: '안구건조' },
];

// 사전에 등록된 병명/증상 단어만 찾습니다. 못 찾으면 억지로 만들어내지 않고 null을 돌려줍니다.
// 마인드맵은 확실한 명사형만 보여줘야 해서, 여기서 못 찾은 표현은 노드를 만들지 않습니다.
function findKnownConditionWord(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const compact = trimmed.replace(/\s+/g, '');

  // "허리가 쑤셔요"처럼 부위+통증 표현이면, 막연한 부위 명사(허리)보다 구체적인 병명(요통)을 우선합니다.
  const painNoun = matchPainCondition(compact);
  if (painNoun) return painNoun;

  // 문장에 키워드가 여러 개 섞여 있으면, 사전 배열 순서가 아니라 문장에서 실제로 먼저 등장하는 단어를 고릅니다.
  // 같은 위치에서 시작하면("생리" ⊂ "생리불순") 더 길고 구체적인 쪽을 우선합니다.
  let bestKeyword: string | null = null;
  let bestIndex = Infinity;
  for (const keyword of CORE_KEYWORDS) {
    const index = trimmed.indexOf(keyword);
    if (index === -1) continue;
    if (index < bestIndex || (index === bestIndex && bestKeyword !== null && keyword.length > bestKeyword.length)) {
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

// 사전에 등록된 명사형으로 확실히 매칭될 때만 마인드맵 가지 단어를 돌려줍니다.
// 매칭에 실패하면 억지로 요약하지 않고 null을 돌려줘서, 호출하는 쪽에서 그 노드를 만들지 않도록 합니다.
export function toBranchWord(text: string): string | null {
  return findKnownConditionWord(text);
}

// 문장형 종결 어미로 끝나면 AI가 "짧은 명사형" 규칙을 안 지키고 문장을 그대로 준 것으로 봅니다.
const NON_NOUN_ENDING = /(다|요|죠|네요|니다|는데|인데|거든요|겠음|같음)$/;
const DISALLOWED_CHARS = /[\s.,!?~"'()\[\]{}%]/;
const MAX_AI_LABEL_LENGTH = 10;

// 사전에 없는 단어라도, AI가 candidate.title / symptom_keyword로 준 텍스트가 실제로 짧은
// 명사 하나처럼 보이면(공백·문장부호 없음, 문장형 어미로 안 끝남, 너무 길지 않음) 그대로 노드
// 라벨로 씁니다. AI가 이 규칙을 안 지켰을 때만(불통과 시) null을 돌려줘서, 호출하는 쪽이
// 사전 매칭 결과나 "노드 숨기기"로 다시 대체하도록 합니다.
export function sanitizeAiNounLabel(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > MAX_AI_LABEL_LENGTH) return null;
  if (DISALLOWED_CHARS.test(trimmed)) return null;
  if (NON_NOUN_ENDING.test(trimmed)) return null;
  return trimmed;
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

  // 같은 위치에서 시작하는 매칭이 있으면("생리" ⊂ "생리불순") 더 긴(구체적인) 쪽을 우선합니다.
  hits.sort((a, b) => a.index - b.index || b.noun.length - a.noun.length);
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
// 사전에 없는 표현이면(=명사형으로 확실히 못 만들면) null을 돌려주고 노드를 만들지 않습니다.
export function toBranchWordForCandidate(
  symptomDescription: string,
  candidateReason: string,
  causeWord: string,
): string | null {
  const pool = findAllKnownConditionWords(symptomDescription, causeWord);
  if (pool.length === 0) return null;
  if (pool.length === 1) return pool[0];

  const mentionedInReason = pool.find((word) => candidateReason.includes(word));
  return mentionedInReason ?? pool[0];
}
