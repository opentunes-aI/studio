# Opentunes.ai: Master Development Plan

This document tracks the phased development of the **Opentunes** ecosystem.
Scope: **Foundation -> Studio (Creation) -> Community (Discovery) -> Commercialization.**

---

## 1. Phase 0: Infrastructure & Core Foundation [✅ COMPLETE]
*Focus: Robustness, Cloud Readiness, and Scalability. "Build it right so it deploys anywhere."*

### 1.1 Impact Assessment
*Before modifying the foundation, we assess risks to existing features:*
*   **Studio App (Creation)**: currently relies on local disk (`./outputs`).
    *   *Impact*: Must be updated to handle "Hybrid Storage" (Local + Cloud). Frontend needs `NEXT_PUBLIC_API_URL` environment variable.
    *   *Risk*: Low. Playback logic will try Local URL -> fallback to Cloud URL.
*   **Community Feed (Social)**: currently relies on `local_filename` and hardcoded `localhost` URLs.
    *   *Impact*: "Public Sharing" currently fails for remote users. Moving to Cloud Storage fixes this.
    *   *Risk*: Medium. Database `songs` table must store the Cloud URL. Existing records might need migration or remain local-only.

### 1.2 Configuration Management
*   [x] **Centralized Env Vars**: Refactor all hardcoded URLs to use environment variables.
    *   Frontend: `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000`), `NEXT_PUBLIC_SUPABASE_URL`.
    *   Backend: `OLLAMA_BASE_URL` (default: `http://localhost:11434`), `ACE_OUTPUT_DIR`.
*   [x] **CORS Security**: Implemented `CORS_ALLOWED_ORIGINS` (default `*`) for production restrictions.

### 1.3 Hybrid Storage Engine (Local + Cloud)
*   **Strategy**: "Dual Write, Smart Read".
    *   **Write**: Generator saves to Local Disk AND uploads to Supabase Storage immediately.
    *   **Read**: Frontend attempts Local URL first; falls back to Supabase CDN if unreachable (404/Network Error).
    *   **Priority Reference**: Local is default for speed/dev; Cloud is default for public/sharing.
*   [x] **Backend Update**: Modify `main.py` pipeline to perform async upload to Supabase bucket `generated_audio` after file generation.
*   [x] **Frontend Utility**: Create `getAudioUrl(song)` resolver that handles the fallback logic transparently.

### 1.4 Deployment Strategy (Free Prototyping)
*   **Frontend**: Cloudflare Pages (Free Bandwidth & Hosting).
*   **Backend API**:
    *   **Option A (Free)**: Google Colab w/ ngrok tunnel. (Run API in notebook, paste URL to Frontend).
    *   **Option B (Serverless)**: Replicate (Pay-per-sec, Scale-to-Zero).
*   [x] **Containerization**: Create `Dockerfile` (Required for Replicate/Render).
*   [x] **Colab Notebook**: Create `colab_api.ipynb` that installs deps, runs FastAPI, and starts ngrok.

### 1.5 Web3 Readiness Prep [FUTURE-PROOFING]
*   **Goal**: Ensure data structures support future on-chain minting without migration pain.
*   [x] **Database Schema**: Created `supabase_web3_prep.sql` to add `wallet_address`, `content_hash`, `nft_contract_address`.
*   [x] **Frontend Scaffold**: Created `useWeb3Store` with mock connection logic for UI validation.
    *   *Why*: Required for NFT metadata integrity. We must prove the file hasn't changed since generation.
    *   *Backend*: Python to calculate hash during generation and save to DB.

### 1.6 Operational Maturity
*   [ ] **DB Migrations**: Consolidate `supabase_*.sql` scripts into a structured `migrations/` folder or unified init script.
*   [ ] **Documentation**: Update `README.md` and `USE-GUIDE.md` with new Env Var setup and Deployment guide.

---

## 2. Phase 1: The Studio (Creation Engine) [✅ COMPLETED]
*Focus: Agentic Workflow, Audio Generation, and Web3 Ownership.*

### 1.1 Core Foundation (MVP)
*   [x] **Architecture**: FastAPI Backend + Next.js Frontend.
*   [x] **Basic Generation**: Text-to-Audio pipeline working locally.
*   [x] **Library Management**: Cloud/Local sync and file deletion.

