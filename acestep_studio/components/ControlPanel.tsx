"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { GenerationRequest, generateMusic, getLLMModels, generateLyrics } from "@/utils/api";
import { useStudioStore, MusicFormat } from "@/utils/store";
import { Play, Loader2, ChevronDown, ChevronUp, Sparkles, X, Wand2, Music2, Type } from "lucide-react";
import StructureBuilder from "./StructureBuilder";

const GENRES: Record<string, string> = {
    "Modern Pop": "pop, synth, drums, guitar, 120 bpm, upbeat, catchy, vibrant, female vocals, polished vocals",
    "Rock": "rock, electric guitar, drums, bass, 130 bpm, energetic, rebellious, gritty, male vocals, raw vocals",
    "Hip Hop": "hip hop, 808 bass, hi-hats, synth, 90 bpm, bold, urban, intense, male vocals, rhythmic vocals",
    "Lo-Fi Study": "lo-fi, chillhop, 80 bpm, vinyl crackle, piano, smooth, relaxing, instrumental, background music",
    "Epic Cinematic": "cinematic, orchestral, hans zimmer style, dramatic, 140 bpm, heavy drums, strings, choir, epic, trailer music",
    "Cyberpunk": "cyberpunk, darksynth, industrial, 130 bpm, futuristic, neon, heavy bass, distorted, instrumental",
    "EDM": "edm, synth, bass, kick drum, 128 bpm, euphoric, pulsating, energetic, instrumental",
    "Reggae": "reggae, guitar, bass, drums, 80 bpm, chill, soulful, positive, male vocals, smooth vocals",
    "Jazz": "jazz, saxophone, piano, double bass, 110 bpm, smooth, improvisational, soulful, male vocals, crooning vocals",
    "Metal": "metal, electric guitar, double kick drum, bass, 160 bpm, aggressive, intense, heavy, male vocals, screamed vocals",
    "R&B": "r&b, synth, bass, drums, 85 bpm, sultry, groovy, romantic, female vocals, silky vocals",
    "Chiptune": "8-bit, chiptune, nintendo style, retro, electronic, upbeat, catchy, synthesizer",
};

