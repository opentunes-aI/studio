# Opentunes.ai: Master Development Plan

This document tracks the phased development of the **Opentunes** ecosystem.
Scope: **Foundation -> Studio (Creation) -> Community (Discovery) -> Agentic Intelligence -> Commercialization.**

---

## Phase 0: Infrastructure & Core Foundation [✅ COMPLETE]
*Focus: Robustness, Cloud Readiness, and Scalability.*

### 0.1 Infrastructure
*   [x] **Config**: Centralized Env Vars (`NEXT_PUBLIC_API_URL`, `OLLAMA_BASE_URL`).
*   [x] **Security**: Configurable CORS (`CORS_ALLOWED_ORIGINS`).
*   [x] **Database**: Structured SQL Migrations (`acestep_studio/migrations/`).
*   [x] **Cleanup**: Organized Repo (`tools/`, `docs/`, `gradio/`).
*   [x] **Dual Write Architecture**: Writes to Disk (Speed) + queues Sync to Supabase (Persistence). *Why: Critical for the **Viral Loop** (instant creation + sharable backend).*
*   [x] **Supabase Schema**: `songs` table + `music` bucket (Public). *Why: Single Source of Truth for Community Remixing & Discovery.*
*   [x] **RLS Policies**: "Authenticated Uploads" / "Public Reads". *Why: Secure user content while allowing public sharing.*

### 0.2 The Deployment Vision (Cost-Optimized Cloud)
*Goal: Zero-to-Low Cost scalability using distributed services.*

*   **Frontend**: Deployed to **Cloudflare Pages** (Free Tier).
    *   *Why*: Infinite scalability, global edge network, perfect for our static/Next.js hybrid site.
*   **Backend (Inference)**: Decoupled architecture.
    *   *Concept*: The Audio Model is fully contained in this repo. We only need a provider for **GPU Hardware**.
    *   **Strategy**: Continue Local Development for speed. **Defer Cloud Provider selection** until Beta Launch.
    *   **Leading Candidates**:
        1.  **Replicate / Modal**: Serverless GPU (Pay-per-second). Best for on-demand scaling.
        2.  **Google Colab**: Free Tier GPU (via Tunnels). Best for zero-cost demos.
        3.  **BYO-GPU**: Users with Gaming PCs run backend locally.
*   **Data Layer**: **Supabase** (Free Tier).
    *   *Why*: Managed Postgres + Auth + Storage fits entirely within free limits for early growth.

### 0.3 LLM Agnostic Infrastructure [✅ COMPLETE]
*Goal: Decouple Intelligence from Execution using LiteLLM.*

*   **Strategy**: "Plug & Play" providers.
    *   **Dev**: **Ollama** (Local). Free & offline.
    *   **Prod**: **Groq** or **OpenRouter** (API).
*   **Implementation Checklist**:
    *   [x] **Adapter**: Integrated `LiteLLMModel` in `director.py`.
    *   [x] **Config**: Environment-based Model ID routing (`AGENT_MODEL_ID`).

### 0.4 Audio Model Agnostic Infrastructure [✅ COMPLETE]
*Goal: Decouple Audio Generation from specific model weights.*

*   **Context**: Currently, `ACEStepPipeline` is hardcoded. We want to support future models (Stable Audio, AudioLDM) without backend refactors.
*   **Action Plan**:
    *   [x] **Interface**: Created abstract `AudioEngine` class (`acestep/models/engine.py`).
    *   [x] **Adapter**: Wrapped `ACEStepPipeline` into `ACEStepEngine` (`acestep/models/wrappers/acestep_engine.py`).
    *   [x] **Registry**: Built Factory pattern to load Engine based on `AUDIO_MODEL_TYPE` env var (`acestep/models/factory.py`).

### 0.5 Mobile App Strategy
*   **Stage 1: PWA (Progressive Web App)**:
    *   *Impact*: Instant "App-like" experience. Users install via browser. Zero code rewrite.
*   **Stage 2: Capacitor / React Native**:
    *   *Impact*: If we need native features (Push Notifications, Background Audio), we can reuse our React logic with Capacitor or migrate to React Native.

---

## Phase 1: The Studio (Creation Engine) [✅ COMPLETE]
*Focus: Audio Generation, Visual Identity, and MVP Features.*

### 1.1 Core Features
*   [x] **Engine**: FastAPI Backend + Next.js Frontend.
*   [x] **Generation**: Text-to-Audio, Repaint, Remix.
*   [x] **Visuals**: "Deep Space" Glassmorphism Theme.
*   [x] **Navigation**: Sidebar, Library, Settings.

---

## Phase 2: The Landing Page (Growth Engine) [✅ COMPLETE]
*Focus: Branding and User Acquisition.*

### 2.1 Hook & Engagement
*   [x] **Visuals**: CSS-only Aurora Backgrounds, Glass Cards.
*   [x] **Showcase**: "HomeShowcase" component for top tracks.
*   [x] **Handover**: "Describe Vibe" -> Studio Pre-fill.

---

