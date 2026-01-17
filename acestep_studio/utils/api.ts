import { API_URL } from "./config";
import { supabase } from "./supabase";

export const API_BASE = API_URL;

/**
 * CACHE: Store the resolved URL so we don't hit Supabase on every request.
 */
let cachedApiUrl: string | null = null;

/**
 * Service Discovery:
 * Determines the correct Backend API URL based on environment.
 */
export async function resolveApiUrl(): Promise<string> {
    // 1. If explicitly set in Environment (e.g. .env.local), use it.
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // 2. Development Mode: Prefer Localhost (defined in config.ts default)
    // This prevents local dev from accidentally connecting to the slow Ngrok tunnel.
    if (process.env.NODE_ENV === 'development') {
        return API_URL;
    }

    // 3. Cache Hit
    if (cachedApiUrl) return cachedApiUrl;

    // 4. Production Service Discovery: Check Supabase for the active Ngrok Tunnel
    if (supabase) {
        try {
            console.log("🔍 Resolving API URL from Service Discovery...");
            const { data, error } = await supabase
                .from('system_config')
                .select('value')
                .eq('key', 'api_url')
                .single();

            if (data?.value) {
                // Strip trailing slash
                cachedApiUrl = data.value.replace(/\/$/, "");
                console.log("✅ Discovered Backend:", cachedApiUrl);
                return cachedApiUrl!;
            }
        } catch (e) {
            console.warn("⚠️ Service Discovery Failed:", e);
        }
    }

    // 5. Fallback: Return the default (likely localhost, which will fail in Prod but safe)
    return API_URL;
}

// --- Helper for fetching ---
async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const baseUrl = await resolveApiUrl();
    const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;
    return fetch(url, options);
}

// --- Typings ---
export interface GenerationRequest {
    title?: string;
    prompt: string;
    lyrics?: string;
    duration: number;
    infer_steps: number;
    guidance_scale?: number;
    seed?: number | null;
    format: string;
    cfg_type?: string;
    scheduler_type?: string;
    retake_variance?: number;
    repaint_start?: number;
    repaint_end?: number;
    task?: string;
    parent_id?: string;
    cover_image?: string;
    user_id?: string;
}

export interface JobStatus {
    job_id: string;
    status: "queued" | "processing" | "completed" | "failed";
    progress: number;
    message: string;
    result?: string[];
    error?: string;
}

// --- API Methods ---

export async function generateMusic(req: GenerationRequest): Promise<JobStatus> {
    const res = await apiFetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error("Failed to start generation");
    return res.json();
}

export async function getStatus(jobId: string): Promise<JobStatus> {
    const res = await apiFetch(`/status/${jobId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to get status");
    return res.json();
}

export async function getHistory(): Promise<{ files: string[] }> {
    try {
        const res = await apiFetch(`/history?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return { files: [] };
        return res.json();
    } catch (e) {
        console.error("getHistory API Error:", e);
        return { files: [] };
    }
}

export async function getTrackMetadata(filename: string): Promise<GenerationRequest | null> {
    try {
        const jsonName = filename.replace(/\.(wav|mp3|flac|ogg)$/i, "_input_params.json");
        const res = await apiFetch(`/outputs/${jsonName}`);
        if (!res.ok) {
            // Fallback for edge cases (legacy files?)
            const simpleJson = filename.replace(/\.(wav|mp3|flac|ogg)$/i, ".json");
            const res2 = await apiFetch(`/outputs/${simpleJson}`);
            if (res2.ok) return res2.json();
            return null;
        }
        return res.json();
    } catch {
        return null;
    }
}

export async function deleteLocalFile(filename: string): Promise<void> {
    const res = await apiFetch(`/files/${encodeURIComponent(filename)}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete file");
}

export async function renameLocalFile(filename: string, newName: string): Promise<void> {
    const res = await apiFetch(`/files/${encodeURIComponent(filename)}/rename?new_name=${encodeURIComponent(newName)}`, {
        method: "PATCH",
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Rename failed");
    }
}

export async function starTrack(filename: string): Promise<void> {
    const res = await apiFetch(`/files/${filename}/star`, { method: "POST" });
    if (!res.ok) throw new Error("Star failed");
}

// --- Ollama Integration ---

export async function getLLMModels(): Promise<string[]> {
    try {
        const res = await apiFetch("/llm/models");
        const data = await res.json();
        return data.models || [];
    } catch {
        return [];
    }
}

export async function generateLyrics(topic: string, mood: string, language: string, model: string): Promise<string> {
    const res = await apiFetch("/llm/generate_lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, mood, language, model }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Lyrics generation failed");
    }
    const data = await res.json();
    return data.lyrics;
}
