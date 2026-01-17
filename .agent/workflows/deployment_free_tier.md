---
description: How to deploy Opentunes MVP using Free Tier services (Vercel + Google Colab)
---

# 🚀 Free Tier MVP Deployment Guide

This workflow enables a zero-cost production environment for Opentunes Studio using Vercel (Frontend) and Google Colab (Backend/GPU).

## 🌍 Architecture

*   **Frontend**: Next.js App Router -> **Vercel** (Free Tier).
*   **Backend**: FastAPI -> **Google Colab** (Free T4 GPU).
*   **Database**: **Supabase** (Free Tier).
*   **Tunneling**: **Ngrok** (exposes Colab to Public).
*   **Service Discovery**: Backend updates a Supabase table with its Ngrok URL on startup; Frontend fetches this URL.

## 🛠️ Prerequisites

1.  **Accounts**: Vercel, Google (Drive/Colab), Ngrok, Supabase.
2.  **Repo**: Code pushed to GitHub.
3.  **Google Drive**: A folder named `Opentunes` in your root Drive.

## 📝 Part 1: Database Setup (Service Discovery)

We need the Frontend to know the dynamic Colab URL without redeploying.

1.  Go to Supabase SQL Editor.
2.  Run this query:
    ```sql
    CREATE TABLE IF NOT EXISTS system_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );
    
    INSERT INTO system_config (key, value) VALUES ('api_url', 'http://localhost:8000') 
    ON CONFLICT (key) DO NOTHING;
    
    -- Allow public read access (or secure via RLS if preferred)
    ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public read" ON system_config FOR SELECT USING (true);
    -- Only Service Role can update (checked in backend)
    ```

## 📦 Part 2: Backend Pack (Google Drive)

Since we have custom code, we load it from Drive.

1.  **Zip your code**:
    *   Compress the `acestep/` folder (the python package) on your local machine.
    *   Compress the `requirements.txt`.
2.  **Upload to Drive**:
    *   Path: `My Drive/Opentunes/code/acestep.zip`
    *   Path: `My Drive/Opentunes/requirements.txt`
3.  **Upload Models (Optional but Faster)**:
    *   If you have the `cache/` folder with models, zip and upload to `My Drive/Opentunes/cache`.

## 🖥️ Part 3: Colab Notebook Setup

We use `colab_api.ipynb` to run the server.

1.  Open `colab_api.ipynb` in Google Colab.
2.  Add **Secrets** in Colab (Key icon on left):
    *   `NGROK_TOKEN`: Your Ngrok Authtoken.
    *   `SUPABASE_URL`: Your Project URL.
    *   `SUPABASE_SERVICE_KEY`: Service Role Key (to write the API URL).
3.  **Run the Notebook**. It will:
    *   Mount Drive.
    *   Unzip Code.
    *   Install Deps.
    *   Start Server.
    *   **Auto-Update Supabase** with the specific Ngrok URL.

## 🌐 Part 4: Frontend Deployment (Vercel)

1.  **Configure Code**:
    *   Modify `acestep_studio/utils/config.ts` to fetch from Supabase instead of env var (or use a helper).
    *   *Alternative*: Just manually paste the URL into Vercel Env Vars if you don't want to code the Supabase fetch.
2.  **Deploy**:
    *   Import Repo to Vercel.
    *   Set Env Vars:
        *   `NEXT_PUBLIC_SUPABASE_URL`
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   Click Deploy.

## 🔄 Daily Routine

1.  Start Colab Notebook (Click "Run All").
2.  Wait for "🔥 API Public URL updated in Supabase" message.
3.  Open your Vercel App. It should work immediately.
