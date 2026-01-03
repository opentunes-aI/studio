"use client";
import { useEffect, useState, useRef } from 'react';
import { Play, Heart, Share2, MoreHorizontal, Flame, Clock, Trophy, Repeat, Download, UserPlus, MessageCircle, UserCheck } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/navigation';
import Avatar from './Avatar';
import Image from 'next/image';

interface Song {
    id: string;
    user_id: string;
    title: string;
    prompt: string | null;
    audio_url: string | null;
    local_filename: string | null;
    created_at: string;
    play_count: number;
    profiles: {
        username: string | null;
        avatar_url: string | null;
    } | null;
    // Likes loaded for current user
    likes: { user_id: string }[];
}

type SortMode = 'latest' | 'trending' | 'top';

export default function CommunityFeed() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [playing, setPlaying] = useState<string | null>(null);
    const [sort, setSort] = useState<SortMode>('latest');
    const [myId, setMyId] = useState<string | null>(null);
    const [following, setFollowing] = useState<Set<string>>(new Set());

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio();
            audioRef.current.onended = () => setPlaying(null);
        }

        // Get current user for like status
        supabase?.auth.getUser().then(({ data }) => {
            if (data.user) {
                setMyId(data.user.id);
                fetchFollows(data.user.id);
            }
        });

        fetchSongs();
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
        };
    }, [sort]);

    async function fetchFollows(userId: string) {
        if (!supabase) return;
        const { data } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', userId);
        if (data) {
            setFollowing(new Set(data.map(f => f.following_id)));
        }
    }

    async function fetchSongs() {
        if (!supabase) {
            setLoading(false);
            return;
        }
        setLoading(true);

        try {
            let query = supabase
                .from('songs')
                .select(`
                    *,
                    profiles (username, avatar_url),
                    likes (user_id)
                `)
                .eq('is_public', true);

            if (sort === 'latest') {
                query = query.order('created_at', { ascending: false });
            } else if (sort === 'trending' || sort === 'top') {
                query = query.order('play_count', { ascending: false });
            }

            const { data, error } = await query.limit(50);

            if (error) throw error;
            if (data) setSongs(data as any);
        } catch (error) {
            console.error('Error fetching community feed:', error);
        } finally {
            setLoading(false);
        }
    }

    const togglePlay = async (url: string | null, id: string) => {
        if (!url || !audioRef.current) return;

        if (playing === id) {
            audioRef.current.pause();
            setPlaying(null);
        } else {
            audioRef.current.src = url;
            audioRef.current.play().catch(console.error);
            setPlaying(id);

            // Increment Play Count
            await supabase?.rpc('increment_play_count', { song_id: id });
        }
    };

    const toggleLike = async (song: Song) => {
        if (!myId || !supabase) return;

        const hasLiked = song.likes.some(l => l.user_id === myId);

        // Optimistic UI Update
        const newSongs = songs.map(s => {
            if (s.id === song.id) {
                return {
                    ...s,
                    likes: hasLiked
                        ? s.likes.filter(l => l.user_id !== myId)
                        : [...s.likes, { user_id: myId }]
                };
            }
            return s;
        });
        setSongs(newSongs);

        if (hasLiked) {
            await supabase.from('likes').delete().match({ user_id: myId, song_id: song.id });
        } else {
            await supabase.from('likes').insert({ user_id: myId, song_id: song.id });
        }
    };

    const toggleFollow = async (targetUserId: string) => {
        if (!myId || !supabase || targetUserId === myId) return;

        const isFollowing = following.has(targetUserId);
        const newSet = new Set(following);
        if (isFollowing) newSet.delete(targetUserId);
        else newSet.add(targetUserId);
        setFollowing(newSet);

        if (isFollowing) {
            await supabase.from('follows').delete().match({ follower_id: myId, following_id: targetUserId });
        } else {
            await supabase.from('follows').insert({ follower_id: myId, following_id: targetUserId });
        }
    };

    const handleMessage = (targetUserId: string) => {
        alert(`Opening chat with user ${targetUserId} (Feature coming soon)`);
    };

    const handleRemix = (prompt: string | null) => {
        if (!prompt) return;
        router.push(`/studio?initialPrompt=${encodeURIComponent(prompt)}`);
    };

    return (
        <div>
            {/* Tabs / Filter Bar */}
            <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
                <button
                    onClick={() => setSort('latest')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${sort === 'latest' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                >
                    <Clock size={16} /> Latest
                </button>
                <button
                    onClick={() => setSort('trending')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${sort === 'trending' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                >
                    <Flame size={16} /> Trending
                </button>
            </div>

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="aspect-square bg-white/5 rounded-2xl"></div>)}
                </div>
            )}

            {!loading && songs.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p className="text-gray-400 mb-4">No tracks found.</p>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {songs.map((song) => {
                    const playUrl = song.audio_url || (song.local_filename ? `http://localhost:8000/outputs/${song.local_filename}` : null);
                    const isLiked = myId && song.likes && song.likes.some(l => l.user_id === myId);
                    const isFollowing = following.has(song.user_id);
                    const isMe = myId === song.user_id;

                    return (
                        <div
                            key={song.id}
                            className="group bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all hover:-translate-y-1 hover:shadow-2xl"
                        >
                            {/* Generative Cover */}
                            <div className="aspect-square relative bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4 flex flex-col justify-between">
                                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                                {/* Header: User & Follow */}
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md pl-1 pr-2 py-0.5 rounded-full border border-white/10 max-w-[70%]">
                                        <Avatar url={song.profiles?.avatar_url} size={20} alt="Au" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-bold text-white truncate leading-none">
                                                @{song.profiles?.username || "anon"}
                                            </span>
                                        </div>
                                        {!isMe && (
                                            <button
                                                onClick={() => toggleFollow(song.user_id)}
                                                className={`ml-0.5 p-0.5 rounded-full transition-colors ${isFollowing ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60 hover:text-white'}`}
                                                title={isFollowing ? 'Unfollow' : 'Follow'}
                                            >
                                                {isFollowing ? <UserCheck size={10} /> : <UserPlus size={10} />}
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {/* Message Button */}
                                        {!isMe && (
                                            <button
                                                onClick={() => handleMessage(song.user_id)}
                                                className="p-1.5 rounded-full bg-black/40 text-white/60 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all"
                                                title="Message Author"
                                            >
                                                <MessageCircle size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Play Count Badge (Moved to separate due to space) */}
                                {song.play_count > 0 && (
                                    <div className="absolute top-12 right-4 flex items-center gap-1 text-[10px] font-medium text-white/60 bg-black/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
                                        <Play size={8} fill="currentColor" /> {song.play_count}
                                    </div>
                                )}

                                {/* Play Button */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="pointer-events-auto">
                                        {playUrl ? (
                                            <button
                                                onClick={() => togglePlay(playUrl, song.id)}
                                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white text-black shadow-lg hover:scale-110 active:scale-95 ${playing === song.id ? 'scale-100' : 'scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100'}`}
                                            >
                                                {playing === song.id ? (
                                                    <div className="flex gap-0.5 h-4 items-center">
                                                        <div className="w-1 h-full bg-black animate-[bounce_1s_infinite]"></div>
                                                        <div className="w-1 h-full bg-black animate-[bounce_1.2s_infinite]"></div>
                                                        <div className="w-1 h-full bg-black animate-[bounce_0.8s_infinite]"></div>
                                                    </div>
                                                ) : (
                                                    <Play size={20} fill="currentColor" className="ml-0.5" />
                                                )}
                                            </button>
                                        ) : (
                                            <div className="px-2 py-0.5 bg-black/50 text-white text-[10px] rounded-full backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                No Preview
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="relative z-10 pointer-events-none">
                                    <div className="pointer-events-auto">
                                        <h3 className="font-bold text-sm text-white mb-0.5 line-clamp-1">{song.title || "Untitled"}</h3>
                                        <p className="text-[10px] text-gray-400 line-clamp-1 mb-2 opacity-80">
                                            {song.prompt || "AI generated track"}
                                        </p>

                                        <div className="flex items-center justify-between text-white/60">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => toggleLike(song)}
                                                    className={`flex items-center gap-1 text-[10px] transition-colors hover:text-pink-400 ${isLiked ? 'text-pink-500' : ''}`}
                                                >
                                                    <Heart size={12} fill={isLiked ? "currentColor" : "none"} />
                                                    <span>{song.likes.length > 0 ? song.likes.length : 'Like'}</span>
                                                </button>
                                                <button className="flex items-center gap-1 text-[10px] hover:text-blue-400 transition-colors">
                                                    <Share2 size={12} />
                                                </button>
                                            </div>

                                            <div className="flex gap-1.5">
                                                {playUrl && (
                                                    <a
                                                        href={playUrl}
                                                        download={`opentunes_${song.title || 'track'}.mp3`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center text-white/60 hover:text-green-400 transition-colors"
                                                        title="Download MP3"
                                                    >
                                                        <Download size={12} />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleRemix(song.prompt)}
                                                    className="flex items-center gap-1 text-[10px] font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 hover:bg-purple-500/20 transition-all"
                                                >
                                                    <Repeat size={10} />
                                                    Remix
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
