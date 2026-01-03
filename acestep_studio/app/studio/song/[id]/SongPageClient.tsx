"use client";
import { useStudioStore } from "@/utils/store";
import { Play, Share2, Wand2 } from "lucide-react";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SongPageClient({ song }: { song: any }) {
    const router = useRouter();
    const { setCurrentTrack, setAllParams, currentTrackUrl } = useStudioStore();

    const isPlayingThis = currentTrackUrl === song.audio_url;

    // Auto-load track if not playing anything?
    // Maybe better to wait for user to click play.

    function handlePlay() {
        if (!song.audio_url) {
            alert("No audio URL available for this song.");
            return;
        }
        setCurrentTrack(song.audio_url, song.title);
    }

    function handleRemix() {
        const meta = song.meta || {};
        setAllParams({
            prompt: song.prompt,
            lyrics: song.lyrics || "",
            duration: song.duration,
            seed: song.seed,
            steps: meta.infer_steps || 60,
            cfgScale: meta.guidance_scale || 15,
            retakeVariance: 0.2
        });
        router.push("/");
    }

    function handleShare() {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
    }

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            {/* Hero Section */}
            <div className="flex-1 flex flex-col items-center justify-center relative p-8">
                {/* Background Blur */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl animate-pulse" />
                </div>

                <div className="z-10 text-center max-w-2xl w-full space-y-6">
                    {/* Title & Meta */}
                    <div className="space-y-2">
                        <div className="text-xs font-mono text-primary uppercase tracking-wider mb-2">Opentunes.ai Generated Track</div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">{song.title}</h1>
                        <p className="text-lg text-muted-foreground italic">"{song.prompt}"</p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4 py-6">
                        <button
                            onClick={handlePlay}
                            className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:brightness-110 hover:scale-105 transition-all shadow-xl shadow-primary/20"
                        >
                            <Play className="fill-current w-5 h-5" />
                            {isPlayingThis ? "Replay" : "Play Now"}
                        </button>
                    </div>

                    {/* Waveform Wrapper */}
                    <div className="h-48 w-full bg-card/30 rounded-xl border border-white/5 overflow-hidden relative shadow-inner">
                        {/* We can use WaveformVisualizer here. It attaches to global audio. 
                             If global audio is playing THIS song, it visualizes it. 
                         */}
                        <WaveformVisualizer />
                    </div>

                    {/* Secondary Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-muted-foreground pt-4 border-t border-white/5">
                        <div>
                            <span className="block text-white/50 mb-1">Duration</span>
                            {song.duration}s
                        </div>
                        <div>
                            <span className="block text-white/50 mb-1">Created</span>
                            {new Date(song.created_at).toLocaleDateString()}
                        </div>
                        <div>
                            <span className="block text-white/50 mb-1">Seed</span>
                            {song.seed}
                        </div>
                        <div>
                            <span className="block text-white/50 mb-1">Format</span>
                            {song.meta?.format || "wav"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="h-20 border-t border-border bg-card/80 backdrop-blur-md flex items-center justify-center gap-4 shrink-0 z-20">
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                >
                    <Share2 className="w-4 h-4" />
                    Share
                </button>
                <button
                    onClick={handleRemix}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
                >
                    <Wand2 className="w-4 h-4" />
                    Remix in Studio
                </button>
            </div>
        </div>
    );
}
