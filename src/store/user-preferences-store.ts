import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserPreferences {
  defaultMode: "owner" | "student" | null;
  setDefaultMode: (mode: "owner" | "student") => void;
}

/**
 * Store user preferences like default mode for owners
 */
export const useUserPreferencesStore = create<UserPreferences>()(
  persist(
    (set) => ({
      defaultMode: null,

      setDefaultMode: (mode) => {
        set({ defaultMode: mode });
      },
    }),
    {
      name: "user-preferences",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
