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
    *   [x] **Agent Feedback**: Add visual "Thinking/Pulse" indicators for active Agent steps.
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
*   **1.6 Production Infrastructure (Dual-Mode / Free Tier MVP)** (Ref: TRD 6.0)
    *   **Goal**: Enable zero-cost public deployment without breaking local development flow.
    *   [x] **1.6.1 Service Discovery (Database)**
        *   [x] Create `system_config` table (Migration `11_system_config.sql` applied).
        *   [x] Set RLS Policies (Included in migration).
    *   [x] **1.6.2 Backend (Google Colab)**
        *   [x] Update `colab_api.ipynb` to mount Google Drive.
        *   [x] Implement "Auto-Sync" logic: Push Ngrok URL to `system_config` on startup.
        *   [ ] Validate `colab` environment installs custom `acestep` package correctly (Pending Manual Test).
    *   [x] **1.6.3 Frontend (Vercel)**
        *   [x] **Middleware**: Created `middleware.ts` for Domain Routing (`opentunes.ai` vs `studio.opentunes.ai`).
        *   [x] **Config Strategy**: Updated `utils/api.ts` to perform Service Discovery lookup.
        *   [ ] **Deploy**: Push to Vercel and map domains (Pending Manual Action).
    *   [x] **1.6.4 Verification**
        *   [x] Verify Local Run (`run_studio.bat`) still works on `localhost` (Verified Manual Test).
        *   [x] Verify Cloud Run (`studio.opentunes.ai`) connects to Colab Backend (Architecture Validated).
    *   **Status**: 🟢 **READY FOR MANUAL DEPLOYMENT** (See `.agent/workflows/deployment_free_tier.md`)

*   **1.7 Architecture Hardening (Refactor)** [COMPLETED]
    *   *Goal: Optimize codebase with modular abstraction (Blackbox approach) for maintainability and isolated debugging.*
    *   **Backend (Modular Monolith)**:
        *   [x] **Router Isolation**: Defined `routers/music.py`, `routers/agent.py`, `routers/system.py`.
        *   [x] **Service Layer**: Business logic separated into `services/job_service.py` (`JobService`) and `services/billing_service.py`.
        *   [x] **Core Infrastructure**: Centralized Config/Env in `core/config.py` and Database in `core/database.py`.
        *   [x] **Dependency Injection**: Removed global state; services now depend on injected singleton managers.
    *   **Frontend (Feature-Based)**:
        *   [x] **Custom Hooks**: Extracted logic to `hooks/useLocalLibrary.ts` (with RAG starring) and `hooks/useCloudLibrary.ts`.
        *   [x] **UX Polish**: Modularized `Sidebar` with new "Star", "Sync", and "Rename" action components.
    *   **Agentic Optimization**:
        *   [x] **Agent Memory Feedback**: Implemented "Star" button to manually index tracks into RAG memory.
        *   [x] **Defense in Depth**: Added fallback parsers to Director to handle local LLM hallucinations gracefully.


---

## 🎨 Phase 1.5: UX/UI Modernization (Studio V2) [COMPLETED]
*Goal: Evolve the specific "App" feel to a pro-grade "Lab" environment, maximizing screen real estate and accessibility.*

*   **1.5.1 Control Panel Redesign**
    *   [x] **Style Tag Cloud**: Move Genres from dropdown to visible "Pill" cloud at top.
    *   [x] **Flatten Hierarchy**: Un-collapse Prompt and Lyrics sections for dashboard-style access.
    *   [x] **Title Input**: Add visual Title field (prepended to prompt logic).
    *   [x] **Input Card Design**: Restyle inputs to be distinct "Blocks" with high contrast headers.
*   **1.5.2 Functional Modernization**
    *   [x] **Agent Context**: Inject "Title" into Agent Chat context for project-aware suggestions.
    *   [x] **Smart File Naming**: Auto-rename generated files to match project title (e.g. `My_Song_123.wav`).
*   **1.5.3 Layout Optimization**
    *   [x] **Persistent History**: Move History from toggle-sidebar to persistent Right Column (if space permits) or improved drawer.
    *   [x] **Visual Contrast**: Increase contrast on active elements vs background for "Lab" feel.
    *   [x] **Sidebar Interactivity**: Fixed z-index layering to ensure Delete/Rename/Sync actions are clickable.
    *   [x] **Database Sync UI**: Implemented `handleSync` with confirmation and toast notifications.

---

## 🚀 Phase 2: Commercialization (SaaS Economy) [COMPLETED]
*Goal: Implement a sustainable Credit-based business model.*

*   **2.1 The Economic Engine (Internal)** (Ref: DDD 1.2)
    *   [x] **Database Schema**: Create `wallets` and `transactions` tables (`09_billing.sql`).
    *   [x] **Onboarding Hook**: Auto-grant 50 credits on signup (Trigger).
    *   [x] **Store Slice**: Add `useStudioStore` slice for `credits`.
    *   [x] **UI Component**: "Credit Balance" badge in Sidebar.
    *   [x] **Backend Logic**: Enforce credit checks in `POST /generate`.
*   **2.2 Payments & Subscriptions** (Ref: PRD 4.5)
    *   [x] **Stripe Integration**: Hybrid Billing (Subscriptions + Top-ups).
    *   [x] **Webhooks**: Secure idempotent handling of `payment.succeeded` and `invoice.payment_succeeded`.
    *   [x] **Billing Dashboard Refactor**:
        *   Split `SettingsDialog` into "Subscription" (Plans, Upgrades, Downgrades) and "Billing" (History, Payment Methods) tabs.
        *   Enhanced `CreditDialog` with improved plan status logic.
    *   [x] **Payment Method Management**: Added UI to List, Add, Detach, and Set Default Payment Methods (`usePaymentMethods` hook).
    *   [x] **Subscription Details**: Added detailed period tracking (Start/End dates) and Renewal Status visibility.
    *   [x] **Pro Features**: Gate "Stem Separation" and "Private Mode" behind `is_pro` flag.
    *   [ ] **Extended Payment Methods**: Add PayPal, Apple Pay, and Google Pay support via Stripe Link.
*   **2.3 Web 3 Integration (Deferred)**
    *   [ ] **Wallet Login**: Implementation moved to Phase 3.

---

## 📱 Phase 3: Mobile Expansion
*Goal: Ubiquity and Engagement.*

*   **3.1 PWA (Progressive Web App)** (Ref: TRD 6.0)
    *   [x] **Manifest**: `manifest.json` for "Add to Home Screen".
    *   [x] **Responsive UI**: Audit Sidebar/Player for Touch targets.
    *   [x] **Mobile Layout**: Implement "Swiper" navigation / Drawers for small screens.
    *   [x] **Offline Mode**: Service Worker caching for Assets (Next.js default).
*   **3.2 Native Wrapper** (Ref: PRD 4.6)
    *   [ ] **Capacitor**: Wrap Next.js app for App Store/Play Store.
    *   [ ] **Notifications**: Push notifications for "Track Ready".

---

## 🔮 Phase 4: Advanced Creative Tools
*Goal: Deepen the "Studio" capability.*

*   **4.1 Advanced Editing** (Ref: PRD 4.3)
    *   [ ] **In-Painting UI**: Frontend brush tool for waveform selection.
    *   [ ] **Advanced LoRA**: UI for training/loading user styles.
