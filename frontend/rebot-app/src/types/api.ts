export type ProfilePayload = {
  nickname?: string | null;
  job?: string | null;
  birth_year?: number | null;
  gender?: string | null;
  average_sleep_hours?: number | null;
  known_conditions?: string | null;
  allergies?: string | null;
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
  selected: boolean;
  is_custom: boolean;
  created_at: string;
};

export type AnalysisResponse = {
  id: string;
  user_id: string;
  symptom_id: string;
  status: 'pending' | 'completed' | 'failed';
  model_name: string;
  selection_status: 'unselected' | 'candidate' | 'none';
  created_at: string;
  candidates: AnalysisCandidate[];
};

export type AnalysisHistoryItem = {
  id: string;
  symptom_id: string;
  symptom_description: string;
  status: 'pending' | 'completed' | 'failed';
  selection_status: 'unselected' | 'candidate' | 'none';
  recommendation_action: string | null;
  recommendation_created_at: string | null;
  created_at: string;
};

export type ChatMessageResponse = {
  id: string;
  analysis_id: string;
  turn_id: string;
  role: 'user' | 'assistant';
  content: string;
  model_name: string | null;
  created_at: string;
};

export type ChatHistoryResponse = {
  analysis_id: string;
  messages: ChatMessageResponse[];
};

export type ChatReplyResponse = {
  analysis_id: string;
  user_message: ChatMessageResponse;
  assistant_message: ChatMessageResponse;
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
  additional_solutions: RecommendationSolution[];
  support_resources: RecommendationSupportResource[];
  created_at: string;
};

export type RecommendationSolution = {
  action: string;
  reason: string;
  duration_minutes: number | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
};

export type RecommendationSupportResource = {
  category: 'tool' | 'service';
  name: string;
  benefit: string;
  selection_tip: string | null;
};

export type FeedbackResponse = {
  id: string;
  user_id: string;
  recommendation_id: string;
  feedback: 'positive' | 'negative';
  reason: string | null;
  created_at: string;
};

export type SymptomFrequency = {
  symptom_name: string;
  occurrence_count: number;
  last_occurred_at: string;
  repeated_marked: boolean;
};

export type WellnessProfileResponse = {
  known_conditions: string | null;
  allergies: string | null;
  symptom_frequencies: SymptomFrequency[];
  total_symptom_records: number;
  period_start: string | null;
  period_end: string | null;
  last_aggregated_at: string;
  medical_guidance_recommended: boolean;
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
