import { Music } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AuthWidget from "./AuthWidget";

export default function Header() {
    return (
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 relative">
                    <Image src="/logo.png" alt="Opentunes Logo" fill className="object-contain rounded-lg" />
                </div>
                <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                    Opentunes<span className="text-primary">.ai</span>
                </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <Link href="/studio" className="text-foreground hover:text-primary transition-colors">Studio</Link>
                <Link href="/community" className="hover:text-foreground transition-colors">Community</Link>
                <a href="#" className="hover:text-foreground transition-colors">Docs</a>
            </nav>

            <div className="flex items-center gap-4">
                <AuthWidget />
            </div>
        </header>
    );
}
