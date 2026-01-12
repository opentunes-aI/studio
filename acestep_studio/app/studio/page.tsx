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
      <div className={`transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-96 opacity-100 mr-0' : 'w-0 opacity-0 -ml-4 overflow-hidden'}`}>
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
