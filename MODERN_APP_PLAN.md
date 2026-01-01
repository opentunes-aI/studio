# Opentunes.ai: Product Roadmap to Commercialization

## 1. Product Vision: "Suno for Localhost"
Our goal is to transform ACE-Step from a technical research demo into a commercial-grade, fee-based SaaS platform called **Opentunes.ai**.
The core philosophy is **"No-Code Music"**: Users should not need to understand "CFG Scale" or "Inference Steps". They should simply describe an emotion and get a radio-ready track.

### Target Architecture (Commercial)
*   **Landing Page**: `opentunes.ai` (Marketing, Pricing).
*   **App URL**: `app.opentunes.ai` (The Studio).
*   **Frontend Hosting**: Cloudflare Pages / Vercel (Next.js).
*   **Backend Hosting**: GPU Cloud (RunPod / Railway / AWS) running Dockerized FastAPI.
*   **Database/Auth**: **Supabase** (PostgreSQL + Auth + Realtime).

---

## 2. Strategic Roadmap

### Horizon 1: The Core Foundation (MVP) [✅ COMPLETED]
*Goal: Prove the architecture works with robust error handling and basic generation.*
- [x] **New Architecture**: Decoupled Next.js Frontend + FastAPI Backend.
- [x] **Failure Monitoring**: Console Drawer for real-time logs (Fixed "Silent Failures").
- [x] **Basic Studio API**: `/generate` endpoint with `soundfile` fix.
- [x] **Optimization**: `cpu_offload` for 8GB Consumer GPUs.
- [x] **Audio Playback**: Waveform visualizer (Wavesurfer.js) with Play/Pause.
- [x] **Feature Parity**: Ported Lyrics, Presets, Formats, and Advanced Param controls.
- [x] **Smart Lyrics**: Integrated Local Ollama for "Magic Lyrics".

---

### Horizon 2: The "Creator Studio" (Feature Completeness) [✅ COMPLETED]
*Goal: Match the creative workflows of Suno/Udio. Move beyond "One-shot" generation.*

- [x] **Branding**: Implemented Header/Footer for "Opentunes" commercial look.
- [x] **Variations (Retake)**: Implemented "Remix Strength" slider and Sidebar integration.
- [x] **In-Painting (Repaint)**: Implemented Waveform Region Selection + Repaint logic.
- [ ] **Out-Painting (Extend)**: (Deferred to Horizon 3).

#### B. UX for Non-Musicians
- [x] **Structure Builder**: Implemented Visual Block Builder with bi-directional sync (Text <-> Visual).
- [x] **Curated Style Chips**: Implemented visual Presets Grid with 12+ genres.

---

### Horizon 3: The "Platform" (Engagement & Library) [🚧 ACTIVE]
*Goal: Increase user stickiness. Migration to Supabase.*

- [x] **Supabase Integration**: Set up Client, Auth Widget, and `.env` config.
- [x] **Database Setup**: Schema created and verified.
- [x] **Persistent Library**: Implemented "Local-First" library with Cloud Sync.
- [x] **UI Layout**: Optimized layout (Controls Left, Library Right) for DAW-like workflow.
- [x] **Shortcuts**: Implemented Space (Play/Pause) and Arrow (Seek) keys.


---

### Horizon 4: Commercialization (SaaS Transformation)
*Goal: Prepare for deployment and monetization.*

- [ ] **Cloud Infrastructure**: Dockerize the app for GPU Instances.
- [ ] **Credit System**: Stripe integration via Supabase Functions.
- [ ] **Social Sharing**: Public profile pages.

---

## 3. Technology Stack (Final State)

| Component | Technology | Reasoning |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 + Tailwind + Zustand | High performance, SEO, robust state. |
| **Backend** | FastAPI + Celery/Redis | Async job processing essential for scale. |
| **Compute** | **GPU Cloud** (RunPod/AWS) | ACE-Step Model Hosting (3.5B params). |
| **Database** | **Supabase** (Postgres) | Auth, DB, Realtime all-in-one. |
| **Storage** | **Supabase Storage** / S3 | Hosting audio files. |

## 4. Immediate Next Steps (Horizon 2)
1.  Implement **Branding**.
2.  Implement **Variations (Retake)** logic.
3.  Implement **Region Selection** for Repainting.
