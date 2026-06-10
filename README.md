**Giới Thiệu**
- **Mô tả**: Dự án "MP3 to Text" chuyển file âm thanh (mp3, wav, m4a, ...) sang văn bản và hỗ trợ dịch tự động. Backend là một dịch vụ FastAPI và giao diện nằm trong thư mục `static`.

**Yêu Cầu**
- **Python**: 3.10+.
- **Gói Python**: xem [requirements.txt](requirements.txt) hoặc nếu có GPU dùng [requirements-gpu.txt](requirements-gpu.txt).
- **OS**: Windows/Linux/macOS. Trên Windows có một helper để cấu hình DLL CUDA trong [app.py](app.py).

**Cài Đặt**
1. Tạo và kích hoạt virtual environment (ví dụ Powershell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Cài đặt phụ thuộc:

```bash
pip install -r requirements.txt
# Nếu có GPU và muốn dùng build/driver hỗ trợ, dùng:
pip install -r requirements-gpu.txt
```

3. Tùy chọn: tạo file `.env` để cấu hình biến môi trường (xem mục Biến Môi Trường).

**Chạy Ứng Dụng**
- Khởi động server API:

```bash
python app.py
```

- Theo mặc định ứng dụng phục vụ giao diện tĩnh từ [static/index.html](static/index.html). Mở trình duyệt tới `http://localhost:5000/` (hoặc cổng mà FastAPI đang dùng).

**API chính**
- **Health**: `GET /api/health` — kiểm tra trạng thái, model và device thực tế.
- **Danh sách ngôn ngữ dịch**: `GET /api/translate/languages` — trả về `SUPPORTED_TARGETS` từ [translate_util.py](translate_util.py).
- **Dịch văn bản**: `POST /api/translate` — JSON body `{ "text": "...", "target": "xx", "source": "auto" }`.
- **Chuyển âm thanh -> văn bản**: `POST /api/transcribe` — form multipart, trường `file` chứa file âm thanh; thêm `language` (tùy chọn) và `translate_to` (tùy chọn) để tự động dịch kết quả.

Ví dụ dùng `curl` để gửi file:

```bash
curl -X POST "http://localhost:5000/api/transcribe" \
  -F "file=@/path/to/audio.mp3" \
  -F "translate_to=vi"
```

Ví dụ gọi dịch văn bản:

```bash
curl -X POST "http://localhost:5000/api/translate" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","target":"vi"}'
```

**Biến Môi Trường (quan trọng)**
- **WHISPER_MODEL**: tên model cho `faster_whisper` (mặc định `base`).
- **WHISPER_DEVICE**: `cpu` hoặc `cuda` (mặc định `cpu`).
- **WHISPER_COMPUTE**: kiểu compute (`int8`, `float16`, ...). Mặc định `int8` (hoặc `float16` nếu device là cuda và không có giá trị).
- **AUTO_TRANSLATE_TARGET**: nếu đặt, mọi kết quả chuyển sẽ tự động cố gắng dịch sang ngôn ngữ này.
- **MAX_UPLOAD_MB**: kích thước tối đa cho upload (mặc định `50`).

Thêm cấu hình Windows: [app.py](app.py) có hàm `_configure_cuda_dll_paths()` giúp thêm đường dẫn DLL cho cublas/cudnn khi cần.

**GPU & Fallback**
- Ứng dụng sẽ cố gắng load model trên GPU nếu `WHISPER_DEVICE=cuda`. Nếu gặp lỗi liên quan CUDA (cudnn/cublas/.dll) sẽ tự fallback sang CPU và ghi chú trong response của `GET /api/health`.
- Trên Windows, nếu gặp lỗi GPU, bạn có thể cài các package được gợi ý (ví dụ `nvidia-cublas-cu12`, `nvidia-cudnn-cu12`) hoặc cài CUDA Toolkit tương ứng.

**Tệp quan trọng**
- [app.py](app.py): server FastAPI và các endpoint.
- [translate_util.py](translate_util.py): logic dịch và danh sách `SUPPORTED_TARGETS`.
- [static/index.html](static/index.html), [static/app.js](static/app.js): giao diện người dùng.
- [requirements.txt](requirements.txt), [requirements-gpu.txt](requirements-gpu.txt): phụ thuộc.

**Phát triển & Đóng góp**
- Muốn thêm tính năng hoặc báo lỗi: fork repo, tạo branch, và gửi PR. Kiểm tra local bằng cách chạy `python app.py` và test endpoints.

**Liên hệ / Tài liệu**
- Xem thư mục `docs/` để biết yêu cầu, thiết kế và các tài liệu liên quan.
# MP3 → Text

Web chuyển file âm thanh (MP3, WAV, …) thành văn bản bằng [faster-whisper](https://github.com/SYSTRAN/faster-whisper), chạy trên máy bạn (không cần API key).

📁 **Tài liệu dự án:** [docs/](docs/01_Project_Overview.md) (BRD, FRD, API spec, UAT, …)

## Yêu cầu

1. **Python 3.10+**
2. **FFmpeg** — [Tải FFmpeg](https://ffmpeg.org/download.html) và thêm vào PATH  
   - Windows: `winget install Gyan.FFmpeg` hoặc tải bản build sẵn

## Cài đặt & chạy

```powershell
cd c:\Users\NMK\Desktop\mp3totext
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Mở trình duyệt: **http://localhost:8000**

## Cấu hình (`.env`)

Chỉnh file `.env` trong thư mục project (mẫu: `.env.example`):

```env
WHISPER_MODEL=base
WHISPER_DEVICE=cpu
WHISPER_COMPUTE=int8
MAX_UPLOAD_MB=50
HOST=0.0.0.0
PORT=8000
```

| Biến | Mặc định | Mô tả |
|------|----------|--------|
| `WHISPER_MODEL` | `base` | `tiny`, `small`, `medium`, `large-v3` |
| `WHISPER_DEVICE` | `cpu` | `cuda` nếu có GPU NVIDIA |
| `WHISPER_COMPUTE` | `int8` | Dùng `float16` khi chạy GPU |
| `MAX_UPLOAD_MB` | `50` | Giới hạn kích thước file upload |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Địa chỉ server |
| `AUTO_TRANSLATE_TARGET` | _(trống)_ | Tự dịch sau convert, VD: `en`, `vi` |

Chạy `.\run.ps1` — script tự đọc `.env`.

## GPU (CUDA) — lỗi `cublas64_12.dll`

Lỗi này xảy ra khi `WHISPER_DEVICE=cuda` nhưng thiếu thư viện CUDA 12 (cuBLAS).

**Cách 1 — Dùng CPU (đơn giản nhất):** trong `.env`:

```env
WHISPER_DEVICE=cpu
WHISPER_COMPUTE=int8
```

**Cách 2 — Sửa GPU:** cài DLL qua pip rồi bật lại CUDA:

```powershell
pip install -r requirements-gpu.txt
```

Trong `.env`: `WHISPER_DEVICE=cuda` và `WHISPER_COMPUTE=float16`, sau đó chạy lại `.\run.ps1`.

**Cách 3:** cài [CUDA Toolkit 12](https://developer.nvidia.com/cuda-downloads) và thêm thư mục `bin` vào PATH.

Nếu GPU vẫn lỗi, app **tự chuyển sang CPU** để không bị crash.

## Dịch văn bản

Sau khi chuyển đổi, giao diện **hai cột kiểu Google Translate**: chọn ngôn ngữ **Từ** / **Sang** trên thanh tab, đổi chiều bằng nút ⇄. Bản dịch tự cập nhật khi đổi ngôn ngữ (cần internet).
