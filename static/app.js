const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");
const fileNameEl = document.getElementById("fileName");
const transcribeBtn = document.getElementById("transcribeBtn");
const languageSelect = document.getElementById("language");
const statusEl = document.getElementById("status");
const resultSection = document.getElementById("resultSection");
const resultText = document.getElementById("resultText");
const translateText = document.getElementById("translateText");
const sourceLang = document.getElementById("sourceLang");
const targetLang = document.getElementById("targetLang");
const swapLangBtn = document.getElementById("swapLangBtn");
const sourcePanelTitle = document.getElementById("sourcePanelTitle");
const targetPanelTitle = document.getElementById("targetPanelTitle");
const translateStatus = document.getElementById("translateStatus");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const copyTranslateBtn = document.getElementById("copyTranslateBtn");
const downloadTranslateBtn = document.getElementById("downloadTranslateBtn");
const segmentsDetails = document.getElementById("segmentsDetails");
const segmentsList = document.getElementById("segmentsList");
const container = document.querySelector(".container");

let selectedFile = null;
let translateLanguages = {};
let translateTimer = null;
let translateAbort = null;

const SOURCE_AUTO = "auto";

const FALLBACK_LANGUAGES = {
  vi: "Tiếng Việt",
  en: "English",
  "zh-CN": "中文 (Giản thể)",
  "zh-TW": "中文 (Phồn thể)",
  ja: "日本語",
  ko: "한국어",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  th: "ไทย",
  id: "Bahasa Indonesia",
  ru: "Русский",
  pt: "Português",
  ar: "العربية",
  hi: "हिन्दी",
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = `status${type ? ` ${type}` : ""}`;
}

function setLoading(loading) {
  transcribeBtn.disabled = loading || !selectedFile;
  transcribeBtn.classList.toggle("loading", loading);
  transcribeBtn.querySelector(".btn-spinner").classList.toggle("hidden", !loading);
}

function setTranslateUiState(state, message = "") {
  translateStatus.classList.toggle("hidden", !message);
  translateStatus.textContent = message;
  translateStatus.classList.remove("loading", "error");
  if (state === "loading") translateStatus.classList.add("loading");
  if (state === "error") translateStatus.classList.add("error");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function parseApiError(data, status, fallback) {
  if (status === 404) {
    return "API dịch không tìm thấy — khởi động lại server (chạy .\\run.ps1).";
  }
  const d = data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x.msg || x).join(", ");
  return fallback;
}

function langLabel(code) {
  if (code === SOURCE_AUTO) return "Phát hiện ngôn ngữ";
  return translateLanguages[code] || code;
}

function updatePanelTitles() {
  sourcePanelTitle.textContent = langLabel(sourceLang.value);
  targetPanelTitle.textContent = langLabel(targetLang.value);
}

function fillLangSelects(languages) {
  translateLanguages = { ...languages };

  const prevSource = sourceLang.value;
  const prevTarget = targetLang.value;

  sourceLang.innerHTML = "";
  targetLang.innerHTML = "";

  const autoOpt = document.createElement("option");
  autoOpt.value = SOURCE_AUTO;
  autoOpt.textContent = "Phát hiện ngôn ngữ";
  sourceLang.appendChild(autoOpt);

  for (const [code, label] of Object.entries(languages)) {
    const o1 = document.createElement("option");
    o1.value = code;
    o1.textContent = label;
    sourceLang.appendChild(o1);

    const o2 = document.createElement("option");
    o2.value = code;
    o2.textContent = label;
    targetLang.appendChild(o2);
  }

  sourceLang.value = prevSource && (prevSource === SOURCE_AUTO || languages[prevSource]) ? prevSource : SOURCE_AUTO;
  targetLang.value = prevTarget && languages[prevTarget] ? prevTarget : "en";
  if (!targetLang.value && targetLang.options.length) targetLang.value = targetLang.options[0].value;

  updatePanelTitles();
}

function pickDefaultTarget(detected) {
  if (detected === "vi") return "en";
  if (detected === "en") return "vi";
  return "vi";
}

function syncSourceFromDetected(detected) {
  if (detected && translateLanguages[detected]) {
    sourceLang.value = detected;
  } else {
    sourceLang.value = SOURCE_AUTO;
  }
  updatePanelTitles();
}

async function loadConfig() {
  let languages = FALLBACK_LANGUAGES;

  try {
    const [langRes, healthRes] = await Promise.all([
      fetch("/api/translate/languages"),
      fetch("/api/health"),
    ]);
    const langData = await langRes.json().catch(() => ({}));
    const healthData = await healthRes.json().catch(() => ({}));

    if (langRes.ok && langData.languages) {
      languages = langData.languages;
    }

    fillLangSelects(languages);

    if (healthData.auto_translate_target && translateLanguages[healthData.auto_translate_target]) {
      targetLang.value = healthData.auto_translate_target;
      updatePanelTitles();
    }
  } catch {
    fillLangSelects(FALLBACK_LANGUAGES);
  }
}

