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
    *   [x] Show Authors in Community Feed.

### Track C: Community Ecosystem [🚀 ACTIVE]
*Focus: From "Solo Creator" to "Collaborative Network" & "Viral Growth Engine".*

#### Vision: The "Sonic Metaverse"
The Community Page is the retention engine. It turns passive listening into active creation via "Remixing", and provides social status to top creators.

1.  **Phase 1: Discovery Engine (The Feed)** [✅ COMPLETED]
    *   [x] **Scaffold**: `/community` page.
    *   [x] **Public Schema**: `is_public` flag and RLS policies.
    *   [x] **Feed Components**: Grid layout with Author Profiles (Avatar/Name).
    *   [x] **Playback**: Robust audio player with Local/Cloud fallback.

2.  **Phase 2: Engagement & Ranking** [✅ COMPLETED]
    *   [x] **Metrics**: functionality for `play_count` and `likes`.
    *   [x] **Sorting**: Tabs for "Latest", "Trending" (Most Played), and "Top Charts".
    *   [x] **Social Actions**: Like (Heart) toggle with optimistic UI updates.
    *   [x] **Follow System**: Users can follow creators (Social Graph).
    *   [x] **Messaging**: Direct Message button (Scaffold).
    *   [ ] **Comment System**: (Future) Threaded discussions.

3.  **Phase 3: The Viral Loop (Remixing)** [🚀 IN PROGRESS]
    *   [x] **Community Showcase**: Top 3 Hero Section replacing static header.
    *   [x] **"Remix" Button**: One-click deep-link to Studio with `initialPrompt` pre-filled.
    *   [x] **Download**: Added direct MP3 download button for public tracks.
    *   [ ] **"Forking"**: (Future) Maintain lineage (Parent Song ID -> Child Song).

4.  **Phase 4: Marketplace (Monetization)** [PLANNED]
    *   [ ] **Stems**: Selling individual tracks (Bass, Drums).
    *   [ ] **Tips**: Send ETH/SOL to creator.

---

## 4. Immediate Next Steps
1.  **Middleware**: Handle subdomain routing.
2.  **App: Out-Painting**: Begin Horizon 4 of Studio.
