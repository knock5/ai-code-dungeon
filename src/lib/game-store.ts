// ============================================================
// Game State — Zustand store dengan localStorage persistence
// Menyimpan: hero stats, XP, level, completed quests, dll
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface HeroStats {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  completedQuests: string[];
  totalQuestsCompleted: number;
  currentStreak: number;
  lastPlayedDate: string | null;
  badges: string[];
}

interface GameActions {
  setHeroName: (name: string) => void;
  addXP: (amount: number) => { leveledUp: boolean; newLevel: number };
  completeQuest: (questId: string) => void;
  takeDamage: (amount: number) => void;
  healHP: (amount: number) => void;
  resetGame: () => void;
  updateStreak: () => void;
}

type GameStore = HeroStats & GameActions;

const INITIAL_STATE: HeroStats = {
  name: "",
  level: 1,
  xp: 0,
  xpToNext: 200,
  hp: 100,
  maxHp: 100,
  completedQuests: [],
  totalQuestsCompleted: 0,
  currentStreak: 0,
  lastPlayedDate: null,
  badges: [],
};

// XP required to reach next level (scales up per level)
function calcXpToNext(level: number): number {
  return Math.floor(200 * Math.pow(1.4, level - 1));
}

// Max HP increases with level
function calcMaxHp(level: number): number {
  return 100 + (level - 1) * 20;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setHeroName: (name) => set({ name }),

      addXP: (amount) => {
        const state = get();
        let { xp, level, xpToNext } = state;
        let leveledUp = false;

        xp += amount;

        // Handle level up (bisa naik multiple level sekaligus)
        while (xp >= xpToNext) {
          xp -= xpToNext;
          level += 1;
          xpToNext = calcXpToNext(level);
          leveledUp = true;
        }

        const newMaxHp = leveledUp ? calcMaxHp(level) : state.maxHp;

        set({
          xp,
          level,
          xpToNext,
          maxHp: newMaxHp,
          hp: leveledUp ? newMaxHp : state.hp, // restore HP on level up
        });

        return { leveledUp, newLevel: level };
      },

      completeQuest: (questId) => {
        const state = get();
        if (state.completedQuests.includes(questId)) return;
        set({
          completedQuests: [...state.completedQuests, questId],
          totalQuestsCompleted: state.totalQuestsCompleted + 1,
        });
      },

      takeDamage: (amount) => {
        const { hp } = get();
        set({ hp: Math.max(0, hp - amount) });
      },

      healHP: (amount) => {
        const { hp, maxHp } = get();
        set({ hp: Math.min(maxHp, hp + amount) });
      },

      updateStreak: () => {
        const { lastPlayedDate, currentStreak } = get();
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (lastPlayedDate === today) return; // already updated today

        const newStreak =
          lastPlayedDate === yesterday ? currentStreak + 1 : 1;

        set({ currentStreak: newStreak, lastPlayedDate: today });
      },

      resetGame: () => set(INITIAL_STATE),
    }),
    {
      name: "ai-code-dungeon-hero",
      version: 1,
    }
  )
);

// ============================================================
// Selectors (computed values)
// ============================================================
export const selectXpPercent = (state: GameStore) =>
  Math.floor((state.xp / state.xpToNext) * 100);

export const selectHpPercent = (state: GameStore) =>
  Math.floor((state.hp / state.maxHp) * 100);

export const selectIsQuestCompleted = (questId: string) => (state: GameStore) =>
  state.completedQuests.includes(questId);

export const selectChapterProgress = (chapterQuests: string[]) => (state: GameStore) => {
  const completed = chapterQuests.filter((id) =>
    state.completedQuests.includes(id)
  ).length;
  return { completed, total: chapterQuests.length };
};
