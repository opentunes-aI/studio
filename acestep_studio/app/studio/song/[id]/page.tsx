import { supabase } from "@/utils/supabase";
import SongPageClient from "./SongPageClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    if (!supabase) return { title: "Song Not Found" };

    const { data: song } = await supabase
        .from('songs')
        .select('*')
        .eq('id', params.id)
        .single();

    if (!song) return { title: "Song Not Found - Opentunes" };

    return {
        title: `${song.title || "Untitled"} - Opentunes.ai`,
        description: `Listen to this AI generated track: "${song.prompt}"`,
        openGraph: {
            title: song.title,
            description: song.prompt,
            type: "music.song",
        }
    };
}

export default async function SongPage({ params }: { params: { id: string } }) {
    if (!supabase) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-4">
                <div className="max-w-md text-center border border-red-500/50 bg-red-900/20 p-6 rounded-lg">
                    <h1 className="text-xl font-bold mb-2">Configuration Error</h1>
                    <p className="text-sm text-red-200">Supabase is not configured. Public sharing requires Cloud mode.</p>
                </div>
            </div>
        );
    }

    const { data: song, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !song) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-4">
                <h1 className="text-2xl font-bold mb-2 text-red-500">404</h1>
                <p className="text-muted-foreground">Song not found or private.</p>
            </div>
        );
    }

    // Force date type compatibility if needed, though usually automatic
    return <SongPageClient song={song} />;
}
