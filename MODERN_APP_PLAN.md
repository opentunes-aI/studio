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
*Focus: Growth, SEO, Branding, and User Onboarding.*

### Phase 1: Infrastructure & Launch [🚀 ACTIVE]
- [x] **SaaS Architecture**: Refactored `app/page.tsx` (Home) vs `app/studio` (App).
- [x] **Hero Page**: High-conversion dark mode landing page.
- [ ] **Middleware**: Domain routing logic (`app.*` -> `/studio`).
- [ ] **Pricing Page**: Subscription tiers display.
- [ ] **Auth Integration**: "Sign In" button redirects to Studio dashboard.

### Phase 2: Content & Growth
- [ ] **Blog Engine**: SEO-optimized content.
- [ ] **Case Studies**: Showcase "Best of Opentunes".

---

## 4. Immediate Next Steps
1.  **Deploy Middleware**: Handle subdomain routing.
2.  **Pricing Page**: Build `app/pricing` section on Home.
3.  **App: Out-Painting**: Begin Horizon 4 of Studio.
