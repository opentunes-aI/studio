# Opentunes.ai: The First Agentic AI Music Generation App

## 1. Product Vision
**"Your Personal AI Producer"**
Opentunes moves beyond "slot machine" generation (Suno/Udio) to **Agentic Co-Creation**.
The user directs the session, and the **AI Producer Agent** handles the complexity—tweaking parameters, writing lyrics, and organizing takes.

**Dual Value Proposition:**
1.  **Agentic Studio (Web 2.0)**: A "Pro" workflow where AI Agents help you craft the perfect track.
2.  **On-Chain Music (Web 3.0)**: (Future) Direct distribution and monetization of your AI masterpieces via Blockchain.

---

## 2. Strategic Roadmap

### Horizon 1: The Core Foundation (MVP) [✅ COMPLETED]
*Goal: Prove the architecture works with robust error handling and basic generation.*
**(See previous logs for completed items)**

### Horizon 2: The "Creator Studio" (Feature Completeness) [✅ COMPLETED]
*Goal: Match the creative workflows of Suno/Udio.*
- [x] **Branding**: Implemented Header/Footer.
- [x] **Variations/In-Painting**: Repaint and Remix logic.
- [x] **Social Network**: Profiles, Explore Feed, and Sharing.
- [x] **Visual Polish**: Dynamic Gradients and Genre Icons.
- [x] **Library Management**: Cloud/Local sync and file deletion.

### Horizon 3: The "Agentic Layer" (Intelligent Workflow) [🚀 ACTIVE]
*Goal: Implement the "AI Producer" to abstract complexity.*

#### Phase 3.1: The Parameter Agent (Backend) [✅ COMPLETED]
- [x] **Infrastructure**: Integrated `smolagents` with local Ollama (`qwen2.5`).
- [x] **Text-to-Config**: "Make it punchier" -> Agent sets paramaters via Tool Calling.
- [x] **Param-Bot**: Floating Chat Interface implemented.

#### Phase 3.2: Multi-Agent Collaboration [✅ COMPLETED]
- [x] **The Lyricist**: Specialized agent for structure-aware songwriting (Verse/Chorus rules).
- [x] **The Critic**: Agent that reviews "Prompt Compliance" before generation.
- [x] **The Visualizer**: Art Director agent for generating cover art (Pollinations.ai).
- [x] **Orchestrator Architecture**: Implemented Planner/Executor pattern for robust multi-tool execution with local LLMs.

### Horizon 4: Advanced Creation (The "Song" Layer)
*Goal: Move from "Clips" to "Songs".*
- [ ] **Extension (Out-Painting)**: "Continue this track for 30s".
- [ ] **Stem Separation**: Separate Vocals/Instrumentals.

### Horizon 5: Commercialization & Web3 (The Bridge)
*Goal: Monetization and Assets.*
- [ ] **Blockchain Bridge**: "Mint this Song" (NFT Metadata).
- [ ] **Deployment**: Dockerize for GPU Cloud.
- [ ] **Credit System**: Stripe/Crypto payments.

---

## 3. Technology Stack (Agentic Era)

| Component | Technology | Reasoning |
| :--- | :--- | :--- |
| **Agents** | **Smolagents / LangGraph** | Code-centric, lightweight orchestration for Local LLMs. |
| **LLM** | **Ollama (Llama 3)** | Free, local, private intelligence. |
| **Frontend** | Next.js 14 + Tailwind | High performance Studio UI. |
| **Backend** | FastAPI + Celery | Async job processing. |
| **Database** | Supabase | Auth, Metadata, Social Graph. |

## 4. Immediate Next Steps (Horizon 4)
1.  Implement **Out-Painting** (Track Extension).
2.  Implement **Stem Separation**.
3.  Deploy **Web3 Bridge** logic.
