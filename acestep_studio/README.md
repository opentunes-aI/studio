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
```

If you don't have Supabase keys, the app will run in **Local Mode** (Authentication features disabled).

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:7865](http://localhost:7865).

## 🏗️ Architecture

*   **Routing**:
    *   `app/page.tsx`: Public landing page (`opentunes.ai`).
    *   `app/studio/`: Main application (`app.opentunes.ai`).
*   **`components/`**: UI Building blocks (ControlPanel, WaveformVisualizer, Sidebar).
*   **`utils/api.ts`**: Client for the Python Backend (`localhost:8000`).
*   **`utils/supabase.ts`**: Supabase Client instance.
*   **`utils/store.ts`**: Zustand Global State (Prompt, Parameters, current track).

## 🎵 Key Features

*   **Waveform Visualization**: Uses `wavesurfer.js` for interactive regions.
*   **Persistent Player**: Global audio playback continues across pages.
*   **Real-time Console**: Polls the backend for generation logs.
*   **Library Management**: Sync Local files to Cloud, and **Delete** unwanted tracks.

*   **Social Network**: Explore feed, User Profiles, Song Renaming, and Dynamic Visuals.
*   **Cloud Sync**: Hybrid "Local-First" architecture. Files stay on disk; metadata syncs to Supabase.
*   **AI Agent Chat**: A robust multi-agent orchestrator powered by `smolagents` and `Ollama`.
    *   **Orchestrator Pattern**: A backend planner dynamically activates specific agents (Producer, Lyricist, Visualizer) based on intent.
    *   **Multi-Session Management**: Support for multiple persistent chat threads to manage different creative projects.
    *   **The Producer**: Configures studio parameters based on vibe.
    *   **The Lyricist**: Writes structured lyrics automatically.
    *   **The Visualizer**: Generates cover art using Pollinations.ai.
    *   **The Critic**: Quality checks your inputs.

## 🤝 Contributing

This project uses `lucide-react` for icons and standard Tailwind utility classes.
Please ensure all new components are responsive and follow the dark-mode aesthetic.
