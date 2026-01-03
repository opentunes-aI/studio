import Link from 'next/link';
import { Twitter, Instagram, Disc, Music2 } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative z-10 border-t border-white/5 py-12 bg-black/60 backdrop-blur-xl">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-sm">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Opentunes.ai</span>
                    <span>© 2026</span>
                </div>

                <div className="flex items-center gap-6">
                    {/* X (formerly Twitter) */}
                    <Link href="#" className="hover:text-white transition-colors group" aria-label="X">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </Link>

                    {/* Instagram */}
                    <Link href="#" className="hover:text-white transition-colors" aria-label="Instagram">
                        <Instagram size={20} />
                    </Link>

                    {/* TikTok */}
                    <Link href="#" className="hover:text-white transition-colors" aria-label="TikTok">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                    </Link>

                    {/* Discord */}
                    <Link href="#" className="hover:text-white transition-colors" aria-label="Discord">
                        <svg viewBox="0 0 127.14 96.36" fill="currentColor" className="w-6 h-5">
                            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c.63-15.79-4.16-39.69-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                        </svg>
                    </Link>
                </div>

                <div className="flex gap-6 text-xs">
                    <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                </div>
            </div>
        </footer>
    );
}
