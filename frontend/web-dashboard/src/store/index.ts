import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AppState {
  user: User | null;
  jwtToken: string | null;
  telemetry: any[];
  login: (user: User, token: string) => void;
  logout: () => void;
  addTelemetry: (data: any) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  jwtToken: null,
  telemetry: [],
  login: (user, token) => set({ user, jwtToken: token }),
  logout: () => set({ user: null, jwtToken: null }),
  addTelemetry: (data) => set((state) => ({ telemetry: [...state.telemetry, data] })),
}));
