# Opentunes.ai: Master Development Plan

This document tracks the phased development of the **Opentunes** ecosystem.
Scope: **Foundation -> Studio (Creation) -> Community (Discovery) -> Agentic Intelligence -> Commercialization.**

---

## Phase 0: Infrastructure & Core Foundation [✅ COMPLETE]
*Focus: Robustness, Cloud Readiness, and Scalability.*

### 0.1 Infrastructure
*   [x] **Config**: Centralized Env Vars (`NEXT_PUBLIC_API_URL`, `OLLAMA_BASE_URL`).
*   [x] **Security**: Configurable CORS (`CORS_ALLOWED_ORIGINS`).
*   [x] **Hybrid Storage**: "Dual Write" (Local + Cloud Supabase) pipeline.
*   [x] **Database**: Structured SQL Migrations (`acestep_studio/migrations/`).
*   [x] **Cleanup**: Organized Repo (`tools/`, `docs/`, `gradio/`).

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

*   **3. The Side Effects (Output)**:
    *   **Events**: Stream standardized JSON packets.
        *   `type: "log"` -> UI Transparency.
        *   `type: "result"` -> State Updates (e.g., `action: "configure"`, `action: "update_lyrics"`).
    *   **Frontend Role**: purely a "Renderer" of these events. It does not calculate logic.

### 4.2 The Agent Squad (Roles)
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
*   **Definition**: Unlike linear RAG (Look -> Answer), our agents use a **Reasoning Loop**:
    1.  **Plan**: "I need examples of sad rap."
    2.  **Act**: Query Vector DB.
    3.  **Observe**: "Results are too generic."
    4.  **Refine**: "Query for 'Emo Rap' instead." -> **New Search**.
    5.  **Synthesize**: Use best result.

### 4.4 Interaction Workflow (Parallel Execution)
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

### 4.7 Implementation Checklist (Action Items) [COMPLETED]
1.  **Memory Foundation (The Database)**
    *   [x] **Database**: Enable `pgvector` extension in Supabase.
    *   [x] **Schema**: Create `agent_memory` table (stores Prompt, Lyrics, Embedding, Rating).

2.  **Agentic RAG Core (The Engine)**
    *   [x] **Embedding Service**: Implement `EmbeddingGenerator` (`acestep/api/rag.py`).
    *   [x] **Retrieval Logic**: Implement `search_memory` tool with Cosine Similarity (`match_agent_memory` RPC).
    *   [x] **Reasoning Loop**: Agents enabled with RAG Tools (`search_audio_library`) to query before generating.
    *   [x] **Ingest Pipeline**: (Deferred to Phase 5) Create auto-trigger to embed and store songs when Rated > 4 stars.

3.  **The Agent Refactor (The Squad)**
    *   [x] **Director**: Implement `DirectorAgent` class (`acestep/api/agents/director.py`).
    *   [x] **Specialists**: Split monolithic service into `producer.py`, `lyricist.py`, `visualizer.py`.
    *   [x] **Tool Connection**: Connect RAG tools to Producer/Lyricist agents.

4.  **The Interaction Loop**
    *   [x] **Parallel Execution**: `director.py` runs Producer and Lyricist via `asyncio.gather`.
    *   [x] **Critic Integration**: `director.py` invokes Critic after draft generation.

5.  **UI/UX Integration**
    *   [x] **Streaming**: Implement `StreamingResponse` in Backend (`main.py`) for real-time logs.
    *   [x] **Visualization**: Frontend listens to stream and renders agent steps (`AgentChat.tsx`).
    *   [x] **Verification**: Confirm "Director" log appears immediately.
    *   [x] **Verification**: Confirm "Producer" searches Memory before configuring.
    *   [x] **Verification**: Confirm "Lyricist" searches Memory before writing.
    *   [x] **Verification**: Confirm "Visualizer" generates art.
    *   [x] **Verification**: Confirm "Critic" validates output.

---


### 4.8 Phase 4 Reinforcement (Robustness & Optimization) [✅ COMPLETE]
*Focus: Stability, Performance, and Error Handling for Production.*

1.  **Frontend Architecture**:
    *   [x] **Refactor**: Split `AgentChat.tsx` into `useChatStream` (Hook) and `MessageBubble` (UI).
    *   [x] **State**: Decouple Stream parsing from UI rendering.

2.  **Backend Stability**:
    *   [x] **JSON Robustness**: Replace regex parsing with Pydantic-based `parse_llm_json`.
    *   [x] **Config**: Move hardcoded Model IDs to `.env` (`AGENT_MODEL_ID`).
    *   [x] **Startup Speed**: Implement Lazy Loading for `RAGEngine`.

---

### 4.9 Validation & Testing Strategy [✅ ACTIVE]
*Focus: Ensuring reliability across the hybrid architecture.*

#### 1. Infrastructure Reference
*   **Frontend Studio**: `http://localhost:7865` (Next.js)
*   **Backend API**: `http://localhost:8000` (FastAPI)

#### 2. Test Suite
*   **Integration Test (Headless)**:
    *   *Command*: `python test_agent_headless.py`
    *   *Scope*: Verifies Backend-to-Model-to-JSON pipeline without UI. Checks Streaming, Plan Parsing, and Agent Communication.
*   **Browser Smoke Test**:
    *   *Scope*: Verifies UI Rendering, Agent Log streams, and Side Effects (e.g., Studio Config).
    *   *Requirement*: **Antigravity Chrome Extension** installed on Profile `abi666`.
*   **Static Analysis**:
    *   *Command*: `npm run lint` (in `acestep_studio`).
    *   *Scope*: Verifies TypeScript type safety for refactored components.

---

## Phase 5: The Viral Loop & Growth [PLANNED]
*Focus: Retention, Sharing, and SEO.*

### 5.1 Features
*   [ ] **"Forking"**: Maintain lineage (Parent Song ID -> Child Song).
*   [ ] **OpenGraph**: Dynamic sharing cards.
*   [ ] **Download**: Direct MP3 download.

---

## Phase 6: Commercialization & Web3 [PLANNED]
*Focus: Monetization and Assets.*

### 6.1 Features
*   [ ] **Blockchain Bridge**: "Mint this Song" (NFT Metadata).
*   [ ] **Stems Marketplace**: Selling individual tracks.
