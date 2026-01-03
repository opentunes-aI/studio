"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Sparkles, Zap, Bot, Coins, Waves } from "lucide-react";
import HomeShowcase from '@/components/HomeShowcase';
import HomePricing from '@/components/HomePricing';

export default function LandingPage() {
    const [prompt, setPrompt] = useState("");
    const router = useRouter();

    const handleStart = (e: React.FormEvent) => {
        e.preventDefault();
        // Redirect to studio with prompt query param (to be handled by studio)
        const url = prompt ? `/studio?initialPrompt=${encodeURIComponent(prompt)}` : '/studio';
        router.push(url);
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 font-sans overflow-x-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-900/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 relative">
                            <Image src="/logo.png" alt="Opentunes Logo" fill className="object-contain rounded-lg" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            Opentunes<span className="text-purple-500">.ai</span>
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="#agents" className="hover:text-white transition-colors">AI Agents</Link>
                        <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href="/studio" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                            Sign In
                        </Link>
                        <Link href="/studio" className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
                            Launch Studio
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 pt-40 pb-0 px-6 container mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-bold mb-8 relative overflow-hidden group hover:scale-105 transition-transform backdrop-blur-md">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-shimmer" />
                    <Sparkles className="w-4 h-4 text-purple-400 relative z-10" />
                    <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-indigo-200 tracking-wide">
                        The Future of Decentralized Music Creation
                    </span>
                </div>

                <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-tight">
                    Your Agentic <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">AI Music Studio</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                    Direct a team of AI Agents to compose, write, and produce.
                    <br className="hidden md:block" />
                    Then <strong>Mint on Chain</strong> to own your royalties forever.
                </p>

                {/* Interactive Input */}
                <form onSubmit={handleStart} className="max-w-xl mx-auto mb-24 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative flex items-center bg-black rounded-full border border-white/10 p-2 shadow-2xl">
                        <input
                            type="text"
                            placeholder="Describe your dream track (e.g., 'Chill lofi beat with rain sounds')"
                            className="flex-1 bg-transparent border-none outline-none text-white px-6 py-3 placeholder:text-gray-600"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                        <button type="submit" className="bg-white text-black rounded-full p-3 hover:bg-gray-200 transition-colors">
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </form>

                {/* Feature Grid */}
                <div id="features" className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto text-left mb-20">
                    {/* Card 1: Agents */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Agentic Co-Creation</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Don't just prompt. Direct a team of specialized agents:
                            <span className="text-white"> The Producer</span>,
                            <span className="text-white"> The Lyricist</span>,
                            <span className="text-white"> The Critic</span>, and
                            <span className="text-white"> The Visualizer</span>.
                        </p>
                    </div>

                    {/* Card 2: Web3 */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Coins className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">On-Chain Ownership</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Stop renting your creativity. Mint your AI generated tracks as NFTs to
                            enable instant monetization and royalty tracking.
                        </p>
                    </div>

                    {/* Card 3: Quality */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-colors group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Waves className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Studio Fidelity</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Powered by **ACE-Step** 3.5B. Generate 48kHz stereo mastery with
                            granular control over instruments, mood, and mixing.
                        </p>
                    </div>
                </div>

                {/* New Components */}
                <HomeShowcase />
                <HomePricing />

            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 bg-black/80">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-sm">
                    <div>© 2026 Opentunes AI Inc.</div>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
                        <Link href="#" className="hover:text-white transition-colors">Discord</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
