import os
import site
import sys
import tempfile
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def _configure_cuda_dll_paths() -> None:
    """Giúp Windows tìm cublas/cudnn (pip hoặc CUDA Toolkit)."""
    if sys.platform != "win32":
        return
    roots = []
    for p in site.getsitepackages() + [site.getusersitepackages()]:
        if p:
            roots.append(Path(p))
    roots.append(Path(sys.prefix))
    subdirs = (
        "nvidia/cublas/bin",
        "nvidia/cudnn/bin",
        "nvidia/cuda_runtime/bin",
    )
    for root in roots:
        for sub in subdirs:
            dll_dir = root / sub
            if dll_dir.is_dir():
                os.environ["PATH"] = str(dll_dir) + os.pathsep + os.environ.get("PATH", "")


_configure_cuda_dll_paths()

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from faster_whisper import WhisperModel
from pydantic import BaseModel, Field

from translate_util import SUPPORTED_TARGETS, translate_text

STATIC_DIR = Path(__file__).parent / "static"
ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm", ".mp4", ".mpeg", ".mpga"}

app = FastAPI(title="MP3 to Text", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_model = None
_model_name = os.getenv("WHISPER_MODEL", "base")
_device = os.getenv("WHISPER_DEVICE", "cpu").strip().lower()
_compute_type = os.getenv("WHISPER_COMPUTE", "int8").strip()
_device_actual = _device
_compute_actual = _compute_type
_cuda_fallback_note: str | None = None
_auto_translate_target = os.getenv("AUTO_TRANSLATE_TARGET", "").strip()
if _auto_translate_target and _auto_translate_target not in SUPPORTED_TARGETS:
    _auto_translate_target = next(
        (c for c in SUPPORTED_TARGETS if c in _auto_translate_target),
        "",
    )


def _is_cuda_load_error(exc: BaseException) -> bool:
    msg = str(exc).lower()
    return any(k in msg for k in ("cublas", "cudnn", "cuda", ".dll", "cudnn"))


def get_model() -> WhisperModel:
    global _model, _device_actual, _compute_actual, _cuda_fallback_note
    if _model is not None:
        return _model

    device = _device
    compute = _compute_type or ("float16" if device == "cuda" else "int8")

    try:
        _model = WhisperModel(_model_name, device=device, compute_type=compute)
        _device_actual = device
        _compute_actual = compute
        return _model
    except Exception as exc:
        if device != "cuda" or not _is_cuda_load_error(exc):
            raise
        _cuda_fallback_note = (
            f"GPU lỗi ({exc}). Đã chuyển sang CPU. "
            "Cài CUDA 12 hoặc: pip install nvidia-cublas-cu12 nvidia-cudnn-cu12"
        )
        _model = WhisperModel(_model_name, device="cpu", compute_type="int8")
        _device_actual = "cpu"
        _compute_actual = "int8"
        return _model


class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1)
    target: str = Field(..., min_length=2, max_length=10)
    source: str = Field(default="auto")


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "model": _model_name,
        "device": _device_actual,
        "device_requested": _device,
        "compute": _compute_actual,
        "cuda_fallback": _cuda_fallback_note,
        "auto_translate_target": _auto_translate_target or None,
    }


@app.get("/api/translate/languages")
def translate_languages():
    return {"languages": SUPPORTED_TARGETS}


@app.post("/api/translate")
def translate(body: TranslateRequest):
    try:
        return translate_text(body.text, body.target, body.source)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Dịch thất bại: {exc}") from exc


@app.post("/api/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    language: str | None = Form(None),
    translate_to: str | None = Form(None),
):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Định dạng không hỗ trợ. Chọn: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File rỗng.")

    max_bytes = int(os.getenv("MAX_UPLOAD_MB", "50")) * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File quá lớn (tối đa {max_bytes // (1024 * 1024)} MB).",
        )

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        kwargs: dict = {}
        if language and language.strip():
            kwargs["language"] = language.strip()

        segments_iter, info = get_model().transcribe(tmp_path, **kwargs)

        segments = []
        parts = []
        for seg in segments_iter:
            text = seg.text.strip()
            if text:
                parts.append(text)
            segments.append({"start": seg.start, "end": seg.end, "text": text})

        result_text = " ".join(parts).strip()
        detected = info.language or ""

        target = (translate_to or _auto_translate_target or "").strip()
        translation = None
        if target and result_text:
            try:
                source = detected if detected else "auto"
                translation = translate_text(result_text, target, source)
            except Exception as exc:
                translation = {"error": str(exc)}

        return {
            "text": result_text,
            "language": detected,
            "segments": segments,
            "translation": translation,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


@app.get("/")
def index():
    return FileResponse(STATIC_DIR / "index.html")


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
