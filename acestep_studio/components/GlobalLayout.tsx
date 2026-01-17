"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ConsoleDrawer from "@/components/ConsoleDrawer";
import FooterPlayer from "@/components/FooterPlayer";
import { useStudioStore } from "@/utils/store";

import { useEffect } from "react";

export default function GlobalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isStudio = pathname === "/" || pathname?.startsWith("/studio");
    const isLibraryOpen = useStudioStore(s => s.isLibraryOpen);

    useEffect(() => {
        // Mobile UX: Auto-close panels on mount to show content
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            useStudioStore.getState().setLibraryOpen(false);
            useStudioStore.getState().setControlsOpen(false);
        }
    }, []);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground antialiased selection:bg-primary/30">
            <Header />

            <div className="flex-1 flex overflow-hidden relative">
                {/* Main Content Area */}
                {children}

                {/* Mobile Backdrop for Library */}
                {isLibraryOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm animate-in fade-in"
                        onClick={() => useStudioStore.getState().setLibraryOpen(false)}
                    />
                )}

                {/* Global Library Sidebar (Right Panel) */}
                {/* Mobile: Fixed Drawer (Overlays content) */}
                {/* Desktop: Relative Flex Item (Pushes content) */}
                <div className={`
                    bg-background lg:bg-transparent border-l border-white/5 lg:border-none
                    transition-all duration-300 ease-in-out flex flex-col 
                    fixed inset-y-0 right-0 z-40 h-full shadow-2xl lg:shadow-none
                    lg:relative lg:inset-auto lg:h-auto lg:z-auto
                    ${isLibraryOpen ? 'translate-x-0 w-80' : 'translate-x-full w-0 lg:translate-x-0 lg:w-0 overflow-hidden'}
                `}>
                    <Sidebar />
                </div>

                {/* Global Console (Overlay) */}
                <ConsoleDrawer />
            </div>

            {/* Global Audio Element for Persistence */}
            <audio id="global-audio" crossOrigin="anonymous" className="hidden" />

            {/* Persistent Player Bar (Visible on non-studio pages) */}
            {!isStudio && <FooterPlayer />}
        </div>
    );
}
