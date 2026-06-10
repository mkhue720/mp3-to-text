# 10 — API Specification

**Base URL:** `http://localhost:8000` (mặc định)  
**Version:** 1.0.0  
**Format:** JSON (trừ upload multipart)

---

## 1. GET `/api/health`

Kiểm tra trạng thái service và cấu hình model.

### Response 200

```json
{
  "status": "ok",
  "model": "base",
  "device": "cpu",
  "device_requested": "cpu",
  "compute": "int8",
  "cuda_fallback": null,
  "auto_translate_target": null
}
```

| Field | Type | Mô tả |
|-------|------|--------|
| `device` | string | Thiết bị thực tế đang dùng |
| `device_requested` | string | Giá trị từ `.env` |
| `cuda_fallback` | string \| null | Thông báo nếu đã fallback từ GPU |

---

## 2. GET `/api/translate/languages`

Danh sách ngôn ngữ dịch hỗ trợ.

### Response 200

```json
{
  "languages": {
    "vi": "Tiếng Việt",
    "en": "English",
    "zh-CN": "中文 (Giản thể)"
  }
}
```

---

## 3. POST `/api/translate`

Dịch văn bản (cần internet).

### Request Body (JSON)

```json
{
  "text": "Hello world",
  "target": "vi",
  "source": "en"
}
```

| Field | Required | Type | Mô tả |
|-------|----------|------|--------|
| `text` | Yes | string | min length 1 |
| `target` | Yes | string | Mã trong `SUPPORTED_TARGETS` |
| `source` | No | string | Mã ngôn ngữ hoặc `"auto"` (default) |

### Response 200

```json
{
  "text": "Xin chào thế giới",
  "source": "en",
  "target": "vi"
}
```

### Errors

| Code | Mô tả |
|------|--------|
| 400 | Ngôn ngữ đích không hỗ trợ |
| 500 | Lỗi Google Translate / mạng |

---

## 4. POST `/api/transcribe`

Upload audio và chuyển thành text.

### Request (multipart/form-data)

| Field | Required | Type | Mô tả |
|-------|----------|------|--------|
| `file` | Yes | file | Audio file |
| `language` | No | string | Mã Whisper: `vi`, `en`, `zh`, … |
| `translate_to` | No | string | Dịch ngay sau transcribe |

### Response 200

```json
{
  "text": "Full transcript text...",
  "language": "en",
  "segments": [
    { "start": 0.0, "end": 3.5, "text": "Hello" }
  ],
  "translation": {
    "text": "Xin chào...",
    "source": "en",
    "target": "vi"
  }
}
```

`translation` có thể là:

- `null` — không yêu cầu dịch
- `{ "error": "..." }` — dịch thất bại, transcribe vẫn OK

### Errors

| Code | Detail ví dụ |
|------|----------------|
| 400 | Định dạng không hỗ trợ |
| 400 | File rỗng |
| 400 | File quá lớn (tối đa N MB) |
| 500 | Lỗi Whisper / CUDA |

---

## 5. GET `/`

Trả về `index.html` (SPA shell).

## 6. Static `/static/*`

- `/static/style.css`
- `/static/app.js`

---

## 7. OpenAPI

Khi server chạy: **http://localhost:8000/docs** (Swagger UI).

---

## 8. Ví dụ cURL

```bash
# Health
curl http://localhost:8000/api/health

# Transcribe
curl -X POST http://localhost:8000/api/transcribe \
  -F "file=@sample.mp3" \
  -F "language=en"

# Translate
curl -X POST http://localhost:8000/api/translate \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Hello\",\"target\":\"vi\",\"source\":\"en\"}"
```
