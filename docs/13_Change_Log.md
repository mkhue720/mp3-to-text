# 13 — Change Log

Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Planned
- Progress bar % khi transcribe
- Lịch sử session (localStorage)
- Tùy chọn dịch DeepL / API key

---

## [1.0.0] — 2026-05-20

### Added
- Web app MP3 → Text (FastAPI + static UI)
- Speech-to-text: **faster-whisper** (model cấu hình qua `.env`)
- Upload: kéo-thả, chọn file; định dạng mp3, wav, m4a, ogg, flac, webm, mp4, mpeg, mpga
- Giới hạn upload `MAX_UPLOAD_MB` (mặc định 50)
- API: `GET /api/health`, `POST /api/transcribe`
- Hiển thị segments theo thời gian (details)
- Dịch văn bản: **deep-translator** → Google Translate
- API: `GET /api/translate/languages`, `POST /api/translate`
- UI hai cột kiểu **Google Translate** (Từ / Sang / swap ⇄)
- Tự dịch debounce khi đổi ngôn ngữ
- Fallback danh sách ngôn ngữ phía client
- Copy & download `.txt` (bản ghi + bản dịch)
- File `.env`, `.env.example`, `run.ps1`
- CUDA DLL path bootstrap + **fallback CPU** khi lỗi cublas
- `requirements-gpu.txt` (nvidia-cublas-cu12, cudnn)
- `run.ps1` tự dừng process cũ trên port
- Bộ tài liệu `docs/` (01–13)

### Changed
- Giao diện từ dropdown "Dịch sang" → thanh ngôn ngữ GT-style
- Mặc định `.env`: `WHISPER_DEVICE=cpu`, `WHISPER_COMPUTE=int8`

### Fixed
- Lỗi cài `openai-whisper` trên Windows → chuyển **faster-whisper**
- Thiếu package `requests` cho deep-translator
- Dropdown Từ/Sang trống (API 404 + CSS `appearance:none`)
- **Lỗi dịch** do 2 server trùng port 8000 (bản cũ không có `/api/translate`)
- Lỗi `cublas64_12.dll` — hướng dẫn GPU + fallback CPU
- `targetLang` không clear khi refill options
- `AUTO_TRANSLATE_TARGET` nhập nhiều mã → parse một mã hợp lệ

### Security
- File audio xóa sau xử lý (temp)
- Không authentication (local tool)

---

## [0.1.0] — 2026-05-19

### Added
- Khởi tạo project
- Whisper transcription (openai-whisper → faster-whisper)
- Giao diện upload cơ bản

---

## Template cho bản ghi mới

```markdown
## [x.y.z] — YYYY-MM-DD

### Added
### Changed
### Fixed
### Removed
### Security
```
