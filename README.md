<h1 align="center">Opentunes.ai</h1>
<p align="center"><strong>The Agentic AI Music Production Studio</strong></p>
<p align="center">
    <a href="https://opentunes.ai">Website</a> |
    <a href="https://discord.gg/opentunes">Discord</a> |
    <a href="docs/TRAINING.md">Model Training</a>
</p>

---

## 🎵 What is Opentunes?
Opentunes is a commercial-grade **Agentic DAW (Digital Audio Workstation)** built for the future of decentralized music creation. Unlike simple "text-to-music" toys, Opentunes provides a granular **Studio Environment** where you collaborate with AI Agents (Producer, Lyricist, Critic) to craft professional tracks.

**Powered by [Opentunes AI Studio](https://github.com/opentunes-aI/studio), the state-of-the-art Music Foundation Model.** 🚀

## ✨ Key Features
*   **🎹 The Studio**: A specialized React Next.js application for high-fidelity audio control.
*   **🤖 Agentic Workflow**: Chat with the "Producer Agent" to refine your vibe, lyrics, and arrangements iteratively.
    *   **New**: **Agent Memory**: "Star" your favorite tracks to teach the AI what you like. The agents recall your starred prompts and lyrics to improve future generations.
*   **🔧 Precision Tools**:
    *   **In-Painting**: Select a region on the waveform to fix or rewrite (Repaint).
    *   **Remixing**: Generate variations with controlled variance.
    *   **Lyrics Wizard**: Auto-generate lyrics using local LLMs (Ollama).
*   **🌐 Hybrid Cloud**: "Local-First" architecture. Run the backend on your GPU, store your library in the Cloud (Supabase).
*   **🎨 Deep Space UX**: A premium, glassmorphism-based dark mode interface designed for creators.

## 🚀 Getting Started (Local)

### Prerequisites
*   **OS**: Windows 10/11, Linux, or macOS.
*   **GPU**: NVIDIA GPU (8GB+ VRAM recommended).
*   **Software**: 
    *   Python 3.10+
    *   Node.js 18+ (for Studio UI)
    *   [Ollama](https://ollama.com) (Optional, for Agent Chat)

### Configuration
Create a `.env` file in the root directory if you want to enable Cloud Sync & Billing:
```ini
# Supabase Configuration (Optional - for Cloud Library & Credits)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" # Required for Credit Deduction logic
```

### Quick Start
1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/opentunes/Opentunes.git
    cd Opentunes
    ```

2.  **Install Backend**:
    ```bash
    # Create environment (Recommended)
    conda create -n opentunes python=3.10 -y
    conda activate opentunes

    # Install Pytorch (Windows example)
    pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126

    # Install App
    pip install -e .
    ```

3.  **Install Frontend**:
    ```bash
    cd acestep_studio
    npm install
    cd ..
    ```

4.  **Run the App**:
    Double-click **`run_studio.bat`** (Windows) or run:
    ```bash
    ./run_studio.bat
    ```

5.  **Open Studio**:
    Navigate to [http://localhost:7865](http://localhost:7865).

---

## 🏗️ Architecture
Opentunes uses a modern **Split Architecture**:

1.  **Backend (`/acestep`)**: 
    *   **Technology**: FastAPI, PyTorch.
    *   **Role**: The "Brain". Runs the **Model Agnostic Audio Engine** (supporting ACE-Step and future models) & Ollama Agents. Handles heavy compute, audio rendering, and GPU management.
    *   **Features**: Lazy Loading (Fast Startup), Agentic RAG Memory, and Background Job Processing.
2.  **Frontend (`/acestep_studio`)**:
    *   **Technology**: Next.js 14, Tailwind CSS, Zustand.
    *   **Role**: The "Face". A responsive web application that manages the session, connects to Supabase, and visualizes the audio.

## 📚 Documentation
*   [**Product Requirements (PRD)**](PRD.md): Vision, Audience, and Feature Checklist.
*   [**Technical Requirements (TRD)**](TRD.md): Architecture, Stack, and Deployment Strategy.
*   [**Data Design (DDD)**](DDD.md): Schema, Data Flow, and Privacy.
*   [**Testing Stragegy (TEST)**](TEST.md): QA Tiers, Performance Benchmarks, and UAT.
*   [**Security Policy (SECURITY)**](SECURITY.md): Auth, RLS, and Compliance.
*   [**Model Training Guide**](docs/TRAINING.md): Learn how to fine-tune ACE-Step on your own datasets.
*   [**RapMachine LoRA**](docs/ZH_RAP_LORA.md): Instructions for the specialized Rap model.
*   [**Legacy Usage Guide**](docs/USE-GUIDE.md): Original command-line usage instructions.

## 🤝 Contributing
We welcome contributors! Opentunes is open-source software.
*   **Frontend**: Work in `acestep_studio/`.
*   **Backend**: Work in `acestep/`.
*   **Debugging**: Run `python tools/test_api.py` to verify the backend API is responding correctly.

## 📜 License
Apache 2.0. This project builds upon the open-source Opentunes AI Studio research.
