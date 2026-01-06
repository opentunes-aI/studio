import { useState, useEffect, useRef } from "react";
import { API_BASE } from "@/utils/api";
import { useStudioStore } from "@/utils/store";

export type ChatMessage = {
    role: "user" | "agent";
    content: any;
    identity?: string;
    isStreaming?: boolean;
    id?: number;
};

export type ChatSession = {
    id: string;
    title: string;
    messages: ChatMessage[];
    timestamp: number;
};

export function useChatStream() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [showSessionList, setShowSessionList] = useState(false);

    const { setPrompt, setSteps, setCfgScale, setDuration, setSeed, setLyrics, setCoverImage, lastCompletedTrack } = useStudioStore();
    const handledTrackRef = useRef<string | null>(null);

    // Listen for completed tracks from global store
    useEffect(() => {
        if (lastCompletedTrack && lastCompletedTrack.id !== handledTrackRef.current) {
            handledTrackRef.current = lastCompletedTrack.id;

            setMessages(prev => [...prev, {
                role: "agent",
                identity: "Studio",
                content: [{
                    type: 'log',
                    message: `🎵 **Generation Complete!**\nTrack: [${lastCompletedTrack.name}](${lastCompletedTrack.url})`
                }],
                id: Date.now()
            }]);
        }
    }, [lastCompletedTrack]);

    function handleSideEffect(act: any) {
        // console.log("Side Effect:", act);
        if (!act) return;
        const params = act.params || act;

        // Debug confirmation in chat (Temporary)
        /*
        setMessages(prev => [...prev, { 
            role: "agent", 
            content: [{ type: 'log', message: `Debug: Action=${act.action}` }], 
            id: Date.now() 
        }]);
        */

        if (act.action === 'configure' || (params?.prompt && !act.message)) {
            if (params.prompt) setPrompt(String(params.prompt));
            if (params.steps) setSteps(Number(params.steps) || 30);
            if (params.cfg_scale) setCfgScale(Number(params.cfg_scale) || 7.0);
            if (params.duration) setDuration(Number(params.duration) || 30);
            if (params.seed) setSeed(Number(params.seed) || null);
        } else if (act.action === 'update_lyrics') {
            let text = params.lyrics || params.content || params.lyric_content || "";

            // Unpack if it's a nested JSON string (common LLM artifact)
            if (typeof text === 'string' && text.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(text);
                    if (parsed.lyrics) text = parsed.lyrics;
                    else if (parsed.content) text = parsed.content;
                } catch { }
            }

            // Handle Arrays (e.g. line lists)
            if (Array.isArray(text)) {
                text = text.join("\n");
            } else if (typeof text === 'object') {
                text = JSON.stringify(text);
            }

            if (text) setLyrics(String(text));
        } else if (act.action === 'generate_cover_art') {
            if (params.image_url) setCoverImage(String(params.image_url));
        }
    }

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

    useEffect(() => {
        if (sessions.length > 0) {
            try {
                localStorage.setItem("agent_sessions", JSON.stringify(sessions));
            } catch (e) {
                console.error("Failed to save sessions", e);
            }
        }
    }, [sessions]);

    useEffect(() => {
        if (!currentSessionId) return;
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages } : s));
    }, [messages, currentSessionId]);

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

    function switchSession(session: ChatSession) {
        setCurrentSessionId(session.id);
        setMessages(session.messages);
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

    async function sendMessage(input: string) {
        if (!input.trim()) return;

        const currentSession = sessions.find(s => s.id === currentSessionId);
        if (currentSession && messages.length === 0) {
            setSessions(prev => prev.map(s =>
                s.id === currentSessionId ? { ...s, title: input.length > 20 ? input.substring(0, 20) + "..." : input } : s
            ));
        }

        const userMsg: ChatMessage = { role: "user", content: input };
        const validHistory = messages.map(m => ({
            role: m.role,
            content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
        }));

        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        const tempId = Date.now();
        setMessages(prev => [...prev, { role: "agent", content: [], identity: "Studio Crew", isStreaming: true, id: tempId }]);

        try {
            const res = await fetch(`${API_BASE}/agent/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg.content, history: validHistory })
            });

            if (!res.body) throw new Error("No Stream");
            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            let accumulatedActions: any[] = [];
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const data = JSON.parse(line);

                        if (data.type === 'log') {
                            accumulatedActions.push(data);
                        } else if (data.type === 'plan') {
                            accumulatedActions.push({
                                type: 'log',
                                step: 'Director',
                                message: `Plan: Music=${data.plan.music}, Lyrics=${data.plan.lyrics}, Art=${data.plan.art}`
                            });
                        } else if (data.type === 'result') {
                            const items = Array.isArray(data.data) ? data.data : [data.data];
                            // Add to UI
                            accumulatedActions.push(...items);
                            // Trigger Side Effects
                            items.forEach((d: any) => handleSideEffect(d));
                        }

                        // Update State
                        setMessages(prev => prev.map(m =>
                            m.id === tempId ? { ...m, content: [...accumulatedActions] } : m
                        ));
                    } catch (e) { console.error("Parse Error", e); }
                }
            }
        } catch (e: any) {
            const msg = e.message || String(e);
            if (msg !== 'AbortError' && !msg.includes('The user aborted')) {
                setMessages(prev => prev.map(m =>
                    m.id === tempId ? { ...m, content: [...(Array.isArray(m.content) ? m.content : []), { message: `Error: ${msg}` }] } : m
                ));
            }
        } finally {
            setLoading(false);
        }
    }

    return {
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
    };
}
