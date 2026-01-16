import { useState, useEffect, useCallback } from "react";
import { supabase, deleteCloudSong } from "@/utils/supabase";

export interface CloudSong {
    id: string;
    title: string;
    created_at: string;
    duration: number;
    local_filename: string;
    parent_id?: string;
    parent?: { title: string };
    meta?: any;
    audio_url?: string;
}

export function useCloudLibrary() {
    const [songs, setSongs] = useState<CloudSong[]>([]);
    const [loading, setLoading] = useState(false);

    const loadSongs = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('songs')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                // Map Parents
                const parentIds = [...new Set(data.map((s: any) => s.parent_id).filter(Boolean))];
                const parentMap: Record<string, string> = {};

                if (parentIds.length > 0) {
                    const { data: parents } = await supabase.from('songs').select('id, title').in('id', parentIds);
                    if (parents) parents.forEach((p: any) => parentMap[p.id] = p.title);
                }

                const enriched = data.map((s: any) => ({
                    ...s,
                    parent: s.parent_id ? { title: parentMap[s.parent_id] || "Unknown" } : null
                }));
                setSongs(enriched);
            }
            if (error) console.error("Cloud fetch error:", error);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSongs();
    }, [loadSongs]);

    const deleteSong = async (song: CloudSong) => {
        try {
            await deleteCloudSong(song);
            setSongs(prev => prev.filter(s => s.id !== song.id));
        } catch (e: any) {
            throw new Error(e.message || "Delete failed");
        }
    };

    const renameSong = async (songId: string, newTitle: string) => {
        if (!supabase) return;
        const { error } = await supabase.from('songs').update({ title: newTitle }).eq('id', songId);
        if (error) throw new Error(error.message);
        setSongs(prev => prev.map(s => s.id === songId ? { ...s, title: newTitle } : s));
    };

    return {
        songs,
        loading,
        refresh: loadSongs,
        deleteSong,
        renameSong
    };
}
