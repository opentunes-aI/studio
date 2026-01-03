import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Users } from 'lucide-react';
import CommunityFeed from '@/components/CommunityFeed';
import CommunityShowcase from '@/components/CommunityShowcase';
import CommunityHeaderAuth from '@/components/CommunityHeaderAuth';
import Footer from '@/components/Footer';

export default function CommunityPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 relative">
                                <Image src="/logo.png" alt="Opentunes Logo" fill className="object-contain rounded-lg" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">Opentunes.ai</span>
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <Link href="/studio" className="hover:text-white transition-colors">Studio</Link>
                        <Link href="/community" className="text-white">Community</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <CommunityHeaderAuth />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24 container mx-auto px-6">

                {/* 1. Top 3 Showcase (Replaces Hero) */}
                <CommunityShowcase />

                {/* 2. Feed Section */}
                <div className="mb-20">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                            Discover & Remix
                        </h1>
                        <p className="text-sm text-gray-400">
                            Join the jam. Follow creators and remix their prompts.
                        </p>
                    </div>

                    <div className="min-h-[400px]">
                        <CommunityFeed />
                    </div>
                </div>
            </main>

            <Footer />
        </div >
    );
}
