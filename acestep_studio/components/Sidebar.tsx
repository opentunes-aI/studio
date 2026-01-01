"use client";
import { useEffect, useState } from "react";
import { getHistory, getTrackMetadata } from "@/utils/api";
import { Music2, RefreshCw, FileAudio, Wand2, Database } from "lucide-react";
import { useStudioStore } from "@/utils/store";
import { syncTrackToCloud, supabase } from "@/utils/supabase";

export default function Sidebar() {
    const [tab, setTab] = useState<'local' | 'cloud'>('local');
    const [files, setFiles] = useState<string[]>([]); // Local files
    const [cloudSongs, setCloudSongs] = useState<any[]>([]); // Cloud rows
    const [loading, setLoading] = useState(false);

    // Store Actions
    const setCurrentTrack = useStudioStore(s => s.setCurrentTrack);
    const currentTrackName = useStudioStore(s => s.currentTrackName);
    const setAllParams = useStudioStore(s => s.setAllParams);

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

    const API_BASE = "http://localhost:8000";

    async function handleRemix(e: React.MouseEvent, filename: string, cloudMeta?: any) {
        e.stopPropagation();

        let meta: any = null;
        if (cloudMeta) {
            meta = cloudMeta; // Use stored meta from DB
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

    return (
        <div className="w-64 bg-card border-l border-border h-full flex flex-col shrink-0 z-10 w-72">
            <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card/50 backdrop-blur">
                <div className="flex gap-1 bg-secondary/50 p-0.5 rounded-lg">
                    <button
                        onClick={() => setTab('local')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${tab === 'local' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Local
                    </button>
                    <button
                        onClick={() => setTab('cloud')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${tab === 'cloud' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Cloud
                    </button>
                </div>
                <button onClick={load} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary">
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {tab === 'local' ? (
                    files.map(f => {
                        const isActive = currentTrackName === f;
                        return (
                            <div
                                key={f}
                                onClick={() => setCurrentTrack(`${API_BASE}/outputs/${f}`, f)}
                                className={`group relative p-3 rounded-md cursor-pointer border transition-all ${isActive ? 'bg-primary/10 border-primary/50' : 'bg-secondary/20 hover:bg-secondary/80 border-transparent hover:border-primary/20'}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-primary text-white' : 'bg-background text-muted-foreground group-hover:text-primary'}`}>
                                        <FileAudio className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-xs font-medium truncate mb-0.5 ${isActive ? 'text-primary' : 'text-foreground'}`}>{f}</div>
                                        <div className="text-[10px] text-muted-foreground truncate font-mono">
                                            {f.split('_')[1] || 'Unknown Date'}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Sync "${f}" to Cloud Library?`)) {
                                                syncTrackToCloud(f).then(() => alert("Synced!"));
                                            }
                                        }}
                                        title="Sync to Cloud Library"
                                        className="p-1.5 bg-background border border-border rounded-md shadow hover:text-blue-500 hover:border-blue-500"
                                    >
                                        <Database className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={(e) => handleRemix(e, f)}
                                        title="Remix"
                                        className="p-1.5 bg-background border border-border rounded-md shadow hover:text-primary hover:border-primary"
                                    >
                                        <Wand2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    cloudSongs.map(song => {
                        const isActive = currentTrackName === song.local_filename;
                        // Note: Playback relies on local file existence for now
                        return (
                            <div
                                key={song.id}
                                onClick={() => setCurrentTrack(`${API_BASE}/outputs/${song.local_filename}`, song.local_filename)}
                                className={`group relative p-3 rounded-md cursor-pointer border transition-all ${isActive ? 'bg-primary/10 border-primary/50' : 'bg-secondary/20 hover:bg-secondary/80 border-transparent hover:border-primary/20'}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-purple-600 text-white' : 'bg-background text-muted-foreground group-hover:text-purple-500'}`}>
                                        <Music2 className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-xs font-medium truncate mb-0.5 ${isActive ? 'text-primary' : 'text-foreground'}`}>{song.title || song.local_filename}</div>
                                        <div className="text-[10px] text-muted-foreground truncate font-mono flex gap-2">
                                            <span>{new Date(song.created_at).toLocaleDateString()}</span>
                                            <span>{song.duration}s</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleRemix(e, song.local_filename, song.meta)}
                                        title="Remix"
                                        className="p-1.5 bg-background border border-border rounded-md shadow hover:text-primary hover:border-primary"
                                    >
                                        <Wand2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}

                {((tab === 'local' && files.length === 0) || (tab === 'cloud' && cloudSongs.length === 0)) && !loading && (
                    <div className="text-center text-xs text-muted-foreground mt-10 p-4 border border-dashed border-border rounded opacity-50">
                        {tab === 'local' ? "No local files found." : "No synced songs in cloud."}
                    </div>
                )}
            </div>
        </div>
    );
}
