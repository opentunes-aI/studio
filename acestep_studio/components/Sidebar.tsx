"use client";
import { useState } from "react";
import { API_URL } from "@/utils/config";
import { useStudioStore } from "@/utils/store";
import { useLocalLibrary } from "@/hooks/useLocalLibrary";
import { useCloudLibrary, CloudSong } from "@/hooks/useCloudLibrary";
import { useCredits } from "@/hooks/useCredits";
import { getTrackMetadata } from "@/utils/api";
import { syncTrackToCloud } from "@/utils/supabase";

import { Music2, RefreshCw, FileAudio, Wand2, Database, Trash2, Share2, Pencil, GitFork, Download, Check, AlertTriangle, Loader2, Star, Plus, Settings } from "lucide-react";
import { getSongGradient } from "@/utils/visuals";
import CreditDialog from "./CreditDialog";
import SettingsDialog from "./SettingsDialog";

// Helper for future Toast integration
const notify = (msg: string, type: 'info' | 'error' = 'info') => {
    // In Phase 2: Replace with sonner.toast()
    if (type === 'error') alert(msg);
    else console.log(msg);
};

export default function Sidebar() {
    const [tab, setTab] = useState<'local' | 'cloud'>('local');
    const [showCredits, setShowCredits] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Hooks
    const localLib = useLocalLibrary();
    const cloudLib = useCloudLibrary();
    const { credits, isPro } = useCredits();

    // Store
    const setCurrentTrack = useStudioStore(s => s.setCurrentTrack);
    const setAllParams = useStudioStore(s => s.setAllParams);
    const setParentId = useStudioStore(s => s.setParentId);
    const currentTrackName = useStudioStore(s => s.currentTrackName);

    // --- Actions ---

    // 1. Load / Refresh
    const load = () => {
        if (tab === 'local') localLib.refresh();
        else cloudLib.refresh();
    };

    // 2. Remix
    async function handleRemix(e: React.MouseEvent, filename: string, cloudMeta?: any, songId?: string) {
        e.stopPropagation();
        setParentId(songId || null);

        let meta: any = null;
        if (cloudMeta) meta = cloudMeta;
        else meta = await getTrackMetadata(filename);

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
            notify(`Loaded remix settings for ${filename}`);
        } else {
            notify(`Metadata not found.`, 'error');
        }
    }

    // 3. Local Actions
    const [renamingFile, setRenamingFile] = useState<string | null>(null);

    async function finishRename(filename: string, newName: string) {
        setRenamingFile(null);
        const baseName = filename.replace(/\.(wav|mp3|flac|ogg)$/i, "");
        if (!newName || newName.trim() === "" || newName === baseName) return;
        try {
            await localLib.renameFile(filename, newName);
        } catch (err: any) { notify(err.message, 'error'); }
    }

    async function handleSync(e: React.MouseEvent, filename: string) {
        e.stopPropagation();
        if (!confirm(`Sync "${filename}" to Cloud?`)) return;

        try {
            await syncTrackToCloud(filename);
            notify("Sync started (check cloud tab)");
        } catch (err: any) {
            notify("Sync Failed: " + err.message, 'error');
        }
    }

    // --- Render ---

    const isLoading = tab === 'local' ? localLib.loading : cloudLib.loading;

    return (
        <div className="w-full h-full flex flex-col shrink-0 z-10 bg-black/40 backdrop-blur-3xl border-l border-white/10 shadow-2xl">
            <CreditDialog isOpen={showCredits} onClose={() => setShowCredits(false)} />
            <SettingsDialog
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onOpenUpgrade={() => { setShowSettings(false); setShowCredits(true); }}
            />

            {/* Header / Tabs */}
            <div className="flex flex-col gap-4 p-5 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold font-heading text-white tracking-tight flex items-center gap-2">
                        <span className="w-2 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></span>
                        Library
                    </h2>
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-full border transition-colors cursor-pointer hover:bg-white/5 ${isPro ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-green-500/10 border-green-500/30 text-green-400'}`} onClick={() => setShowCredits(true)}>
                            <span className="text-xs font-mono font-bold">{credits} ¢</span>
                            <div className="bg-current/20 rounded-full p-0.5 hover:bg-current/40 transition-colors">
                                <Plus size={12} />
                            </div>
                        </div>
                        <button onClick={() => setShowSettings(true)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <Settings size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5 flex-1">
                        <button
                            onClick={() => setTab('local')}
                            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${tab === 'local' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Local
                        </button>
                        <button
                            onClick={() => setTab('cloud')}
                            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${tab === 'cloud' ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Cloud
                        </button>
                    </div>
                    <button onClick={load} className="text-gray-400 hover:text-white hover:bg-white/10 transition-all p-2 rounded-lg border border-white/5 bg-black/40">
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {tab === 'local' ? (
                    localLib.files.map(f => {
                        const isActive = currentTrackName === f;
                        return (
                            <div
                                key={f}
                                onClick={() => setCurrentTrack(`${API_URL}/outputs/${f}`, f)}
                                className={`group relative p-3 rounded-xl cursor-pointer border transition-all duration-200 ${isActive ? 'bg-purple-600/20 border-purple-500/50 shadow-purple-900/20' : 'bg-white/5 hover:bg-white/10 border-white/5'} hover:translate-x-1`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={getSongGradient(f)}>
                                        <FileAudio className="w-5 h-5 text-white drop-shadow-md" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {renamingFile === f ? (
                                            <input
                                                autoFocus
                                                type="text"
                                                defaultValue={f.replace(/\.(wav|mp3|flac|ogg)$/i, "")}
                                                className="w-full bg-black/50 text-xs text-white border border-purple-500 rounded px-1 outline-none"
                                                onBlur={(e) => finishRename(f, e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') finishRename(f, e.currentTarget.value);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <div className={`text-xs font-bold truncate mb-1 ${isActive ? 'text-purple-300' : 'text-gray-200'}`}>{f}</div>
                                        )}
                                        <div className="text-[10px] text-gray-500 truncate font-mono opacity-70">
                                            {f.split('_')[1] || 'Unknown Date'}
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Actions */}
                                <div className="absolute right-2 top-2 flex gap-1.5 bg-black/90 p-1.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <button onClick={(e) => { e.stopPropagation(); localLib.starFile(f).then(() => notify("Saved to Agent Memory")); }} title="Star (Save to Agent Memory)" className="p-1 hover:text-yellow-400"><Star size={14} /></button>
                                    <button onClick={(e) => handleSync(e, f)} title="Sync" className="p-1 hover:text-cyan-400"><Database size={14} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); setRenamingFile(f); }} title="Rename" className="p-1 hover:text-yellow-400"><Pencil size={14} /></button>
                                    <button onClick={(e) => handleRemix(e, f)} title="Remix" className="p-1 hover:text-purple-400"><Wand2 size={14} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete?")) localLib.deleteFile(f); }} title="Delete" className="p-1 hover:text-red-400"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    cloudLib.songs.map(song => (
                        <div
                            key={song.id}
                            onClick={() => setCurrentTrack(`${API_URL}/outputs/${song.local_filename}`, song.local_filename)}
                            className="group relative p-3 rounded-xl cursor-pointer border bg-white/5 hover:bg-white/10 border-white/5 hover:translate-x-1 transition-all"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={getSongGradient(song.id)}>
                                    <Music2 className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold truncate mb-1 text-gray-200">{song.title}</div>
                                    {song.parent && <div className="flex items-center gap-1 text-[9px] text-zinc-500"><GitFork size={10} /> Remix of {song.parent.title}</div>}
                                </div>
                            </div>
                            {/* Cloud Actions */}
                            <div className="absolute right-2 top-2 flex gap-1.5 bg-black/90 p-1.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <button onClick={(e) => { e.stopPropagation(); window.open(song.audio_url || `${API_URL}/outputs/${song.local_filename}`, '_blank'); }} className="p-1 hover:text-green-400"><Download size={14} /></button>
                                <button onClick={(e) => handleRemix(e, song.local_filename, song.meta, song.id)} className="p-1 hover:text-purple-400"><Wand2 size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete?')) cloudLib.deleteSong(song); }} className="p-1 hover:text-red-400"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
