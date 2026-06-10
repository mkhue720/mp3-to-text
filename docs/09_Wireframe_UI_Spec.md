# 09 — Wireframe & UI Specification

## 1. Màn hình tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│  [Badge] Faster Whisper · Chạy trên máy bạn                 │
│              MP3 → Text                                      │
│     Tải file âm thanh lên, nhận bản ghi và bản dịch...     │
├─────────────────────────────────────────────────────────────┤
│  CARD: Upload                                                │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │         [icon upload]                                  │  │
│  │      Kéo thả file vào đây                              │  │
│  │   hoặc [chọn file] · MP3, WAV... (max 50MB)           │  │
│  │   tenfile.mp3 (2.34 MB)                                │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│  Ngôn ngữ audio: [ Tự động ▼ ]                              │
│  [████████ Bắt đầu chuyển đổi ████████]                     │
│  Status: Đang xử lý… / Hoàn tất! / Lỗi…                     │
├─────────────────────────────────────────────────────────────┤
│  CARD: Kết quả (Google Translate layout) — wide           │
│  ┌──────────────┬───┬──────────────┐                      │
│  │ TỪ           │ ⇄ │ SANG         │                      │
│  │ [Phát hiện ▼]│   │ [Tiếng Việt▼]│                      │
│  ├──────────────┴───┴──────────────┤                      │
│  │ English          │ Tiếng Việt    │  (panel titles)    │
│  │ [⎘] [↓]          │ Đang dịch [⎘][↓]                   │
│  ├──────────────────┼──────────────────┤                  │
│  │ Bản ghi text     │ Bản dịch text    │                  │
│  │ (readonly)       │ (readonly)       │                  │
│  └──────────────────┴──────────────────┘                  │
│  ▶ Chi tiết theo thời gian                                  │
└─────────────────────────────────────────────────────────────┘
```

## 2. Thành phần UI

| ID | Component | File | Mô tả |
|----|-----------|------|--------|
| UI-01 | `#dropzone` | index.html | Vùng kéo-thả, click mở file |
| UI-02 | `#language` | index.html | Ngôn ngữ audio (Whisper) |
| UI-03 | `#transcribeBtn` | index.html | Primary CTA |
| UI-04 | `#status` | index.html | Live region thông báo |
| UI-05 | `#resultSection` | index.html | Card kết quả (hidden → show) |
| UI-06 | `#sourceLang` | index.html | Dropdown Từ |
| UI-07 | `#targetLang` | index.html | Dropdown Sang |
| UI-08 | `#swapLangBtn` | index.html | Đổi chiều |
| UI-09 | `#resultText` | index.html | Textarea bản ghi |
| UI-10 | `#translateText` | index.html | Textarea bản dịch |
| UI-11 | `#segmentsDetails` | index.html | Accordion timeline |

## 3. Design tokens (CSS)

| Token | Giá trị | Dùng cho |
|-------|---------|----------|
| `--bg` | `#0c0f14` | Nền trang |
| `--surface` | `#141a24` | Card |
| `--accent` | `#5b8def` | CTA, link, focus |
| `--success` | `#3dd68c` | File name, success status |
| `--error` | `#f07178` | Lỗi |
| `--radius` | `14px` | Bo góc card |
| Font | DM Sans | Toàn site |

## 4. Responsive

| Breakpoint | Hành vi |
|------------|---------|
| `> 768px` | `.container--wide` max 1040px; 2 cột `.gt-panels` |
| `≤ 768px` | 1 cột; panels xếp dọc |
| `≤ 560px` | Upload options full width |

## 5. Trạng thái tương tác

| Trạng thái | Hiển thị |
|------------|----------|
| Chưa có file | Nút convert disabled |
| Đang transcribe | Spinner trên nút, status "Đang xử lý…" |
| Transcribe xong | `resultSection` visible, `container--wide` |
| Đang dịch | `#translateStatus`: "Đang dịch…" |
| Lỗi dịch | `#translateStatus`: "Lỗi dịch" (màu đỏ) |
| Dropzone dragover | Border accent, nền nhạt |

## 6. Accessibility

- `#status` có `role="status"` `aria-live="polite"`
- Dropzone: `tabindex="0"`, Enter/Space mở file
- Select lang: `aria-label` trên Từ / Sang

## 7. Không có (v1)

- Dark/light toggle
- Toast notification riêng
- Progress bar % transcribe
