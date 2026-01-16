import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X, Receipt, User, Settings, CreditCard, LogOut, Moon, Sun } from "lucide-react";
import { useBillingHistory } from "@/hooks/useBillingHistory";
import { supabase } from "@/utils/supabase";
import { useCredits } from "@/hooks/useCredits";

export default function SettingsDialog({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<'general' | 'billing'>('billing');
    const [userEmail, setUserEmail] = useState<string>("");
    const [mounted, setMounted] = useState(false);

    // Billing Data
    const { history, loading: historyLoading } = useBillingHistory();
    const { credits, isPro } = useCredits();

    useEffect(() => {
        setMounted(true);
        supabase?.auth.getUser().then(({ data }) => {
            if (data.user?.email) setUserEmail(data.user.email);
        });
    }, []);

    if (!isOpen || !mounted) return null;

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
                                <label className="text-xs text-gray-500 uppercase font-bold">Plan Status</label>
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

        if (activeTab === 'billing') {
            return (
                <div className="space-y-4 h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 shrink-0">
                        <Receipt size={18} className="text-emerald-400" /> Transaction History
                    </h3>

                    <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-2">
                        {historyLoading ? (
                            <div className="text-center py-10 text-gray-500">Loading transactions...</div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 bg-white/5 rounded-xl border border-white/5 border-dashed">
                                No transactions found.
                            </div>
                        ) : (
                            history.map((tx) => (
                                <div key={tx.id} className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {tx.amount > 0 ? <CreditCard size={14} /> : <Receipt size={14} />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white capitalize">{tx.reason || "Credit Update"}</div>
                                            <div className="text-[10px] text-gray-500 font-mono">{new Date(tx.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className={`font-mono font-bold text-sm ${tx.amount > 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount} ¢
                                    </div>
                                </div>
                            ))
                        )}
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

                    <div className="p-8 h-full">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
