import { create } from 'zustand';

const useAuthStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem('userData'),
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
  API_BASE_URL:"https://api.manoharlalonline.com/eCRM/api",
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Initialize selectedWorkspace from local storage or set it to null
  selectedWorkspace: localStorage.getItem('selectedWorkspace')
    ? JSON.parse(localStorage.getItem('selectedWorkspace'))
    : null,

  updateSelectedWorkspace: (workspace) => {
    set({ selectedWorkspace: workspace });
    localStorage.setItem('selectedWorkspace', JSON.stringify(workspace));
  },

  // Initialize selectedBoard from local storage or set it to null
  selectedBoard: localStorage.getItem('selectedBoard')
    ? JSON.parse(localStorage.getItem('selectedBoard'))
    : null,

  updateSelectedBoard: (board) => {
    set({ selectedBoard: board });
    localStorage.setItem('selectedBoard', JSON.stringify(board));
  },

  // Initialize selectedCard from local storage or set it to null
  selectedCard: localStorage.getItem('selectedCard')
    ? JSON.parse(localStorage.getItem('selectedCard'))
    : null,

  updateSelectedCard: (card) => {
    set({ selectedCard: card });
    localStorage.setItem('selectedCard', JSON.stringify(card));
  },
}));

export default useAuthStore;
