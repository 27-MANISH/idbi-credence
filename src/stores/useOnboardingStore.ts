/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DraftData {
  companyName: string;
  turnover: string;
  loanAmount: string;
  industry: string;
  gstin: string;
  pan: string;
  cin: string;
  existingBank: string;
  purpose: string;
}

export interface Consents {
  dpdp: boolean;
  gst: boolean;
  upi: boolean;
  banking: boolean;
  epfo: boolean;
}

interface OnboardingState {
  step: number;
  draftData: DraftData;
  consents: Consents;
  setStep: (step: number) => void;
  updateDraftData: (data: Partial<DraftData>) => void;
  setConsent: (key: keyof Consents, value: boolean) => void;
  setAllConsents: (value: boolean) => void;
  reset: () => void;
}

const initialDraftData: DraftData = {
  companyName: '',
  turnover: '',
  loanAmount: '',
  industry: 'Manufacturing',
  gstin: '',
  pan: '',
  cin: '',
  existingBank: 'None',
  purpose: '',
};

const initialConsents: Consents = {
  dpdp: false,
  gst: false,
  upi: false,
  banking: false,
  epfo: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      draftData: initialDraftData,
      consents: initialConsents,
      setStep: (step) => set({ step }),
      updateDraftData: (data) =>
        set((state) => ({
          draftData: { ...state.draftData, ...data },
        })),
      setConsent: (key, value) =>
        set((state) => ({
          consents: { ...state.consents, [key]: value },
        })),
      setAllConsents: (value) =>
        set(() => ({
          consents: {
            dpdp: value,
            gst: value,
            upi: value,
            banking: value,
            epfo: value,
          },
        })),
      reset: () =>
        set({
          step: 1,
          draftData: initialDraftData,
          consents: initialConsents,
        }),
    }),
    {
      name: 'credence-onboarding-storage',
    }
  )
);
