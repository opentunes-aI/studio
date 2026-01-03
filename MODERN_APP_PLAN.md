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

### Track A: Platform Architecture
- [x] **Routing Refactor**: `app/page.tsx` (Home) vs `app/studio` (App).
- [x] **Auth Gate** [✅ COMPLETED]: Protected `/studio` with `StudioGate`.
    *   Unauthenticated users see "Enter Studio" Login Card.
    *   "Continue as Guest" available for Local Mode.
- [ ] **Middleware**: Handle subdomain rewriting (`app.*` -> `/studio`).

### Track B: User Identity [PLANNED]
*Focus: Identity, Privacy, and Personal Branding.*

1.  **Phase 1: Schema & Storage**
    *   [x] Create `public.profiles` table (linked to `auth.users`).
    *   [x] Setup Storage Bucket `avatars`.
    *   [x] Create Triggers to auto-create profile on User Signup.
2.  **Phase 2: UI Components**
    *   [x] **UserMenu**: Header Dropdown (Profile, Settings, Sign Out).
    *   [x] **ProfileForm**: Modal to edit Username, Bio, and upload Avatar.
    *   [x] **SettingsDialog**: Global Preferences (Studio Defaults, Appearance) using `localStorage` and React Portals.
3.  **Phase 3: Integration**
    *   [x] Replace Email in Header with Avatar/Username.
    *   [ ] Show Authors in Community Feed.

### Track C: Community Ecosystem [PLANNED]
*Focus: From "Solo Creator" to "Collaborative Network".*

1.  **Phase 1: The Scaffold (Infrastructure)**
    *   [x] **Scaffold**: Created `/community` placeholder page with consistent branding.
    *   [x] **Navigation**: Added "Community" link to Landing Page and Studio Header.
    *   [ ] Define Supabase Schema for public sharing (`is_public` flag on tracks).
2.  **Phase 2: Global Feed Integration**
    *   [x] **Landing Integration**: Landing Page "View Global Feed" buttons now point to `/community`.
    *   [ ] Implement "Feed Reader" to fetch latest public tracks.
3.  **Phase 3: Social Interaction**
    *   [ ] **Likes & Comments**: Social graph.
    *   [ ] **Remix/Fork**: "Use this track as seed" button on public items.

---

## 4. Immediate Next Steps
1.  **Community Scaffold**: Connect real DB to the Community Page.
2.  **Middleware**: Handle subdomain routing.
3.  **App: Out-Painting**: Begin Horizon 4 of Studio.
3.  **App: Out-Painting**: Begin Horizon 4 of Studio.
