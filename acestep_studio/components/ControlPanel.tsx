"use client";
import { useState, useEffect } from "react";
import { GenerationRequest, generateMusic, getLLMModels, generateLyrics } from "@/utils/api";
import { useStudioStore, MusicFormat } from "@/utils/store";
import { Play, Loader2, ChevronDown, ChevronUp, Sparkles, X, Wand2 } from "lucide-react";
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

interface ControlPanelProps {
    onJobCreated: (jobId: string) => void;
}

export default function ControlPanel({ onJobCreated }: ControlPanelProps) {
    // Global State
    const {
        prompt, setPrompt,
        lyrics, setLyrics,
        duration, setDuration,
        format, setFormat,
        seed, setSeed,
        steps, setSteps,
        cfgScale, setCfgScale,
        retakeVariance, setRetakeVariance,
        repaintStart, repaintEnd, setRepaintRegion
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

            const req: GenerationRequest = {
                prompt,
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
            };
            const job = await generateMusic(req);
            onJobCreated(job.job_id);
        } catch (e) {
            alert("Failed: " + e);
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
        <div className="w-96 bg-card border-r border-border h-full flex flex-col p-4 gap-4 shrink-0 z-20 shadow-xl overflow-y-auto relative">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Studio Controls
            </h2>

            {/* Genre Preset */}
            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between items-center">
                    <span>Style Presets</span>
                    <span className="text-[10px] text-muted-foreground/50">Click to apply</span>
                </label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-0.5 custom-scrollbar">
                    {Object.entries(GENRES).map(([name, promptText]) => (
                        <button
                            key={name}
                            onClick={() => setPrompt(promptText)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-secondary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-foreground whitespace-nowrap active:scale-95 shadow-sm"
                            title={promptText}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Prompt */}
            <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prompt</label>
                <textarea
                    className="w-full h-24 bg-input border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50 resize-none"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Describe style, instruments, mood..."
                />
            </div>

            {/* Lyrics */}
            <div className="space-y-1 flex flex-col h-64 shrink-0 transition-all">
                <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lyrics</label>
                        <div className="flex bg-secondary/50 rounded-md p-0.5 ml-2 border border-border">
                            <button
                                onClick={() => setLyricsTab('text')}
                                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${lyricsTab === 'text' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Text
                            </button>
                            <button
                                onClick={() => setLyricsTab('visual')}
                                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${lyricsTab === 'visual' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Blocks
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLyricsWizard(true)}
                        className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                    >
                        <Sparkles className="w-3 h-3" /> <span className="hidden sm:inline">Wizard</span>
                    </button>
                </div>

                {lyricsTab === 'text' ? (
                    <textarea
                        className="w-full h-full bg-input border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50 resize-none font-mono custom-scrollbar"
                        value={lyrics}
                        onChange={e => setLyrics(e.target.value)}
                        placeholder="[verse]&#10;Line 1...&#10;Line 2..."
                    />
                ) : (
                    <div className="h-full border border-border rounded-md bg-input/30 p-1 overflow-hidden">
                        <StructureBuilder value={lyrics} onChange={setLyrics} />
                    </div>
                )}
            </div>

            {/* Duration */}
            <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</label>
                    <span className="text-xs font-mono text-primary">{duration}s</span>
                </div>
                <input
                    type="range" min="10" max="240"
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* Variation Slider (Only if seeded) */}
            {seed !== null && (
                <div className="pt-2 pb-2 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-secondary/50 p-3 rounded-lg border border-primary/20 shadow-sm">
                        <div className="flex justify-between mb-2">
                            <label className="text-xs text-primary font-bold flex items-center gap-1.5 uppercase tracking-wider"><Wand2 className="w-3 h-3" /> Remix Strength</label>
                            <span className="text-xs font-mono bg-background px-1.5 rounded">{retakeVariance}</span>
                        </div>
                        <input
                            type="range" min="0" max="1" step="0.05"
                            value={retakeVariance}
                            onChange={e => setRetakeVariance(Number(e.target.value))}
                            className="w-full accent-primary h-2 bg-background rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
                            <span>Exact</span>
                            <span>Subtle</span>
                            <span>Vary</span>
                            <span>Wild</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced Toggle */}
            <div className="pt-2 border-t border-border">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground py-2"
                >
                    <span>Advanced Settings</span>
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvanced && (
                    <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">

                        {/* Seed */}
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Seed (Empty = Random)</label>
                            <input
                                type="number"
                                className="w-full bg-input border border-border rounded p-2 text-xs"
                                placeholder="Random"
                                value={seed || ""}
                                onChange={e => setSeed(e.target.value ? Number(e.target.value) : null)}
                            />
                        </div>

                        {/* Steps */}
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <label className="text-xs text-muted-foreground">Inference Steps</label>
                                <span className="text-xs font-mono">{steps}</span>
                            </div>
                            <input
                                type="range" min="10" max="200" step="1"
                                value={steps}
                                onChange={e => setSteps(Number(e.target.value))}
                                className="w-full accent-primary h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* CFG */}
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <label className="text-xs text-muted-foreground">Guidance Scale</label>
                                <span className="text-xs font-mono">{cfgScale}</span>
                            </div>
                            <input
                                type="range" min="1" max="30" step="0.5"
                                value={cfgScale}
                                onChange={e => setCfgScale(Number(e.target.value))}
                                className="w-full accent-primary h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Format */}
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Format</label>
                            <select
                                className="w-full bg-input border border-border rounded p-2 text-xs"
                                value={format}
                                onChange={e => setFormat(e.target.value as MusicFormat)}
                            >
                                <option value="wav">WAV (High Quality)</option>
                                <option value="mp3">MP3</option>
                                <option value="flac">FLAC</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>


            <div className="flex-1" />

            {/* Repaint Indicator */}
            {repaintStart !== null && repaintEnd !== null && (
                <div className="mb-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-md animate-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-orange-500 flex items-center gap-1"><Wand2 className="w-3 h-3" /> Repaint Active</span>
                        <button onClick={() => setRepaintRegion(null, null)} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                    </div>
                    <div className="text-xs font-mono mt-1 text-foreground">
                        {repaintStart.toFixed(2)}s — {repaintEnd.toFixed(2)}s
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                        Correcting lyrics/audio in this region.
                    </div>
                </div>
            )}

            <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full h-12 rounded-md font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none mt-2 ${repaintStart !== null ? 'bg-orange-600 text-white' : 'bg-primary text-primary-foreground'}`}
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (repaintStart !== null ? <Wand2 className="w-5 h-5" /> : (seed !== null && retakeVariance > 0) ? <Wand2 className="w-5 h-5" /> : <Play className="fill-current w-5 h-5" />)}
                {loading ? "Processing..." : (repaintStart !== null ? "Repaint Region" : (seed !== null && retakeVariance > 0) ? "Remix Track" : "Generate Track")}
            </button>

            {/* Lyrics Wizard Modal */}
            {showLyricsWizard && (
                <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm p-4 flex flex-col gap-4 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                        <h3 className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Lyrics Wizard</h3>
                        <button onClick={() => setShowLyricsWizard(false)}><X className="w-5 h-5 opacity-50 hover:opacity-100" /></button>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground">Model (Local Ollama)</label>
                            <select
                                className="w-full bg-input border border-border rounded p-2 text-xs"
                                value={selectedModel}
                                onChange={e => setSelectedModel(e.target.value)}
                            >
                                {llmModels.length === 0 && <option value="">No models found (Check Ollama)</option>}
                                {llmModels.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-muted-foreground">Topic</label>
                            <input
                                className="w-full bg-input border border-border rounded p-2 text-xs"
                                placeholder="e.g. A breakup in the rain"
                                value={lyricsTopic}
                                onChange={e => setLyricsTopic(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground">Mood</label>
                                <select className="w-full bg-input border border-border rounded p-2 text-xs" value={lyricsMood} onChange={e => setLyricsMood(e.target.value)}>
                                    <option>Emotional</option>
                                    <option>Happy</option>
                                    <option>Dark</option>
                                    <option>Energetic</option>
                                    <option>Romantic</option>
                                    <option>Funny</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground">Language</label>
                                <select className="w-full bg-input border border-border rounded p-2 text-xs" value={lyricsLang} onChange={e => setLyricsLang(e.target.value)}>
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
                        className="w-full bg-primary text-primary-foreground h-10 rounded-md font-bold hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {generatingLyrics ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        Generate Lyrics
                    </button>
                </div>
            )}
        </div>
    );
}
