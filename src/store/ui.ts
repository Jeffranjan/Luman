import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  composeModalOpen: boolean;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setComposeModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  composeModalOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setComposeModalOpen: (open) => set({ composeModalOpen: open }),
}));
