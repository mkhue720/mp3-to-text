# 12 — Test Cases & UAT

**Phiên bản:** 1.0  
**Môi trường UAT:** Windows 10/11, Python 3.10+, `http://localhost:8000`

---

## 1. Smoke Test

| TC ID | Mô tả | Bước | Kỳ vọng | Pass |
|-------|--------|------|---------|------|
| SM-01 | Server start | Chạy `.\run.ps1` | Uvicorn running, không crash | ☐ |
| SM-02 | Health | GET `/api/health` | `status: ok` | ☐ |
| SM-03 | Trang chủ | Mở `/` | UI upload hiển thị | ☐ |

---

## 2. Upload & Validation

| TC ID | Mô tả | Dữ liệu | Kỳ vọng | Pass |
|-------|--------|---------|---------|------|
| UP-01 | Upload MP3 hợp lệ | file.mp3 < 50MB | Hiện tên file, nút bật | ☐ |
| UP-02 | Kéo-thả | Kéo wav vào dropzone | Giống UP-01 | ☐ |
| UP-03 | File quá lớn | > MAX_UPLOAD_MB | Lỗi 400 / thông báo | ☐ |
| UP-04 | File sai định dạng | .txt | Lỗi định dạng | ☐ |
| UP-05 | File rỗng | 0 byte | Lỗi file rỗng | ☐ |

---

## 3. Transcribe

| TC ID | Mô tả | Điều kiện | Kỳ vọng | Pass |
|-------|--------|-----------|---------|------|
| TR-01 | Transcribe EN | Audio tiếng Anh rõ | Text EN ở cột trái | ☐ |
| TR-02 | Transcribe VI | Audio tiếng Việt | Text VI | ☐ |
| TR-03 | Auto language | Không chọn ngôn ngữ | `language` detected đúng | ☐ |
| TR-04 | Segments | Audio > 10s | Chi tiết thời gian có mục | ☐ |
| TR-05 | Spinner | Đang xử lý | Nút loading + status | ☐ |

---

## 4. Translate

| TC ID | Mô tả | Điều kiện | Kỳ vọng | Pass |
|-------|--------|-----------|---------|------|
| TL-01 | EN → VI | Có internet | Bản dịch cột phải | ☐ |
| TL-02 | Đổi Sang | Đổi sang ja | Dịch lại sau ~0.5s | ☐ |
| TL-03 | Dropdown có data | Load trang | Từ/Sang hiện tên ngôn ngữ | ☐ |
| TL-04 | Swap ⇄ | Có cả 2 bản | Hoán đổi lang + text | ☐ |
| TL-05 | Không mạng | Tắt internet | Lỗi dịch, bản ghi vẫn có | ☐ |
| TL-06 | API 404 | Server cũ | Thông báo restart server | ☐ |

---

## 5. Export

| TC ID | Mô tả | Kỳ vọng | Pass |
|-------|--------|---------|------|
| EX-01 | Copy bản ghi | Clipboard đúng | ☐ |
| EX-02 | Copy bản dịch | Clipboard đúng | ☐ |
| EX-03 | Download transcript | File `*_transcript.txt` | ☐ |
| EX-04 | Download translation | File `*_translation.txt` | ☐ |

---

## 6. Configuration

| TC ID | Mô tả | Cấu hình | Kỳ vọng | Pass |
|-------|--------|----------|---------|------|
| CF-01 | Model tiny | `WHISPER_MODEL=tiny` | Health trả tiny | ☐ |
| CF-02 | CPU mode | `WHISPER_DEVICE=cpu` | Transcribe OK | ☐ |
| CF-03 | CUDA fallback | cuda + thiếu DLL | CPU fallback, health note | ☐ |
| CF-04 | Auto translate env | `AUTO_TRANSLATE_TARGET=vi` | Dịch VI sau transcribe | ☐ |
| CF-05 | Port custom | `PORT=8001` | App trên 8001 | ☐ |

---

## 7. Non-functional

| TC ID | Mô tả | Kỳ vọng | Pass |
|-------|--------|---------|------|
| NF-01 | Responsive mobile | 375px width | 1 cột panels | ☐ |
| NF-02 | Temp file cleanup | Sau transcribe | Không đầy temp | ☐ |
| NF-03 | CORS | Gọi API từ same origin | Không lỗi CORS | ☐ |

---

## 8. UAT Sign-off

| Hạng mục | Người test | Ngày | Kết quả |
|----------|------------|------|---------|
| Smoke + Upload | | | ☐ Pass ☐ Fail |
| Transcribe | | | ☐ Pass ☐ Fail |
| Translate + Export | | | ☐ Pass ☐ Fail |
| Config | | | ☐ Pass ☐ Fail |

**Ghi chú lỗi:**

```
(ID TC) Mô tả lỗi:
Bước tái hiện:
Kỳ vọng / Thực tế:
```
