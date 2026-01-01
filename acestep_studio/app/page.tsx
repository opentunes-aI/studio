"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ControlPanel from "@/components/ControlPanel";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import ConsoleDrawer from "@/components/ConsoleDrawer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // When a job is created, we track it
  function handleJobCreated(id: string) {
    setActiveJobId(id);
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground antialiased selection:bg-primary/30">
      <Header />
      <div className="flex-1 flex overflow-hidden relative">
        <ControlPanel onJobCreated={handleJobCreated} />
        <div className="flex-1 flex flex-col relative min-w-0 bg-background/50 backdrop-blur-sm">
          <WaveformVisualizer />
        </div>
        <Sidebar />

        {/* Drawer sits on top of everything in the main area, or fixed to window */}
        <ConsoleDrawer activeJobId={activeJobId} />
      </div>
      <Footer />
    </div>
  );
}
