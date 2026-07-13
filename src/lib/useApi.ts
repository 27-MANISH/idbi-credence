'use client';

/**
 * React hooks for FinHealth API calls.
 * Wraps `src/lib/api.ts` with loading, error, and data states.
 * Reads JWT from useAuthStore automatically so callers don't need to thread tokens.
 */

import { useState, useCallback, useRef } from 'react';
import {
  authApi, loansApi, scoreApi,
  ApiError,
  type Token,
  type UserOut,
  type OnboardingRequest,
  type OnboardingResponse,
  type ScoreComputeRequest,
  type ScoreExplainResponse,
  type LoanUpdate,
  type LoanOut,
  type QueueItem,
} from './api';
import { useAuthStore } from '@/stores/useAuthStore';

// ---------------------------------------------------------------------------
// Generic hook factory
// ---------------------------------------------------------------------------

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useApiCall<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
) {
  const [state, setState] = useState<UseApiState<TReturn>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: TArgs): Promise<TReturn | null> => {
      // Cancel previous in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setState({ data: null, loading: true, error: null });

      try {
        const result = await fn(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.detail
            : err instanceof Error
            ? err.message
            : 'Unknown error';
        setState(prev => ({ ...prev, loading: false, error: msg }));
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn],
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

// ---------------------------------------------------------------------------
// Auth hooks
// ---------------------------------------------------------------------------

export function useLogin() {
  const { setToken, setUser } = useAuthStore();

  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
  }>({ loading: false, error: null });

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setState({ loading: true, error: null });
      try {
        const token: Token = await authApi.login(email, password);
        setToken(token.access_token);

        // Fetch user profile
        const user: UserOut = await authApi.me(token.access_token);
        setUser(user);

        setState({ loading: false, error: null });
        return true;
      } catch (err) {
        const msg =
          err instanceof ApiError ? err.detail : 'Login failed. Please try again.';
        setState({ loading: false, error: msg });
        return false;
      }
    },
    [setToken, setUser],
  );

  return { ...state, login };
}

export function useSignup() {
  const { setToken, setUser } = useAuthStore();

  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
  }>({ loading: false, error: null });

  const signup = useCallback(
    async (payload: {
      email: string;
      name: string;
      password: string;
      role?: string;
    }): Promise<boolean> => {
      setState({ loading: true, error: null });
      try {
        await authApi.signup(payload);
        // Auto-login after signup
        const token: Token = await authApi.login(payload.email, payload.password);
        setToken(token.access_token);
        const user: UserOut = await authApi.me(token.access_token);
        setUser(user);
        setState({ loading: false, error: null });
        return true;
      } catch (err) {
        const msg =
          err instanceof ApiError ? err.detail : 'Signup failed. Please try again.';
        setState({ loading: false, error: msg });
        return false;
      }
    },
    [setToken, setUser],
  );

  return { ...state, signup };
}

// ---------------------------------------------------------------------------
// Onboarding hook
// ---------------------------------------------------------------------------

export function useOnboard() {
  const token = useAuthStore(s => s.token);

  const hook = useApiCall(
    useCallback(
      (payload: OnboardingRequest) => loansApi.onboard(payload, token),
      [token],
    ),
  );

  return hook as Omit<typeof hook, 'execute'> & {
    execute: (payload: OnboardingRequest) => Promise<OnboardingResponse | null>;
  };
}

// ---------------------------------------------------------------------------
// Score hooks
// ---------------------------------------------------------------------------

export function useComputeScore() {
  const token = useAuthStore(s => s.token);

  const hook = useApiCall(
    useCallback(
      (payload: ScoreComputeRequest) => scoreApi.compute(payload, token),
      [token],
    ),
  );

  return hook as Omit<typeof hook, 'execute'> & {
    execute: (payload: ScoreComputeRequest) => Promise<ScoreExplainResponse | null>;
  };
}

export function useExplainScore() {
  const token = useAuthStore(s => s.token);

  const hook = useApiCall(
    useCallback(
      (id: string) => scoreApi.explain(id, token),
      [token],
    ),
  );

  return hook as Omit<typeof hook, 'execute'> & {
    execute: (id: string) => Promise<ScoreExplainResponse | null>;
  };
}

// ---------------------------------------------------------------------------
// Loan decision hook
// ---------------------------------------------------------------------------

export function useUpdateLoan() {
  const token = useAuthStore(s => s.token);

  const hook = useApiCall(
    useCallback(
      (id: string, payload: LoanUpdate) => loansApi.update(id, payload, token),
      [token],
    ),
  );

  return hook as Omit<typeof hook, 'execute'> & {
    execute: (id: string, payload: LoanUpdate) => Promise<LoanOut | null>;
  };
}

export function useLoansQueue() {
  const token = useAuthStore(s => s.token);

  const hook = useApiCall(
    useCallback(
      () => loansApi.queue(token),
      [token],
    ),
  );

  return hook as Omit<typeof hook, 'execute'> & {
    execute: () => Promise<QueueItem[] | null>;
  };
}

export function useGetLoanDetails() {
  const token = useAuthStore(s => s.token);

  const hook = useApiCall(
    useCallback(
      (id: string) => loansApi.get(id, token),
      [token],
    ),
  );

  return hook as Omit<typeof hook, 'execute'> & {
    execute: (id: string) => Promise<{
      loan: LoanOut;
      profile: ProfileCreate & { id: string; status: string; created_at: string };
      score: QueueItem['score'];
      consent: QueueItem['consent'];
      audits: any[];
    } | null>;
  };
}
