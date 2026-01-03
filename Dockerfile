# GPU-Ready Dockerfile for Opentunes Backend
# Base: Python 3.10
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
# ffmpeg: Audio processing
# git: Pip install from git
# build-essential: Compiling deps
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy Application Code
COPY . .

# Install PyTorch with CUDA 12.4 support (Optimized for GPU Cloud)
# We install this FIRST to ensure the correct GPU version is present
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

# Install other dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Package
RUN pip install --no-cache-dir .

# Env Config
ENV OLLAMA_BASE_URL=http://localhost:11434
# Ensure Output Dir exists
RUN mkdir -p outputs

# Expose API Port
EXPOSE 8000

# Start Command
CMD ["uvicorn", "acestep.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
