import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { API_BASE } from '@/utils/api';

export interface PaymentMethod {
    id: string;
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    is_default: boolean;
}

export function usePaymentMethods() {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMethods = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase!.auth.getUser();
            if (!user) return;

            const res = await fetch(`${API_BASE}/billing/payment-methods/${user.id}?email=${encodeURIComponent(user.email || '')}`);
            if (!res.ok) throw new Error("Failed to fetch payment methods");

            const data = await res.json();
            setMethods(data.methods || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const attachMethod = async () => {
        // Triggers setup session
        const { data: { user } } = await supabase!.auth.getUser();
        if (!user) return;

        const res = await fetch(`${API_BASE}/billing/create-setup-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, email: user.email })
        });

        if (res.ok) {
            const { url } = await res.json();
            window.location.href = url;
        }
    };

    const detachMethod = async (pm_id: string) => {
        const { data: { user } } = await supabase!.auth.getUser();
        if (!user) return;

        await fetch(`${API_BASE}/billing/payment-methods/detach`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, pm_id })
        });
        await fetchMethods();
    };

    const setDefaultMethod = async (pm_id: string) => {
        const { data: { user } } = await supabase!.auth.getUser();
        if (!user) return;

        await fetch(`${API_BASE}/billing/payment-methods/default`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, pm_id })
        });
        await fetchMethods();
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    return { methods, loading, error, attachMethod, detachMethod, setDefaultMethod, refresh: fetchMethods };
}
