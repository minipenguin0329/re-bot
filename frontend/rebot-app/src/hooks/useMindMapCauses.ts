import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { MindMapCause } from '@/src/data/mindmap';
import { backendApi } from '@/src/services/api';
import { toBranchWord } from '@/src/utils/text';

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
          const causeWord = toBranchWord(candidate.title);
          if (!causeWord) return;
          const cause = byCauseWord.get(causeWord) ?? { id: causeWord, label: causeWord, symptoms: [] };
          byCauseWord.set(causeWord, cause);

          const symptomWord = toBranchWord(symptomDescription);
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
