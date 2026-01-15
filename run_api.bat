@echo off
call .\venv\Scripts\activate.bat
rem set "ACE_CHECKPOINT_PATH=G:\My Drive\models"
set ACE_OUTPUT_DIR=.\outputs
echo Starting ACE-Step API...
uvicorn acestep.api.main:app --host 127.0.0.1 --port 7866
