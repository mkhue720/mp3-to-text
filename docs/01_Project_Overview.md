# 01 — Project Overview

## Tên dự án

**MP3 → Text** (mp3totext)

## Mô tả ngắn

Ứng dụng web chạy local giúp người dùng tải file âm thanh (MP3, WAV, …), chuyển thành văn bản bằng **Faster Whisper**, và dịch song song theo giao diện **hai cột kiểu Google Translate**. Không yêu cầu API key trả phí; xử lý chính trên máy người dùng.

## Mục tiêu

| Mục tiêu | Mô tả |
|----------|--------|
| Chuyển giọng nói → chữ | Hỗ trợ tiếng Việt và đa ngôn ngữ |
| Dịch văn bản | Tích hợp Google Translate (internet) |
| Dễ triển khai | Python + FastAPI, một lệnh `run.ps1` |
| Riêng tư | Audio không lưu DB; file tạm xóa sau xử lý |

## Phạm vi (Scope)

### Trong phạm vi

- Upload / kéo-thả file âm thanh (≤ 50 MB mặc định)
- Nhận diện giọng nói (Whisper)
- Hiển thị bản ghi + phân đoạn thời gian
- Dịch Từ / Sang với 15+ ngôn ngữ
- Sao chép / tải `.txt`
- Cấu hình qua `.env` (model, CPU/GPU, port)

### Ngoài phạm vi (v1)

- Đăng nhập / phân quyền
- Lưu lịch sử trên server
- Batch nhiều file
- API key DeepL / OpenAI
- Mobile app native

## Công nghệ

| Lớp | Công nghệ |
|-----|-----------|
| Backend | Python 3.10+, FastAPI, Uvicorn |
| STT | faster-whisper (OpenAI Whisper) |
| Dịch | deep-translator → Google Translate |
| Frontend | HTML, CSS, JavaScript (vanilla) |
| Cấu hình | python-dotenv (`.env`) |

## Cấu trúc thư mục

```
mp3totext/
├── app.py                 # API + phục vụ static
├── translate_util.py      # Logic dịch
├── static/                # UI
├── docs/                  # Tài liệu dự án
├── requirements.txt
├── requirements-gpu.txt
├── run.ps1
├── .env
└── README.md
```

## Stakeholders

| Vai trò | Trách nhiệm |
|---------|-------------|
| End user | Upload audio, nhận text & bản dịch |
| Developer | Bảo trì, cấu hình model/GPU |
| Ops (local) | Cài Python, FFmpeg, chạy server |

## Liên kết tài liệu

| # | Tài liệu |
|---|----------|
| 02 | [Business Requirement Document (BRD)](02_Business_Requirement_Document_BRD.md) |
| 03 | [Functional Requirement Document (FRD)](03_Functional_Requirement_Document_FRD.md) |
| 10 | [API Specification](10_API_Specification.md) |
