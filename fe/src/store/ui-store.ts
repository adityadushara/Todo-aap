import { create } from "zustand";

interface UIState {
  isCreateTaskOpen: boolean;
  openCreateTask: () => void;
  closeCreateTask: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreateTaskOpen: false,
  openCreateTask: () => set({ isCreateTaskOpen: true }),
  closeCreateTask: () => set({ isCreateTaskOpen: false }),
}));
