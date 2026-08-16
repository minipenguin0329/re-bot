import type { RecommendationResponse, RecommendationSolution } from '@/src/types/api';

export const MAX_RECOMMENDATION_SOLUTIONS = 5;

export function getRecommendationSolutions(
  recommendation: RecommendationResponse,
): RecommendationSolution[] {
  const solutions: RecommendationSolution[] = [
    {
      action: recommendation.action,
      reason: recommendation.reason,
      duration_minutes: recommendation.duration_minutes,
      difficulty: recommendation.difficulty,
    },
    ...(recommendation.additional_solutions ?? []),
  ];

  if (recommendation.alternative && solutions.length < MAX_RECOMMENDATION_SOLUTIONS) {
    solutions.push({
      action: recommendation.alternative,
      reason: '앞선 방법을 실행하기 어려울 때 선택할 수 있는 대안이에요.',
      duration_minutes: null,
      difficulty: null,
    });
  }

  return solutions.slice(0, MAX_RECOMMENDATION_SOLUTIONS);
}
