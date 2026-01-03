import Link from 'next/link';
import { ArrowRight, Music, Sparkles, Zap } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 font-sans">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center">
                            <Music className="w-4 h-4 text-white" />
                        </div>
                        Opentunes.ai
                    </div>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <Link href="#" className="hover:text-white transition-colors">Features</Link>
                        <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
                        <Link href="#" className="hover:text-white transition-colors">Blog</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href="/studio" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                            Sign In
                        </Link>
                        <Link href="/studio" className="px-5 py-2 rounded-full bg-white text-black text-sm font-bold hover:scale-105 transition-transform">
                            Launch Studio
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <main className="pt-32 pb-16 px-6 container mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-400 mb-8 animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    <span>Now with Multi-Agent Orchestration</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 max-w-4xl mx-auto leading-tight">
                    Your Personal <br /> AI Music Producer.
                </h1>

                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Opentunes is the first <strong>Agentic Music Studio</strong>. Collaborate with AI Producers, Lyricists, and Art Directors to craft professional tracks in seconds.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/studio" className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-lg hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] transition-all flex items-center gap-2">
                        Start Creating Free
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link href="#" className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        Join Waiting List
                    </Link>
                </div>

                {/* Visual Placeholder */}
                <div className="mt-20 relative max-w-5xl mx-auto rounded-xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                    <div className="h-[400px] flex items-center justify-center text-gray-600 font-mono">
                        [App Screenshot Placeholder]
                    </div>
                </div>
            </main>

            {/* Placeholder Footer */}
            <footer className="border-t border-white/10 py-12 text-center text-gray-600 text-sm mt-20">
                © 2026 Opentunes AI Inc. | Built for the Future of Music.
            </footer>
        </div>
    );
}
