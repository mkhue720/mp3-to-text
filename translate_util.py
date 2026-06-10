from deep_translator import GoogleTranslator

CHUNK_SIZE = 4500

SUPPORTED_TARGETS = {
    "vi": "Tiếng Việt",
    "en": "English",
    "zh-CN": "中文 (Giản thể)",
    "zh-TW": "中文 (Phồn thể)",
    "ja": "日本語",
    "ko": "한국어",
    "fr": "Français",
    "de": "Deutsch",
    "es": "Español",
    "th": "ไทย",
    "id": "Bahasa Indonesia",
    "ru": "Русский",
    "pt": "Português",
    "ar": "العربية",
    "hi": "हिन्दी",
}


def chunk_text(text: str, max_len: int = CHUNK_SIZE) -> list[str]:
    if len(text) <= max_len:
        return [text]

    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + max_len, len(text))
        if end < len(text):
            space = text.rfind(" ", start, end)
            if space > start:
                end = space
        piece = text[start:end].strip()
        if piece:
            chunks.append(piece)
        start = end if end > start else start + max_len
    return chunks or [text]


def translate_text(text: str, target: str, source: str = "auto") -> dict:
    target = target.strip()
    source = (source or "auto").strip() or "auto"

    if target not in SUPPORTED_TARGETS:
        supported = ", ".join(sorted(SUPPORTED_TARGETS))
        raise ValueError(f"Ngôn ngữ đích không hỗ trợ. Chọn một trong: {supported}")

    text = text.strip()
    if not text:
        return {"text": "", "source": source, "target": target}

    translator = GoogleTranslator(source=source, target=target)
    parts = []
    for chunk in chunk_text(text):
        if chunk == "":
            parts.append("")
            continue
        parts.append(translator.translate(chunk))

    return {
        "text": " ".join(parts),
        "source": source,
        "target": target,
    }
