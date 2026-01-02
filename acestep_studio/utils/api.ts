export const API_BASE = "http://127.0.0.1:8000";

export interface GenerationRequest {
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
}

export interface JobStatus {
    job_id: string;
    status: "queued" | "processing" | "completed" | "failed";
    progress: number;
    message: string;
    result?: string[];
    error?: string;
}

export async function generateMusic(req: GenerationRequest): Promise<JobStatus> {
    const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error("Failed to start generation");
    return res.json();
}

export async function getStatus(jobId: string): Promise<JobStatus> {
    const res = await fetch(`${API_BASE}/status/${jobId}`);
    if (!res.ok) throw new Error("Failed to get status");
    return res.json();
}

export async function getHistory(): Promise<{ files: string[] }> {
    const res = await fetch(`${API_BASE}/history`);
    return res.json();
}

export async function getTrackMetadata(filename: string): Promise<GenerationRequest | null> {
    try {
        const jsonName = filename.replace(/\.(wav|mp3|flac|ogg)$/i, "_input_params.json");
        const res = await fetch(`${API_BASE}/outputs/${jsonName}`);
        if (!res.ok) {
            // Fallback for edge cases (legacy files?)
            const simpleJson = filename.replace(/\.(wav|mp3|flac|ogg)$/i, ".json");
            const res2 = await fetch(`${API_BASE}/outputs/${simpleJson}`);
            if (res2.ok) return res2.json();
            return null;
        }
        return res.json();
    } catch {
        return null;
    }
}

export async function deleteLocalFile(filename: string): Promise<void> {
    const res = await fetch(`${API_BASE}/files/${filename}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete file");
}

// Ollama Integration
export async function getLLMModels(): Promise<string[]> {
    try {
        const res = await fetch(`${API_BASE}/llm/models`);
        const data = await res.json();
        return data.models || [];
    } catch {
        return [];
    }
}

export async function generateLyrics(topic: string, mood: string, language: string, model: string): Promise<string> {
    const res = await fetch(`${API_BASE}/llm/generate_lyrics`, {
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
