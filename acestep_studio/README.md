# Opentunes Studio Application

The commercial-grade interface for **Opentunes.ai**, separating the Marketing Landing Page from the Studio App.

## 🔐 Authentication & Access Control

Access to the Studio (`/studio`) is protected by **StudioGate**.
*   **Guests**: Redirected to a Login Card.
*   **Auth Provider**: Supabase Magic Links.
*   **Local Mode**: If Supabase keys are missing, the Login Card offers a "Continue as Guest" bypass.

## 🌍 Community & Feeds

The application supports a vibrant creator economy:
*   **Showcase Cards**: Pre-configured templates on the Landing Page that launch the Agent with specific prompts.
*   **Global Feed**: Accessible at `/community` (Scaffold), aiming to showcase user creations.
*   **Templating**: Clicking a Showcase Card passes the `initialPrompt` to the Agent, preserving it through the Login flow via `localStorage`.

## 🛠️ Setup

### 1. Environment Variables
Copy the `.env.local.example` (or `env.local`) to `.env.local` and fill in your Supabase keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# Optional: Point to deployed backend
NEXT_PUBLIC_API_URL=http://localhost:7866
# Optional: Stripe (for Billing)
NEXT_PUBLIC_APP_URL=http://localhost:7865
```

### 1a. Backend Environment (For Deployment)
The Python backend (`run_api.bat`) supports:
*   `CORS_ALLOWED_ORIGINS` (default: `*` - Comma separated domains)
*   `OLLAMA_BASE_URL` (default: `http://localhost:11434`)
*   `ACE_OUTPUT_DIR` (default: `./outputs`)

If you don't have Supabase keys, the app will run in **Local Mode** (Authentication features disabled).

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Database Setup (Supabase)
### 4. Database Setup (Supabase)
Run the numbered SQL scripts found in `acestep_studio/migrations/` in order:
1.  `01_core_schema.sql`: Core tables (Songs) and Storage.
2.  `02_profiles.sql`: User Profiles and Avatars.
3.  `03_community.sql`: Social features (Likes, Play Counts, Public Access).
4.  `04_social.sql`: Follows and Messages.
5.  `05_web3.sql`: Web3 readiness columns.

Open [http://localhost:7865](http://localhost:7865).

## 🏗️ Architecture

*   **Routing**:
    *   `app/page.tsx`: Public landing page (`opentunes.ai`).
    *   `app/studio/`: Main application (`app.opentunes.ai`).
*   **`components/`**: UI Building blocks (ControlPanel, WaveformVisualizer, Sidebar).
*   **`utils/api.ts`**: Client for the Python Backend (`localhost:7866`).
*   **`utils/supabase.ts`**: Supabase Client instance.
*   **`utils/store.ts`**: Zustand Global State (Prompt, Parameters, current track).

## 🎵 Key Features

*   **Waveform Visualization**: Uses `wavesurfer.js` for interactive regions.
*   **Immersive Mode**: Collapsible sidebars (Control Panel & Library) for focused editing.
*   **Persistent Player**: Global audio playback continues across pages.
*   **Real-time Console**: Polls the backend for generation logs.
*   **Library Management**: Sync Local files to Cloud, **Rename**, **Delete**, and **Star** (save to Agent Memory) your best tracks.

*   **Social Network**: 
    *   **User Identity**: Rich Profiles, Custom Avatars, and Persistent Settings.
    *   **Community Feed**: Global showcase of public tracks with Author attribution.
    *   **Cloud Sync**: Hybrid "Local-First" architecture. Files stay on disk; metadata syncs to Supabase.
    *   **Billing & Credits**: New! Subscribe to monthly plans or top-up credits via Stripe.
*   **AI Agent Chat**: A robust multi-agent orchestrator powered by `smolagents` and `Ollama`.
    *   **Retrieval-Augmented Generation (RAG)**: Agents search a "Memory" database (Supabase `pgvector`) to find previous successful prompts and lyrics before generating.
    *   **Real-Time Streaming**: Watch the "Director", "Producer", "Lyricist", and "Critic" think and collaborate live in the chat.
    *   **The Squad**:
        *   **🎬 Director**: Analyzing intent and planning tasks.
        *   **🎹 Producer**: Searching the audio library and configuring the Studio.
        *   **✍️ Lyricist**: Researching style references and drafting lyrics.
        *   **🎨 Visualizer**: Painting cover art descriptions.
        *   **🧐 Critic**: Acting as an advisor to ensure coherence.

## 🤝 Contributing

This project uses `lucide-react` for icons and standard Tailwind utility classes.
Please ensure all new components are responsive and follow the "Deep Space" aesthetic (Glassmorphism, Neon Accents, Outfit/Inter typography).
