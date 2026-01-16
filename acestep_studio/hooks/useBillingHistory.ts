import { useState, useEffect } from "react";
import { API_BASE } from "@/utils/api";
import { useStudioStore } from "@/utils/store";
import { supabase } from "@/utils/supabase";

type Transaction = {
    id: string;
    created_at: string;
    amount: number;
    reason: string;
    metadata: any;
};

export function useBillingHistory() {
    const [history, setHistory] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    async function fetchHistory() {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setHistory([]);
                return;
            }

            const res = await fetch(`${API_BASE}/billing/history/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setHistory(Array.isArray(data.history) ? data.history : []);
            } else {
                setHistory([]);
            }
        } catch (e) {
            console.error("Billing History Error:", e);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    }

    return { history, loading, refresh: fetchHistory };
}
