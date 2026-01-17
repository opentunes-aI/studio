"use client";
import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Bot, X, Send, Sparkles, Menu, Plus, MessageSquare, Trash2 } from "lucide-react";
import { useChatStream } from "./agent-chat/useChatStream";
import { MessageBubble } from "./agent-chat/MessageBubble";
import { useStudioStore } from "@/utils/store";

export default function AgentChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        loading,
        sendMessage,
        sessions,
        currentSessionId,
        showSessionList,
        setShowSessionList,
        createNewSession,
        switchSession,
        deleteSession
    } = useChatStream();

    const searchParams = useSearchParams();
    const router = useRouter();
    const hasHandledPrompt = useRef(false);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle initial prompt
    useEffect(() => {
        let initialPrompt = searchParams.get("initialPrompt");
        if (!initialPrompt && typeof window !== 'undefined') {
            initialPrompt = localStorage.getItem('pendingPrompt');
            if (initialPrompt) localStorage.removeItem('pendingPrompt');
        }

        if (initialPrompt && !hasHandledPrompt.current) {
            hasHandledPrompt.current = true;
            if (searchParams.get("initialPrompt")) {
                const pid = searchParams.get("parentId");
                router.replace(pid ? `/studio?parentId=${pid}` : '/studio', { scroll: false });
            }
            setIsOpen(true);
            setTimeout(() => sendMessage(initialPrompt!), 500);
        }
    }, [searchParams]);

    const trackTitle = useStudioStore(s => s.trackTitle);

    const handleSend = () => {
        if (!input.trim()) return;

        let message = input;

        // Inject Context if valid (Defense against non-string state)
        if (typeof trackTitle === 'string' && trackTitle.trim().length > 0) {
            message = `[Context: Project Title="${trackTitle}"] ${input}`;
        }

        sendMessage(message);
        setInput("");
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 animate-bounce-slow ring-2 ring-white/20"
                    title="Talk to AI Producer"
                >
                    <Bot className="text-white w-8 h-8" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full h-[85vh] sm:w-[350px] sm:h-[500px] bg-card/95 backdrop-blur-xl border-t sm:border border-border rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden ring-1 ring-white/10 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-2 duration-300">
                    {/* Header */}
                    <div className="h-14 bg-gradient-to-r from-pink-600/20 to-purple-600/20 border-b border-border flex items-center justify-between px-4 shrink-0">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <button onClick={() => setShowSessionList(!showSessionList)} className="hover:bg-white/10 p-1 rounded transition-colors" title="Menu">
                                <Menu className="w-5 h-5 text-foreground" />
                            </button>
                            <span className="font-bold text-foreground text-sm truncate max-w-[150px]">
                                {showSessionList ? "Your Sessions" : (sessions.find(s => s.id === currentSessionId)?.title || "AI Studio")}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            {!showSessionList && (
                                <button onClick={createNewSession} className="hover:bg-white/10 p-1 rounded transition-colors" title="New Chat">
                                    <Plus className="w-5 h-5 text-foreground" />
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="hover:text-red-500 transition-colors p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden relative bg-card/50">
                        {showSessionList ? (
                            <div className="absolute inset-0 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {sessions.map(session => (
                                    <div
                                        key={session.id}
                                        onClick={() => switchSession(session)}
                                        className={`p-3 rounded-lg cursor-pointer flex justify-between items-center group transition-colors ${currentSessionId === session.id ? 'bg-primary/20 border border-primary/50' : 'hover:bg-secondary/50 border border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-sm truncate text-foreground font-medium">{session.title}</span>
                                                <span className="text-[10px] text-muted-foreground">{new Date(session.timestamp).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => deleteSession(e, session.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all hover:bg-white/10 rounded"
                                            title="Delete Chat"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {sessions.length === 0 && (
                                    <div className="text-center text-muted-foreground text-xs mt-10">No sessions found.</div>
                                )}
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col">
                                <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                                    {messages.length === 0 && (
                                        <div className="bg-secondary/50 p-4 rounded-xl text-sm text-foreground text-center mt-10 border border-white/5 mx-4">
                                            <Sparkles className="w-8 h-8 text-pink-500 mx-auto mb-3" />
                                            <p className="font-semibold mb-1">Welcome to AI Studio</p>
                                            <p className="text-xs text-muted-foreground">Start a new creative session. Ask me to:</p>
                                            <div className="text-xs text-muted-foreground mt-2 space-y-1 text-left inline-block">
                                                <li>• Configure a "Cyberpunk Synthwave" track</li>
                                                <li>• Write lyrics for a Love Song</li>
                                                <li>• Generate Cover Art for an Album</li>
                                            </div>
                                        </div>
                                    )}
                                    {messages.map((m, i) => (
                                        <MessageBubble key={i} message={m} identity={m.identity} />
                                    ))}
                                    {loading && (() => {
                                        // Determine active agent state from the last message's log trail
                                        const lastMsg = messages[messages.length - 1];
                                        let activeStep = "Director";
                                        let activeAction = "Thinking...";

                                        if (lastMsg && Array.isArray(lastMsg.content) && lastMsg.content.length > 0) {
                                            const lastLog = [...lastMsg.content].reverse().find((c: any) => c.type === 'log' || c.step);
                                            if (lastLog) {
                                                activeStep = lastLog.step || "Studio";
                                                activeAction = lastLog.message || "Working...";
                                                // Shorten message if too long
                                                if (activeAction.length > 40) activeAction = activeAction.substring(0, 37) + "...";
                                            }
                                        }

                                        // Theme Map
                                        const theme: Record<string, { color: string, icon: any }> = {
                                            "Director": { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Sparkles },
                                            "Producer": { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: Bot },
                                            "Lyricist": { color: "text-pink-400 bg-pink-400/10 border-pink-400/20", icon: MessageSquare },
                                            "Visualizer": { color: "text-orange-400 bg-orange-400/10 border-orange-400/20", icon: Sparkles },
                                            "Critic": { color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: Bot },
                                            "Studio": { color: "text-gray-400 bg-gray-400/10 border-gray-400/20", icon: Sparkles },
                                        };

                                        const style = theme[activeStep] || theme["Studio"];
                                        const Icon = style.icon;

                                        return (
                                            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className={`px-4 py-2.5 rounded-2xl border ${style.color} flex items-center gap-3 shadow-sm`}>
                                                    <div className="relative">
                                                        <Icon className="w-4 h-4 animate-pulse" />
                                                        <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-current rounded-full animate-ping opacity-75"></span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{activeStep}</span>
                                                        <span className="text-xs font-medium opacity-90">{activeAction}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    <div ref={messagesEndRef} />
                                </div>
                                {/* Input */}
                                <div className="p-3 border-t border-border flex gap-2 bg-card/80 backdrop-blur shrink-0">
                                    <input
                                        className="flex-1 bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 text-foreground"
                                        placeholder="Describe your sound..."
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={loading || !input.trim()}
                                        className="p-2 bg-primary rounded-lg text-white disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
