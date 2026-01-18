
import { createClient } from '@supabase/supabase-js';
import { API_URL } from './config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Custom Storage to allow Cross-Subdomain Session Sharing via Cookies
const CookieStorage = {
    getItem: (key: string) => {
        if (typeof document === 'undefined') return null;
        const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    },
    setItem: (key: string, value: string) => {
        if (typeof document === 'undefined') return;
        const hostname = window.location.hostname;
        let domainAttr = '';
        if (hostname.includes('opentunes.ai')) {
            domainAttr = '; domain=.opentunes.ai';
        }
        // Set cookie for 100 years
        document.cookie = `${key}=${JSON.stringify(encodeURIComponent(value))}; path=/; max-age=31536000${domainAttr}; SameSite=Lax; Secure`;
        // Note: supabase-js v2 stores the session object as a string, but sometimes we need to be careful with encoding.
        // Actually, supabase-js handles serialization. We just need to persist the string value.
        // Simplified:
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000${domainAttr}; SameSite=Lax; Secure`;
    },
    removeItem: (key: string) => {
        if (typeof document === 'undefined') return;
        const hostname = window.location.hostname;
        let domainAttr = '';
        if (hostname.includes('opentunes.ai')) {
            domainAttr = '; domain=.opentunes.ai';
        }
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT${domainAttr}; SameSite=Lax; Secure`;
    }
};

export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: true,
            storageKey: 'sb-auth-token',
            storage: (typeof window !== 'undefined') ? CookieStorage : undefined,
            // If server-side, storage should be undefined/null effectively 
        }
    })
    : null;

import { getTrackMetadata } from "./api";

export async function syncTrackToCloud(filename: string): Promise<boolean> {
    if (!supabase) throw new Error("Supabase not initialized");
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const meta = await getTrackMetadata(filename);
        if (!meta) {
            console.warn("No metadata found for:", filename);
            throw new Error("Local metadata missing");
        }

        // 1. Upload Audio to Storage
        let publicUrl = null;
        try {
            const response = await fetch(`${API_URL}/outputs/${filename}`);
            if (response.ok) {
                const blob = await response.blob();
                const path = `${user.id}/${filename}`;

                const { error: uploadError } = await supabase.storage
                    .from('music')
                    .upload(path, blob, { upsert: true });

                if (uploadError) {
                    throw uploadError;
                } else {
                    const { data: { publicUrl: url } } = supabase.storage
                        .from('music')
                        .getPublicUrl(path);
                    publicUrl = url;
                }
            } else {
                throw new Error("Could not read local file blob");
            }
        } catch (uploadErr) {
            console.error("Upload Failed:", uploadErr);
            throw uploadErr;
        }

        const { error } = await supabase.from('songs').insert({
            user_id: user.id,
            title: meta.title || meta.prompt.substring(0, 50) || "Untitled",
            prompt: meta.prompt,
            lyrics: meta.lyrics,
            duration: meta.duration,
            seed: meta.seed || 0,
            local_filename: filename,
            audio_url: publicUrl,
            status: 'completed',
            is_public: true, // Default to true for now
            parent_id: meta.parent_id || null,
            meta: meta
        });

        if (error) {
            console.error("Cloud Sync Failed:", error);
            throw error;
        }
        console.log("Cloud Sync Success:", filename);
        return true;
    } catch (e) {
        console.error("Sync Exception:", e);
        throw e;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deleteCloudSong(song: any) {
    if (!supabase) return;
    try {
        console.log("Deleting cloud song:", song.id);
        // Delete from DB
        const { error } = await supabase.from('songs').delete().eq('id', song.id);
        if (error) throw error;

        // Delete from Storage
        if (song.local_filename && song.user_id) {
            const path = `${song.user_id}/${song.local_filename}`;
            const { error: storageError } = await supabase.storage.from('music').remove([path]);
            if (storageError) console.warn("Storage delete failed:", storageError);
        }
    } catch (e) {
        console.error("Delete Failed:", e);
        throw e;
    }
}
