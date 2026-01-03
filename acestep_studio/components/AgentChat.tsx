"use client";
import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Bot, X, Send, Sparkles, Menu, Plus, MessageSquare, Trash2 } from "lucide-react";
import { useStudioStore } from "@/utils/store";
import { API_BASE } from "@/utils/api";

type ChatSession = {
    id: string;
    title: string;
    messages: any[];
    timestamp: number;
};

export default function AgentChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Session State
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [showSessionList, setShowSessionList] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const hasHandledPrompt = useRef(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Store setters
    const { setPrompt, setSteps, setCfgScale, setDuration, setSeed, setLyrics } = useStudioStore();

    // Load Sessions
    useEffect(() => {
        try {
            const savedSessions = localStorage.getItem("agent_sessions");
            if (savedSessions) {
                const parsed = JSON.parse(savedSessions);
                setSessions(parsed);
                if (parsed.length > 0) {
                    setCurrentSessionId(parsed[0].id);
                    setMessages(parsed[0].messages);
                } else {
                    createNewSession();
                }
            } else {
                createNewSession();
            }
        } catch (e) {
            console.error("Failed to load sessions", e);
            createNewSession();
        }
    }, []);

    // Save Sessions (Only when sessions change)
    useEffect(() => {
        if (sessions.length > 0) {
            try {
                localStorage.setItem("agent_sessions", JSON.stringify(sessions));
            } catch (e) {
                console.error("Failed to save sessions", e);
            }
        }
    }, [sessions]);

    // Update current session when messages change (Debounced slightly ideally, but direct for now)
    // Update current session when messages change (Debounced slightly ideally, but direct for now)
    useEffect(() => {
        if (!currentSessionId) return;
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages } : s));
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, currentSessionId]);

    // Handle initial prompt from Landing Page
    // Handle initial prompt from Landing Page or Post-Login Redirect
    useEffect(() => {
        let initialPrompt = searchParams.get("initialPrompt");

        // If not in URL, check if we stored it pre-login
        if (!initialPrompt && typeof window !== 'undefined') {
            initialPrompt = localStorage.getItem('pendingPrompt');
            if (initialPrompt) {
                localStorage.removeItem('pendingPrompt');
            }
        }

        if (initialPrompt && !hasHandledPrompt.current) {
            hasHandledPrompt.current = true;
            // Clear param to prevent re-trigger on refresh if it was in URL
            if (searchParams.get("initialPrompt")) {
                router.replace('/studio', { scroll: false });
            }

            setIsOpen(true);
            // Delay slightly to ensure state is ready if needed, or just send
            setTimeout(() => sendMessage(initialPrompt!), 500);
        }
    }, [searchParams]);


    function createNewSession() {
        const newSession: ChatSession = {
            id: Date.now().toString(),
            title: `New Session ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            messages: [],
            timestamp: Date.now()
        };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        setMessages([]);
        setShowSessionList(false);
    }

    function deleteSession(e: React.MouseEvent, id: string) {
        e.stopPropagation();
        const newSessions = sessions.filter(s => s.id !== id);
        setSessions(newSessions);
        if (id === currentSessionId) {
            if (newSessions.length > 0) {
                setCurrentSessionId(newSessions[0].id);
                setMessages(newSessions[0].messages);
            } else {
                createNewSession();
            }
        }
    }

    function switchSession(session: ChatSession) {
        setCurrentSessionId(session.id);
        setMessages(session.messages);
        setShowSessionList(false);
    }

    // Helper to render message content (which is now PURE DATA)
    const renderMessageContent = (msg: any) => {
        if (msg.role === 'user') return msg.content;

        let actions = [];
        if (Array.isArray(msg.content)) actions = msg.content;
        else if (typeof msg.content === 'object') actions = [msg.content];
        else return <div className="whitespace-pre-wrap">{String(msg.content)}</div>;

        return (
            <div className="space-y-4">
                {actions.map((act: any, i: number) => {
                    if (!act) return null;
                    const params = act.params || act;

                    if (act.action === 'configure' || (params?.prompt && !act.message)) {
                        return (
                            <div key={i} className="border-l-2 border-pink-500 pl-2 mb-2">
                                <p className="text-[10px] font-bold opacity-50 mb-1">PRODUCER</p>
                                <p className="text-xs">I've configured the studio:</p>
                                <div className="bg-black/20 p-2 rounded mt-1">
                                    <p className="text-[10px] font-mono opacity-80 truncate">Prompt: "{String(params.prompt)}"</p>
                                    <p className="text-[10px] font-mono opacity-80">Steps: {params.steps}, CFG: {params.cfg_scale}</p>
                                </div>
                            </div>
                        );
                    }

                    if (act.action === 'update_lyrics') {
                        return (
                            <div key={i} className="border-l-2 border-blue-500 pl-2 mb-2">
                                <p className="text-[10px] font-bold opacity-50 mb-1">LYRICIST</p>
                                <p className="text-xs">I've written lyrics for you! Check the lyrics tab.</p>
                                <div className="max-h-20 overflow-hidden text-[10px] opacity-60 mt-1 italic whitespace-pre-wrap font-serif">
                                    {String(params.lyrics || "").substring(0, 100)}...
                                </div>
                            </div>
                        );
                    }

                    if (act.action === 'generate_cover_art') {
                        return (
                            <div key={i} className="flex flex-col gap-2 border-l-2 border-purple-500 pl-2 mb-2">
                                <p className="text-[10px] font-bold opacity-50">ART DIRECTOR</p>
                                <span className="mb-1 text-xs">I've designed this cover:</span>
                                <img src={params.image_url} alt="Cover" className="w-full rounded-md border border-white/10 shadow-lg" />
                                <span className="text-[10px] text-muted-foreground italic">"{params.description}"</span>
                            </div>
                        );
                    }

                    if (act.action === 'critique_warning') {
                        return (
                            <div key={i} className="border-l-2 border-yellow-500 pl-2 text-yellow-200 mb-2">
                                <p className="text-[10px] font-bold opacity-50 mb-1">THE CRITIC</p>
                                {String(act.message || "")}
                            </div>
                        );
                    }

                    if (act.fallback) {
                        return (
                            <div key={i} className="text-xs text-orange-400">
                                {String(act.message || "I encountered a glitch but set the prompt.")}
                            </div>
                        );
                    }

                    if (typeof act === 'string') return <div key={i}>{act}</div>;
                    if (act.message) return <div key={i}>{String(act.message)}</div>;

                    return <div key={i} className="text-[10px] font-mono opacity-50 overflow-x-auto">{JSON.stringify(act)}</div>;
                })}
            </div>
        );
    };

    async function sendMessage(overrideInput?: string) {
        // Allow passing input directly (for initial prompt)
        const textToSend = typeof overrideInput === 'string' ? overrideInput : input;

        if (!textToSend.trim()) return;

        // Auto-title (Simplified)
        const currentSession = sessions.find(s => s.id === currentSessionId);
        if (currentSession && messages.length === 0) {
            setSessions(prev => prev.map(s =>
                s.id === currentSessionId ? { ...s, title: textToSend.length > 20 ? textToSend.substring(0, 20) + "..." : textToSend } : s
            ));
        }

        const userMsg = { role: "user", content: textToSend };
        // Sanitize history for backend (Convert objects to strings)
        const validHistory = messages.map(m => ({
            role: m.role,
            content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
        }));

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/agent/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg.content, history: validHistory })
            });
            const data = await res.json();

            // Normalize Payload
            const payload = (data && data.result) ? data.result : data;

            // Extract Actions
            let actions: any[] = [];
            if (payload?.action) {
                actions.push(payload);
            } else if (payload && typeof payload === 'object') {
                Object.values(payload).forEach((val: any) => {
                    if (val && typeof val === 'object' && val.action) {
                        actions.push(val);
                    }
                });
            }

            if (actions.length === 0) {
                if (typeof payload === 'string' || payload?.message) actions.push({ message: payload });
                else if (Object.keys(payload || {}).length > 0) actions.push(payload);
            }

            // Execute Side Effects (State Updates)
            let finalIdentity = "Producer";
            if (actions.length > 1) finalIdentity = "Studio Crew";

            actions.forEach((act) => {
                if (!act) return;
                const params = act.params || act;

                if (act.action === 'configure' || (params?.prompt && !act.message)) {
                    finalIdentity = actions.length === 1 ? "Producer" : finalIdentity;
                    if (params.prompt) setPrompt(String(params.prompt));
                    if (params.steps) setSteps(Number(params.steps) || 30);
                    if (params.cfg_scale) setCfgScale(Number(params.cfg_scale) || 7.0);
                    if (params.duration) setDuration(Number(params.duration) || 30);
                    if (params.seed) setSeed(Number(params.seed) || null);
                } else if (act.action === 'update_lyrics') {
                    finalIdentity = actions.length === 1 ? "Lyricist" : finalIdentity;
                    setLyrics(String(params.lyrics || ""));
                } else if (act.action === 'generate_cover_art') {
                    finalIdentity = actions.length === 1 ? "Art Director" : finalIdentity;
                } else if (act.action === 'critique_warning') {
                    finalIdentity = actions.length === 1 ? "The Critic" : finalIdentity;
                }
            });

            // Store Pure Data
            setMessages(prev => [...prev, { role: "agent", content: actions, identity: finalIdentity }]);

        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: "agent", content: "Error: Client-side processing failed. Check console." }]);
        } finally {
            setLoading(false);
        }
    }

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
                <div className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden ring-1 ring-white/10">
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
                                        <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                            {m.role === 'agent' && (
                                                <div className="flex items-center gap-2 mb-1 ml-1">
                                                    <div className={`w-2 h-2 rounded-full ${m.identity === 'Studio Crew' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-pink-500'}`} />
                                                    <span className="text-xs font-bold text-foreground tracking-wider uppercase opacity-90">
                                                        {m.identity || "Producer"}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`max-w-[90%] p-3 rounded-2xl text-sm shadow-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary/80 text-secondary-foreground rounded-bl-none border border-white/5 backdrop-blur-sm'}`}>
                                                {renderMessageContent(m)}
                                            </div>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="flex justify-start animate-in fade-in">
                                            <div className="bg-secondary/30 px-4 py-2 rounded-full text-xs text-muted-foreground animate-pulse flex items-center gap-2">
                                                <Sparkles className="w-3 h-3 animate-spin" />
                                                Agent is thinking...
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                {/* Input */}
                                <div className="p-3 border-t border-border flex gap-2 bg-card/80 backdrop-blur shrink-0">
                                    <input
                                        className="flex-1 bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 text-foreground"
                                        placeholder="Describe your sound..."
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => sendMessage()}
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
