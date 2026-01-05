import { Sparkles } from "lucide-react";

interface MessageBubbleProps {
    message: any;
    identity?: string;
}

export function MessageBubble({ message, identity }: MessageBubbleProps) {
    const isUser = message.role === 'user';
    const isAgent = message.role === 'agent';

    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {isAgent && (
                <div className="flex items-center gap-2 mb-1 ml-1">
                    <div className={`w-2 h-2 rounded-full ${identity === 'Studio Crew' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-pink-500'}`} />
                    <span className="text-xs font-bold text-foreground tracking-wider uppercase opacity-90">
                        {identity || "Producer"}
                    </span>
                </div>
            )}
            <div className={`max-w-[90%] p-3 rounded-2xl text-sm shadow-sm ${isUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary/80 text-secondary-foreground rounded-bl-none border border-white/5 backdrop-blur-sm'}`}>
                <MessageContent content={message.content} role={message.role} />
            </div>
        </div>
    );
}

function MessageContent({ content, role }: { content: any, role: string }) {
    if (role === 'user') return <div className="whitespace-pre-wrap">{String(content)}</div>;

    let actions = [];
    if (Array.isArray(content)) actions = content;
    else if (typeof content === 'object') actions = [content];
    else return <div className="whitespace-pre-wrap">{String(content)}</div>;

    return (
        <div className="space-y-4">
            {actions.map((act: any, i: number) => {
                if (!act) return null;
                const params = act.params || act;

                if (act.action === 'configure' || (params?.prompt && !act.message && !act.type)) {
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

                if (act.type === 'log') {
                    return (
                        <div key={i} className="flex items-center gap-2 mb-1 px-2 py-1 bg-black/10 rounded border border-white/5 animate-in fade-in slide-in-from-left-2">
                            <span className="text-[10px] font-mono text-pink-400 uppercase tracking-widest min-w-[60px]">{act.step}</span>
                            <span className="text-xs text-foreground/80 whitespace-pre-wrap">{act.message}</span>
                        </div>
                    );
                }

                if (typeof act === 'string') return <div key={i}>{act}</div>;
                if (act.message) return <div key={i}>{String(act.message)}</div>;

                return <div key={i} className="text-[10px] font-mono opacity-50 overflow-x-auto">{JSON.stringify(act)}</div>;
            })}
        </div>
    );
}
