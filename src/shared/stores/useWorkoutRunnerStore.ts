import { create } from "zustand";

export interface WorkoutRunnerState {
  currentExerciseIndex: number;
  restTimeLeft: number;
  isResting: boolean;
  setCurrentExerciseIndex: (index: number) => void;
  setRestTimeLeft: (seconds: number) => void;
  setIsResting: (value: boolean) => void;
  reset: () => void;
}

export const useWorkoutRunnerStore = create<WorkoutRunnerState>((set) => ({
  currentExerciseIndex: 0,
  restTimeLeft: 0,
  isResting: false,
  setCurrentExerciseIndex: (index) => set({ currentExerciseIndex: index }),
  setRestTimeLeft: (seconds) => set({ restTimeLeft: seconds }),
  setIsResting: (value) => set({ isResting: value }),
  reset: () =>
    set({ currentExerciseIndex: 0, restTimeLeft: 0, isResting: false }),
}));
