import { supabase } from "@/utils/supabase";
import ExploreGrid from "@/app/explore/ExploreGrid";
import { User, Music } from "lucide-react";

export default async function ProfilePage({ params }: { params: { username: string } }) {
    if (!supabase) return <div className="p-10 text-center">Config Error</div>;

    const username = decodeURIComponent(params.username);

    // 1. Get Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
                <User className="w-12 h-12 mb-4 opacity-20" />
                <h1 className="text-xl">User &quot;{username}&quot; Not Found</h1>
            </div>
        );
    }

    // 2. Get Songs
    const { data: songs } = await supabase
        .from('songs')
        .select(`
            *,
            profiles (*)
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background">
            <div className="p-6 md:p-10 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-6 mb-10 p-6 bg-card border border-border rounded-2xl shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-inner ring-4 ring-background">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                profile.username?.[0]?.toUpperCase() || "?"
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{profile.username}</h1>
                            <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                <Music className="w-4 h-4" />
                                <span>{songs?.length || 0} Tracks</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold mb-4">Latest Public Tracks</h2>
                        <ExploreGrid songs={songs || []} />
                    </div>
                </div>
            </div>
        </div>
    );
}
