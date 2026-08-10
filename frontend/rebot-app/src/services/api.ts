import { supabase } from '@/src/lib/supabase';
import { Platform } from 'react-native';
import type {
  AnalysisResponse,
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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
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
  selectCandidate: (analysisId: string, candidateId: string | null) =>
    request<{ analysis_id: string; selection_status: 'candidate' | 'none'; selected_candidate_id: string | null }>(
      `/api/analysis/${analysisId}/select`,
      { method: 'POST', ...jsonBody({ candidate_id: candidateId }) },
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
  listProducts: () => request<ProductResponse[]>('/api/products?consent=true'),
  searchProducts: (query: string) =>
    request<ProductResponse[]>(`/api/products/search?q=${encodeURIComponent(query)}&consent=true`),
  getRecommendedProducts: (tags: string[]) =>
    request<ProductResponse[]>(
      `/api/products/recommended?tags=${encodeURIComponent(tags.join(','))}&consent=true`,
    ),
};