### 1.2 Feature Completeness
*   [x] **Visual Refinement (v2)**: Applied "Deep Space" theme to Sidebar, Control Panel, and Waveform.
*   [x] **Branding**: Implemented Header/Footer.
*   [x] **Variations**: Repaint and Remix logic.
*   [x] **Visual Polish**: Dynamic Gradients and Genre Icons.
*   [x] **Agentic Layer**: "AI Producer" (Chat Interface) to abstract complexity.
    *   [x] Param-Bot, Multi-Agent Orchestration (Producer, Lyricist).

### 1.3 Future Studio Features (Phase 3+)
*   [ ] **Out-Painting**: "Continue this track for 30s".
*   [ ] **Stem Separation**: Separate Vocals/Instrumentals.

---

## 3. Phase 2: The Landing Page (Growth Engine) [✅ COMPLETED]
*Focus: User Acquisition, Branding, and On-Chain Value Prop.*

### 2.1 The "Hook" Setup
*   [x] **Visual Overhaul (v2)**: Implemented "Deep Space" theme, CSS Aurora background, and glassmorphism.
*   [x] **Hero Section**: Interactive "Describe your vibe" input redirects to Studio.
*   [x] **Handover**: `initialPrompt` query param populates Producer Agent.
*   [x] **Branding**: Unified Header styling, Logo, and Favicon.

### 2.2 Engagement & Social Proof
*   [x] **Audio Carousel**: `HomeShowcase` grid displaying best generated tracks.
*   [x] **Agent Visualizer**: Text explanation of the multi-agent system.
*   [x] **Value Props**: "Web3 Monetization", "Pro Fidelity", "Agentic Intelligence".

### 2.3 Commercial & SEO [🚀 ACTIVE]
*   [x] **Pricing Plans**: Free/Pro/Studio tier visualization (`HomePricing`).
*   [x] **SEO**: Meta tags for "AI Music Generator".
*   [x] **Global Footer**: Social Media icons (X, Instagram, TikTok, Discord).

---

## 4. Phase 3: User Identity & Community [✅ COMPLETED]
*Focus: From "Solo Creator" to "Collaborative Network".*

### 3.1 Identity System
*   [x] **Profiles**: `public.profiles` table, Avatar upload, UserMenu.
*   [x] **Settings**: Global Preferences (Studio Defaults, Appearance).

### 3.2 Discovery Engine (The Feed)
*   [x] **Feed Components**: Grid layout with Author Profiles.
*   [x] **Playback**: Robust audio player with Local/Cloud fallback.
*   [x] **Filtering**: "Latest", "Trending" (Play Count), "Top Charts".

### 3.3 Social Graph
*   [x] **Engagement**: Like (Heart) toggle with optimistic UI.
*   [x] **Follow System**: Users can follow creators.
*   [x] **Messaging**: Direct Message button (UI Scaffold).

---

## 5. Phase 4: The Viral Loop & Growth [🚀 IN PROGRESS]
*Focus: Retention, Sharing, and SEO.*

### 4.1 Content Showcase
*   [x] **Community Showcase**: Top 3 Hero Section replacing static header.
*   [x] **"Remix" Button**: One-click deep-link to Studio with `initialPrompt` pre-filled.
*   [x] **Download**: Direct MP3 download button.

### 4.2 Next Steps (Viral)
*   [ ] **"Forking"**: Maintain lineage (Parent Song ID -> Child Song).
*   [ ] **OpenGraph Images**: Dynamic sharing cards for Twitter/Discord.

---

## 6. Phase 5: Commercialization & Web3 [PLANNED]
*Focus: Monetization and Assets.*
*Focus: Monetization and Assets.*

*   [ ] **Blockchain Bridge**: "Mint this Song" (NFT Metadata).
*   [ ] **Credit System**: Stripe/Crypto payments.
*   [ ] **Stems Marketplace**: Selling individual tracks.
*   [ ] **Middleware**: Handle subdomain routing (`app.opentunes.ai`).

---

## 6. Immediate Execution Plan
1.  **Execute Phase 0**:
    *   Create `.env.local` templates.
    *   Implement "Dual Write" in Python Backend (Supabase Upload).
    *   Update Frontend `getAudioUrl` logic.
2.  **Verify Integrity**:
    *   Test: Generate Song -> Verify Local Playback -> Verify Cloud Upload -> Verify Public Link.
