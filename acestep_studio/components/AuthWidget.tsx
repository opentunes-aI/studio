"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { LogIn, LogOut } from "lucide-react";
import { useStore } from "@/utils/store";
import UserMenu from "./UserMenu";

export default function AuthWidget() {
    const { session, setSession } = useStore();
    const [loading, setLoading] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (!supabase) return;
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        return () => subscription.unsubscribe();
    }, [setSession]);

    async function handleLogin() {
        console.log("[Auth] Starting login for:", email);
        if (!supabase || !email) {
            console.error("[Auth] Missing dependencies");
            return;
        }
        setLoading(true);
        try {
            console.log("[Auth] Calling Supabase API...");
            // Use dynamic redirect to ensure cloud users hit the studio domain
            const hostname = window.location.hostname;
            let redirectUrl = window.location.origin + '/studio';
            if (hostname === 'opentunes.ai' || hostname === 'www.opentunes.ai') {
                redirectUrl = 'https://studio.opentunes.ai';
            } else if (hostname === 'studio.opentunes.ai') {
                redirectUrl = 'https://studio.opentunes.ai';
            }

            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: redirectUrl }
            });
            console.log("[Auth] API Response:", error);

            if (error) {
                alert("Supabase Error: " + error.message);
            } else {
                alert(`Check ${email} for the login link!`);
                setShowInput(false);
            }
        } catch (e) {
            console.error("[Auth] Exception:", e);
            alert("Unexpected error: " + e);
        } finally {
            setLoading(false);
        }
    }

    if (!supabase) {
        return (
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-xs font-mono text-muted-foreground">Local Mode</span>
            </div>
        );
    }

    if (session?.user) {
        return <UserMenu />;
    }

    if (showInput) {
        return (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                <input
                    autoFocus
                    className="h-8 rounded-full border border-border bg-secondary/50 px-3 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    disabled={loading}
                />
                <button
                    onClick={handleLogin}
                    disabled={loading || !email}
                    className="bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center hover:brightness-110 active:scale-90 transition-all font-bold disabled:opacity-50"
                >
                    {loading ? <span className="animate-spin text-xs">⌛</span> : "->"}
                </button>
                <button onClick={() => setShowInput(false)} className="text-muted-foreground hover:text-foreground p-1"><LogOut className="w-3 h-3 rotate-180" /></button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowInput(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground hover:brightness-110 font-bold text-xs transition-all shadow-sm active:scale-95"
        >
            <LogIn className="w-3 h-3" />
            Sign In / Sync
        </button>
    );
}
