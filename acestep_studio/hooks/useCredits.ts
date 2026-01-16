import { useEffect } from "react";
import { useStudioStore } from "@/utils/store";
import { supabase } from "@/utils/supabase";

export function useCredits() {
    const setCredits = useStudioStore(s => s.setCredits);
    const setIsPro = useStudioStore(s => s.setIsPro);
    const credits = useStudioStore(s => s.credits);
    const isPro = useStudioStore(s => s.isPro);

    useEffect(() => {
        let channel: any = null;

        async function init() {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Initial Fetch
            const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
            if (wallet) {
                setCredits(wallet.balance);
                setIsPro(wallet.is_pro);
            }

            // 2. Subscribe
            channel = supabase
                .channel('wallet-changes')
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'wallets',
                    filter: `user_id=eq.${user.id}`
                }, (payload: any) => {
                    const newBal = payload.new.balance;
                    if (typeof newBal === 'number') setCredits(newBal);
                })
                .subscribe();
        }

        init();

        return () => {
            if (channel) supabase?.removeChannel(channel);
        };
    }, []); // Run once on mount

    return { credits, isPro };
}
