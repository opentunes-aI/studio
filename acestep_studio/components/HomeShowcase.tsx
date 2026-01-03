"use client";
import { Play } from "lucide-react";

import Image from "next/image";

const TRACKS = [
    { id: 1, title: "Midnight in Tokyo", artist: "@neo_jazz", genre: "Lofi Jazz", image: "/covers/cover_lofi.png" },
    { id: 2, title: "Cyberpunk Chase", artist: "@runner_2049", genre: "Synthwave", image: "/covers/cover_synthwave.png" },
    { id: 3, title: "Ethereal Dreams", artist: "@sky_walker", genre: "Ambient", image: "/covers/cover_ambient_v2.png" },
    { id: 4, title: "Bass Heavy", artist: "@drop_king", genre: "Dubstep", image: "/covers/cover_dubstep.png" },
];

export default function HomeShowcase() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Made with Opentunes</h2>
                    <p className="text-gray-400">Listen to what our community is creating right now.</p>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                    {TRACKS.map((track) => (
                        <div key={track.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-900 border border-white/10 hover:border-white/30 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1">
                            {/* Local Generated Cover Art */}
                            <Image
                                src={track.image}
                                alt={track.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                            />

                            {/* Dark Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                            {/* Content */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <h3 className="font-bold text-lg leading-tight mb-1 text-white">{track.title}</h3>
                                    <p className="text-xs text-gray-300 mb-4 opacity-80">{track.artist}</p>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] uppercase tracking-wider font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded text-white">{track.genre}</span>
                                        <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                                            <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <button className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest border-b border-purple-400/30 pb-1">
                        View Global Feed
                    </button>
                </div>
            </div>
        </section>
    );
}
