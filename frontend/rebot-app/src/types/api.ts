export type ProfilePayload = {
  nickname?: string | null;
  job?: string | null;
  birth_year?: number | null;
  gender?: string | null;
  average_sleep_hours?: number | null;
};

export type ProfileResponse = ProfilePayload & {
  id: string;
  created_at: string;
  updated_at: string;
};

export type MeResponse = {
  id: string;
  email: string | null;
  profile: ProfileResponse | null;
};

export type DailyLogPayload = {
  date?: string;
  sleep_hours?: number | null;
  sleep_irregular?: boolean;
  stress_level?: number | null;
  water_ml?: number | null;
  exercise_minutes?: number | null;
  caffeine_count?: number | null;
  alcohol?: boolean | null;
  meal_note?: string | null;
  memo?: string | null;
};

export type DailyLogResponse = DailyLogPayload & {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type SymptomResponse = {
  id: string;
  user_id: string;
  category: string;
  description: string;
  is_repeated: boolean;
  image_path: string | null;
  created_at: string;
};

export type AnalysisCandidate = {
  id: string;
  analysis_id: string;
  rank: number;
  title: string;
  reason: string;
  evidence: string[];
  confirmation_question: string;
  created_at: string;
};

export type AnalysisResponse = {
  id: string;
  user_id: string;
  symptom_id: string;
  status: 'pending' | 'completed' | 'failed';
  model_name: string;
  selection_status: 'unselected' | 'candidate' | 'none';
  selected_candidate_id: string | null;
  created_at: string;
  candidates: AnalysisCandidate[];
};

export type RecommendationResponse = {
  id: string;
  user_id: string;
  analysis_id: string;
  candidate_id: string | null;
  action: string;
  reason: string;
  duration_minutes: number | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  alternative: string | null;
  created_at: string;
};

export type FeedbackResponse = {
  id: string;
  user_id: string;
  recommendation_id: string;
  feedback: 'positive' | 'negative';
  reason: string | null;
  created_at: string;
};

export type ReportResponse = {
  id: string;
  user_id: string;
  period_type: 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  statistics: {
    recorded_days: number;
    average_sleep_hours: number | null;
    average_stress_level: number | null;
    exercise_days: number;
    symptom_count: number;
    late_meal_count: number;
  };
  summary: {
    overview: string;
    observations: string[];
    disclaimer: string;
  };
  created_at: string;
};

export type ProductResponse = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  image_url: string | null;
  purchase_url: string | null;
  tags: string[];
  price_krw: number | null;
  active: boolean;
  created_at: string;
};
