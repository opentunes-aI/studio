import { supabase } from "@/utils/supabase";
import ExploreGrid from "./ExploreGrid";

export const revalidate = 60;

export default async function ExplorePage() {
    if (!supabase) {
        return <div className="p-10 text-center">Supabase connection missing.</div>;
    }

    const { data: songs, error } = await supabase
        .from('songs')
        .select(`
            *,
            profiles (
                username,
                avatar_url
            )
        `)
        .order('created_at', { ascending: false })
        .limit(24);

    if (error) {
        console.error("Explore Fetch Error:", error);
    }

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background">
            <div className="p-6 md:p-10 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground">Explore</h1>
                        <p className="text-muted-foreground mt-2">Discover what the community is creating.</p>
                    </div>

                    <ExploreGrid songs={songs || []} />
                </div>
            </div>
        </div>
    );
}
