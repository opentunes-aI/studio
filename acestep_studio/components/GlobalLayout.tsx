"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ConsoleDrawer from "@/components/ConsoleDrawer";
import FooterPlayer from "@/components/FooterPlayer";
import { useStudioStore } from "@/utils/store";

export default function GlobalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isStudio = pathname === "/" || pathname?.startsWith("/studio");
    const isLibraryOpen = useStudioStore(s => s.isLibraryOpen);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground antialiased selection:bg-primary/30">
            <Header />

            <div className="flex-1 flex overflow-hidden relative">
                {/* Main Content Area */}
                {children}

                {/* Global Library Sidebar (Right Panel) */}
                <div className={`transition-all duration-300 ease-in-out flex flex-col ${isLibraryOpen ? 'w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-20 overflow-hidden'}`}>
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
