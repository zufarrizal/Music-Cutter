const fileInput = document.getElementById("fileInput");
const fileInfo = document.getElementById("fileInfo");
const audioPreview = document.getElementById("audioPreview");
const startSlider = document.getElementById("startSlider");
const endSlider = document.getElementById("endSlider");
const startValue = document.getElementById("startValue");
const endValue = document.getElementById("endValue");
const selectionInfo = document.getElementById("selectionInfo");
const playSelectionBtn = document.getElementById("playSelectionBtn");
const cutBtn = document.getElementById("cutBtn");
const rangeSelection = document.getElementById("rangeSelection");

let audioContext;
let audioBuffer = null;
let currentFileName = "audio";
let stopTimer = null;

const fmt = (seconds) => `${seconds.toFixed(2)}s`;

function updateSelectionUI() {
  const a = Number(startSlider.value);
  const b = Number(endSlider.value);
  const max = Number(startSlider.max) || 0;
  startValue.value = fmt(a);
  endValue.value = fmt(b);
  selectionInfo.textContent = `Durasi potong: ${(b - a).toFixed(2)}s`;

  if (max > 0) {
    rangeSelection.style.left = `${(a / max) * 100}%`;
    rangeSelection.style.width = `${((b - a) / max) * 100}%`;
  } else {
    rangeSelection.style.left = "0%";
    rangeSelection.style.width = "0%";
  }
}

function enforceBounds(changed) {
  let a = Number(startSlider.value);
  let b = Number(endSlider.value);

  if (changed === "start" && a > b) {
    b = a;
    endSlider.value = String(b);
  }
  if (changed === "end" && b < a) {
    a = b;
    startSlider.value = String(a);
  }
  updateSelectionUI();
}

function setControlsEnabled(enabled) {
  startSlider.disabled = !enabled;
  endSlider.disabled = !enabled;
  playSelectionBtn.disabled = !enabled;
  cutBtn.disabled = !enabled;
}

function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const objectUrl = URL.createObjectURL(file);
    audioPreview.src = objectUrl;
    currentFileName = file.name.replace(/\.[^.]+$/, "");

    const arrayBuffer = await file.arrayBuffer();
    const ctx = getAudioContext();
    audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

    const duration = audioBuffer.duration;
    startSlider.min = "0";
    endSlider.min = "0";
    startSlider.max = String(duration);
    endSlider.max = String(duration);
    startSlider.value = "0";
    endSlider.value = String(duration);

    fileInfo.textContent = `${file.name} (${duration.toFixed(2)} detik)`;
    setControlsEnabled(true);
    updateSelectionUI();
  } catch (error) {
    audioBuffer = null;
    setControlsEnabled(false);
    fileInfo.textContent = `Gagal membaca file audio: ${error.message}`;
  }
});

startSlider.addEventListener("input", () => enforceBounds("start"));
endSlider.addEventListener("input", () => enforceBounds("end"));

playSelectionBtn.addEventListener("click", () => {
  if (!audioBuffer) return;
  const a = Number(startSlider.value);
  const b = Number(endSlider.value);
  if (b <= a) return;

  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }

  audioPreview.currentTime = a;
  audioPreview.play();
  stopTimer = setTimeout(() => {
    audioPreview.pause();
    audioPreview.currentTime = a;
    stopTimer = null;
  }, (b - a) * 1000);
});

cutBtn.addEventListener("click", async () => {
  if (!audioBuffer) return;
  const a = Number(startSlider.value);
  const b = Number(endSlider.value);
  if (b <= a) return;

  const startSample = Math.floor(a * audioBuffer.sampleRate);
  const endSample = Math.floor(b * audioBuffer.sampleRate);
  const frameCount = endSample - startSample;
  if (frameCount <= 0) return;

  const channels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;

  const channelData = [];
  for (let c = 0; c < channels; c++) {
    const src = audioBuffer.getChannelData(c);
    channelData.push(src.slice(startSample, endSample));
  }

  const wavBlob = encodeWav(channelData, sampleRate);
  const url = URL.createObjectURL(wavBlob);
  const aEl = document.createElement("a");
  aEl.href = url;
  aEl.download = `${currentFileName}_A-${a.toFixed(2)}_B-${b.toFixed(2)}.wav`;
  aEl.click();
  URL.revokeObjectURL(url);
});

function encodeWav(channelData, sampleRate) {
  const channels = channelData.length;
  const length = channelData[0].length;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let c = 0; c < channels; c++) {
      const sample = Math.max(-1, Math.min(1, channelData[c][i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view, offset, text) {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}
