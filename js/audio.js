// ===== AUDIO VISUALIZER & WEB AUDIO API =====
let audioCtx = null;
let analyser = null;
let micStream = null;
let animFrameId = null;
let isRecording = false;
let canvasCtx = null;

async function startMicrophone() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
    }
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const source = audioCtx.createMediaStreamSource(micStream);
    source.connect(analyser);
    isRecording = true;
    startVisualization();
    return true;
  } catch (e) {
    console.warn('Microphone access denied or not available:', e);
    return false;
  }
}

function stopMicrophone() {
  isRecording = false;
  if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
  if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
}

function startVisualization() {
  const canvas = document.getElementById('audioCanvas');
  if (!canvas || !analyser) return;
  canvasCtx = canvas.getContext('2d');
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    if (!isRecording) return;
    animFrameId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;
      const gradient = canvasCtx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
      gradient.addColorStop(0, '#7C3AED');
      gradient.addColorStop(1, '#EC4899');
      canvasCtx.fillStyle = gradient;
      canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  }
  draw();
}

// ===== ROOM AUDIO SIMULATION =====
function simulateVoiceActivity() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.1);
  gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.5);
}

// ===== NOTIFICATION SOUND =====
function playNotifSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.3);
  } catch(e) {}
}

// ===== GIFT SOUND =====
function playGiftSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t = audioCtx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t); osc.stop(t + 0.3);
    });
  } catch(e) {}
}

// ===== JOIN ROOM SOUND =====
function playJoinSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.4);
  } catch(e) {}
}

// ===== SAFE HOOKS — run after all scripts load =====
window.addEventListener('load', () => {

  // Hook sendGift to play sound
  const _origSendGift = window.sendGift;
  if (typeof _origSendGift === 'function') {
    window.sendGift = function(id) {
      _origSendGift(id);
      playGiftSound();
    };
  }

  // Hook navigate to play join-room sound (only once, guard against re-patch)
  const _origNavigate = window.navigate;
  if (typeof _origNavigate === 'function' && !_origNavigate._audioPatched) {
    window.navigate = function(page, data) {
      if (page === 'room') playJoinSound();
      return _origNavigate(page, data);
    };
    window.navigate._audioPatched = true;
  }
});