## Phase 3: User Identity & Community [✅ COMPLETE]
*Focus: Social Graph and Collaboration.*

### 3.1 Social Layer
*   [x] **Profiles**: Pubic Profiles, Avatars.
*   [x] **Interaction**: Likes, Plays, Follows.
*   [x] **Feed**: "Trending" and "Latest" algorithms.

---

## Phase 4: Agentic Intelligence (The Core) [🚀 NEXT UP]
*Focus: Autonomous Reasoning, RAG Memory, and Specialized Agents.*

### 4.1 Architecture: The "Black Box" Pattern
*Design Philosophy: The Intelligence Layer is a self-contained module acting as a "Brain" for the dumb Application Layer.*

*   **1. The Contract (Input)**:
    *   **Endpoint**: `POST /agent/chat` acts as the single entry point.
    *   **Payload**: `{ message: string, history: [] }`. The App knows *nothing* about internal agents.

*   **2. The Brain (Internal Logic)**:
    *   **Location**: `acestep/api/agents/`.
    *   **Structure**:
        *   **Director**: Public Interface & Orchestrator.
        *   **Specialists**: (Producer, Lyricist, Visualizer) Private implementations.
        *   **RAG**: Internal long-term memory.
    *   *Modularity*: This folder can be refactored/replaced entirely without breaking the Frontend.
    *   **LLM Agnostic**: Built on `LiteLLM`, allowing 1-line swaps between Ollama, Groq, OpenAI, or Anthropic via `.env` adjustments.

*   **3. The Side Effects (Output)**:
    *   **Events**: Stream standardized JSON packets.
        *   `type: "log"` -> UI Transparency.
        *   `type: "result"` -> State Updates (e.g., `action: "configure"`, `action: "update_lyrics"`).
    *   **Frontend Role**: purely a "Renderer" of these events. It does not calculate logic.

### 4.2 The Agent Squad (Roles)
*   **Implementation Status**:
    *   [x] **Director**: `DirectorAgent` orchestrator (`director.py`).
    *   [x] **Specialists**: Private agents (`producer.py`, `lyricist.py`, `visualizer.py`).
    *   [x] **Tools**: RAG tools connected to Specialists.

1.  **🤖 The Director (Orchestrator)**
    *   *Role*: Understands User Intent. Breaks complex requests ("Make a sad rap song") into sub-tasks.
    *   *Tools*: `delegate_task`.
2.  **🎹 The Producer (Audio Engineer)**
    *   *Role*: Master of Sound. Knows BPM, Instruments, and `configure_studio`.
    *   *RAG*: Searches `search_memory` (Audio) for "Sound Recipes".
3.  **✍️ The Lyricist (Songwriter)**
    *   *Role*: Master of Words. Writes structures (`[Verse]`, `[Chorus]`) and rhymes.
    *   *RAG*: Searches `search_memory` (Lyrics) for style references.
