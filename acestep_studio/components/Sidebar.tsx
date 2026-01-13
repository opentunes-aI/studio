"use client";
import { useEffect, useState } from "react";
import { getHistory, getTrackMetadata, deleteLocalFile, renameLocalFile } from "@/utils/api";
import { Music2, RefreshCw, FileAudio, Wand2, Database, Trash2, Share2, Pencil, GitFork, Download } from "lucide-react";
import { useStudioStore } from "@/utils/store";
import { syncTrackToCloud, deleteCloudSong, supabase } from "@/utils/supabase";
import { getSongGradient } from "@/utils/visuals";
import { API_URL } from "@/utils/config";

export default function Sidebar() {
    const [tab, setTab] = useState<'local' | 'cloud'>('local');
    const [files, setFiles] = useState<string[]>([]);
    const [cloudSongs, setCloudSongs] = useState<any[]>([]); // Cloud rows
    const [loading, setLoading] = useState(false);

    // Store Actions
    const setCurrentTrack = useStudioStore(s => s.setCurrentTrack);
    const setAllParams = useStudioStore(s => s.setAllParams);
    const setCredits = useStudioStore(s => s.setCredits);
    const setIsPro = useStudioStore(s => s.setIsPro);
    const credits = useStudioStore(s => s.credits);
    const isPro = useStudioStore(s => s.isPro);

    // Legacy / Other
    const setParentId = useStudioStore(s => s.setParentId);
    const currentTrackName = useStudioStore(s => s.currentTrackName);

    async function load() {
        setLoading(true);
        try {
            // Load Wallet
            if (supabase) {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        const { data: wallet, error } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
                        if (error) console.warn("Wallet fetch failed (Migration pending?):", error);
                        if (wallet) {
                            setCredits(wallet.balance);
                            setIsPro(wallet.is_pro);
                        }
                    }
                } catch (e) {
                    console.warn("Wallet system unavailable:", e);
                }
            }

            if (tab === 'local') {
                const res = await getHistory();
                setFiles(Array.isArray(res?.files) ? res.files : []);
            } else {
                if (!supabase) return;
                const { data, error } = await supabase
                    .from('songs')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (data) {
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
                    setCloudSongs(enriched);
                }
                if (error) console.error(error);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    useEffect(() => {
        load();

        let channel: any = null;
        async function initSub() {
            if (supabase) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // Remove existing if any (cleanup handles it, but safety)
                    channel = supabase
                        .channel('wallet-changes')
                        .on('postgres_changes', {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'wallets',
                            filter: `user_id=eq.${user.id}`
                        }, (payload: any) => {
                            const newBal = payload.new.balance;
                            setCredits(newBal);
                        })
                        .subscribe();
                }
            }
        }
        initSub();

        return () => { if (channel) supabase?.removeChannel(channel); };
    }, [tab]);

    const API_BASE = API_URL;

    async function handleRemix(e: React.MouseEvent, filename: string, cloudMeta?: any, songId?: string) {
        e.stopPropagation();

        setParentId(songId || null);

        let meta: any = null;
        if (cloudMeta) {
            meta = cloudMeta;
        } else {
            meta = await getTrackMetadata(filename);
        }

        if (meta) {
            setAllParams({
                prompt: meta.prompt || "",
                lyrics: meta.lyrics || "",
                duration: meta.duration || meta.audio_duration || 60,
                seed: (meta.manual_seeds && meta.manual_seeds[0]) || meta.seed || null,
                steps: meta.infer_step || meta.infer_steps || 60,
                cfgScale: meta.guidance_scale || 15,
                retakeVariance: 0.2
            });
            alert(`Loaded remix settings for ${filename.slice(0, 20)}...`);
        } else {
            alert(`Metadata not found. Cannot remix.`);
        }
    }

    async function handleDeleteLocal(e: React.MouseEvent, filename: string) {
        e.stopPropagation();
        if (!confirm(`Delete "${filename}" permanently? This cannot be undone.`)) return;
        try {
            await deleteLocalFile(filename);
            load();
        } catch (err) { alert(err); }
    }

    async function handleDeleteCloud(e: React.MouseEvent, song: any) {
        e.stopPropagation();
        if (!confirm(`Delete "${song.title}" from Cloud Library?`)) return;
        try {
            await deleteCloudSong(song);
            load();
        } catch (err) { alert(err); }
    }

    async function handleShare(e: React.MouseEvent, songId: string) {
        e.stopPropagation();
        const url = `${window.location.origin}/studio/song/${songId}`;
        navigator.clipboard.writeText(url);
        alert(`Link copied: ${url}`);
    }

    async function handleRenameCloud(e: React.MouseEvent, song: any) {
        e.stopPropagation();
        const newTitle = prompt("Rename song:", song.title || "Untitled");
        if (newTitle && newTitle.trim() !== "") {
            if (!supabase) return;
            const { error } = await supabase.from('songs').update({ title: newTitle }).eq('id', song.id);
            if (!error) {
                load();
            } else {
                console.error(error);
                alert("Failed to rename.");
            }
        }
    }

    async function handleRenameLocal(e: React.MouseEvent, filename: string) {
        e.stopPropagation();
        const baseName = filename.replace(/\.(wav|mp3|flac|ogg)$/i, "");
        const newName = prompt("Rename file (new name only, extension preserved):", baseName);
        if (newName && newName.trim() !== "" && newName !== baseName) {
            try {
                await renameLocalFile(filename, newName);
                load();
            } catch (err: any) { alert("Rename Failed: " + err.message); }
        }
    }

    return (
        <div className="w-full h-full flex flex-col shrink-0 z-10 bg-black/40 backdrop-blur-3xl border-l border-white/10 shadow-2xl">
            {/* Header / Tabs */}
            <div className="flex flex-col gap-4 p-5 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold font-heading text-white tracking-tight flex items-center gap-2">
                        <span className="w-2 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></span>
                        Library
                    </h2>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${isPro ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
                        <span className="text-xs font-mono font-bold">{credits} ¢</span>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5 flex-1">
                        <button
                            onClick={() => setTab('local')}
                            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${tab === 'local' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Local
                        </button>
                        <button
                            onClick={() => setTab('cloud')}
                            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${tab === 'cloud' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Cloud
                        </button>
                    </div>
                    <button onClick={load} className="text-gray-400 hover:text-white hover:bg-white/10 transition-all p-2 rounded-lg border border-white/5 bg-black/40">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {tab === 'local' ? (
                    files.map(f => {
                        const isActive = currentTrackName === f;
                        return (
                            <div
                                key={f}
                                onClick={() => setCurrentTrack(`${API_BASE}/outputs/${f}`, f)}
                                className={`group relative p-3 rounded-xl cursor-pointer border transition-all duration-200 ${isActive ? 'bg-purple-600/20 border-purple-500/50 shadow-[0_0_15px_-5px_rgba(124,58,237,0.3)]' : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10'} hover:translate-x-1`}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'shadow-inner' : ''}`}
                                        style={getSongGradient(f)}
                                    >
                                        <FileAudio className="w-5 h-5 text-white drop-shadow-md" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-xs font-bold truncate mb-1 font-heading ${isActive ? 'text-purple-300' : 'text-gray-200'}`}>{f}</div>
                                        <div className="text-[10px] text-gray-500 truncate font-mono opacity-70">
                                            {f.split('_')[1] || 'Unknown Date'}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5 bg-black/80 p-1.5 rounded-lg backdrop-blur-md shadow-xl border border-white/10 z-20">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Sync "${f}" to Cloud Library?`)) {
                                                syncTrackToCloud(f)
                                                    .then(() => alert("Synced!"))
                                                    .catch(err => alert("Sync Failed: " + err.message));
                                            }
                                        }}
                                        title="Sync to Cloud Library"
                                        className="p-1 hover:text-cyan-400 transition-colors"
                                    >
                                        <Database className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const link = document.createElement('a');
                                            link.href = `${API_BASE}/outputs/${f}`;
                                            link.download = f;
                                            link.click();
                                        }}
                                        title="Download"
                                        className="p-1 hover:text-green-400 transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleRenameLocal(e, f)}
                                        title="Rename"
                                        className="p-1 hover:text-yellow-400 transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleRemix(e, f)}
                                        title="Remix"
                                        className="p-1 hover:text-purple-400 transition-colors"
                                    >
                                        <Wand2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteLocal(e, f)}
                                        title="Delete"
                                        className="p-1 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    cloudSongs.map(song => {
                        const isActive = currentTrackName === song.local_filename;
                        return (
                            <div
                                key={song.id}
                                onClick={() => setCurrentTrack(`${API_BASE}/outputs/${song.local_filename}`, song.local_filename)}
                                className={`group relative p-3 rounded-xl cursor-pointer border transition-all duration-200 ${isActive ? 'bg-cyan-600/20 border-cyan-500/50 shadow-[0_0_15px_-5px_rgba(34,211,238,0.3)]' : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10'} hover:translate-x-1`}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'shadow-inner' : ''}`}
                                        style={getSongGradient(song.id)}
                                    >
                                        <Music2 className="w-5 h-5 text-white drop-shadow-md" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-xs font-bold truncate mb-1 font-heading ${isActive ? 'text-cyan-300' : 'text-gray-200'}`}>{song.title || song.local_filename}</div>
                                        {song.parent && (
                                            <div className="flex items-center gap-1 text-[9px] text-zinc-500 mb-0.5">
                                                <GitFork size={10} className="text-zinc-600" />
                                                <span className="truncate">Remix of {song.parent.title}</span>
                                            </div>
                                        )}
                                        <div className="text-[10px] text-gray-500 truncate font-mono opacity-70 flex gap-2">
                                            <span>{new Date(song.created_at).toLocaleDateString()}</span>
                                            <span>{song.duration}s</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5 bg-black/80 p-1.5 rounded-lg backdrop-blur-md shadow-xl border border-white/10 z-20">
                                    <button
                                        onClick={(e) => handleShare(e, song.id)}
                                        title="Share Link"
                                        className="p-1 hover:text-blue-400 transition-colors"
                                    >
                                        <Share2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(song.audio_url || `${API_BASE}/outputs/${song.local_filename}`, '_blank');
                                        }}
                                        title="Download"
                                        className="p-1 hover:text-green-400 transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleRenameCloud(e, song)}
                                        title="Rename"
                                        className="p-1 hover:text-green-400 transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleRemix(e, song.local_filename, song.meta, song.id)}
                                        title="Remix"
                                        className="p-1 hover:text-purple-400 transition-colors"
                                    >
                                        <Wand2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteCloud(e, song)}
                                        title="Delete"
                                        className="p-1 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}

                {((tab === 'local' && files.length === 0) || (tab === 'cloud' && cloudSongs.length === 0)) && !loading && (
                    <div className="text-center text-xs text-gray-600 mt-10 p-6 border border-dashed border-white/5 rounded-xl">
                        {tab === 'local' ? "No local files found." : "No synced songs in cloud."}
                    </div>
                )}
            </div>
        </div>
    );
}
