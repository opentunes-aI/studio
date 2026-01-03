import { Play, User } from "lucide-react";
import Link from "next/link";
import { useStudioStore } from "@/utils/store";
import { getSongGradient, getGenreIcon } from "@/utils/visuals";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ExploreGrid({ songs }: { songs: any[] }) {
    const { setCurrentTrack, currentTrackUrl } = useStudioStore();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {songs.map((song) => {
                const isPlaying = currentTrackUrl === song.audio_url;
                // Handle different join structures (array vs object depending on relationship)
                // profiles is typically an object if singular, but we should be safe
                const author = Array.isArray(song.profiles)
                    ? song.profiles[0]?.username
                    : song.profiles?.username || "Anonymous";

                return (
                    <div key={song.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg flex flex-col">
                        {/* Art Placeholder */}
                        <div style={getSongGradient(song.id)} className="aspect-square relative">
                            {/* Genre Icon */}
                            <div className="absolute top-2 right-2 text-3xl opacity-20 group-hover:opacity-50 transition-opacity select-none filter grayscale group-hover:grayscale-0">
                                {getGenreIcon(song.prompt || "")}
                            </div>
                            {/* Play Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px] z-10">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (song.audio_url) setCurrentTrack(song.audio_url, song.title);
                                        else alert("No audio URL");
                                    }}
                                    className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                                >
                                    <Play className={`fill-current w-5 h-5 ml-0.5 ${isPlaying ? 'animate-pulse' : ''}`} />
                                </button>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                                <div className="font-bold text-white truncate text-shadow-lg">{song.title}</div>
                                <div className="text-xs text-gray-300 truncate opacity-80">{song.prompt}</div>
                            </div>
                        </div>

                        <div className="p-3 bg-card flex-1 flex flex-col justify-end">
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <User className="w-3 h-3 text-primary" />
                                    </div>
                                    <Link href={`/u/${encodeURIComponent(author)}`} className="truncate max-w-[100px] font-medium hover:underline cursor-pointer">
                                        {author}
                                    </Link>
                                </div>
                                <Link
                                    href={`/song/${song.id}`}
                                    className="text-[10px] uppercase font-bold text-muted-foreground hover:text-primary transition-colors"
                                >
                                    View Track
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            })}
            {songs.length === 0 && (
                <div className="col-span-full text-center py-20 text-muted-foreground border border-dashed border-border rounded-lg bg-secondary/10">
                    <p>No public songs found.</p>
                    <p className="text-sm mt-2">Sync a song to Cloud to see it here!</p>
                </div>
            )}
        </div>
    );
}
