# Product Requirements Document (PRD) - Opentunes.ai

## 1. Problem Statement
**Context**: Modern AI music tools are either "toys" (simple text-to-audio) or fragmented developer libraries. There is no cohesive **Studio Environment** where creators can collaborate with AI agents to produce specific, high-quality detailed musical works.
**Goal**: Build a commercial-grade **Agentic DAW (Digital Audio Workstation)** that empowers creators to iterate, refine, and produce professional-quality music using a team of specialized AI agents.

## 2. Target Audience
*   **Primary**: "Prosumer" Music Creators (Producers, Hobbyists) who want AI as a collaborator, not a replacement.
*   **Secondary**: Developers/Modders building custom audio agents or models.
*   **Tertiary**: Casual users seeking "Viral" content creation (Meme songs, personalized tracks).

## 3. Success Metrics
*   **Adoption**: Number of Active Installs (Clones/Local Runs).
*   **Engagement**: Average Session Duration (Time spent in Studio).
*   **Viral Loop**: % of generated tracks shared to the Community Feed (Public).
*   **Performance**: Time-to-First-Sound (< 60s on Consumer GPU).
*   **Flexibility**: "Vendor Agnostic" Infrastructure (Zero lock-in to specific LLM or Audio Model providers).

---

## 4. Feature Checklist

### 4.1 Core Studio Experience (MVP)
*   [x] **Agentic Chat Interface**: Real-time collaboration with AI Squad (Director, Producer, Lyricist).
*   [x] **Waveform Visualization**: Interactive audio player with regions.
*   [x] **Immersive Mode**: Collapsible Sidebars for maximum workspace focus.
*   [x] **Studio Controls**: Collapsible Control Panel for BPM, Duration, Steps, Guidance Scale.
*   [x] **Lazy Loading**: Instant app startup with on-demand model loading.
*   [x] **Real-time Console**: Visibility into what the AI is "thinking" (Streaming Logs).

### 4.2 AI Agents (The "Squad")
*   [x] **Director Agent**: Orchestrates tasks and understands user intent.
*   [x] **Producer Agent**: Configures technical audio parameters (RAG-enabled).
*   [x] **Lyricist Agent**: writes verses/choruses (RAG-enabled).
*   [x] **Visualizer Agent**: Generates cover art via Pollinations.ai.
*   [x] **Critic Agent**: coherent checks between lyrics and beat.

### 4.3 Content Management
*   [x] **Local Library**: Save/Delete tracks on local disk.
*   [x] **Dual-Write Sync**: Metadata syncs to Supabase (Cloud) for portability.
*   [x] **Download**: Export tracks as MP3/WAV.
*   [ ] **In-Painting/Repaint**: Select region to regenerate (Partially Implemented in Backend).
*   [ ] **Stem Separation**: Split Audio into Vocals/Drums/Bass.

### 4.4 Social & Community
*   [x] **User Identity**: Global Profiles, Avatars (Gravatar/Custom).
*   [x] **Community Feed**: Discover public tracks from other users.
*   [x] **Engagement**: Like, Play Count, Follow users.
*   [x] **Sharing**: Dynamic OpenGraph cards for social media.
*   [x] **Forking/Remixing**: "Remix this track" button preserves lineage (Parent/Child).

### 4.5 Commercialization (SaaS Model) - Phase 2
*   [ ] **Credit System**: Virtual currency for compute usage (e.g., 10 credits per song).
*   [ ] **Tiers**:
    *   **Free**: Daily credit grant (e.g., 50/day), Public tracks only, Standard Queue.
    *   **Pro ($15/mo)**: Monthly credit grant (e.g., 1000/mo), Private tracks, Stem Separation, Priority Queue.
*   [ ] **Payments**: Stripe Integration for Subscriptions and Credit Top-ups.
*   [ ] **Web3 (Future)**: Optional wallet connection for NFT minting (Phase 3+).

### 4.6 Platform Support
*   [ ] **Mobile PWA**: Installable on iOS/Android via Browser.
*   [ ] **Native Wrapper**: App Store version (Capacitor).

---

## 5. Constraints & Assumptions
*   **Hardware**: User must have an NVIDIA GPU (8GB+ VRAM) for Local Mode.
*   **Network**: Requires Internet for RAG (Supabase), Agents (Ollama/Groq), and Visualizer.
*   **Latency**: First generation has cold-start latency (Model Load); subsequent are faster.
