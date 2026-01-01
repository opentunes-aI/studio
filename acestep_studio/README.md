# Opentunes Studio (Frontend)

This is the commercial-grade frontend for **Opentunes.ai** (formerly ACE-Step).
Built with **Next.js 14**, **Tailwind CSS**, **Zustand**, and **Supabase**.

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

## 🤝 Contributing

This project uses `lucide-react` for icons and standard Tailwind utility classes.
Please ensure all new components are responsive and follow the dark-mode aesthetic.
