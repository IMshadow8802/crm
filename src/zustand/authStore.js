// authStore.js
import {create} from 'zustand';

const useAuthStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem('userData'),
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
  sidebarOpen: true, // Add sidebarOpen state
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

export default useAuthStore;