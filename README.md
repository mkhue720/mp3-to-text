# MP3 → Text

A web app that converts audio files (MP3, WAV, …) into text using [faster-whisper](https://github.com/SYSTRAN/faster-whisper), running locally on your machine (no API key required).

📁 **Project docs:** [docs/](docs/01_Project_Overview.md) (BRD, FRD, API spec, UAT, …)

## Introduction

**Description**: The "MP3 to Text" project converts audio files (mp3, wav, m4a, ...) into text and supports automatic translation. The backend is a FastAPI service, and the UI lives in the `static` folder.

## Requirements

- **Python**: 3.10+
- **FFmpeg** — [Download FFmpeg](https://ffmpeg.org/download.html) and add it to PATH
  - Windows: `winget install Gyan.FFmpeg` or download a prebuilt binary
- **Python packages**: see [requirements.txt](requirements.txt), or [requirements-gpu.txt](requirements-gpu.txt) if you have a GPU
- **OS**: Windows/Linux/macOS. On Windows there's a helper for configuring CUDA DLLs in [app.py](app.py)

## Installation & Running

1. Create and activate a virtual environment (PowerShell example):

```powershell
cd c:\Users\NMK\Desktop\mp3totext
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```bash
pip install -r requirements.txt
# If you have a GPU and want a compatible build/driver, use:
pip install -r requirements-gpu.txt
```

3. Optional: create a `.env` file to configure environment variables (see Environment Variables section).

4. Run the server:

```bash
uvicorn app:app
```

Open your browser at: **http://localhost:8000**

By default, the app serves the static UI from [static/index.html](static/index.html).

## Configuration (`.env`)

Edit the `.env` file in the project directory (template: `.env.example`):

```env
WHISPER_MODEL=base
WHISPER_DEVICE=cpu
WHISPER_COMPUTE=int8
MAX_UPLOAD_MB=50
HOST=0.0.0.0
PORT=8000
```

| Variable | Default | Description |
|------|----------|--------|
| `WHISPER_MODEL` | `base` | `tiny`, `small`, `medium`, `large-v3` |
| `WHISPER_DEVICE` | `cpu` | `cuda` if you have an NVIDIA GPU |
| `WHISPER_COMPUTE` | `int8` | Use `float16` when running on GPU |
| `MAX_UPLOAD_MB` | `50` | Maximum upload file size |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Server address |
| `AUTO_TRANSLATE_TARGET` | _(empty)_ | Auto-translate after conversion, e.g. `en`, `vi` |

Run `.\run.ps1` — the script automatically reads `.env`.

## Main API

- **Health**: `GET /api/health` — checks status, model, and the actual device in use.
- **List of translation languages**: `GET /api/translate/languages` — returns `SUPPORTED_TARGETS` from [translate_util.py](translate_util.py).
- **Translate text**: `POST /api/translate` — JSON body `{ "text": "...", "target": "xx", "source": "auto" }`.
- **Convert audio to text**: `POST /api/transcribe` — multipart form, `file` field containing the audio file; optional `language` and `translate_to` fields to auto-translate the result.

Example using `curl` to send a file:

```bash
curl -X POST "http://localhost:5000/api/transcribe" \
  -F "file=@/path/to/audio.mp3" \
  -F "translate_to=vi"
```

Example calling text translation:

```bash
curl -X POST "http://localhost:5000/api/translate" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","target":"vi"}'
```

## GPU (CUDA) — `cublas64_12.dll` error

This error occurs when `WHISPER_DEVICE=cuda` but CUDA 12 libraries (cuBLAS) are missing.

**Option 1 — Use CPU (simplest):** in `.env`:

```env
WHISPER_DEVICE=cpu
WHISPER_COMPUTE=int8
```

**Option 2 — Fix GPU:** install the DLLs via pip, then re-enable CUDA:

```powershell
pip install -r requirements-gpu.txt
```

In `.env`: set `WHISPER_DEVICE=cuda` and `WHISPER_COMPUTE=float16`, then run `.\run.ps1` again.

**Option 3:** install the [CUDA Toolkit 12](https://developer.nvidia.com/cuda-downloads) and add its `bin` folder to PATH.

If the GPU still fails, the app **automatically falls back to CPU** to avoid crashing.

## GPU & Fallback

- The app will try to load the model on GPU if `WHISPER_DEVICE=cuda`. If a CUDA-related error occurs (cudnn/cublas/.dll), it automatically falls back to CPU and notes this in the `GET /api/health` response.
- On Windows, if you encounter GPU errors, you can install the suggested packages (e.g. `nvidia-cublas-cu12`, `nvidia-cudnn-cu12`) or install the corresponding CUDA Toolkit.

## Text Translation

After conversion, the UI shows a **two-column, Google Translate-style** layout: choose the **From** / **To** language from the tab bar, and swap directions with the ⇄ button. The translation updates automatically when you change languages (requires internet).

## Important Files

- [app.py](app.py): FastAPI server and endpoints.
- [translate_util.py](translate_util.py): translation logic and the `SUPPORTED_TARGETS` list.
- [static/index.html](static/index.html), [static/app.js](static/app.js): user interface.
- [requirements.txt](requirements.txt), [requirements-gpu.txt](requirements-gpu.txt): dependencies.

## Development & Contributing

Want to add a feature or report a bug? Fork the repo, create a branch, and submit a PR. Test locally by running `python app.py` and testing the endpoints.

## Contact / Documentation

See the `docs/` folder for requirements, design, and related documentation.