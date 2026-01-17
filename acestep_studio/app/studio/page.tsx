"use client";
import ControlPanel from "@/components/ControlPanel";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import AgentChat from "@/components/AgentChat";

import { useStudioStore } from "@/utils/store";

export default function Home() {
  const isControlsOpen = useStudioStore(s => s.isControlsOpen);

  return (
    <div className="flex h-full w-full">
      {/* Studio Controls (Creation) */}
      {/* Mobile Backdrop for Controls */}
      {isControlsOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm animate-in fade-in"
          onClick={() => useStudioStore.getState().setControlsOpen(false)}
        />
      )}

      {/* Studio Controls (Creation) */}
      <div className={`
        bg-[#0c0c12] lg:bg-transparent border-r border-white/5 lg:border-none
        fixed inset-y-0 left-0 z-40 h-full shadow-2xl lg:shadow-none overflow-y-auto custom-scrollbar lg:overflow-visible
        lg:relative lg:inset-auto lg:h-auto lg:z-auto
        transition-all duration-300 ease-in-out shrink-0
        ${isControlsOpen
          ? 'w-[85vw] sm:w-96 translate-x-0 opacity-100'
          : '-translate-x-full w-0 opacity-0 lg:w-0 lg:translate-x-0 lg:-ml-4 overflow-hidden'}
      `}>
        <ControlPanel />
      </div>

      {/* Main Workspace (Waveform / Visualizer) */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-background/50 backdrop-blur-sm">
        <WaveformVisualizer />
      </div>

      {/* Note: Sidebar is now in GlobalLayout (Right) */}
      <AgentChat />
    </div>
  );
}
