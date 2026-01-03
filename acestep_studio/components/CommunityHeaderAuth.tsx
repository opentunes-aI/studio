"use client";
import { useStore } from '../utils/store';
import UserMenu from './UserMenu';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CommunityHeaderAuth() {
    const { session } = useStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />;

    if (session) {
        return <UserMenu />;
    }

    return (
        <Link
            href="/studio"
            className="px-5 py-2 text-sm font-bold bg-white text-black rounded-full hover:bg-gray-200 transition-colors shadow-lg hover:shadow-white/20"
        >
            Login / Join
        </Link>
    );
}
