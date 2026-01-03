# Opentunes.ai: Master Development Plan

This document tracks the development of the **Opentunes** ecosystem.
The platform is divided into two distinct domains:
1.  **Opentunes.ai (Marketing)**: Public facing landing page for user acquisition.
2.  **App.Opentunes.ai (Studio)**: The authenticated SaaS application for music creation.

---

## PART A: The Studio App Plan (App.Opentunes.ai)
*Focus: Agentic Workflow, Audio Generation, and Web3 Ownership.*

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

### Horizon 3: The "Agentic Layer" (Intelligent Workflow) [✅ COMPLETED]
*Goal: Implement the "AI Producer" to abstract complexity.*

#### Phase 3.1: The Parameter Agent (Backend)
- [x] **Infrastructure**: Integrated `smolagents` with local Ollama (`qwen2.5`).
- [x] **Text-to-Config**: "Make it punchier" -> Agent sets defaults.
- [x] **Param-Bot**: Floating Chat Interface.

#### Phase 3.2: Multi-Agent Orchestration
- [x] **Architecture**: Developed Planner/Executor pattern for robust sequential execution.
- [x] **The Agents**: Producer (Config), Lyricist (Writing), Visualizer (Cover Art).
- [x] **UI**: Multi-session chat history and composite message stacking.

### Horizon 4: Advanced Creation (The "Song" Layer) [TODO]
*Goal: Move from "Clips" to "Songs".*
- [ ] **Extension (Out-Painting)**: "Continue this track for 30s".
- [ ] **Stem Separation**: Separate Vocals/Instrumentals.

### Horizon 5: Commercialization & Web3 (The Bridge) [TODO]
*Goal: Monetization and Assets.*
- [ ] **Blockchain Bridge**: "Mint this Song" (NFT Metadata).
- [ ] **Deployment**: Dockerize for GPU Cloud.
- [ ] **Credit System**: Stripe/Crypto payments.

---

## PART B: The Home Landing Plan (Opentunes.ai)
*Focus: Growth, Branding, and On-Chain Value Prop.*

### Phase 1: The "Hook" (Hero & Value Props) [✅ COMPLETED]
1.  **Hero Section**:
    *   **Interactive Input**: "Describe your vibe..." -> Redirects to Studio pre-filled.
    *   **Handover**: [✅ COMPLETED] Wired up `initialPrompt` query param in AgentChat.
2.  **Branding & Navigation** [✅ COMPLETED]:
    *   **Logo**: Updated Opentunes Note/CD Logo & Favicon.
    *   **Consistency**: Unified Header styling between Home and Studio.
3.  **Value Prop Grid**:
    *   **Agentic Intelligence**: "Don't just prompt. Direct a team of agents (Producer, Lyricist, Visualizer)."
    *   **Web3 Monetization**: "Mint your hits. Royalties are baked in from day one."
    *   **Pro Fidelity**: "High-definition audio generation, just like Suno/Udio but open."

### Phase 2: Engagement & Social Proof [✅ COMPLETED]
1.  **Audio Carousel**: Implemented `HomeShowcase` grid.
2.  **Agent Visualizer**: (Included in Hero text).
3.  **Community Feed**: Static placeholder implemented.

### Phase 3: Commercial & SEO [🚀 ACTIVE]
1.  **Pricing Plans**: Implemented `HomePricing` (Free/Pro/Studio).
2.  **SEO Optimization**: Tags for "AI Music Generator", "Web3 Music".

---

## 4. Immediate Next Steps
1.  **Deploy Middleware**: Handle subdomain routing.
2.  **Pricing Page**: Build `app/pricing` section on Home.
3.  **App: Out-Painting**: Begin Horizon 4 of Studio.