async function runTranslate() {
  const text = resultText.value.trim();
  const target = targetLang.value;
  if (!text || !target) {
    translateText.value = "";
    return;
  }

  const source = sourceLang.value === SOURCE_AUTO ? "auto" : sourceLang.value;
  if (source !== "auto" && source === target) {
    translateText.value = text;
    setTranslateUiState("idle");
    return;
  }

  if (translateAbort) translateAbort.abort();
  translateAbort = new AbortController();

  setTranslateUiState("loading", "Đang dịch…");

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target, source }),
      signal: translateAbort.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(parseApiError(data, res.status, "Dịch thất bại."));

    translateText.value = data.text || "";
    setTranslateUiState("idle");
    setStatus("Đã cập nhật bản dịch.", "success");
  } catch (err) {
    if (err.name === "AbortError") return;
    setTranslateUiState("error", "Lỗi dịch");
    setStatus(err.message || "Có lỗi khi dịch.", "error");
  }
}

function scheduleTranslate() {
  clearTimeout(translateTimer);
  translateTimer = setTimeout(runTranslate, 450);
}

function swapLanguages() {
  const oldSource = sourceLang.value;
  const oldTarget = targetLang.value;
  const oldLeft = resultText.value;
  const oldRight = translateText.value;

  resultText.value = oldRight;
  translateText.value = oldLeft;

  if (oldSource === SOURCE_AUTO) {
    sourceLang.value = oldTarget;
    targetLang.value = pickDefaultTarget(oldTarget);
  } else {
    sourceLang.value = oldTarget;
    targetLang.value = oldSource;
  }

  updatePanelTitles();
  scheduleTranslate();
}

function pickFile(file) {
  if (!file) return;
  selectedFile = file;
  fileNameEl.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
  fileNameEl.classList.remove("hidden");
  transcribeBtn.disabled = false;
  setStatus("");
  resultSection.classList.add("hidden");
  container.classList.remove("container--wide");
  resultText.value = "";
  translateText.value = "";
}

browseBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  fileInput.click();
});

dropzone.addEventListener("click", () => fileInput.click());

dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) pickFile(fileInput.files[0]);
});

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragover");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("dragover");
});

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) pickFile(file);
});

sourceLang.addEventListener("change", () => {
  updatePanelTitles();
  scheduleTranslate();
});

targetLang.addEventListener("change", () => {
  updatePanelTitles();
  scheduleTranslate();
});

swapLangBtn.addEventListener("click", swapLanguages);

transcribeBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  const form = new FormData();
  form.append("file", selectedFile);
  const lang = languageSelect.value;
  if (lang) form.append("language", lang);

  setLoading(true);
  setStatus("Đang xử lý… Lần đầu có thể mất vài phút để tải model.");

  try {
    const res = await fetch("/api/transcribe", {
      method: "POST",
      body: form,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.detail || "Chuyển đổi thất bại.");
    }

    resultText.value = data.text || "";
    resultSection.classList.remove("hidden");
    container.classList.add("container--wide");

    if (!targetLang.options.length) {
      await loadConfig();
    }

    syncSourceFromDetected(data.language || "");

    if (!targetLang.value || targetLang.value === data.language) {
      targetLang.value = pickDefaultTarget(data.language || "");
      updatePanelTitles();
    }

    if (data.segments?.length) {
      segmentsList.innerHTML = data.segments
        .map(
          (seg) =>
            `<li><span>${formatTime(seg.start)} – ${formatTime(seg.end)}</span>${escapeHtml(seg.text)}</li>`
        )
        .join("");
      segmentsDetails.classList.remove("hidden");
    } else {
      segmentsDetails.classList.add("hidden");
    }

    if (data.translation?.text && !data.translation.error) {
      translateText.value = data.translation.text;
      if (data.translation.target) targetLang.value = data.translation.target;
      updatePanelTitles();
      setStatus("Hoàn tất!", "success");
    } else {
      scheduleTranslate();
      setStatus(
        data.translation?.error
          ? `Chuyển đổi xong. Dịch lỗi: ${data.translation.error}`
          : "Hoàn tất!",
        data.translation?.error ? "error" : "success"
      );
    }
  } catch (err) {
    setStatus(err.message || "Có lỗi xảy ra.", "error");
  } finally {
    setLoading(false);
  }
});

copyBtn.addEventListener("click", async () => {
  if (!resultText.value) return;
  await navigator.clipboard.writeText(resultText.value);
  setStatus("Đã sao chép bản ghi.", "success");
});

downloadBtn.addEventListener("click", () => {
  downloadText(resultText.value, "transcript");
});

copyTranslateBtn.addEventListener("click", async () => {
  if (!translateText.value) return;
  await navigator.clipboard.writeText(translateText.value);
  setStatus("Đã sao chép bản dịch.", "success");
});

downloadTranslateBtn.addEventListener("click", () => {
  downloadText(translateText.value, "translation");
});

function downloadText(content, suffix) {
  if (!content) return;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const base = selectedFile?.name?.replace(/\.[^.]+$/, "") || "output";
  a.download = `${base}_${suffix}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

fillLangSelects(FALLBACK_LANGUAGES);
loadConfig();