4.  **🎨 The Visualizer (Creative Director)**
    *   *Role*: Master of Imagery. Generates cover art prompts.
    *   *Model API*: **[Pollinations.ai](https://pollinations.ai)** (Default) or ComfyUI.
    *   *Output*: Attaches image to Song Metadata.
5.  **🧐 The Critic (Quality Control)**
    *   *Role*: Reviewer. Checks if outputs match User Intent and RAG insights.
    *   *Action*: Can reject a plan and ask for retry.

### 4.3 Agentic RAG (Autonomous Cycle)
*   **Implementation Status**:
    *   [x] **Database**: `pgvector` extension enabled, `agent_memory` table schema.
    *   [x] **Engine**: `EmbeddingGenerator` service implemented (`rag.py`).
    *   [x] **Retrieval**: `search_memory` tool with Cosine Similarity.

*   **Definition**: Unlike linear RAG (Look -> Answer), our agents use a **Reasoning Loop**:
    1.  **Plan**: "I need examples of sad rap."
    2.  **Act**: Query Vector DB.
    3.  **Observe**: "Results are too generic."
    4.  **Refine**: "Query for 'Emo Rap' instead." -> **New Search**.
    5.  **Synthesize**: Use best result.

### 4.4 Interaction Workflow (Parallel Execution)
*   **Implementation Status**:
    *   [x] **Parallelism**: `asyncio.gather` runs Producer and Lyricist simultaneously.
    *   [x] **Critic Loop**: Logic integration to review outputs before finalizing.

**Scenario**: *"Make a dark cyber-rap song about AI."*

1.  **Step 1: The Brief (Director)**
    *   *Input*: User Request.
    *   *Output*: **Creative Brief** (Genre: Cyberpunk, Mood: Dark, Topic: AI).
    *   *Action*: Spawns `Lyricist` and `Producer` tasks **simultaneously**.

2.  **Step 2: Creation (Parallel)**
    *   **🟡 Lyricist**:
        *   *Agentic Loop*: Search "Cyber-rap" -> (No results) -> Search "Sci-Fi Hip Hop" -> Found!
        *   *Draft*: Writes Verses based on retrieved flow.
    *   **🟠 Producer**:
        *   *Agentic Loop*: Search "Dark Rap" -> Retrieves "Distorted 808" prompt.
        *   *Config*: Sets BPM 140, Instruments: Synth.

3.  **Step 3: Convergence & Quality Control (Critic)**
    *   *Input*: Lyrics + Audio Config.
    *   *Check*: "Do lyrics require a slower BPM?" (e.g., "Fast rap needs slow beat" vs "Fast beat").
    *   *Verdict*: **APPROVED** (or `Producer.retry(BPM=90)`).

4.  **Step 4: Visualization (Visualizer)**
    *   *Action*: Generates Cover Art.
    *   *Output*: Attached to final song.

5.  **Step 5: Execution (Director)**
    *   Finalizes job.

### 4.5 Scalability
*   **Modular Design**: New agents (e.g., "Marketing Agent") can be added easily.

### 4.6 UX Specifications: The "Living" Studio
*   **Implementation Status**:
    *   [x] **Streaming**: Real-time JSON log streaming (`StreamingResponse`).
    *   [x] **UI**: `AgentChat` component rendering standard events.
    *   [x] **Verification**: All Agent roles (Director, Producer, Lyricist, Critic, Visualizer) visually confirmed.

We must show the user *exactly* what the AI team is doing in real-time.

*   **🎬 The Director**:
    *   *Status*: "Analyzing request..." -> "Planning tasks..."
    *   *Visual*: Main Log Header.
*   **🎹 The Producer**:
    *   *Status*: "Searching Audio Memory (RAG)..." -> "Configuring Studio..."
    *   *Visual*: Pink Icon. Shows Similarity Score of found examples (optional).
*   **✍️ The Lyricist**:
    *   *Status*: "Searching Lyric Memory (RAG)..." -> "Drafting Verses..."
    *   *Visual*: Blue Icon. Shows snippet of drafted text.
*   **🧐 The Critic**:
    *   *Status*: "Reviewing Coherence..." -> "Approved ✅" or "⚠️ Warning: BPM mismatch".
    *   *Visual*: Yellow Icon. Acts as an **Advisor** (Non-blocking). Flags inconsistencies for user review.
*   **🎨 The Visualizer**:
    *   *Status*: "Dreaming up Cover Art..." -> "Painting..."
    *   *Visual*: Purple Icon. Shows image generation progress.

---


### 4.7 Phase 4 Reinforcement (Robustness & Optimization) [✅ COMPLETE]
*Focus: Stability, Performance, and Error Handling for Production.*

1.  **Frontend Architecture**:
    *   [x] **Refactor**: Split `AgentChat.tsx` into `useChatStream` (Hook) and `MessageBubble` (UI).
    *   [x] **State**: Decouple Stream parsing from UI rendering.

2.  **Backend Stability**:
    *   [x] **JSON Robustness**: Replace regex parsing with Pydantic-based `parse_llm_json`.
    *   [x] **Config**: Move hardcoded Model IDs to `.env` (`AGENT_MODEL_ID`).
    *   [x] **Startup Speed**: Implement Lazy Loading for `RAGEngine`.
    *   [x] **Output Sanitization**: Stripping tool logs (`Calling tools...`) from UI.
    *   [x] **Type Safety**: Robust handling of `smolagents` native types (`AgentText`).
    *   [x] **Heuristic Recovery**: Auto-wrapping of incomplete Agent results (Producer/Lyricist).

---

### 4.8 Validation & Testing Strategy [✅ COMPLETE]
*Focus: Ensuring reliability across the hybrid architecture.*

#### 1. Infrastructure Reference
*   **Frontend Studio**: `http://localhost:7865` (Next.js)
*   **Backend API**: `http://localhost:8000` (FastAPI)

#### 2. Test Suite
*   [x] **Integration Test (Headless)**:
    *   *Command*: `python test_agent_headless.py`
    *   *Scope*: Verifies Backend-to-Model-to-JSON pipeline without UI. Checks Streaming, Plan Parsing, and Agent Communication.
*   **Browser Smoke Test**:
    *   *Scope*: Verifies UI Rendering, Agent Log streams, and Side Effects (e.g., Studio Config).
    *   *Requirement*: **Antigravity Chrome Extension** installed on Profile `abi666`.
*   **Static Analysis**:
    *   *Command*: `npm run lint` (in `acestep_studio`).
    *   *Scope*: Verifies TypeScript type safety for refactored components.

---

## Phase 5: The Viral Loop & Growth [✅ COMPLETE]
*Focus: Retention, Sharing, and SEO.*

### 5.1 Features
*   [x] **"Forking"**: Maintain lineage (Parent Song ID -> Child Song).
*   [x] **OpenGraph**: Dynamic sharing cards.
*   [x] **Download**: Direct MP3 download.

---

## Phase 6: Commercialization & Web3 [🚀 NEXT UP]
*Focus: Monetization and Assets.*

### 6.1 Features
*   [ ] **Blockchain Bridge**: "Mint this Song" (NFT Metadata).
*   [ ] **Stems Marketplace**: Selling individual tracks.
