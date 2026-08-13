import { createContext, PropsWithChildren, useContext, useState } from 'react';

import { backendApi } from '@/src/services/api';
import type { AnalysisResponse, RecommendationResponse } from '@/src/types/api';

type DiagnosisDraft = {
  description: string;
  isRepeated: boolean;
  photoUri: string | null;
};

type WellnessContextValue = {
  flow: 'diagnosis' | 'solution' | null;
  analysis: AnalysisResponse | null;
  recommendation: RecommendationResponse | null;
  diagnosisDraft: DiagnosisDraft | null;
  prepareDiagnosis: (draft: DiagnosisDraft) => void;
  runPreparedDiagnosis: () => Promise<AnalysisResponse>;
  chooseCandidate: (candidateIds: string[]) => Promise<RecommendationResponse>;
  requestKnownCauseSolution: (situation: string) => Promise<RecommendationResponse>;
  sendFeedback: (feedback: 'positive' | 'negative', reason?: string) => Promise<void>;
  requestAlternative: (reason?: string) => Promise<RecommendationResponse>;
  resetWellnessFlow: () => void;
};

const WellnessContext = createContext<WellnessContextValue | null>(null);

export function WellnessProvider({ children }: PropsWithChildren) {
  const [flow, setFlow] = useState<'diagnosis' | 'solution' | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [diagnosisDraft, setDiagnosisDraft] = useState<DiagnosisDraft | null>(null);

  const prepareDiagnosis = (draft: DiagnosisDraft) => {
    setFlow('diagnosis');
    setDiagnosisDraft(draft);
    setAnalysis(null);
    setRecommendation(null);
  };

  const runPreparedDiagnosis = async () => {
    if (!diagnosisDraft) throw new Error('분석할 증상 정보가 없습니다.');
    const symptom = await backendApi.createSymptom({
      category: 'general_discomfort',
      description: diagnosisDraft.description,
      is_repeated: diagnosisDraft.isRepeated,
    });
    if (diagnosisDraft.photoUri) {
      await backendApi.uploadSymptomImage(symptom.id, diagnosisDraft.photoUri);
    }
    const result = await backendApi.createAnalysis(symptom.id);
    setAnalysis(result);
    return result;
  };

  const chooseCandidate = async (candidateIds: string[]) => {
    if (!analysis) throw new Error('완료된 분석 정보가 없습니다.');
    await backendApi.selectCandidates(analysis.id, candidateIds);
    const result = await backendApi.createRecommendation(analysis.id);
    setRecommendation(result);
    return result;
  };

  const requestKnownCauseSolution = async (situation: string) => {
    setFlow('solution');
    setAnalysis(null);
    setRecommendation(null);
    const symptom = await backendApi.createSymptom({
      category: 'known_cause_situation',
      description: situation,
      is_repeated: false,
    });
    const analysisResult = await backendApi.createAnalysis(symptom.id);
    setAnalysis(analysisResult);
    const firstCandidateId = analysisResult.candidates[0]?.id;
    await backendApi.selectCandidates(analysisResult.id, firstCandidateId ? [firstCandidateId] : []);
    const result = await backendApi.createRecommendation(analysisResult.id);
    setRecommendation(result);
    return result;
  };

  const sendFeedback = async (feedback: 'positive' | 'negative', reason?: string) => {
    if (!recommendation) throw new Error('피드백을 남길 추천 정보가 없습니다.');
    await backendApi.sendFeedback(recommendation.id, feedback, reason);
  };

  const requestAlternative = async (reason?: string) => {
    if (!recommendation) throw new Error('대안을 요청할 추천 정보가 없습니다.');
    await backendApi.sendFeedback(recommendation.id, 'negative', reason);
    const result = await backendApi.createAlternative(recommendation.id);
    setRecommendation(result);
    return result;
  };

  const resetWellnessFlow = () => {
    setFlow(null);
    setAnalysis(null);
    setRecommendation(null);
    setDiagnosisDraft(null);
  };

  const value: WellnessContextValue = {
    flow,
    analysis,
    recommendation,
    diagnosisDraft,
    prepareDiagnosis,
    runPreparedDiagnosis,
    chooseCandidate,
    requestKnownCauseSolution,
    sendFeedback,
    requestAlternative,
    resetWellnessFlow,
  };

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>;
}

export function useWellness() {
  const context = useContext(WellnessContext);
  if (!context) throw new Error('useWellness must be used within a WellnessProvider');
  return context;
}
