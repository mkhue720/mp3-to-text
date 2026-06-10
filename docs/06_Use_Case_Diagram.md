# 06 — Use Case Diagram

## Actors

| Actor | Mô tả |
|-------|--------|
| **End User** | Người dùng web local |
| **Admin** | Cấu hình `.env`, khởi động server |
| **Whisper Model** | Hệ thống con (local STT) |
| **Google Translate** | Hệ thống ngoài (dịch qua internet) |

## Use Case Diagram (Mermaid)

```mermaid
flowchart TB
    subgraph actors [Actors]
        U((End User))
        A((Admin))
    end

    subgraph system [MP3 to Text System]
        UC1[Upload Audio File]
        UC2[Transcribe to Text]
        UC3[View Segments]
        UC4[Select Source/Target Language]
        UC5[Translate Text]
        UC6[Swap Languages]
        UC7[Copy to Clipboard]
        UC8[Download TXT]
        UC9[Configure Environment]
        UC10[Start/Stop Server]
    end

    subgraph external [External]
        W[[Whisper / faster-whisper]]
        G[[Google Translate]]
    end

    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6
    U --> UC7
    U --> UC8

    A --> UC9
    A --> UC10

    UC2 --> W
    UC5 --> G

    UC2 -.-> UC3
    UC2 -.-> UC5
    UC4 -.-> UC5
```

## Danh sách Use Case

| UC ID | Tên | Actor | Mô tả ngắn |
|-------|-----|-------|------------|
| UC-01 | Upload Audio | End User | Chọn/kéo-thả file |
| UC-02 | Transcribe | End User | POST `/api/transcribe` |
| UC-03 | View Segments | End User | Mở details timeline |
| UC-04 | Select Languages | End User | Từ / Sang dropdown |
| UC-05 | Translate | End User | POST `/api/translate` |
| UC-06 | Swap Languages | End User | Đổi chiều ⇄ |
| UC-07 | Copy | End User | Clipboard |
| UC-08 | Download | End User | File `.txt` |
| UC-09 | Configure | Admin | Sửa `.env` |
| UC-10 | Run Server | Admin | `run.ps1` / uvicorn |

## Include / Extend

| Quan hệ | Từ | Đến | Ghi chú |
|---------|-----|-----|---------|
| include | UC-02 | UC-01 | Phải có file trước |
| include | UC-05 | UC-02 | Cần text (thường sau transcribe) |
| extend | UC-05 | UC-04 | Đổi lang kích hoạt dịch lại |
| extend | UC-02 | UC-05 | Nếu `AUTO_TRANSLATE_TARGET` được set |