export default function ControlPanel() {
    // Global State
    const {
        prompt, setPrompt,
        trackTitle, setTrackTitle, // New
        lyrics, setLyrics,
        duration, setDuration,
        format, setFormat,
        seed, setSeed,
        steps, setSteps,
        cfgScale, setCfgScale,
        retakeVariance, setRetakeVariance,
        repaintStart, repaintEnd, setRepaintRegion,
        setActiveJobId,
        coverImage,
        parentId,
        setParentId,
        session
    } = useStudioStore();

    const [loading, setLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [lyricsTab, setLyricsTab] = useState<'text' | 'visual'>('text');

    // Lyrics Wizard State
    const [showLyricsWizard, setShowLyricsWizard] = useState(false);
    const [llmModels, setLlmModels] = useState<string[]>([]);
    const [lyricsTopic, setLyricsTopic] = useState("");
    const [lyricsMood, setLyricsMood] = useState("Emotional");
    const [lyricsLang, setLyricsLang] = useState("English");
    const [selectedModel, setSelectedModel] = useState("");
    const [generatingLyrics, setGeneratingLyrics] = useState(false);

    const searchParams = useSearchParams();

    useEffect(() => {
        const pid = searchParams.get('parentId');
        if (pid && setParentId) setParentId(pid);
    }, [searchParams, setParentId]);

    useEffect(() => {
        getLLMModels().then(models => {
            setLlmModels(models);
            if (models.length > 0) setSelectedModel(models[0]);
        });
    }, []);

    async function handleGenerate() {
        setLoading(true);
        try {
            const isRepaint = repaintStart !== null && repaintEnd !== null;
            const isRetake = seed !== null && retakeVariance > 0;

            // Prepend Title to prompt if present
            const effectivePrompt = trackTitle ? `Title: ${trackTitle}. ${prompt}` : prompt;

            const req: GenerationRequest = {
                prompt: effectivePrompt,
                lyrics,
                duration,
                infer_steps: steps,
                guidance_scale: cfgScale,
                seed: seed,
                format,
                cfg_type: "apg",
                scheduler_type: "euler",
                task: isRepaint ? "repainting" : (isRetake ? "retake" : "text2music"),
                retake_variance: retakeVariance,
                repaint_start: isRepaint ? repaintStart! : undefined,
                repaint_end: isRepaint ? repaintEnd! : undefined,
                parent_id: parentId || undefined,
                cover_image: coverImage || undefined,
                user_id: session?.user?.id
            };
            const job = await generateMusic(req);
            setActiveJobId(job.job_id);
        } catch (e: any) {
            alert("Failed: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleLyricsGenerate() {
        if (!selectedModel) {
            alert("No LLM Model selected (Is Ollama running?)");
            return;
        }
        setGeneratingLyrics(true);
        try {
            const result = await generateLyrics(lyricsTopic, lyricsMood, lyricsLang, selectedModel);
            setLyrics(result);
            setShowLyricsWizard(false);
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setGeneratingLyrics(false);
        }
    }

    return (
        <div className="w-96 bg-black/40 backdrop-blur-3xl border-r border-white/10 h-full flex flex-col shrink-0 z-20 shadow-2xl relative">

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold font-heading text-white tracking-tight flex items-center gap-2">
                        <span className="w-2 h-6 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full"></span>
                        Studio Controls
                    </h2>
                </div>

                {/* 1. Style Tags (Cloud) */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                        <Music2 className="w-3 h-3" /> Styles
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                        {Object.entries(GENRES).map(([name, promptText]) => (
                            <button
                                key={name}
                                onClick={() => setPrompt(promptText)}
                                className="px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all text-gray-400 active:scale-95"
                                title={promptText}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Main Inputs (Card) */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4 shadow-inner">

                    {/* Title Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                            Title <span className="text-[10px] lowercase opacity-50 font-normal">(optional)</span>
                        </label>
                        <input
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm font-bold text-white placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-heading tracking-wide"
                            placeholder="My Awesome Track"
                            value={trackTitle || ""}
                            onChange={e => setTrackTitle(e.target.value)}
                        />
                    </div>

                    {/* Prompt Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Description
                        </label>
                        <textarea
                            className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder:text-gray-700 resize-none transition-all custom-scrollbar leading-relaxed"
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="Describe style, instruments, mood..."
                        />
                    </div>
                </div>

                {/* 3. Lyrics (Card) */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-1 flex flex-col shadow-inner min-h-[18rem]">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                            <Type className="w-3 h-3" /> Lyrics
                        </label>

                        <div className="flex items-center gap-2">
                            <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/5">
                                <button
                                    onClick={() => setLyricsTab('text')}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${lyricsTab === 'text' ? 'bg-purple-500 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Text
                                </button>
                                <button
                                    onClick={() => setLyricsTab('visual')}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${lyricsTab === 'visual' ? 'bg-purple-500 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Blocks
                                </button>
                            </div>
                            <button
                                onClick={() => setShowLyricsWizard(true)}
                                className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/30 rounded-md border border-cyan-500/20"
                                title="AI Lyrics Wizard"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-1 relative">
                        {lyricsTab === 'text' ? (
                            <textarea
                                className="w-full h-full min-h-[14rem] bg-transparent border-none rounded-xl p-3 text-sm focus:outline-none text-white placeholder:text-gray-700 resize-none font-mono custom-scrollbar leading-relaxed"
                                value={lyrics}
                                onChange={e => setLyrics(e.target.value)}
                                placeholder="[verse]&#10;Line 1...&#10;Line 2..."
                            />
                        ) : (
                            <div className="h-full min-h-[14rem] overflow-hidden rounded-xl bg-black/20">
                                <StructureBuilder value={lyrics} onChange={setLyrics} />
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Duration Slider */}
                <div className="space-y-3 pt-2 px-1">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Duration</label>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/30 shadow-[0_0_10px_-4px_rgba(34,211,238,0.5)]">{duration}s</span>
                    </div>
                    <input
                        type="range" min="10" max="240"
                        value={duration}
                        onChange={e => setDuration(Number(e.target.value))}
                        className="w-full accent-cyan-400 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Variation Slider (Only if seeded) */}
                {seed !== null && (
                    <div className="bg-purple-900/10 p-3 rounded-xl border border-purple-500/20 shadow-sm animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between mb-2">
                            <label className="text-xs text-purple-300 font-bold flex items-center gap-1.5 uppercase tracking-wider"><Wand2 className="w-3 h-3" /> Remix Strength</label>
                            <span className="text-xs font-mono text-white bg-purple-500/20 px-1.5 rounded border border-purple-500/30">{retakeVariance}</span>
                        </div>
                        <input
                            type="range" min="0" max="1" step="0.05"
                            value={retakeVariance}
                            onChange={e => setRetakeVariance(Number(e.target.value))}
                            className="w-full accent-purple-500 h-1.5 bg-black/20 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1 font-medium">
                            <span>Exact</span>
                            <span>Wild</span>
                        </div>
                    </div>
                )}

                {/* Visualizer Preview (if valid) - moved to bottom or keep in sidebar if we want */}
                {coverImage && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 group shadow-lg shrink-0 animate-in fade-in zoom-in-95 duration-500">
                        <img src={coverImage} className="object-cover w-full h-full transition-transform group-hover:scale-105 duration-700" alt="Cover Art" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <span className="text-xs font-bold text-white flex items-center gap-1"><Sparkles className="w-3 h-3 text-purple-400" /> Generated Art</span>
                        </div>
                    </div>
                )}

                {/* Advanced Toggle */}
                <div className="pt-2 border-t border-white/5">
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300 py-2 transition-colors"
                    >
                        <span>Advanced Parameters</span>
                        {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {showAdvanced && (
                        <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 pb-4">
                            {/* Seed */}
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-medium">Seed (Random if empty)</label>
                                <input
                                    type="number"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white"
                                    placeholder="Random"
                                    value={seed || ""}
                                    onChange={e => setSeed(e.target.value ? Number(e.target.value) : null)}
                                />
                            </div>

                            {/* Steps */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between">
                                    <label className="text-xs text-gray-400 font-medium">Inference Steps</label>
                                    <span className="text-xs font-mono text-gray-500">{steps}</span>
                                </div>
                                <input
                                    type="range" min="10" max="200" step="1"
                                    value={steps}
                                    onChange={e => setSteps(Number(e.target.value))}
                                    className="w-full accent-gray-500 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* CFG */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between">
                                    <label className="text-xs text-gray-400 font-medium">Guidance Scale</label>
                                    <span className="text-xs font-mono text-gray-500">{cfgScale}</span>
                                </div>
                                <input
                                    type="range" min="1" max="30" step="0.5"
                                    value={cfgScale}
                                    onChange={e => setCfgScale(Number(e.target.value))}
                                    className="w-full accent-gray-500 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* Format */}
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-medium">Output Format</label>
                                <select
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-white/20"
                                    value={format}
                                    onChange={e => setFormat(e.target.value as MusicFormat)}
                                >
                                    <option value="wav">WAV (Lossless)</option>
                                    <option value="mp3">MP3 (Compressed)</option>
                                    <option value="flac">FLAC</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Spacer for floating button */}
                <div className="h-16" />
            </div>

            {/* Floating Action Button (Sticky Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/90 to-transparent z-30">
                {/* Repaint Indicator */}
                {repaintStart !== null && repaintEnd !== null && (
                    <div className="mb-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl animate-in slide-in-from-bottom-2 backdrop-blur-md flex justify-between items-center group">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1"><Wand2 className="w-3 h-3" /> Repaint Region</span>
                            <span className="text-xs font-mono text-white/80">{repaintStart.toFixed(2)}s — {repaintEnd.toFixed(2)}s</span>
                        </div>
                        <button onClick={() => setRepaintRegion(null, null)} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className={`w-full h-14 rounded-xl font-bold font-heading text-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-purple-900/40 relative overflow-hidden group ${repaintStart !== null ? 'bg-orange-600 text-white' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-t border-white/20'}`}
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    {loading ? <Loader2 className="animate-spin w-5 h-5 relative z-10" /> : (repaintStart !== null ? <Wand2 className="w-5 h-5 relative z-10" /> : (seed !== null && retakeVariance > 0) ? <Wand2 className="w-5 h-5 relative z-10" /> : <Play className="fill-current w-5 h-5 relative z-10" />)}
                    <span className="relative z-10">{loading ? "Processing..." : (repaintStart !== null ? "Refine Selection" : (seed !== null && retakeVariance > 0) ? "Remix Track" : "Generate Track")}</span>
                </button>
            </div>

            {/* Lyrics Wizard Modal */}
            {showLyricsWizard && (
                <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                        <h3 className="font-bold flex items-center gap-2 text-xl text-white font-heading"><Sparkles className="w-5 h-5 text-purple-400" /> Lyrics Wizard</h3>
                        <button onClick={() => setShowLyricsWizard(false)} className="p-1 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="space-y-5 flex-1 overflow-y-auto">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Model (Local Ollama)</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-purple-500/50 outline-none"
                                value={selectedModel}
                                onChange={e => setSelectedModel(e.target.value)}
                            >
                                {llmModels.length === 0 && <option value="">No models found (Check Ollama)</option>}
                                {llmModels.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Topic / Theme</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-purple-500/50 outline-none placeholder:text-gray-600"
                                placeholder="e.g. A cyberpunk detective loop in rain"
                                value={lyricsTopic}
                                onChange={e => setLyricsTopic(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mood</label>
                                <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none" value={lyricsMood} onChange={e => setLyricsMood(e.target.value)}>
                                    <option>Emotional</option>
                                    <option>Happy</option>
                                    <option>Dark</option>
                                    <option>Energetic</option>
                                    <option>Romantic</option>
                                    <option>Funny</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Language</label>
                                <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none" value={lyricsLang} onChange={e => setLyricsLang(e.target.value)}>
                                    <option>English</option>
                                    <option>Chinese</option>
                                    <option>Spanish</option>
                                    <option>Japanese</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLyricsGenerate}
                        disabled={generatingLyrics || !selectedModel}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-lg shadow-purple-900/20"
                    >
                        {generatingLyrics ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                        Generate Lyrics
                    </button>
                </div>
            )}
        </div>
    );
}
