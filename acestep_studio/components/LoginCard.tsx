"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";

export default function LoginCard({ onLocalHack }: { onLocalHack?: () => void }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const isLocal = !supabase;

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        if (!email || !supabase) return;

        // Persist prompt if present
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const prompt = params.get('initialPrompt');
            if (prompt) {
                localStorage.setItem('pendingPrompt', prompt);
            }
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: window.location.origin + '/studio' }
            });
            if (error) throw error;
            setSent(true);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (sent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-300">
                <div className="p-8 bg-zinc-900 border border-green-500/30 rounded-3xl max-w-sm text-center shadow-xl shadow-green-900/20">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">Check your email!</h3>
                    <p className="text-zinc-400 text-sm">We sent a magic link to <span className="text-white">{email}</span>.</p>
                    <button onClick={() => setSent(false)} className="mt-6 text-xs text-zinc-500 hover:text-white transition-colors">
                        Try different email
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full animate-in fade-in duration-500">
            <div className="w-full max-w-sm bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                {/* Glow Effect */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-purple-500/30 transition-colors"></div>

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 relative mb-4">
                            <Image src="/logo.png" alt="Logo" fill className="object-contain rounded-xl" />
                        </div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
                            Enter Studio
                        </h2>
                    </div>

                    {isLocal && (
                        <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                            <div className="flex items-start gap-2">
                                <span className="text-yellow-500 text-xs mt-0.5">⚠️</span>
                                <div className="flex-1">
                                    <p className="text-yellow-500 text-xs font-bold mb-1">LOCAL MODE</p>
                                    <p className="text-yellow-500/80 text-[10px] mb-2">Supabase keys missing. Auth is disabled.</p>
                                    <button
                                        onClick={onLocalHack}
                                        className="w-full py-1.5 bg-yellow-600/20 text-yellow-500 text-xs font-bold rounded hover:bg-yellow-600 hover:text-black transition-colors"
                                    >
                                        Continue as Guest
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-500 ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="producer@opentunes.ai"
                                disabled={isLocal}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || isLocal}
                            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Magic Link"}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-[10px] text-zinc-600">
                        By signing in, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
