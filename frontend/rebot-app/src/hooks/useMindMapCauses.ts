import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { MindMapCause } from '@/src/data/mindmap';
import { backendApi } from '@/src/services/api';
import { sanitizeAiNounLabel, toBranchWord, toBranchWordForCandidate } from '@/src/utils/text';

const HISTORY_LIMIT = 8;
const MAX_CAUSES = 6;
const MAX_SYMPTOMS_PER_CAUSE = 5;

export function useMindMapCauses() {
  const [causes, setCauses] = useState<MindMapCause[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const history = await backendApi.listAnalyses();
      const completed = history.filter((item) => item.status === 'completed').slice(0, HISTORY_LIMIT);
      const details = await Promise.all(completed.map((item) => backendApi.getAnalysis(item.id).catch(() => null)));

      const byCauseWord = new Map<string, MindMapCause>();
      details.forEach((analysis, index) => {
        if (!analysis) return;
        const symptomDescription = completed[index].symptom_description;
        analysis.candidates.forEach((candidate) => {
          // 사전에 없는 표현이면, candidate.title 자체가 이미 AI가 짧은 명사형으로 만들어 준
          // 값이니(프롬프트 규칙) 그걸 검증해서 대신 씁니다. 그마저 규칙을 안 지켰으면 노드를 만들지 않습니다.
          const causeWord = toBranchWord(candidate.title) ?? sanitizeAiNounLabel(candidate.title);
          if (!causeWord) return;
          const cause = byCauseWord.get(causeWord) ?? { id: causeWord, label: causeWord, symptoms: [] };
          byCauseWord.set(causeWord, cause);

          // 한 번의 증상 입력에 문제가 여러 개 섞여 있어도, 이 후보가 실제로 설명하는 내용에 맞는
          // 단어를 우선 선택합니다 (예: "두통이 있고 체중도 늘었어요" → 후보별로 두통/체중을 각각 선택).
          // 사전 매칭이 실패하면 AI가 분석 응답에 함께 준 symptom_keyword로 대신합니다.
          const symptomWord = toBranchWordForCandidate(symptomDescription, candidate.reason, causeWord)
            ?? sanitizeAiNounLabel(analysis.symptom_keyword);
          if (!symptomWord) return;
          let symptom = cause.symptoms.find((existing) => existing.label === symptomWord);
          if (!symptom) {
            if (cause.symptoms.length >= MAX_SYMPTOMS_PER_CAUSE) return;
            symptom = { id: `${causeWord}-${symptomWord}`, label: symptomWord, details: [] };
            cause.symptoms.push(symptom);
          }
          symptom.details.push({ title: symptomDescription, reason: candidate.reason });
        });
      });

      setCauses(Array.from(byCauseWord.values()).slice(0, MAX_CAUSES));
    } catch {
      setCauses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return { causes, loading, reload: load };
}
