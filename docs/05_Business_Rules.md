# 05 — Business Rules

| ID | Quy tắc | Mô tả | Nguồn |
|----|---------|--------|-------|
| BR-R01 | Định dạng file | Chỉ xử lý: `.mp3`, `.wav`, `.m4a`, `.ogg`, `.flac`, `.webm`, `.mp4`, `.mpeg`, `.mpga` | `app.py` |
| BR-R02 | Kích thước upload | `size(file) ≤ MAX_UPLOAD_MB × 1024²` (mặc định 50 MB) | `.env` |
| BR-R03 | File rỗng | Từ chối file 0 byte | `app.py` |
| BR-R04 | Xóa file tạm | File audio upload lưu temp phải xóa sau transcribe (finally) | `app.py` |
| BR-R05 | Ngôn ngữ dịch đích | `target` phải thuộc `SUPPORTED_TARGETS` | `translate_util.py` |
| BR-R06 | Chunk dịch | Mỗi đoạn gửi Google Translate ≤ 4500 ký tự | `translate_util.py` |
| BR-R07 | AUTO_TRANSLATE | Chỉ **một** mã ngôn ngữ hợp lệ trong `.env`; nếu chuỗi dài → lấy mã đầu tiên khớp | `app.py` |
| BR-R08 | Nguồn dịch mặc định | Sau transcribe: `source = detected_language` hoặc `auto` | `app.py` |
| BR-R09 | Cùng ngôn ngữ | Nếu `source === target` (không phải auto) → trả nguyên văn, không gọi API | `app.js` |
| BR-R10 | Default đích sau EN | Audio EN → đích mặc định `vi`; ngược lại thường `en` | `app.js` |
| BR-R11 | Model Whisper | Giá trị hợp lệ: `tiny`, `base`, `small`, `medium`, `large-v3` (theo faster-whisper) | `.env` |
| BR-R12 | Device CPU | `WHISPER_COMPUTE=int8` khuyến nghị | `.env` |
| BR-R13 | Device CUDA | `WHISPER_COMPUTE=float16`; lỗi DLL → fallback `cpu` + `int8` | `app.py` |
| BR-R14 | Dịch cần mạng | Không có internet → dịch thất bại, transcribe vẫn OK | Kiến trúc |
| BR-R15 | STT local | Whisper chạy on-premise; không gửi audio lên API STT trả phí | Kiến trúc |
| BR-R16 | Một model cache | Singleton `_model` — đổi `.env` model cần restart server | `app.py` |
| BR-R17 | Port đơn | `run.ps1` dừng process cũ trên `PORT` trước khi bind | `run.ps1` |

## Quy tắc hiển thị UI

| ID | Quy tắc |
|----|---------|
| BR-UI01 | Giao diện chính tiếng Việt |
| BR-UI02 | Kết quả: layout 2 cột desktop; 1 cột mobile (< 768px) |
| BR-UI03 | Debounce dịch: 450 ms sau khi đổi ngôn ngữ |

## Quy tắc lỗi

| HTTP | Tình huống |
|------|------------|
| 400 | Định dạng sai, file rỗng, quá lớn, ngôn ngữ dịch không hỗ trợ |
| 404 | Route không tồn tại (thường do server cũ trùng port) |
| 500 | Lỗi Whisper / dịch không mong đợi |
