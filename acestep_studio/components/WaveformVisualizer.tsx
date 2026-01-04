"use client";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
// @ts-expect-error Regions plugin lacks types
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { useStudioStore } from "@/utils/store";
import { Play, Pause, AlertCircle } from "lucide-react";

export default function WaveformVisualizer() {
    const containerRef = useRef<HTMLDivElement>(null);
    const ws = useRef<WaveSurfer | null>(null);
    const { currentTrackUrl, currentTrackName, setRepaintRegion } = useStudioStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const mediaEl = document.getElementById('global-audio') as HTMLMediaElement;

        ws.current = WaveSurfer.create({
            container: containerRef.current,
            media: mediaEl || undefined,
            waveColor: '#4b5563', // gray-600
            progressColor: '#22d3ee', // cyan-400
            cursorColor: '#ffffff',
            barWidth: 3,
            barGap: 3,
            barRadius: 3,
            height: 250,
            normalize: true,
            backend: 'WebAudio',
        });

        // Initialize Regions
        const wsRegions = ws.current.registerPlugin(RegionsPlugin.create());

        wsRegions.enableDragSelection({
            color: 'rgba(124, 58, 237, 0.3)', // Violet with opacity
            resize: true,
            drag: true,
        });

        // Event Handling
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wsRegions.on('region-created', (region: any) => {
            // Remove previous regions (single selection mode)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            wsRegions.getRegions().forEach((r: any) => {
                if (r.id !== region.id) r.remove();
            });
            setRepaintRegion(region.start, region.end);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wsRegions.on('region-updated', (region: any) => {
            setRepaintRegion(region.start, region.end);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wsRegions.on('region-clicked', (region: any, e: any) => {
            e.stopPropagation();
        });

        ws.current.on('interaction', () => {
            // Placeholder
        });

        ws.current.on('play', () => setIsPlaying(true));
        ws.current.on('pause', () => setIsPlaying(false));
        ws.current.on('finish', () => setIsPlaying(false));
        ws.current.on('error', (e) => setError(e.toString()));

        // Keyboard Shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!ws.current) return;
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.code === 'Space') {
                e.preventDefault();
                ws.current.playPause();
            } else if (e.code === 'ArrowLeft') {
                ws.current.skip(-5);
            } else if (e.code === 'ArrowRight') {
                ws.current.skip(5);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            ws.current?.destroy();
        }
    }, [setRepaintRegion]);

    useEffect(() => {
        if (currentTrackUrl && ws.current) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setError(null);
            ws.current.load(currentTrackUrl);
        }
    }, [currentTrackUrl]);

    function togglePlay() {
        if (ws.current) {
            ws.current.playPause();
        }
    }

    return (
        <div className="flex-1 bg-black relative flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-black to-black animate-pulse-slow" />

            <div className="z-10 absolute top-10 left-0 right-0 text-center pointer-events-none">
                {currentTrackName ? (
                    <div className="inline-block px-6 py-3 bg-black/40 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl pointer-events-auto animate-in slide-in-from-top-4">
                        <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest mr-3">Now Playing</span>
                        <span className="text-white font-heading font-medium text-lg drop-shadow-md">{currentTrackName}</span>
                    </div>
                ) : (
                    <div className="text-gray-500 font-mono text-xs px-6 py-3 border border-dashed border-white/10 rounded-full bg-white/5 backdrop-blur">
                        Select a track to visualize
                    </div>
                )}
                {error && (
                    <div className="mt-4 text-red-400 bg-red-950/50 border border-red-500/30 px-4 py-2 rounded-lg flex items-center justify-center gap-2 backdrop-blur-md">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}
            </div>

            <div ref={containerRef} className="w-full px-12 z-10" />

            {currentTrackUrl && (
                <div className="absolute bottom-10 z-20">
                    <button
                        onClick={togglePlay}
                        className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)] hover:bg-cyan-400 hover:text-black hover:scale-110 transition-all active:scale-95 group"
                    >
                        {isPlaying ? <Pause className="fill-current w-8 h-8" /> : <Play className="fill-current w-8 h-8 ml-1" />}
                    </button>
                </div>
            )}
        </div>
    );
}
