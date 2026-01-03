"use client";
import { useEffect, useState, useRef } from 'react';
import { Play, Heart, Download, Crown } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { API_URL } from '../utils/config';
import Avatar from './Avatar';

interface Song {
    id: string;
    title: string;
    prompt: string | null;
    audio_url: string | null;
    local_filename: string | null;
    play_count: number;
    profiles: {
        username: string | null;
        avatar_url: string | null;
    } | null;
}

export default function CommunityShowcase() {
    const [topSongs, setTopSongs] = useState<Song[]>([]);
    const [playing, setPlaying] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio();
            audioRef.current.onended = () => setPlaying(null);
        }

        async function fetchTop() {
            if (!supabase) return;
            const { data } = await supabase
                .from('songs')
                .select(`*, profiles(username, avatar_url)`)
                .eq('is_public', true)
                .order('play_count', { ascending: false })
                .limit(3);

            if (data) setTopSongs(data as any);
        }
        fetchTop();
    }, []);

    const togglePlay = (url: string | null, id: string) => {
        if (!url || !audioRef.current) return;
        if (playing === id) {
            audioRef.current.pause();
            setPlaying(null);
        } else {
            audioRef.current.src = url;
            audioRef.current.play();
            setPlaying(id);
        }
    };

    if (topSongs.length === 0) return null;

    return (
        <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Crown className="text-yellow-400" fill="currentColor" />
                Community Top 3
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topSongs.map((song, index) => {
                    const playUrl = song.audio_url || (song.local_filename ? `${API_URL}/outputs/${song.local_filename}` : null);
                    return (
                        <div key={song.id} className="relative group rounded-3xl overflow-hidden aspect-[4/5] bg-zinc-900 border border-white/10 hover:border-yellow-500/50 transition-all hover:scale-[1.02] shadow-2xl">
                            {/* Background / Cover */}
                            <div className={`absolute inset-0 bg-gradient-to-b ${index === 0 ? 'from-yellow-900/40' : index === 1 ? 'from-zinc-500/20' : 'from-orange-900/20'} to-black p-6 flex flex-col justify-end`}>
                                <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                                {/* Rank Badge */}
                                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 font-black text-xl text-white">
                                    #{index + 1}
                                </div>

                                {/* Content */}
                                <div className="relative z-10 space-y-4">
                                    {/* Play Button Big */}
                                    <div className="flex justify-center mb-4">
                                        {playUrl && (
                                            <button
                                                onClick={() => togglePlay(playUrl, song.id)}
                                                className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                                            >
                                                {playing === song.id ? (
                                                    <div className="flex gap-1 h-8">
                                                        <div className="w-2 bg-black animate-bounce delay-0"></div>
                                                        <div className="w-2 bg-black animate-bounce delay-100"></div>
                                                        <div className="w-2 bg-black animate-bounce delay-200"></div>
                                                    </div>
                                                ) : (
                                                    <Play size={32} fill="currentColor" />
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Text Info */}
                                    <div className="text-center">
                                        <h3 className="font-bold text-2xl text-white mb-1 line-clamp-1">{song.title || "Untitled"}</h3>
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            <Avatar url={song.profiles?.avatar_url} size={20} alt="" />
                                            <span className="text-sm text-gray-300">@{song.profiles?.username || "anon"}</span>
                                        </div>
                                        <div className="flex justify-center gap-4 text-xs font-mono opacity-60">
                                            <span>▶ {song.play_count} Plays</span>
                                            {/* <span>♥ {song.likes || 0} Likes</span>  Need aggregate */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
