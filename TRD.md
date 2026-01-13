# Technical Requirements Document (TRD) - Opentunes.ai

## 1. System Architecture Overview
**Hybrid Architecture**: "Local Compute, Cloud State".
*   **Frontend (The Face)**: Next.js Application. Runs in Browser. Handles UI, State, and Cloud Sync.
*   **Backend (The Brain)**: FastAPI Python Server. Runs on User's Machine (GPU). Handles Inference, Agents, and File I/O.
*   **Cloud (The Memory)**: Supabase (Postgres). Handles Auth, Vectors, and Social Metadata.

## 2. Technology Stack

### 2.1 Frontend (`/acestep_studio`)
*   [x] **Framework**: Next.js 14 (App Router).
*   [x] **Language**: TypeScript.
*   [x] **Styling**: Tailwind CSS (Vanilla CSS variables for themes).
*   [x] **Layout**: Immersive Mode with Collapsible Panels (Zustand State).
*   [x] **State Management**: Zustand (Global Store).
*   [x] **Data Fetching**: Supabase JS Client + Native `fetch`.
*   [x] **Audio Visualization**: `wavesurfer.js`.

### 2.2 Backend (`/acestep`)
*   [x] **Framework**: FastAPI (ASGI).
*   [x] **Language**: Python 3.10+.
*   [x] **ML Engine**: PyTorch.
*   [x] **Architecture**: Model Agnostic Engine (Factory Pattern).
    *   **Registry**: `acestep.models.factory` loads engines dynamicall.
    *   **Base**: `AudioEngine` abstract class.
    *   **Impl**: `ACEStepEngine` (Diffusion).
*   [x] **Agents**: `smolagents` (HuggingFace) + `LiteLLM` (Model Adapter).
*   [x] **Database Driver**: `supabase-py` (for RAG/Vector Search).

### 2.3 Cloud Services
*   [x] **Database**: PostgreSQL (Supabase Managed).
*   [x] **Auth**: Supabase Auth (Magic Link / Social).
*   [x] **Storage**: Supabase Storage (Buckets: `avatars`, `music`).
*   [x] **Search**: `pgvector` extension for Agent Memory.

---

## 3. Integration Points Checklists

### 3.1 API Contracts (`/docs`)
*   [x] **POST `/generate`**: Async Job Creation. Returns `job_id`.
*   [x] **GET `/jobs/{job_id}`**: Polling for Status/Result.
*   [x] **POST `/agent/chat`**: Streaming NDJSON endpoint for Agent thoughts.
*   [x] **GET `/visualizer/models`**: List available Image models.

### 3.2 External Services
*   [x] **Ollama**: Local LLM Inference (Gateway: `http://localhost:11434`).
*   [x] **Pollinations.ai**: Image Generation API.
*   [x] **Supabase API**: RESTful interactions for metadata.

---

## 4. Scalability & Performance Requirements
*   [x] **Lazy Loading**: Backend must NOT load 4GB+ weights at startup. Load on demand.
*   [x] **Concurrency**: `asyncio` used for Agent parallel execution (Director/Lyricist).
*   [x] **Job Queue**: Background `process_jobs` worker decouples HTTP request from GPU blocking.
*   [x] **CORS Policy**: Configurable origins for separating Frontend/Backend deployment.
*   [ ] **GPU VRAM Optimization**: Quantization support (Future).

## 5. Security Requirements
*   [x] **RLS (Row Level Security)**: Database policies enforce "Users can only edit their own tracks".
*   [x] **Environment Variables**: API Keys (Supabase) stored in `.env.local` (Frontend) / `.env` (Backend).
*   [x] **Cors**: Strict allowlist for Production.
*   [ ] **Rate Limiting**: Prevent API abuse in Cloud variant.

## 6. Future Cloud & Deployment Strategy
*   **Frontend**: Deployed to **Cloudflare Pages** (Edge).
    *   **Adapter**: `@cloudflare/next-on-pages`.
    *   **Reasoning**: Unmetered bandwidth for media apps, global low-latency.
    *   *Enabler*: Fully decoupled from Backend via `NEXT_PUBLIC_API_URL`.
*   **Backend (Inference)**: Containerized deployment (Docker).
    *   **Audio Agnosticism**: The `AudioEngine` abstraction allows us to deploy specialized containers (e.g., "Stable Audio Container" vs "ACE-Step Container") to different GPU providers (Modal, Replicate) without changing the API contract.
    *   **LLM Agnosticism**: `LiteLLM` allows the Cloud production env to use **Groq/OpenAI** for high-speed agents, while Devs use **Ollama**, merely by changing `AGENT_MODEL_ID` env var.
*   **Scaling Pattern**: The "Job Queue" architecture allows horizontal scaling of Worker nodes (GPUs) independent of the API server.
*   **Mobile Strategy**:
    *   **Phase 1**: PWA (Progressive Web App) for instant install.
    *   **Phase 2**: Capacitor Wrapper for native store deployment.
