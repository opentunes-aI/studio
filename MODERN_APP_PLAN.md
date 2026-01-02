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

### Horizon 3: The "Agentic Layer" (Intelligent Workflow) [🚀 NEXT UP]
*Goal: Implement the "AI Producer" to abstract complexity.*

#### Phase 3.1: The Parameter Agent (Backend)
- [ ] **Infrastructure**: Integrate `smolagents` or `langchain` with local Ollama (Llama 3).
- [ ] **Text-to-Config**: "Make it punchier" -> Agent sets `cfg_scale=20`, `steps=64`.
- [ ] **Param-Bot**: A chat interface to modify the current track state via natural language.

#### Phase 3.2: Multi-Agent Collaboration
- [ ] **The Lyricist**: Specialized agent for structure-aware songwriting (Verse/Chorus rules).
- [ ] **The Critic**: Agent that reviews "Prompt Compliance" before generation.

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

## 4. Immediate Next Steps (Horizon 2)
1.  Implement **Branding**.
2.  Implement **Variations (Retake)** logic.
3.  Implement **Region Selection** for Repainting.
