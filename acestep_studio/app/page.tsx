"use client";
import ControlPanel from "@/components/ControlPanel";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import AgentChat from "@/components/AgentChat";

export default function Home() {
  return (
    <div className="flex h-full w-full">
      {/* Studio Controls (Creation) */}
      <ControlPanel />

      {/* Main Workspace (Waveform / Visualizer) */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-background/50 backdrop-blur-sm">
        <WaveformVisualizer />
      </div>

      {/* Note: Sidebar is now in GlobalLayout (Right) */}
      <AgentChat />
    </div>
  );
}
