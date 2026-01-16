# Testing Strategy (TEST.md) - Opentunes.ai

## 1. Quality Assurance Tiers

### 1.1 Unit Testing (Backend Logic)
*   **Scope**: Individual Python modules (Agents, Services).
*   **Tools**: `pytest`.
*   **Checklist**:
    *   [x] **Agents**: Verify `parse_llm_json` correctly handles malformed outputs.
    *   [x] **Infrastructure**: Verify `LazyLoader` correctly delays model initialization.
    *   [x] **Database**: Verify CRUD operations on `agent_memory`.
    *   [ ] **Services**: Verify `JobService` queuing logic in isolation (mocked DB/Worker).
    *   [ ] **Routers**: Verify `MusicRouter` rejects invalid Pydantic models (422 Error).
    *   [ ] **Billing**: Verify `deduct_credits` logic prevents negative balance.

### 1.2 Integration Testing (API Pipeline)
*   **Scope**: Frontend <-> Backend <-> External APIs (Ollama/Stripe).
*   **Tools**: `test_agent_headless.py` (Scripted Scenario).
*   **Checklist**:
    *   [x] **Agent Chat**: `POST /agent/chat` streams correct NDJSON events.
    *   [x] **Generation Job**: `POST /generate` returns Job ID -> Worker picks up -> Metadata saves.
    *   [ ] **Billing Flow**: Mock Stripe Webhook -> Credit Updates in `transactions`.

### 1.3 System E2E Testing (Browser)
*   **Scope**: Full User Journey in Chrome/Puppeteer.
*   **Tools**: Subagent / Playwright.
*   **Checklist**:
    *   [ ] **"The Creator Loop"**: Login -> Chat Prompt -> Generate -> Play Audio.
    *   [ ] **"The Social Loop"**: Publish Track -> Open Feed -> Like Track.
    *   [ ] **"The Pro Loop"**: Buy Credits -> Generate Private Track.

---

## 2. Performance & Load Testing

### 2.1 Latency Benchmarks
*   **Checklist**:
    *   [x] **Cold Start**: Time from `run_studio.bat` to "Ready" state (< 2s).
    *   [ ] **Model Load**: Time from First Request to "Inference Start" (Lazy Loading) (< 60s).
    *   [ ] **Generation Speed**: Seconds of Audio generated per Second of Compute (RTF). Target: < 1.0 (Real-time).

### 2.2 Load / Concurrency
*   **Checklist**:
    *   [ ] **Worker Queue**: Verify the `process_jobs` worker handles 5+ concurrent requests by queuing them (without crashing VRAM).
    *   [ ] **Database**: Verify `pgvector` queries remain < 100ms with 10k vectors.

---

## 3. User Acceptance Testing (UAT)

### 3.1 Visual Quality
*   **Checklist**:
    *   [ ] **Responsiveness**: Sidebar/Player works on Mobile/Tablet viewports.
    *   [ ] **Theme**: Glassmorphism effects render correctly without z-index artifacts.
    *   [ ] **States**: Empty States, Loading Spinners, and Error Toasts clearly communicate status.

### 3.2 Audio Quality ("Vibe Check")
*   **Checklist**:
    *   [ ] **Coherence**: Does the generated audio match the Prompt's mood (BPM, Key)?
    *   [ ] **Fidelity**: Is the output clean (no screeching/artifacts) at `steps=50`?
    *   [ ] **Looping**: Does the track loop seamlessly?

### 3.3 Documentation Coverage
*   **Checklist**:
    *   [ ] **Setup**: Can a fresh user clone and run `run_studio.bat` without errors?
    *   [ ] **Onboarding**: Does the Landing Page correctly explain the "Agentic" concept?
