import { supabase } from '@/src/lib/supabase';
import { Platform } from 'react-native';
import type {
  AnalysisHistoryItem,
  AnalysisResponse,
  ChatHistoryResponse,
  ChatReplyResponse,
  DailyLogPayload,
  DailyLogResponse,
  FeedbackResponse,
  MeResponse,
  ProductResponse,
  ProfilePayload,
  ProfileResponse,
  RecommendationResponse,
  ReportResponse,
  SymptomResponse,
  WellnessProfileResponse,
} from '@/src/types/api';

const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

if (!rawApiBaseUrl) {
  throw new Error('EXPO_PUBLIC_API_BASE_URL을 설정해주세요.');
}

const apiBaseUrl = rawApiBaseUrl.replace(/\/$/, '');

type ApiErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
    request_id?: string;
  };
};

export class ApiError extends Error {
  code: string;
  status: number;
  requestId?: string;

  constructor(message: string, status: number, code = 'API_ERROR', requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.';
}

// 같은 화면에서 여러 훅이 동시에 같은 GET을 호출하면(예: 홈 화면 진입 시 목록 조회가 중복 발생),
// 이 환경의 fetch가 동시 요청의 응답을 공유해 "Body is unusable" 에러를 내는 경우가 있어
// 진행 중인 동일 GET 요청은 새로 fetch하지 않고 기존 Promise를 재사용합니다.
const inflightGetRequests = new Map<string, Promise<unknown>>();

// 위 문제는 "같은 경로"에만 국한되지 않습니다 — 마인드맵처럼 서로 다른 경로로 여러 GET을
// Promise.all로 한꺼번에 쏘는 경우(예: 분석 기록 여러 건을 동시에 조회)에도 이 환경의 fetch가
// 응답 본문을 공유해 같은 에러를 냅니다. 그래서 GET 요청은 전부 한 줄로 세워서(직렬화) 한
// 번에 하나씩만 실제로 fetch가 나가도록 합니다. POST/PATCH 등은 이런 동시 호출 패턴이 없어서
// 그대로 둡니다.
let getQueueTail: Promise<unknown> = Promise.resolve();

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase();
  if (method !== 'GET') return performRequest<T>(path, init);

  const existing = inflightGetRequests.get(path);
  if (existing) return existing as Promise<T>;

  const queued = getQueueTail.catch(() => undefined).then(() => performRequest<T>(path, init));
  getQueueTail = queued.catch(() => undefined);

  inflightGetRequests.set(path, queued);
  void queued.finally(() => {
    if (inflightGetRequests.get(path) === queued) inflightGetRequests.delete(path);
  });

  return queued;
}

