# 04 — User Stories & Acceptance Criteria

---

## US-01 — Upload file âm thanh

**Là** người dùng  
**Tôi muốn** tải hoặc kéo-thả file MP3/audio  
**Để** chuẩn bị chuyển thành văn bản  

### Acceptance Criteria

- [ ] AC-01.1: Kéo-thả file hợp lệ → hiển thị tên file và dung lượng (MB).
- [ ] AC-01.2: Click "chọn file" mở dialog và chọn được file.
- [ ] AC-01.3: File không thuộc định dạng hỗ trợ → không cho convert (hoặc báo lỗi khi gửi).
- [ ] AC-01.4: Nút "Bắt đầu chuyển đổi" chỉ bật khi đã có file.

---

## US-02 — Chuyển audio thành chữ

**Là** người dùng  
**Tôi muốn** bấm một nút để transcribe  
**Để** nhận bản ghi nội dung audio  

### Acceptance Criteria

- [ ] AC-02.1: Sau khi xử lý xong, văn bản hiển thị ở cột trái (bản ghi).
- [ ] AC-02.2: Có thể chọn "Tự động" hoặc ngôn ngữ audio cụ thể trước khi convert.
- [ ] AC-02.3: Trạng thái hiển thị "Đang xử lý…" khi đang chạy.
- [ ] AC-02.4: Mở "Chi tiết theo thời gian" thấy danh sách segment + timestamp.

---

## US-03 — Cấu hình model / thiết bị

**Là** quản trị local  
**Tôi muốn** chỉnh `.env`  
**Để** cân bằng tốc độ và độ chính xác  

### Acceptance Criteria

- [ ] AC-03.1: `WHISPER_MODEL=small` load model tương ứng sau restart.
- [ ] AC-03.2: `WHISPER_DEVICE=cuda` dùng GPU; nếu lỗi cublas → fallback CPU không crash.
- [ ] AC-03.3: `GET /api/health` trả `device`, `model`, `cuda_fallback` nếu có.

---

## US-04 — Dịch văn bản (Google Translate style)

**Là** người dùng  
**Tôi muốn** chọn ngôn ngữ Từ / Sang trên thanh tab  
**Để** đọc bản dịch song song bản gốc  

### Acceptance Criteria

- [ ] AC-04.1: Dropdown **Từ** có "Phát hiện ngôn ngữ" + danh sách ngôn ngữ.
- [ ] AC-04.2: Dropdown **Sang** có ≥ 15 ngôn ngữ (vi, en, ja, …).
- [ ] AC-04.3: Sau transcribe, đổi **Sang** → bản dịch tự cập nhật (có internet).
- [ ] AC-04.4: Hiển thị "Đang dịch…" khi đang gọi API dịch.
- [ ] AC-04.5: Lỗi dịch hiển thị thông báo (không crash trang).

---

## US-05 — Đổi chiều dịch

**Là** người dùng  
**Tôi muốn** bấm nút đổi chiều ⇄  
**Để** hoán đổi ngôn ngữ nguồn/đích và nội dung hai cột  

### Acceptance Criteria

- [ ] AC-05.1: Sau swap, ngôn ngữ Từ/Sang đổi vị trí hợp lý.
- [ ] AC-05.2: Nội dung hai ô text được hoán đổi (nếu có bản dịch).
- [ ] AC-05.3: Hệ thống gọi dịch lại sau swap.

---

## US-06 — Xuất kết quả

**Là** người dùng  
**Tôi muốn** copy hoặc tải file text  
**Để** dùng trong Word / email  

### Acceptance Criteria

- [ ] AC-06.1: Nút copy bản ghi → clipboard có đúng nội dung.
- [ ] AC-06.2: Nút copy bản dịch → clipboard có đúng nội dung.
- [ ] AC-06.3: Tải `.txt` đặt tên theo file audio gốc + suffix.

---

## Definition of Done (chung)

- Code chạy được qua `.\run.ps1`
- Không lỗi console khi flow chính: upload → transcribe → dịch
- Tài liệu API cập nhật nếu đổi endpoint
