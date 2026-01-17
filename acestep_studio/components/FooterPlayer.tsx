"use client";
import { useEffect, useState, useRef } from "react";
import { useStudioStore } from "@/utils/store";
import { Play, Pause, SkipForward, SkipBack, Volume2, Download } from "lucide-react";

export default function FooterPlayer() {
    const { currentTrackName, currentTrackUrl } = useStudioStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Find existing global audio
        const el = document.getElementById('global-audio') as HTMLAudioElement;
        if (el) {
            audioRef.current = el;

            const updateState = () => {
                setIsPlaying(!el.paused);
                setProgress(el.currentTime);
                setDuration(el.duration || 0);
            };

            el.addEventListener('play', updateState);
            el.addEventListener('pause', updateState);
            el.addEventListener('timeupdate', updateState);
            el.addEventListener('loadedmetadata', updateState);

            // Initial state
            updateState();

            return () => {
                el.removeEventListener('play', updateState);
                el.removeEventListener('pause', updateState);
                el.removeEventListener('timeupdate', updateState);
                el.removeEventListener('loadedmetadata', updateState);
            };
        }
    }, []);

    function togglePlay() {
        if (audioRef.current) {
            if (audioRef.current.paused) audioRef.current.play();
            else audioRef.current.pause();
        }
    }

    if (!currentTrackUrl) return null;

    return (
        <div className="h-20 bg-card border-t border-border flex items-center justify-between px-6 shrink-0 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
            {/* Track Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                <div className="w-12 h-12 bg-secondary rounded-md flex items-center justify-center shrink-0">
                    <span className="text-2xl">🎵</span>
                </div>
                <div className="min-w-0">
                    <div className="font-bold text-sm truncate text-foreground">{currentTrackName || "Unknown Track"}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">Opentunes Studio</div>
                </div>
            </div>

            {/* Controls */}
            <div className="text-center flex-1 w-full max-w-xs sm:w-auto flex flex-col items-center justify-center gap-1">
                <div className="flex items-center gap-4">
                    <button className="text-muted-foreground hover:text-foreground"><SkipBack className="w-5 h-5" /></button>
                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <button className="text-muted-foreground hover:text-foreground"><SkipForward className="w-5 h-5" /></button>
                </div>
                <div className="w-full flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                    <span>{formatTime(progress)}</span>
                    <input
                        type="range"
                        min="0" max={duration || 100}
                        value={progress}
                        onChange={(e) => {
                            if (audioRef.current) audioRef.current.currentTime = Number(e.target.value);
                        }}
                        className="flex-1 h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Volume / Extras (Hidden on Mobile) */}
            <div className="flex-1 justify-end items-center gap-4 hidden sm:flex">
                <button
                    onClick={() => {
                        if (!currentTrackUrl) return;
                        const a = document.createElement('a');
                        a.href = currentTrackUrl;
                        a.download = currentTrackName ? `${currentTrackName}.wav` : 'track.wav';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Download Track"
                >
                    <Download className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-muted-foreground" />
                    <div className="w-24 h-1.5 bg-secondary rounded-full" />
                </div>
            </div>
        </div>
    );
}

function formatTime(s: number) {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
