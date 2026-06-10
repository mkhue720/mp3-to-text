# 03 — Functional Requirement Document (FRD)

**Dự án:** MP3 → Text v1.0

---

## 1. Tổng quan chức năng

| Module | Mô tả |
|--------|--------|
| M1 — Upload | Chọn / kéo-thả file âm thanh |
| M2 — Transcribe | Chuyển audio → text (Whisper) |
| M3 — Translate | Dịch text (Google Translate) |
| M4 — Export | Copy / download `.txt` |
| M5 — Config | `.env`, health API |

---

## 2. Yêu cầu chức năng chi tiết

### M1 — Upload file

| ID | Mô tả | Đầu vào | Đầu ra |
|----|--------|---------|--------|
| FR-01 | Kéo-thả file vào vùng upload | File audio | Hiển thị tên + dung lượng |
| FR-02 | Chọn file qua dialog | File audio | Hiển thị tên + dung lượng |
| FR-03 | Chỉ chấp nhận định dạng hợp lệ | File | mp3, wav, m4a, ogg, flac, webm, mp4, mpeg, mpga |
| FR-04 | Từ chối file rỗng | File 0 byte | Thông báo lỗi |
| FR-05 | Từ chối file vượt `MAX_UPLOAD_MB` | File lớn | HTTP 400 |

### M2 — Transcribe

| ID | Mô tả | Đầu vào | Đầu ra |
|----|--------|---------|--------|
| FR-10 | Bắt đầu chuyển đổi khi đã chọn file | Nút "Bắt đầu chuyển đổi" | Spinner + status |
| FR-11 | Chọn ngôn ngữ audio (tùy chọn) | Dropdown | Gửi `language` hoặc auto |
| FR-12 | Trả về full text | Audio | `text` |
| FR-13 | Trả về ngôn ngữ phát hiện | Audio | `language` |
| FR-14 | Trả về segments theo thời gian | Audio | `segments[]` |
| FR-15 | Lazy-load Whisper model | Lần đầu gọi | Model cache trong RAM |
| FR-16 | Fallback CPU nếu CUDA lỗi | `WHISPER_DEVICE=cuda` | Chạy CPU + ghi chú health |

### M3 — Translate

| ID | Mô tả | Đầu vào | Đầu ra |
|----|--------|---------|--------|
| FR-20 | Thanh ngôn ngữ Từ / Sang (GT style) | UI | 2 select + swap |
| FR-21 | Nguồn: Phát hiện hoặc mã cụ thể | `source` | Dịch đúng chiều |
| FR-22 | Đích: 15 ngôn ngữ hỗ trợ | `target` | `text` dịch |
| FR-23 | Tự dịch khi đổi ngôn ngữ (debounce) | Đổi select | Gọi `/api/translate` |
| FR-24 | Đổi chiều ⇄ | Nút swap | Hoán đổi text + lang |
| FR-25 | Chunk văn bản dài ≤ 4500 ký tự | Text dài | Nhiều request dịch |
| FR-26 | Tự dịch sau transcribe (env) | `AUTO_TRANSLATE_TARGET` | `translation` trong response |
| FR-27 | Fallback danh sách ngôn ngữ client | API lỗi | `FALLBACK_LANGUAGES` |

### M4 — Export

| ID | Mô tả |
|----|--------|
| FR-30 | Sao chép bản ghi vào clipboard |
| FR-31 | Sao chép bản dịch vào clipboard |
| FR-32 | Tải `*_transcript.txt` |
| FR-33 | Tải `*_translation.txt` |

### M5 — Config & System

| ID | Mô tả |
|----|--------|
| FR-40 | Đọc `.env`: model, device, compute, port, upload limit |
| FR-41 | `GET /api/health` — trạng thái model/device |
| FR-42 | `GET /api/translate/languages` — danh sách ngôn ngữ |
| FR-43 | Xóa file tạm sau transcribe |

---

## 3. Yêu cầu phi chức năng

| ID | Loại | Mô tả |
|----|------|--------|
| NFR-01 | Hiệu năng | Model `base` + CPU: chấp nhận vài phút / file trung bình |
| NFR-02 | Bảo mật | Không lưu audio lâu dài; CORS `*` (local dev) |
| NFR-03 | Khả dụng | UI tiếng Việt; thông báo lỗi rõ |
| NFR-04 | Khả chuyển | Windows PowerShell script `run.ps1` |
| NFR-05 | Bảo trì | Tách `translate_util.py`, static tách file |

---

## 4. Ma trận truy vết (FR → User Story)

| FR | User Story |
|----|------------|
| FR-01..05 | US-01 |
| FR-10..16 | US-02, US-03 |
| FR-20..27 | US-04, US-05 |
| FR-30..33 | US-06 |

Xem [04_User_Stories_Acceptance_Criteria.md](04_User_Stories_Acceptance_Criteria.md).
