"use client";
import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles } from "lucide-react";
import { useStudioStore } from "@/utils/store";
import { API_BASE } from "@/utils/api";

export default function AgentChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Store setters
    const { setPrompt, setSteps, setCfgScale, setDuration, setSeed } = useStudioStore();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function sendMessage() {
        if (!input.trim()) return;

        const userMsg = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/agent/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg.content })
            });
            const data = await res.json();

            // Handle Agent Response
            // The agent might return a string, or our structured object
            let replyContent = "I've processed that.";

            if (data?.action === 'configure' || (data?.params)) {
                // Handle direct return or wrapped return
                const p = data.params || data;

                if (p.prompt) setPrompt(p.prompt);
                if (p.steps) setSteps(p.steps);
                if (p.cfg_scale) setCfgScale(p.cfg_scale);
                if (p.duration) setDuration(p.duration);
                if (p.seed) setSeed(p.seed);

                replyContent = `I've configured the studio:\nPrompt: "${p.prompt}"\nSteps: ${p.steps}, CFG: ${p.cfg_scale}`;
            } else if (data?.fallback) {
                replyContent = "I encountered a glitch but set the prompt for you.";
                setPrompt(data.fallback.prompt);
            } else if (typeof data === 'string') {
                replyContent = data;
            } else if (data?.message) {
                replyContent = data.message;
            } else {
                replyContent = JSON.stringify(data); // Debug
            }

            setMessages(prev => [...prev, { role: "agent", content: replyContent }]);

        } catch (e) {
            setMessages(prev => [...prev, { role: "agent", content: "Error: I couldn't reach the backend agent. Is it running?" }]);
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
                    <div className="h-14 bg-gradient-to-r from-pink-600/20 to-purple-600/20 border-b border-border flex items-center justify-between px-4">
                        <div className="flex items-center gap-2 font-bold text-foreground">
                            <Sparkles className="w-5 h-5 text-pink-500" />
                            <span>AI Producer</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:text-red-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        <div className="bg-secondary/50 p-3 rounded-lg text-sm text-foreground">
                            Hi! I'm your AI Producer Agent. Tell me what vibe you want (e.g. "Slow jazz reverb"), and I'll engage the studio.
                        </div>
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-bl-none'}`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-secondary/30 px-4 py-2 rounded-full text-xs text-muted-foreground animate-pulse">
                                    Agent is thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-border flex gap-2 bg-card">
                        <input
                            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                            placeholder="Describe your sound..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            autoFocus
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="p-2 bg-primary rounded-lg text-white disabled:opacity-50 hover:bg-primary/90 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
