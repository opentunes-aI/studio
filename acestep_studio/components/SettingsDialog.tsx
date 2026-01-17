import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X, Receipt, User, Settings, CreditCard, LogOut, Moon, Sun, Check, Plus, Trash2, Calendar } from "lucide-react";
import CreditDialog, { PLANS, Plan } from "./CreditDialog";
import { useBillingHistory } from "@/hooks/useBillingHistory";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { supabase } from "@/utils/supabase";
import { useCredits } from "@/hooks/useCredits";
import { API_BASE } from "@/utils/api";

interface SubDetails {
    status: string;
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
    plan_amount: number;
    plan_interval: string;
}

export default function SettingsDialog({ isOpen, onClose, onOpenUpgrade }: { isOpen: boolean, onClose: () => void, onOpenUpgrade: () => void }) {
    const [activeTab, setActiveTab] = useState<'general' | 'subscription' | 'billing'>('general');
    const [userEmail, setUserEmail] = useState<string>("");
    const [mounted, setMounted] = useState(false);
    const [portalLoading, setPortalLoading] = useState(false);
    const [subDetails, setSubDetails] = useState<SubDetails | null>(null);

    // Billing Data
    const { history, loading: historyLoading } = useBillingHistory();
    const { credits, isPro, subscriptionStatus, subscriptionTier } = useCredits();

    // Payment Methods
    const { methods, loading: pmLoading, attachMethod, detachMethod, setDefaultMethod } = usePaymentMethods();

    useEffect(() => {
        setMounted(true);
        supabase?.auth.getUser().then(({ data }) => {
            if (data.user?.email) setUserEmail(data.user.email);
        });
    }, []);

    useEffect(() => {
        if (activeTab === 'billing' && isPro) {
            // Fetch detailed subscription info
            supabase?.auth.getUser().then(async ({ data }) => {
                if (!data.user) return;
                try {
                    const res = await fetch(`${API_BASE}/billing/subscription-details/${data.user.id}`);
                    if (res.ok) {
                        const json = await res.json();
                        if (json.details) setSubDetails(json.details);
                    }
                } catch (e) { console.error(e); }
            });
        }
    }, [activeTab, isPro]);

    const handleManageSubscription = () => {
        setActiveTab('subscription');
    };

    if (!isOpen || !mounted) return null;

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel? You will lose access to Pro features at the end of the billing period.")) return;
        setPortalLoading(true);
        try {
            const { data: { user } } = await supabase!.auth.getUser();
            const res = await fetch(`${API_BASE}/billing/cancel-subscription`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user?.id })
            });
            if (!res.ok) throw new Error("Cancellation failed");
            alert("Subscription canceled. Access remains until period end.");
            // Refresh details locally or reload
        } catch (e) { alert("Error: " + e); }
        finally { setPortalLoading(false); }
    };

    const handleBuy = async (plan: Plan) => {
        if (!confirm(`Switch to ${plan.name}? This will start a new billing cycle.`)) return;
        setPortalLoading(true);
        try {
            const user = await supabase?.auth.getUser();
            const res = await fetch(`${API_BASE}/billing/create-checkout-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user?.data.user?.id,
                    email: user?.data.user?.email,
                    price_id: plan.id,
                    is_subscription: true
                })
            });
            if (!res.ok) throw new Error("Checkout Failed");
            const { url } = await res.json();
            window.location.href = url;
        } catch (e) { alert(e); }
        finally { setPortalLoading(false); }
    };

    const formatDate = (ts: number) => new Date(ts * 1000).toLocaleDateString();

    const renderContent = () => {
        if (activeTab === 'general') {
            return (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <User size={18} className="text-blue-400" /> Account
                        </h3>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Email</label>
                                <div className="text-white font-mono bg-black/40 p-2 rounded border border-white/10 mt-1">
                                    {userEmail || "Loading..."}
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Plan Status</label>
                                    <button
                                        onClick={isPro ? handleManageSubscription : onOpenUpgrade}
                                        disabled={portalLoading}
                                        className={`text-[10px] hover:text-white underline disabled:opacity-50 ${isPro ? 'text-gray-400' : 'text-emerald-400 font-bold'}`}
                                    >
                                        {portalLoading ? "Loading..." : (isPro ? "Manage Subscription" : "Upgrade to Pro")}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`px-2 py-1 rounded text-xs font-bold ${isPro ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-700 text-gray-300'}`}>
                                        {isPro ? "PRO / SUBSCRIBER" : "FREE TIER"}
                                    </div>
                                    <span className="text-xs text-gray-500">{(credits || 0).toLocaleString()} credits remaining</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Settings size={18} className="text-gray-400" /> Preferences
                        </h3>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300 text-sm">Theme</span>
                                <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                                    <button className="p-1.5 rounded bg-white/10 text-white"><Moon size={14} /></button>
                                    <button className="p-1.5 rounded text-gray-500 hover:text-white"><Sun size={14} /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 mt-8">
                        <LogOut size={12} /> Sign Out
                    </button>
                </div>
            );
        }

        if (activeTab === 'subscription') {
            return (
                <div className="space-y-6 h-full flex flex-col animate-in slide-in-from-right-4 duration-300 pb-4">
                    <div className="bg-gradient-to-br from-purple-900/20 to-black p-6 rounded-2xl border border-purple-500/20">
                        {/* Plan Status Dashboard */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Current Status</h4>
                                <div className="text-2xl font-bold text-white flex items-center gap-3">
                                    <span className="capitalize">{subscriptionTier} Tier</span>
                                    {subscriptionStatus === 'active' && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">ACTIVE</span>}
                                    {subscriptionStatus === 'canceling' && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/20">CANCELING</span>}
                                </div>
                                <div className="text-gray-500 text-sm mt-1">
                                    {subscriptionStatus === 'none' ? "You are on the Free Tier." : "Next billing cycle: Automatic renewal."}
                                </div>
                            </div>
                        </div>

                        {/* Plans Grid */}
                        <div className="space-y-3">
                            <h3 className="text-md font-bold text-gray-400 uppercase tracking-wider mb-4">Available Plans</h3>
                            {PLANS.map((plan) => {
                                const isFree = plan.price === 0;
                                const isCurrent = plan.name.toLowerCase() === (subscriptionTier || 'free').toLowerCase();

                                return (
                                    <div key={plan.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isCurrent ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className={`font-bold ${isCurrent ? 'text-white' : 'text-gray-300'}`}>{plan.name}</span>
                                                {plan.popular && !isCurrent && <span className="text-[9px] bg-purple-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Popular</span>}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                                <span className="text-white font-mono">${plan.price}/mo</span>
                                                <span>• {plan.credits} Credits</span>
                                            </div>
                                        </div>

                                        {isCurrent ? (
                                            <button disabled className="px-4 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold cursor-default flex items-center gap-1">
                                                <Check size={12} /> Current Plan
                                            </button>
                                        ) : isFree ? (
                                            <button
                                                onClick={handleCancel}
                                                disabled={portalLoading}
                                                className="px-4 py-1.5 rounded-full bg-white/5 text-gray-400 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-xs font-bold transition-all"
                                            >
                                                {portalLoading ? "..." : "Downgrade to Free"}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBuy(plan)}
                                                disabled={portalLoading}
                                                className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-gray-200 text-xs font-bold transition-all"
                                            >
                                                {portalLoading ? "..." : (subscriptionStatus === 'active' ? "Switch" : "Upgrade")}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'billing') {
            const billingHistory = history.filter(h => h.amount > 0);
            return (
                <div className="space-y-8 h-full flex flex-col animate-in slide-in-from-right-4 duration-300 pb-4">

                    {/* Billing Info & Payment Methods */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-md font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Receipt size={16} /> Subscription Status
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Current Period</div>
                                    {subDetails ? (
                                        <div>
                                            <div className="text-lg font-bold text-white">
                                                {formatDate(subDetails.current_period_start)} - {formatDate(subDetails.current_period_end)}
                                            </div>
                                            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                                                <Calendar size={10} /> Renews automatically
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-400 italic">No active subscription period</div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Billing Account</div>
                                <div className="text-sm font-mono text-gray-400">
                                    {subDetails ? `$${(subDetails.plan_amount / 100).toFixed(2)} / ${subDetails.plan_interval}` : 'Free Tier'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-md font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                Payment Methods
                            </h3>
                            <button
                                onClick={attachMethod}
                                className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-2"
                            >
                                <Plus size={12} /> Add New
                            </button>
                        </div>

                        <div className="space-y-2">
                            {pmLoading ? (
                                <div className="text-gray-500 text-xs">Loading methods...</div>
                            ) : methods.length === 0 ? (
                                <div className="text-gray-500 text-xs italic">No payment methods found.</div>
                            ) : (
                                methods.map(pm => (
                                    <div key={pm.id} className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                                {pm.brand}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white font-mono">•••• {pm.last4}</div>
                                                <div className="text-[10px] text-gray-500">Expires {pm.exp_month}/{pm.exp_year}</div>
                                            </div>
                                            {pm.is_default && (
                                                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase font-bold tracking-wider">Default</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!pm.is_default && (
                                                <button
                                                    onClick={() => setDefaultMethod(pm.id)}
                                                    className="text-[10px] text-gray-400 hover:text-white underline mr-2"
                                                >
                                                    Make Default
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (confirm("Remove this payment method?")) detachMethod(pm.id);
                                                }}
                                                className="p-1.5 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                                                title="Remove"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-md font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            Invoices & History
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-2 min-h-[150px]">
                            {historyLoading ? (
                                <div className="text-center py-10 text-gray-500">Loading history...</div>
                            ) : billingHistory.length === 0 ? (
                                <div className="text-center py-4 text-xs text-gray-600 border border-white/5 border-dashed rounded-lg">
                                    No billing records found.
                                </div>
                            ) : (
                                billingHistory.map((tx) => (
                                    <div key={tx.id} className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-400">
                                                <Receipt size={14} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white capitalize">{tx.reason || "Payment"}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">{new Date(tx.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="font-mono font-bold text-sm text-emerald-400">
                                            +{tx.amount} ¢
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            );
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-[800px] h-[600px] bg-[#0c0c12] rounded-2xl border border-white/10 shadow-2xl flex overflow-hidden ring-1 ring-white/10">

                {/* Sidebar */}
                <div className="w-64 bg-black/20 border-r border-white/10 p-6 flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-8 tracking-tight">Settings</h2>

                    <nav className="space-y-2 flex-1">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${activeTab === 'general' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <User size={16} /> General
                        </button>
                        <button
                            onClick={() => setActiveTab('subscription')}
                            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${activeTab === 'subscription' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <CreditCard size={16} /> Subscription
                        </button>
                        <button
                            onClick={() => setActiveTab('billing')}
                            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${activeTab === 'billing' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Receipt size={16} /> Billing
                        </button>
                    </nav>

                    <div className="text-xs text-gray-600 pt-6 border-t border-white/5">
                        Version 1.2.0 <br />
                        Opentunes Studio
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col relative bg-gradient-to-br from-white/[0.02] to-transparent">
                    <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-10">
                        <X size={20} />
                    </button>

                    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
                        {renderContent()}
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
}
