import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { API_BASE } from "@/utils/api";
import { useCredits } from "@/hooks/useCredits";
import { X, Check, Zap, Crown, Star, Sparkles } from "lucide-react";
import { supabase } from "@/utils/supabase";

type Plan = {
    id: string;
    name: string;
    price: number;
    credits: number;
    features: string[];
    color: string;
    popular?: boolean;
    isPack?: boolean;
};

const PLANS: Plan[] = [
    {
        id: "price_1SqJJQQSlQu7Rwj9wBMyU5qd",
        name: "Starter",
        price: 5,
        credits: 500,
        features: ["500 Monthly Credits", "Standard Queue", "Personal License"],
        color: "blue"
    },
    {
        id: "price_1SqJJRQSlQu7Rwj9DE1vwgBl",
        name: "Creator",
        price: 10,
        credits: 1200,
        popular: true,
        features: ["1,200 Monthly Credits", "Priority Generation", "Commercial License", "Stem Separation"],
        color: "purple"
    },
    {
        id: "price_1SqJJRQSlQu7Rwj9UGagxrde",
        name: "Studio",
        price: 20,
        credits: 3000,
        features: ["3,000 Monthly Credits", "Instant Queue", "Full Commercial Rights", "Model Fine-tuning"],
        color: "orange"
    }
];

const PACKS: Plan[] = [
    { id: "price_1SqJJSQSlQu7Rwj91fFSYbmv", name: "Refill 500", price: 5, credits: 500, features: [], color: "emerald", isPack: true },
    { id: "price_1SqJJSQSlQu7Rwj9tD86STRv", name: "Refill 1200", price: 10, credits: 1200, features: [], color: "emerald", isPack: true },
];

export default function CreditDialog({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { credits } = useCredits();
    const [loading, setLoading] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    if (!isOpen || !mounted) return null;

    async function handleBuy(plan: Plan) {
        setLoading(plan.id);

        try {
            const user = await supabase?.auth.getUser();
            if (!user?.data?.user) {
                alert("Please log in first!");
                return;
            }

            const res = await fetch(`${API_BASE}/billing/create-checkout-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.data.user.id,
                    email: user.data.user.email,
                    price_id: plan.id,
                    is_subscription: !plan.isPack
                })
            });

            if (!res.ok) throw new Error("Checkout Failed");
            const { url } = await res.json();
            window.location.href = url;

        } catch (e) {
            alert("Checkout Error: " + e);
        } finally {
            setLoading(null);
        }
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto py-10">
            <div className="w-[1000px] bg-[#0c0c12] rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden ring-1 ring-white/10 flex flex-col">

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-20 bg-white/5 p-2 rounded-full hover:bg-white/10">
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="text-center pt-12 pb-8 px-6 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none"></div>
                    <div className="inline-flex items-center gap-2 mb-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-mono text-gray-300">CURRENT BALANCE: <span className="text-white font-bold">{credits} CREDITS</span></span>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Upgrade your Studio</h2>
                    <p className="text-gray-400 max-w-lg mx-auto">
                        Unlock professional tools, commercial rights, and priority generation speeds.
                    </p>
                </div>

                {/* Main Plans Grid */}
                <div className="grid grid-cols-3 gap-6 px-12 pb-12">
                    {PLANS.map(plan => (
                        <div
                            key={plan.id}
                            className={`
                                relative flex flex-col p-6 rounded-2xl border transition-all duration-300 group
                                ${plan.popular
                                    ? 'bg-gradient-to-b from-purple-900/40 to-black border-purple-500/50 shadow-2xl shadow-purple-900/20 md:scale-105 z-10'
                                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/20'
                                }
                            `}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className={`text-lg font-bold mb-1 ${plan.popular ? 'text-white' : 'text-gray-300'}`}>{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                                    <span className="text-sm text-gray-500">/mo</span>
                                </div>
                                <div className={`text-sm font-mono mt-2 inline-block px-2 py-1 rounded-md ${plan.popular ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10 text-gray-400'}`}>
                                    {plan.credits} Credits
                                </div>
                            </div>

                            <div className="flex-1 space-y-3 mb-8">
                                {plan.features.map((feat, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                        <Check size={16} className={plan.popular ? 'text-purple-400' : 'text-gray-500'} />
                                        <span>{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleBuy(plan)}
                                disabled={!!loading}
                                className={`
                                    w-full py-3 rounded-xl font-bold text-sm transition-all
                                    ${plan.popular
                                        ? 'bg-white text-black hover:bg-gray-200'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                    }
                                `}
                            >
                                {loading === plan.id ? (
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto"></div>
                                ) : (
                                    "Subscribe"
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Top Up Section */}
                <div className="bg-black/40 border-t border-white/5 p-8 flex flex-col items-center">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <Sparkles size={16} className="text-emerald-400" />
                        Running low? One-time refills
                    </h3>
                    <div className="flex gap-4">
                        {PACKS.map(pack => (
                            <button
                                key={pack.id}
                                onClick={() => handleBuy(pack)}
                                disabled={!!loading}
                                className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/50 px-5 py-3 rounded-xl transition-all group"
                            >
                                <div className="text-left">
                                    <div className="text-white font-bold">{pack.name}</div>
                                    <div className="text-xs text-emerald-400 font-mono">{pack.credits} Credits</div>
                                </div>
                                <div className="h-8 w-[1px] bg-white/10"></div>
                                <div className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">${pack.price}</div>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-6">
                        Secure payments via Stripe. Subscriptions can be cancelled at any time.
                    </p>
                </div>

            </div>
        </div>,
        document.body
    );
}
