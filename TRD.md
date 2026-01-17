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
*   [x] **Architecture**: **Feature-Based** structure (`components/features/Library`).
*   [x] **Logic Layer**: **Custom Hooks** (`hooks/useAudio.ts`) decouple UI from State/API.
*   [x] **Styling**: Tailwind CSS (Vanilla CSS variables for themes).
*   [x] **State Management**: Zustand (Global Store).
*   [x] **Data Fetching**: Supabase JS Client + Native `fetch`.
*   [x] **Audio Visualization**: `wavesurfer.js`.

### 2.2 Backend (`/acestep`)
*   [x] **Framework**: FastAPI (ASGI).
*   [x] **Architecture**: **Modular Monolith**.
    *   **Routers** (`api/routers/`): Handle HTTP, Auth, Validation.
    *   **Services** (`api/services/`): Pure Business Logic (Billing, Job Queue).
    *   **Core** (`api/core/`): Configuration, Database, Logging.
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

## 6. Deployment Architecture
### 6.1 Strategy: "Dual-Mode with Service Discovery"
The codebase is designed to support two distinct runtime environments without code modification.

| Feature | Local Development | Cloud MVP (Free Tier) |
| :--- | :--- | :--- |
| **Frontend Host** | `localhost:7865` | Vercel (`opentunes.ai`) |
| **Backend Host** | `localhost:7866` | Google Colab (via Ngrok) |
| **Service Discovery** | Static (`config.ts` defaults) | Dynamic (Fetched from Supabase `system_config`) |
| **Routing** | Direct Path | `middleware.ts` Domain Routing |

### 6.2 Frontend Architecture (Vercel)
*   **Domain Routing**: A `middleware.ts` file acts as the traffic controller based on the incoming Hostname.
    *   `opentunes.ai` -> Rewrites to `/` (Landing Page).
    *   `studio.opentunes.ai` -> Rewrites to `/studio` (Main App).
    *   `localhost` -> Permissive (Access all paths).
*   **Service Discovery**:
    *   The App checks `process.env.NEXT_PUBLIC_API_URL`.
    *   If empty, it queries Supabase table `system_config` for key `api_url` to find the active Colab Ngrok tunnel.

### 6.3 Backend Architecture (Google Colab)
*   **Runtime**: The `colab_api.ipynb` notebook acts as the server.
    *   **Mounts**: Google Drive (for Model Checks/Cache).
    *   **Installs**: The `acestep` package (zipped from Drive).
    *   **Tunnels**: `pyngrok` exposes port 8000 to the public internet.
    *   **Syncs**: On startup, auto-updates the Supabase `system_config` table with the new Ngrok URL.
*   **Data Persistence**:
    *   Generated Files: Temporarily stored in Colab `/content/outputs`.
    *   Long-term: Background task immediately uploads to Supabase Storage (`music` bucket).

### 6.4 Mobile Strategy
*   **Phase 1**: PWA (Progressive Web App) for instant install.
*   **Phase 2**: Capacitor Wrapper for native store deployment.
