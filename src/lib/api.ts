/**
 * Typed API client for FinHealth FastAPI backend.
 * All endpoints match `server/app/routers/` exactly.
 *
 * Base URL resolves to:
 *   - Next.js proxy  →  /api/v1  (production, avoids CORS)
 *   - Direct backend →  NEXT_PUBLIC_API_URL (development)
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_BASE =
  typeof window !== 'undefined'
    ? ''
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000');

// ---------------------------------------------------------------------------
// Types (mirrored from server/app/models/schemas.py)
// ---------------------------------------------------------------------------

export interface Token {
  access_token: string;
  token_type: string;
}

export interface UserOut {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface ProfileCreate {
  gstin: string;
  name: string;
  type: string;
  years?: number;
  location?: string;
}

export interface ConsentFlags {
  gst_consent: boolean;
  upi_consent: boolean;
  aa_consent: boolean;
  epfo_consent: boolean;
}

export interface LoanBase {
  loan_type: string;   // WORKING_CAPITAL | TERM_LOAN | INVOICE_DISCOUNTING
  amount: number;      // INR
  tenure: number;      // months
}

export interface OnboardingRequest {
  profile: ProfileCreate;
  consent: ConsentFlags;
  loan: LoanBase;
}

export interface OnboardingResponse {
  profile_id: string;
  consent_id: string;
  application_id: string;
  loan_id: string;
  message: string;
}

export interface ScoreComputeRequest {
  profile_id: string;
  consent_id?: string;
}

export interface ScoreExplainFeature {
  name: string;
  raw_value: number;
  weight: number;
  contribution: number;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface ScoreExplainResponse {
  features: ScoreExplainFeature[];
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  risk_report: string;
}

export interface LoanUpdate {
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  decided_by?: string;
}

export interface LoanOut {
  id: string;
  profile_id: string;
  application_id: string;
  loan_type: string;
  amount: number;
  tenure: number;
  interest_rate?: string;
  status: string;
  decided_by?: string;
  decided_at?: string;
  created_at: string;
}

export interface QueueItem {
  loan: LoanOut;
  profile: ProfileCreate & { id: string; status: string; created_at: string };
  score: {
    id: string;
    profile_id: string;
    overall_score: number;
    grade: string;
    risk_band: string;
    gst_score: number;
    upi_score: number;
    aa_score: number;
    epfo_score: number;
    signals: Record<string, any>;
    explanation?: string;
    computed_at: string;
  } | null;
  consent: ConsentFlags & { id: string; profile_id: string; consented_at: string } | null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type HTTPMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions<T = unknown> {
  method?: HTTPMethod;
  body?: T;
  token?: string | null;
  /** Override the default base URL (useful for proxy routes) */
  baseUrl?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

async function request<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const { method = 'GET', body, token, baseUrl = API_BASE } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err?.detail ?? detail;
    } catch {
      // ignore JSON parse error
    }
    throw new ApiError(res.status, detail);
  }

  // 204 No Content
  if (res.status === 204) return undefined as TResponse;

  return res.json() as Promise<TResponse>;
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

export const authApi = {
  signup: (payload: { email: string; name: string; password: string; role?: string }) =>
    request<UserOut, typeof payload>('/api/v1/auth/signup', {
      method: 'POST',
      body: payload,
    }),

  login: (email: string, password: string) =>
    request<Token, { email: string; password: string }>('/api/v1/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  me: (token: string) =>
    request<UserOut>('/api/v1/auth/me', { token }),
};

// ---------------------------------------------------------------------------
// Loan / Onboarding endpoints
// ---------------------------------------------------------------------------

export const loansApi = {
  /** DPDP-compliant onboarding — creates profile, consent, and loan in one shot */
  onboard: (payload: OnboardingRequest, token?: string | null) =>
    request<OnboardingResponse, OnboardingRequest>('/api/v1/loans/onboard', {
      method: 'POST',
      body: payload,
      token,
    }),

  list: (token?: string | null) =>
    request<LoanOut[]>('/api/v1/loans/', { token }),

  queue: (token?: string | null) =>
    request<QueueItem[]>('/api/v1/loans/queue', { token }),

  get: (id: string, token?: string | null) =>
    request<{
      loan: LoanOut;
      profile: ProfileCreate & { id: string; status: string; created_at: string };
      score: QueueItem['score'];
      consent: QueueItem['consent'];
      audits: any[];
    }>(`/api/v1/loans/${id}`, { token }),

  update: (id: string, payload: LoanUpdate, token?: string | null) =>
    request<any, LoanUpdate>(`/api/v1/loans/${id}/decision`, {
      method: 'POST',
      body: payload,
      token,
    }),
};

// ---------------------------------------------------------------------------
// Score / Explainability endpoints
// ---------------------------------------------------------------------------

export const scoreApi = {
  /** Trigger LangGraph scoring orchestrator for a profile */
  compute: (payload: ScoreComputeRequest, token?: string | null) =>
    request<ScoreExplainResponse, ScoreComputeRequest>('/api/v1/score/compute', {
      method: 'POST',
      body: payload,
      token,
    }),

  /** Fetch SHAP explanation for a score ID or profile ID */
  explain: (id: string, token?: string | null) =>
    request<ScoreExplainResponse>(`/api/v1/score/explain/${id}`, { token }),
};
