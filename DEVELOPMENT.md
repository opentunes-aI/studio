# Development Roadmap - Opentunes.ai

This document outlines the execution phases for Opentunes.ai, mapping strategic goals to specific items in the **PRD** and **TRD**. It serves as the primary checklist for implementation tracking.

## ✅ Phase 1: The Foundation (Core Product) [COMPLETED]
*Goal: Build the "0 to 1" Studio that empowers users to create music with AI agents.*

*   **1.1 Infrastructure & Architecture** (Ref: TRD 1.0, 2.0)
    *   [x] **LLM Agnostic**: Integrated `LiteLLM` for decoupled intelligence (Ollama/Groq/OpenAI Support).
    *   [x] **Model Agostic Engine**: Decoupled Audio Inference (ACE-Step / Stable Audio Factory).
    *   [x] **Hybrid Cloud**: Local GPU + Supabase Sync (Dual Write).
    *   [x] **Lazy Loading**: Optimized fast startup time.
*   **1.2 The Studio Experience** (Ref: PRD 4.1)
    *   [x] **UI/UX**: Responsive Next.js App with Glassmorphism theme.
    *   [x] **Waveform**: Interactive Visualization (`wavesurfer.js`).
    *   [x] **Console**: Real-time Agent Log streaming.
    *   [x] **Immersive Mode**: Implement collapsible Sidebars for "Focus Mode" waveform editing.
    *   [ ] **Agent Feedback**: Add visual "Thinking/Pulse" indicators for active Agent steps.
    *   [ ] **Mobile Layout**: Implement "Swiper" navigation for small screens.
*   **1.3 Agentic Intelligence** (Ref: PRD 4.2, TRD 2.2)
    *   [x] **The Squad**: Director, Producer, Lyricist, Visualizer, Critic.
    *   [x] **RAG Memory**: Vector Search for Lyrics/Audio styles.
    *   [x] **Robustness**: JSON Parsing fixes, Error Recovery.
*   **1.4 Community & Growth** (Ref: PRD 4.4)
    *   [x] **Identity**: Profiles, Avatars.
    *   [x] **Viral Loop**: Sharing, Feeds, Remix Lineage.
*   **1.5 Marketing & Acquisition** (Ref: PRD 2.0)
    *   [x] **Landing Page**: Aurora UI, High-conversion design.
    *   [x] **Handover**: Seamless Context passing (Landing -> Studio).
*   **1.6 Production Infrastructure (Cloud)** (Ref: TRD 6.0)
    *   [ ] **Frontend (Cloudflare Pages)**:
        *   Install `@cloudflare/next-on-pages` adapter.
        *   Configure Build Script: `npm run pages:build`.
        *   Deploy to Cloudflare Dashboard (Connect GitHub).
    *   [ ] **Backend (GPU Cloud)**:
        *   Create `Dockerfile` (Pinned PyTorch version).
        *   Select Provider (Modal is recommended for flexible Serverless GPU).
        *   Deploy and secure API Endpoint (HTTPS).


---

## 🚀 Phase 2: Commercialization (SaaS Economy) [NEXT UP]
*Goal: Implement a sustainable Credit-based business model.*

*   **2.1 The Economic Engine (Internal)** (Ref: DDD 1.2)
    *   [x] **Database Schema**: Create `wallets` and `transactions` tables (`09_billing.sql`).
    *   [x] **Onboarding Hook**: Auto-grant 50 credits on signup (Trigger).
    *   [x] **Store Slice**: Add `useStudioStore` slice for `credits`.
    *   [x] **UI Component**: "Credit Balance" badge in Sidebar.
    *   [x] **Backend Logic**: Enforce credit checks in `POST /generate`.
*   **2.2 Payments & Subscriptions** (Ref: PRD 4.5)
    *   [ ] **Stripe Integration**: Checkout for "Credit Packs" and "Pro Plans".
    *   [ ] **Webhooks**: Secure idempotent handling of `payment.succeeded`.
    *   [ ] **Pro Features**: Gate "Stem Separation" and "Private Mode" behind `is_pro` flag.
*   **2.3 Web 3 Integration (Deferred)**
    *   [ ] **Wallet Login**: Implementation moved to Phase 3.

---

## 📱 Phase 3: Mobile Expansion
*Goal: Ubiquity and Engagement.*

*   **3.1 PWA (Progressive Web App)** (Ref: TRD 6.0)
    *   [ ] **Manifest**: `manifest.json` for "Add to Home Screen".
    *   [ ] **Responsive UI**: Audit Sidebar/Player for Touch targets.
    *   [ ] **Offline Mode**: Service Worker caching for Assets.
*   **3.2 Native Wrapper** (Ref: PRD 4.6)
    *   [ ] **Capacitor**: Wrap Next.js app for App Store/Play Store.
    *   [ ] **Notifications**: Push notifications for "Track Ready".

---

## 🔮 Phase 4: Advanced Creative Tools
*Goal: Deepen the "Studio" capability.*

*   **4.1 Advanced Editing** (Ref: PRD 4.3)
    *   [ ] **In-Painting UI**: Frontend brush tool for waveform selection.
    *   [ ] **Advanced LoRA**: UI for training/loading user styles.
