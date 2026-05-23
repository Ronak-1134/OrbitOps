// src/stores/useAppStore.js
import { create } from 'zustand'

const useAppStore = create((set) => ({
  // Loader
  isLoading: true,
  loadProgress: 0,
  loadPhase: 'boot',   // 'boot' | 'systems' | 'online' | 'done'

  setLoadProgress: (p) => set({ loadProgress: p }),
  setLoadPhase: (phase) => set({ loadPhase: phase }),
  setLoaded: () => set({ isLoading: false, loadPhase: 'done' }),

  // Navigation
  activeSection: 'hero',
  setActiveSection: (s) => set({ activeSection: s }),
}))

export default useAppStore