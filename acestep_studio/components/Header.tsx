import { Music, PanelLeft, PanelRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AuthWidget from "./AuthWidget";
import { useStudioStore } from "@/utils/store";
import { usePathname } from "next/navigation";

export default function Header() {
    const { isLibraryOpen, setLibraryOpen, isControlsOpen, setControlsOpen } = useStudioStore();
    const pathname = usePathname();
    const isStudio = pathname === "/" || pathname?.startsWith("/studio");

    return (
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-50">
            <div className="flex items-center gap-3">
                {isStudio && (
                    <button
                        onClick={() => setControlsOpen(!isControlsOpen)}
                        className={`p-1.5 rounded-md transition-colors ${!isControlsOpen ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-white/5'}`}
                        title="Toggle Controls"
                    >
                        <PanelLeft size={18} />
                    </button>
                )}
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 relative">
                        <Image src="/logo.png" alt="Opentunes Logo" fill className="object-contain rounded-lg" />
                    </div>
                    <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        Opentunes<span className="text-primary">.ai</span>
                    </span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                    <Link href="/studio" className="text-foreground hover:text-primary transition-colors">Studio</Link>
                    <Link href="/community" className="hover:text-foreground transition-colors">Community</Link>
                </nav>

                <div className="h-4 w-[1px] bg-white/10 mx-2" />

                <AuthWidget />

                <button
                    onClick={() => setLibraryOpen(!isLibraryOpen)}
                    className={`p-1.5 rounded-md transition-colors ${!isLibraryOpen ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-white/5'}`}
                    title="Toggle Library"
                >
                    <PanelRight size={18} />
                </button>
            </div>
        </header>
    );
}
