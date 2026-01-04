"use client";
import { useEffect, useState } from "react";
import { getHistory, getTrackMetadata, deleteLocalFile } from "@/utils/api";
import { Music2, RefreshCw, FileAudio, Wand2, Database, Trash2, Share2, Pencil } from "lucide-react";
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
    const currentTrackName = useStudioStore(s => s.currentTrackName);

    async function load() {
        setLoading(true);
        try {
            if (tab === 'local') {
                const res = await getHistory();
                setFiles(res.files);
            } else {
                if (!supabase) return;
                const { data, error } = await supabase
                    .from('songs')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (data) setCloudSongs(data);
                if (error) console.error(error);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    useEffect(() => { load(); }, [tab]);

    const API_BASE = API_URL;

    async function handleRemix(e: React.MouseEvent, filename: string, cloudMeta?: any) {
        e.stopPropagation();

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

    function handleShare(e: React.MouseEvent, songId: string) {
        e.stopPropagation();
        const url = `${window.location.origin}/song/${songId}`;
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

    return (
        <div className="w-72 h-full flex flex-col shrink-0 z-10 bg-black/20 backdrop-blur-xl border-l border-white/10 shadow-2xl">
            {/* Header / Tabs */}
            <div className="h-14 flex items-center justify-between px-4 shrink-0 border-b border-white/5 bg-white/5">
                <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                    <button
                        onClick={() => setTab('local')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${tab === 'local' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Local
                    </button>
                    <button
                        onClick={() => setTab('cloud')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${tab === 'cloud' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Cloud
                    </button>
                </div>
                <button onClick={load} className="text-gray-400 hover:text-white hover:bg-white/10 transition-all p-1.5 rounded-md">
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
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
                                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'shadow-inner' : ''}`}
                                        style={getSongGradient(f)}
                                    >
                                        <FileAudio className="w-4 h-4 text-white drop-shadow-md" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-xs font-bold truncate mb-0.5 font-heading ${isActive ? 'text-purple-300' : 'text-gray-200'}`}>{f}</div>
                                        <div className="text-[10px] text-gray-400 truncate font-mono opacity-70">
                                            {f.split('_')[1] || 'Unknown Date'}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5 bg-black/60 p-1 rounded-lg backdrop-blur-md">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Sync "${f}" to Cloud Library?`)) {
                                                syncTrackToCloud(f).then(() => alert("Synced!"));
                                            }
                                        }}
                                        title="Sync to Cloud Library"
                                        className="p-1 hover:text-cyan-400 transition-colors"
                                    >
                                        <Database className="w-3.5 h-3.5" />
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
                                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'shadow-inner' : ''}`}
                                        style={getSongGradient(song.id)}
                                    >
                                        <Music2 className="w-4 h-4 text-white drop-shadow-md" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-xs font-bold truncate mb-0.5 font-heading ${isActive ? 'text-cyan-300' : 'text-gray-200'}`}>{song.title || song.local_filename}</div>
                                        <div className="text-[10px] text-gray-400 truncate font-mono opacity-70 flex gap-2">
                                            <span>{new Date(song.created_at).toLocaleDateString()}</span>
                                            <span>{song.duration}s</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5 bg-black/60 p-1 rounded-lg backdrop-blur-md">
                                    <button
                                        onClick={(e) => handleShare(e, song.id)}
                                        title="Share Link"
                                        className="p-1 hover:text-blue-400 transition-colors"
                                    >
                                        <Share2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleRenameCloud(e, song)}
                                        title="Rename"
                                        className="p-1 hover:text-green-400 transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleRemix(e, song.local_filename, song.meta)}
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
