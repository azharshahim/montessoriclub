import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { TranslationKey } from '../i18n';

export type AgeBand = '0-2' | '3-5' | '6-8' | '9-12';
export type AvatarId = 'fox' | 'owl' | 'panda' | 'frog' | 'cat' | 'bunny' | 'bear' | 'penguin';

export interface ActivityProgress {
  /** Niveau adaptatif courant (1..maxLevel). */
  level: number;
  stars: number;
  sessions: number;
  successes: number;
  mistakes: number;
  lastPlayedAt: number | null;
}

export interface PlayDay {
  /** Date locale au format YYYY-MM-DD. */
  date: string;
  minutes: number;
}

export interface Profile {
  id: string;
  name: string;
  ageBand: AgeBand;
  avatar: AvatarId;
  createdAt: number;
  stars: number;
  progress: Record<string, ActivityProgress>;
  /** 14 derniers jours d'usage — stockés localement, jamais transmis. */
  playDays: PlayDay[];
  /** Limite quotidienne choisie par le parent (minutes), null = illimitée. */
  dailyLimitMinutes: number | null;
}

export const AGE_BANDS: AgeBand[] = ['0-2', '3-5', '6-8', '9-12'];

export const ageBandKey: Record<AgeBand, TranslationKey> = {
  '0-2': 'age.0_2',
  '3-5': 'age.3_5',
  '6-8': 'age.6_8',
  '9-12': 'age.9_12',
};

/** Catalogue de badges — dérivé du total d'étoiles, jamais stocké en double. */
export const BADGES = [
  { id: 'first', threshold: 5, emoji: '🌱' },
  { id: 'ten', threshold: 25, emoji: '🌟' },
  { id: 'thirty', threshold: 60, emoji: '🚀' },
  { id: 'master', threshold: 120, emoji: '👑' },
] as const;

export function dayKey(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function emptyProgress(): ActivityProgress {
  return { level: 1, stars: 0, sessions: 0, successes: 0, mistakes: 0, lastPlayedAt: null };
}

function newId(): string {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

interface ProfilesState {
  profiles: Profile[];
  selectedId: string | null;
  addProfile: (data: { name: string; ageBand: AgeBand; avatar: AvatarId }) => string;
  updateProfile: (id: string, patch: Partial<Pick<Profile, 'name' | 'avatar' | 'ageBand' | 'dailyLimitMinutes'>>) => void;
  deleteProfile: (id: string) => void;
  select: (id: string | null) => void;
  /** Enregistre un résultat de session et applique la difficulté adaptative. */
  recordSession: (args: {
    profileId: string;
    gameId: string;
    stars: number;
    mistakes: number;
    successes: number;
    maxLevel: number;
    /** false = session interrompue : étoiles créditées, niveau inchangé. */
    adaptLevel?: boolean;
  }) => void;
  addMinutes: (profileId: string, minutes: number) => void;
  resetProgress: (profileId: string) => void;
}

export const useProfiles = create<ProfilesState>()(
  persist(
    (set) => ({
      profiles: [],
      selectedId: null,

      addProfile: ({ name, ageBand, avatar }) => {
        const id = newId();
        const profile: Profile = {
          id,
          name: name.trim() || 'Explorateur',
          ageBand,
          avatar,
          createdAt: Date.now(),
          stars: 0,
          progress: {},
          playDays: [],
          dailyLimitMinutes: ageBand === '3-5' || ageBand === '0-2' ? 20 : 30,
        };
        set((state) => ({ profiles: [...state.profiles, profile], selectedId: id }));
        return id;
      },

      updateProfile: (id, patch) =>
        set((state) => ({
          profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      deleteProfile: (id) =>
        set((state) => {
          const profiles = state.profiles.filter((p) => p.id !== id);
          return {
            profiles,
            selectedId: state.selectedId === id ? (profiles[0]?.id ?? null) : state.selectedId,
          };
        }),

      select: (id) => set({ selectedId: id }),

      recordSession: ({ profileId, gameId, stars, mistakes, successes, maxLevel, adaptLevel = true }) =>
        set((state) => ({
          profiles: state.profiles.map((profile) => {
            if (profile.id !== profileId) return profile;
            const current = profile.progress[gameId] ?? emptyProgress();
            // Difficulté adaptative Montessori : réussite sans faute -> niveau +1,
            // trop d'erreurs -> on redescend d'un niveau sans jamais punir.
            let nextLevel = current.level;
            if (adaptLevel && mistakes === 0 && successes > 0) nextLevel = Math.min(maxLevel, current.level + 1);
            else if (adaptLevel && mistakes >= Math.max(3, successes)) nextLevel = Math.max(1, current.level - 1);

            const updated: ActivityProgress = {
              level: nextLevel,
              stars: current.stars + stars,
              sessions: current.sessions + 1,
              successes: current.successes + successes,
              mistakes: current.mistakes + mistakes,
              lastPlayedAt: Date.now(),
            };
            return {
              ...profile,
              stars: profile.stars + stars,
              progress: { ...profile.progress, [gameId]: updated },
            };
          }),
        })),

      addMinutes: (profileId, minutes) =>
        set((state) => ({
          profiles: state.profiles.map((profile) => {
            if (profile.id !== profileId) return profile;
            const key = dayKey();
            const existing = profile.playDays.find((d) => d.date === key);
            const playDays = existing
              ? profile.playDays.map((d) => (d.date === key ? { ...d, minutes: d.minutes + minutes } : d))
              : [...profile.playDays, { date: key, minutes }].slice(-14);
            return { ...profile, playDays };
          }),
        })),

      resetProgress: (profileId) =>
        set((state) => ({
          profiles: state.profiles.map((profile) =>
            profile.id === profileId ? { ...profile, stars: 0, progress: {}, playDays: [] } : profile
          ),
        })),
    }),
    { name: 'mc-profiles-v1', storage: createJSONStorage(() => AsyncStorage), version: 1 }
  )
);

// --- Sélecteurs dérivés (hors store pour éviter les re-rendus inutiles) ---

export function useActiveProfile(): Profile | null {
  return useProfiles((s) => s.profiles.find((p) => p.id === s.selectedId) ?? null);
}

export function starsToday(profile: Profile): number {
  const key = dayKey();
  const day = profile.playDays.find((d) => d.date === key);
  return day?.minutes ?? 0;
}

export function totalSessions(profile: Profile): number {
  return Object.values(profile.progress).reduce((sum, p) => sum + p.sessions, 0);
}

export function earnedBadges(stars: number) {
  return BADGES.filter((b) => stars >= b.threshold);
}

// Durées d’écran restent locales à l’appareil : aucune synchronisation réseau.
