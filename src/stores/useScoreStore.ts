/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DimensionScores {
  gst: number;
  upi: number;
  banking: number;
  epfo: number;
  growth: number;
}

export interface ShapContributions {
  gst: number;
  upi: number;
  banking: number;
  epfo: number;
  growth: number;
}

interface ScoreState {
  currentScore: number | null;
  grade: string | null;
  dimensionScores: DimensionScores;
  shapContributions: ShapContributions;
  isComputing: boolean;
  explanation: string | null;
  setScoreData: (data: {
    currentScore: number;
    grade: string;
    dimensionScores: DimensionScores;
    shapContributions: ShapContributions;
    explanation?: string;
  }) => void;
  setComputing: (isComputing: boolean) => void;
  reset: () => void;
}

const initialDimensionScores: DimensionScores = {
  gst: 0,
  upi: 0,
  banking: 0,
  epfo: 0,
  growth: 0,
};

const initialShapContributions: ShapContributions = {
  gst: 0,
  upi: 0,
  banking: 0,
  epfo: 0,
  growth: 0,
};

export const useScoreStore = create<ScoreState>()(
  persist(
    (set) => ({
      currentScore: null,
      grade: null,
      dimensionScores: initialDimensionScores,
      shapContributions: initialShapContributions,
      isComputing: false,
      explanation: null,
      setScoreData: (data) =>
        set({
          currentScore: data.currentScore,
          grade: data.grade,
          dimensionScores: data.dimensionScores,
          shapContributions: data.shapContributions,
          explanation: data.explanation || null,
        }),
      setComputing: (isComputing) => set({ isComputing }),
      reset: () =>
        set({
          currentScore: null,
          grade: null,
          dimensionScores: initialDimensionScores,
          shapContributions: initialShapContributions,
          isComputing: false,
          explanation: null,
        }),
    }),
    {
      name: 'credence-score-storage',
    }
  )
);
