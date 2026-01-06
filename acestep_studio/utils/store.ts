import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';

export type MusicFormat = "wav" | "mp3" | "flac" | "ogg";

interface StudioState {
    // Auth
    session: Session | null;
    setSession: (s: Session | null) => void;

    // Playback State
    currentTrackUrl: string | null;
    currentTrackName: string | null;
    setCurrentTrack: (url: string | null, name: string | null) => void;

    // Form State
    prompt: string;
    lyrics: string;
    duration: number;
    format: MusicFormat;
    seed: number | null;
    steps: number;
    cfgScale: number;
    retakeVariance: number;
    repaintStart: number | null;
    repaintEnd: number | null;
    activeJobId: string | null;
    isConsoleOpen: boolean;
    coverImage: string | null;
    parentId: string | null;

    // Global Settings
    settings: {
        defaultFormat: "mp3" | "wav";
        defaultDuration: number;
        reducedMotion: boolean;
        autoSave: boolean;
    };
    updateSettings: (s: Partial<StudioState['settings']>) => void;

    // Actions
    setPrompt: (v: string) => void;
    setLyrics: (v: string) => void;
    setDuration: (v: number) => void;
    setFormat: (v: MusicFormat) => void;
    setSeed: (v: number | null) => void;
    setSteps: (v: number) => void;
    setCfgScale: (v: number) => void;
    setRetakeVariance: (v: number) => void;
    setRepaintRegion: (start: number | null, end: number | null) => void;
    setActiveJobId: (id: string | null) => void;
    setConsoleOpen: (v: boolean) => void;
    setCoverImage: (v: string | null) => void;
    setParentId: (id: string | null) => void;

    lastCompletedTrack: { id: string; name: string; url: string } | null;
    setLastCompletedTrack: (track: { id: string; name: string; url: string } | null) => void;

    setAllParams: (params: Partial<Omit<StudioState, 'setCurrentTrack' | 'setAllParams' | 'currentTrackUrl' | 'currentTrackName' | 'session' | 'setSession'>>) => void;
}

export const useStore = create<StudioState>((set) => ({
    // Defaults
    session: null,
    setSession: (s) => set({ session: s }),

    // Settings Defaults
    settings: {
        defaultFormat: "mp3",
        defaultDuration: 60,
        reducedMotion: false,
        autoSave: true
    },
    updateSettings: (s) => set((state) => {
        const newSettings = { ...state.settings, ...s };
        if (typeof window !== 'undefined') {
            localStorage.setItem('opentunes_settings', JSON.stringify(newSettings));
        }
        return { settings: newSettings };
    }),

    currentTrackUrl: null,
    currentTrackName: null,
    prompt: "upbeat techno with synth leads",
    lyrics: "",
    duration: 60,
    format: "wav",
    seed: null,
    steps: 60,
    cfgScale: 15.0,
    retakeVariance: 0.2,
    repaintStart: null,
    repaintEnd: null,
    activeJobId: null,
    isConsoleOpen: false,
    coverImage: null,
    parentId: null,

    setCurrentTrack: (url, name) => set({
        currentTrackUrl: url,
        currentTrackName: name,
        repaintStart: null,
        repaintEnd: null
    }),

    setPrompt: (v) => set({ prompt: v }),
    setLyrics: (v) => set({ lyrics: v }),
    setDuration: (v) => set({ duration: v }),
    setFormat: (v) => set({ format: v }),
    setSeed: (v) => set({ seed: v }),
    setSteps: (v) => set({ steps: v }),
    setCfgScale: (v) => set({ cfgScale: v }),
    setRetakeVariance: (v) => set({ retakeVariance: v }),
    setRepaintRegion: (s, e) => set({ repaintStart: s, repaintEnd: e }),
    setActiveJobId: (id) => set({ activeJobId: id, isConsoleOpen: true }),
    setConsoleOpen: (v) => set({ isConsoleOpen: v }),
    setCoverImage: (v) => set({ coverImage: v }),
    setParentId: (id) => set({ parentId: id }),

    lastCompletedTrack: null,
    setLastCompletedTrack: (track) => set({ lastCompletedTrack: track }),

    setAllParams: (params) => set((state) => ({ ...state, ...params })),
}));

// Backward compatibility alias if needed, or update consumers
export const useStudioStore = useStore;
