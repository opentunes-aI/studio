# Data Design Document (DDD) - Opentunes.ai

## 1. Data/Database Schema (Supabase)

### 1.1 Core Tables
*   [x] **`profiles`**
    *   `id` (uuid, PK): Refers to `auth.users`.
    *   `username` (text): Unique handle.
    *   `avatar_url` (text): Path to `avatars` bucket.
    *   `bio` (text): User description.

*   [x] **`songs`**
    *   `id` (uuid, PK): Unique Track ID.
    *   `user_id` (uuid, FK): Creator.
    *   `title` (text): Track Title.
    *   `prompt` (text): The raw text prompt used.
    *   `lyrics` (text): Generated Lyrics.
    *   `duration` (float): Length in seconds.
    *   `storage_path` (text): Path to `music` bucket (cloud) or Local path.
    *   `is_public` (bool): Visibility flag.
    *   `parent_id` (uuid, FK): Lineage tracking (Remixes).

*   [x] **`agent_memory`** (Vector Store)
    *   `id` (bigint): PK.
    *   `content` (text): The prompt/lyric snippet.
    *   `embedding` (vector[768]): Semantic representation.
    *   `metadata` (jsonb): Tags (genre, mood, type='audio'|'lyrics').

*   [x] **`interactions`**
    *   `id` (bigint): PK.
    *   `user_id` (uuid): Who acted.
    *   `song_id` (uuid): Target.
    *   `type` (enum): 'like', 'play', 'share'.

### 1.2 Billing & Credits Schema (SaaS)
*   **`wallets`**
    *   `user_id` (uuid, PK): Refers to users.
    *   `balance` (int): Current available credits.
    *   `is_pro` (bool): Active subscription status.
    *   `next_refill_at` (timestamp): For daily/monthly grants.

*   **`transactions`** (Immutable Ledger)
    *   `id` (uuid, PK).
    *   `user_id` (uuid, FK).
    *   `amount` (int): Negative for usage (-10), Positive for purchase (+500).
    *   `reason` (enum): 'generation', 'remix', 'topup', 'subscription', 'daily_grant'.
    *   `metadata` (jsonb): Links to `job_id` or `stripe_payment_id`.
    *   `created_at` (timestamp).

### 1.3 Storage Buckets
*   [x] **`music`**: Stores generated `.wav` / `.mp3` files.
    *   Policy: Authenticated Uploads, Public Reads.
*   [x] **`avatars`**: Stores user profile images.

---

## 2. Data Flow & Processing

### 2.1 Generation Pipeline (Input -> Output)
*   **Input**: `GenerationRequest` (JSON)
    ```json
    {
      "prompt": "Dark techno...",
      "lyrics": "...",
      "seed": 12345,
      "task": "text2music"
    }
    ```
*   **Processing**:
    1.  Frontend -> Backend API (`POST /generate`).
    2.  `MusicRouter` validates request -> calls `JobService.create_job()`.
    3.  `JobService` checks Credits (`BillingService`) -> push to Queue.
    4.  Worker -> `AudioEngine` (Inference).
    5.  Output -> Local Disk (`./outputs/*.wav`) + Metadata JSON (`_input_params.json`).
    6.  Sync -> Background Task syncs File + DB Entry to Supabase.

### 2.2 Agent Communication (Stream)
*   **Format**: NDJSON (Newline Delimited JSON).
*   **Protocol**: Server-Sent Events (SSE) pattern.
*   **Packet Structure**:
    ```json
    {"type": "log", "step": "Director", "message": "Thinking..."}
    {"type": "result", "data": [{"action": "configure", "params": {...}}]}
    ```

---

## 3. Data Privacy & Compliance
*   **GDPR/CCPA**: 
    *   [x] **Right to Delete**: Users can delete tracks via UI (Cascades to DB and Storage).
    *   [x] **Data Ownership**: RLS policies ensure User A cannot modify User B's data.
    *   [ ] **Export**: Users can download raw audio files (Implemented: Download Button).
*   **Local-First Philosophy**:
    *   Primary data generation happens on User Hardware. 
    *   Cloud sync is optional (but enabled by default for sharing).
    *   Sensitive environment variables (API Keys) stay on client/server env, never committed.
