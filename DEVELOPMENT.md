# Development Roadmap - Opentunes.ai

This document outlines the execution phases for Opentunes.ai, mapping strategic goals to specific items in the **PRD** and **TRD**. It serves as the primary checklist for implementation tracking.

## ✅ Phase 1: The Foundation (Core Product) [COMPLETED]
*Goal: Build the "0 to 1" Studio that empowers users to create music with AI agents.*

*   **1.1 Infrastructure & Architecture** (Ref: TRD 1.0, 2.0)
    *   [x] **LLM Agnostic**: Integrated `LiteLLM` for decoupled intelligence (Ollama/Groq/OpenAI Support).
    *   [x] **Model Agostic Engine**: Decoupled Audio Inference (ACE-Step / Stable Audio Factory).
    *   [x] **Hybrid Cloud**: Local GPU + Supabase Sync (Dual Write).
    *   [x] **Lazy Loading**: Optimized fast startup time.
*   **1.2 The Studio Experience** (Ref: PRD 4.1)
    *   [x] **UI/UX**: Responsive Next.js App with Glassmorphism theme.
    *   [x] **Waveform**: Interactive Visualization (`wavesurfer.js`).
    *   [x] **Console**: Real-time Agent Log streaming.
*   **1.3 Agentic Intelligence** (Ref: PRD 4.2, TRD 2.2)
    *   [x] **The Squad**: Director, Producer, Lyricist, Visualizer, Critic.
    *   [x] **RAG Memory**: Vector Search for Lyrics/Audio styles.
    *   [x] **Robustness**: JSON Parsing fixes, Error Recovery.
*   **1.4 Community & Growth** (Ref: PRD 4.4)
    *   [x] **Identity**: Profiles, Avatars.
    *   [x] **Viral Loop**: Sharing, Feeds, Remix Lineage.
*   **1.5 Marketing & Acquisition** (Ref: PRD 2.0)
    *   [x] **Landing Page**: Aurora UI, High-conversion design.
    *   [x] **Showcase**: Featured Tracks component.
    *   [x] **Handover**: Seamless Context passing (Landing -> Studio).

---

## 🚀 Phase 2: Commercialization & Assets [NEXT UP]
*Goal: Turn the tool into a Platform with economic value.*

*   **2.1 Web3 Integration** (Ref: PRD 4.5)
    *   [ ] **NFT Minting**: Bridge `Song` (Supabase) to `NFT` (Blockchain).
    *   [ ] **Wallet Connect**: Add `RainbowKit` or comparable to Frontend.
*   **2.2 Marketplace** (Ref: PRD 4.5)
    *   [ ] **Stems Export**: Implement Splitter (Backend) for Vocals/Drums.
    *   [ ] **Storefront**: UI for browsing/buying stems.
*   **2.3 Pro Tier** (Ref: TRD 6.0)
    *   [ ] **Cloud GPU**: Integrate Modal/Replicate adapter for "SaaS Mode".
    *   [ ] **Stripe Integration**: Payments for Pro access.

---

## 📱 Phase 3: Mobile Expansion
*Goal: Ubiquity and Engagement.*

*   **3.1 PWA (Progressive Web App)** (Ref: TRD 6.0)
    *   [ ] **Manifest**: `manifest.json` for "Add to Home Screen".
    *   [ ] **Responsive UI**: Audit Sidebar/Player for Touch targets.
    *   [ ] **Offline Mode**: Service Worker caching for Assets.
*   **3.2 Native Wrapper** (Ref: PRD 4.6)
    *   [ ] **Capacitor**: Wrap Next.js app for App Store/Play Store.
    *   [ ] **Notifications**: Push notifications for "Track Ready".

---

## 🔮 Phase 4: Advanced Creative Tools
*Goal: Deepen the "Studio" capability.*

*   **4.1 Advanced Editing** (Ref: PRD 4.3)
    *   [ ] **In-Painting UI**: Frontend brush tool for waveform selection.
    *   [ ] **Advanced LoRA**: UI for training/loading user styles.
