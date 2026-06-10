# 02 — Business Requirement Document (BRD)

**Dự án:** MP3 → Text  
**Phiên bản:** 1.0  
**Ngày:** 2026-05-20

---

## 1. Bối cảnh kinh doanh

Người dùng cần chuyển nội dung audio (bài giảng, họp, podcast) sang văn bản có thể chỉnh sửa và dịch sang ngôn ngữ khác — mà không phụ thuộc dịch vụ cloud trả phí hoặc upload dữ liệu nhạy cảm lên bên thứ ba cho bước nhận dạng giọng nói.

## 2. Vấn đề cần giải quyết

- Thao tác thủ công nghe–ghi chép tốn thời gian.
- Công cụ online có giới hạn dung lượng / phí / lo ngại bảo mật.
- Thiếu luồng **ghi âm → chữ → dịch** trong một giao diện thống nhất.

## 3. Mục tiêu kinh doanh

| ID | Mục tiêu | Chỉ số thành công (gợi ý) |
|----|----------|---------------------------|
| BG-01 | Giảm thời gian tạo bản ghi | < 2× thời lượng audio (CPU, model base) |
| BG-02 | Hỗ trợ đa ngôn ngữ | ≥ 10 ngôn ngữ dịch; Whisper auto-detect |
| BG-03 | Triển khai local | Không bắt buộc API key cho STT |
| BG-04 | Trải nghiệm quen thuộc | UI dạng Google Translate |

## 4. Phạm vi nghiệp vụ

### 4.1 Bao gồm

- Upload file âm thanh đơn.
- Chuyển đổi speech-to-text.
- Dịch văn bản kết quả.
- Xuất văn bản (copy / download).

### 4.2 Không bao gồm

- Quản lý tài khoản doanh nghiệp.
- Thanh toán / subscription.
- Lưu trữ dài hạn trên cloud.
- Chỉnh sửa audio / video.

## 5. Yêu cầu nghiệp vụ cấp cao

| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| BR-01 | Hệ thống chấp nhận MP3 và các định dạng audio phổ biến | Must |
| BR-02 | Kết quả chữ có thể sao chép hoặc tải file | Must |
| BR-03 | Người dùng chọn ngôn ngữ đích dịch trực quan | Must |
| BR-04 | Xử lý STT trên máy người dùng (privacy) | Must |
| BR-05 | Cấu hình model chất lượng / tốc độ qua file môi trường | Should |
| BR-06 | Hỗ trợ GPU khi có CUDA | Could |
| BR-07 | Tự dịch sau convert nếu cấu hình | Could |

## 6. Ràng buộc

- Cần **internet** cho tính năng dịch (Google Translate).
- Lần đầu chạy tải model Whisper (~150 MB với `base`).
- Dung lượng file giới hạn (mặc định 50 MB).
- Windows: có thể cần cài FFmpeg; GPU cần CUDA 12 / cuBLAS.

## 7. Giả định & phụ thuộc

- Người dùng có Python 3.10+ và quyền cài package.
- Google Translate (qua deep-translator) khả dụng tại thời điểm dịch.
- Chất lượng STT phụ thuộc chất lượng audio và model Whisper.

## 8. Rủi ro

| Rủi ro | Tác động | Giảm thiểu |
|--------|----------|-------------|
| Google Translate chặn / rate limit | Dịch lỗi | Thông báo lỗi rõ; retry |
| GPU thiếu DLL CUDA | Không chạy CUDA | Fallback CPU trong app |
| File quá lớn | Timeout / OOM | Giới hạn `MAX_UPLOAD_MB` |
| Nhiều server trùng port | API 404 | `run.ps1` kill process cũ |

## 9. Phê duyệt

| Vai trò | Tên | Ngày | Chữ ký |
|---------|-----|------|--------|
| Product Owner | | | |
| Technical Lead | | | |