async function performRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token) {
    throw new ApiError('로그인이 필요합니다.', 401, 'AUTH_REQUIRED');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${data.session.access_token}`);
  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(
      `백엔드에 연결할 수 없습니다. API 주소(${apiBaseUrl})와 서버 실행 상태를 확인해주세요.`,
      0,
      'NETWORK_ERROR',
    );
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let payload: T | ApiErrorEnvelope | null = null;
  if (text) {
    try {
      payload = JSON.parse(text) as T | ApiErrorEnvelope;
    } catch {
      if (!response.ok) {
        throw new ApiError(`백엔드 요청에 실패했습니다. (${response.status})`, response.status);
      }
      throw new ApiError('백엔드 응답 형식을 읽을 수 없습니다.', response.status, 'INVALID_RESPONSE');
    }
  }
  if (!response.ok) {
    const envelope = payload as ApiErrorEnvelope | null;
    throw new ApiError(
      envelope?.error?.message ?? `요청에 실패했습니다. (${response.status})`,
      response.status,
      envelope?.error?.code,
      envelope?.error?.request_id,
    );
  }
  return payload as T;
}

function jsonBody(value: unknown): Pick<RequestInit, 'body'> {
  return { body: JSON.stringify(value) };
}

export const backendApi = {
  getMe: () => request<MeResponse>('/api/me'),
  createProfile: (payload: ProfilePayload & { nickname: string }) =>
    request<ProfileResponse>('/api/profile', { method: 'POST', ...jsonBody(payload) }),
  updateProfile: (payload: ProfilePayload) =>
    request<ProfileResponse>('/api/profile', { method: 'PATCH', ...jsonBody(payload) }),
  createDailyLog: (payload: DailyLogPayload) =>
    request<DailyLogResponse>('/api/logs', { method: 'POST', ...jsonBody(payload) }),
  listDailyLogs: (days = 7) => request<DailyLogResponse[]>(`/api/logs?days=${days}`),
  updateDailyLog: (logId: string, payload: DailyLogPayload) =>
    request<DailyLogResponse>(`/api/logs/${logId}`, { method: 'PATCH', ...jsonBody(payload) }),
  createSymptom: (payload: { category: string; description: string; is_repeated: boolean }) =>
    request<SymptomResponse>('/api/symptoms', { method: 'POST', ...jsonBody(payload) }),
  uploadSymptomImage: async (symptomId: string, uri: string) => {
    const form = new FormData();
    const extension = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)?.[1]?.toLowerCase() || 'jpg';
    const mime = extension === 'png' ? 'image/png' : 'image/jpeg';
    if (Platform.OS === 'web') {
      const imageResponse = await fetch(uri);
      const blob = await imageResponse.blob();
      form.append('file', blob, `symptom.${extension}`);
    } else {
      form.append('file', { uri, name: `symptom.${extension}`, type: mime } as unknown as Blob);
    }
    return request<{ image_path: string }>(`/api/symptoms/${symptomId}/image`, {
      method: 'POST',
      body: form,
    });
  },
  createAnalysis: (symptomId: string) =>
    request<AnalysisResponse>('/api/analysis', {
      method: 'POST',
      ...jsonBody({ symptom_id: symptomId }),
    }),
  listAnalyses: () => request<AnalysisHistoryItem[]>('/api/analysis'),
  getAnalysis: (analysisId: string) => request<AnalysisResponse>(`/api/analysis/${analysisId}`),
  deleteAnalysis: (analysisId: string) =>
    request<void>(`/api/analysis/${analysisId}`, { method: 'DELETE' }),
  getAnalysisChat: (analysisId: string) =>
    request<ChatHistoryResponse>(`/api/analysis/${analysisId}/chat`),
  sendAnalysisChatMessage: (analysisId: string, content: string) =>
    request<ChatReplyResponse>(`/api/analysis/${analysisId}/chat`, {
      method: 'POST',
      ...jsonBody({ content }),
    }),
  deleteAnalysisChat: (analysisId: string) =>
    request<void>(`/api/analysis/${analysisId}/chat`, { method: 'DELETE' }),
  selectCandidates: (analysisId: string, candidateIds: string[], customCause?: string) =>
    request<{ analysis_id: string; selection_status: 'candidate' | 'none'; selected_candidate_ids: string[]; custom_candidate_id: string | null }>(
      `/api/analysis/${analysisId}/select`,
      { method: 'POST', ...jsonBody({ candidate_ids: candidateIds, custom_cause: customCause?.trim() || null }) },
    ),
  createRecommendation: (analysisId: string) =>
    request<RecommendationResponse>('/api/recommendations', {
      method: 'POST',
      ...jsonBody({ analysis_id: analysisId }),
    }),
  sendFeedback: (recommendationId: string, feedback: 'positive' | 'negative', reason?: string) =>
    request<FeedbackResponse>(`/api/recommendations/${recommendationId}/feedback`, {
      method: 'POST',
      ...jsonBody({ feedback, reason: reason?.trim() || null }),
    }),
  createAlternative: (recommendationId: string) =>
    request<RecommendationResponse>(`/api/recommendations/${recommendationId}/alternative`, {
      method: 'POST',
    }),
  getWeeklyReport: () => request<ReportResponse>('/api/reports/weekly'),
  getWellnessProfile: () => request<WellnessProfileResponse>('/api/profile/wellness'),
  listProducts: () => request<ProductResponse[]>('/api/products?consent=true'),
  searchProducts: (query: string) =>
    request<ProductResponse[]>(`/api/products/search?q=${encodeURIComponent(query)}&consent=true`),
  getRecommendedProducts: (tags: string[]) =>
    request<ProductResponse[]>(
      `/api/products/recommended?tags=${encodeURIComponent(tags.join(','))}&consent=true`,
    ),
};
