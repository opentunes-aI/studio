
import { createClient } from '@supabase/supabase-js';
import { API_URL } from './config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

import { getTrackMetadata } from "./api";

export async function syncTrackToCloud(filename: string) {
    if (!supabase) return;
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const meta = await getTrackMetadata(filename);
        if (!meta) {
            console.warn("No metadata found for:", filename);
            return;
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
                    // console.error("Storage Error (Bucket might not exist):", uploadError);
                } else {
                    const { data: { publicUrl: url } } = supabase.storage
                        .from('music')
                        .getPublicUrl(path);
                    publicUrl = url;
                }
            }
        } catch (uploadErr) {
            console.error("Upload Failed:", uploadErr);
        }

        const { error } = await supabase.from('songs').insert({
            user_id: user.id,
            title: meta.prompt.substring(0, 50) || "Untitled",
            prompt: meta.prompt,
            lyrics: meta.lyrics,
            duration: meta.duration,
            seed: meta.seed || 0,
            local_filename: filename,
            audio_url: publicUrl,
            status: 'completed',
            meta: meta
        });

        if (error) console.error("Cloud Sync Failed:", error);
        else console.log("Cloud Sync Success:", filename);
    } catch (e) {
        console.error("Sync Exception:", e);
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
