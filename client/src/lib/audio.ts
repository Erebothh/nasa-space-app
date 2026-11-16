const SOUND_PREFERENCE_KEY = 'orbitalab-sound-enabled';
const SOUND_VOLUME_KEY = 'orbitalab-sound-volume';
const MASTER_GAIN = 0.6;
const CLIP_TIMEOUT_MS = 60_000;
const ALERT_BASE = '/audio/alertas/Alerta.m4a';

const ALERT_CLIPS: Record<string, string> = {
  'nominal-operations': '/audio/alertas/Ajuste_de_navegacion.m4a',
  'power-drop': '/audio/alertas/Caida_de_tension.m4a',
  'low-downlink': '/audio/alertas/Ventana_de_bajada_limitada.m4a',
  'structural-stress': '/audio/alertas/Estres_estructural_en_Max-Q.m4a',
  'space-radiation-storm': '/audio/alertas/tormenta_de_radiacion_espacial.m4a',
  'fluid-shift-vision': '/audio/alertas/desplazamiento_de_fuidos_y_presion_ocular.m4a',
  'spatial-disorientation': '/audio/alertas/Desorientacion_espacial_en_transicion.m4a',
  'microbiome-alert': '/audio/alertas/poliferacion_microbiana_en_cabina.m4a',
  'autonomous-medical-latency': '/audio/alertas/contingencia_medica_con_latencia.m4a',
};

let soundEnabled = readPreference();
let soundVolume = readVolumePreference();
let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicTimer: number | null = null;
let musicOscillators: OscillatorNode[] = [];
let currentClip: HTMLAudioElement | null = null;
let finishCurrentClip: ((played: boolean) => void) | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let pauseClipTimeout: (() => void) | null = null;
let resumeClipTimeout: (() => void) | null = null;
let pauseSpeechTimeout: (() => void) | null = null;
let resumeSpeechTimeout: (() => void) | null = null;
let alertQueue = Promise.resolve();
let noteIndex = 0;

function readPreference(): boolean {
  try {
    return window.localStorage.getItem(SOUND_PREFERENCE_KEY) !== 'false';
  } catch (error) {
    console.warn('No se pudo leer la preferencia de sonido:', error);
    return true;
  }
}

function readVolumePreference(): number {
  try {
    const stored = window.localStorage.getItem(SOUND_VOLUME_KEY);
    if (stored === null) return 0.85;
    const value = Number(stored);
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0.85;
  } catch (error) {
    console.warn('No se pudo leer el volumen configurado:', error);
    return 0.85;
  }
}

function updateMasterGain(): void {
  if (!audioContext || !masterGain) return;
  masterGain.gain.setTargetAtTime(
    soundEnabled ? MASTER_GAIN * soundVolume : 0,
    audioContext.currentTime,
    0.04,
  );
}

function getAudioContext(): AudioContext | null {
  if (audioContext) return audioContext;
  if (typeof window.AudioContext !== 'function') {
    console.warn('Este navegador no dispone de Web Audio.');
    return null;
  }
  audioContext = new window.AudioContext();
  masterGain = audioContext.createGain();
  masterGain.gain.value = soundEnabled ? MASTER_GAIN * soundVolume : 0;
  masterGain.connect(audioContext.destination);
  return audioContext;
}

export function getSoundEnabled(): boolean {
  return soundEnabled;
}

export function getSoundVolume(): number {
  return soundVolume;
}

export function setSoundVolume(volume: number): void {
  soundVolume = Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : 0.85));
  try {
    window.localStorage.setItem(SOUND_VOLUME_KEY, String(soundVolume));
  } catch (error) {
    console.warn('No se pudo guardar el volumen configurado:', error);
  }
  updateMasterGain();
  if (currentClip) currentClip.volume = 0.9 * soundVolume;
}

export function unlockAudio(): void {
  if (!soundEnabled) return;
  const context = getAudioContext();
  if (!context) return;
  void context.resume().then(() => startAmbientMusic()).catch((error: unknown) => {
    console.warn('No se pudo iniciar el audio:', error);
  });
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  try {
    window.localStorage.setItem(SOUND_PREFERENCE_KEY, String(enabled));
  } catch (error) {
    console.warn('No se pudo guardar la preferencia de sonido:', error);
  }
  if (!enabled) {
    updateMasterGain();
    stopAmbientMusic();
    stopCurrentClip();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    return;
  }
  const context = getAudioContext();
  if (context) {
    void context.resume().then(() => {
      updateMasterGain();
      startAmbientMusic();
    }).catch((error: unknown) => {
      console.warn('No se pudo reactivar el audio:', error);
    });
  }
}

function startAmbientMusic(): void {
  if (!soundEnabled || musicTimer !== null) return;
  const context = getAudioContext();
  if (!context || !masterGain) return;

  musicGain = context.createGain();
  musicGain.gain.value = 0.19;
  musicGain.connect(masterGain);
  for (const frequency of [55, 82.41]) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.value = frequency === 55 ? 0.028 : 0.014;
    oscillator.connect(gain);
    gain.connect(musicGain);
    oscillator.start();
    musicOscillators.push(oscillator);
  }
  const notes = [220, 261.63, 329.63, 392, 329.63, 261.63, 196, 261.63];
  const playNote = () => {
    const context = audioContext;
    const destination = musicGain;
    if (!context || !destination || !soundEnabled) return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = notes[noteIndex % notes.length];
    noteIndex += 1;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(now);
    oscillator.stop(now + 1.6);
  };
  playNote();
  musicTimer = window.setInterval(playNote, 1800);
}

function stopAmbientMusic(): void {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
  for (const oscillator of musicOscillators) {
    oscillator.stop();
  }
  musicOscillators = [];
  musicGain?.disconnect();
  musicGain = null;
}

export function playUiClick(): void {
  if (!soundEnabled) return;
  const context = getAudioContext();
  const destination = masterGain;
  if (!context || !destination || context.state !== 'running') return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(720, now);
  oscillator.frequency.exponentialRampToValueAtTime(480, now + 0.045);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.13, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(now);
  oscillator.stop(now + 0.08);
}

export function playAlertTone(): void {
  if (!soundEnabled) return;
  const context = getAudioContext();
  const destination = masterGain;
  if (!context || !destination || context.state !== 'running') return;
  [880, 660, 880].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = context.currentTime + index * 0.18;
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.09, startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.12);
    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.13);
  });
}

export function speakAlvaDialog(text: string, language = 'es-AR'): Promise<boolean> {
  if (!soundEnabled || !('speechSynthesis' in window)) return Promise.resolve(false);
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = 0.95;
  utterance.volume = soundVolume;
  currentUtterance = utterance;
  return new Promise((resolve) => {
    let timeout: number | null = null;
    const clearTimeout = () => {
      if (timeout === null) return;
      window.clearTimeout(timeout);
      timeout = null;
    };
    const finish = (played: boolean) => {
      clearTimeout();
      if (currentUtterance === utterance) {
        currentUtterance = null;
        pauseSpeechTimeout = null;
        resumeSpeechTimeout = null;
      }
      resolve(played);
    };
    const scheduleTimeout = () => {
      clearTimeout();
      timeout = window.setTimeout(() => {
        console.warn('Se agotó el tiempo de espera del diálogo de AlvaBot.');
        finish(false);
      }, CLIP_TIMEOUT_MS);
    };
    pauseSpeechTimeout = clearTimeout;
    resumeSpeechTimeout = scheduleTimeout;
    scheduleTimeout();
    utterance.onend = () => finish(true);
    utterance.onerror = (event) => {
      console.warn('No se pudo reproducir el diálogo de AlvaBot:', event.error);
      finish(false);
    };
    window.speechSynthesis.speak(utterance);
  });
}

export function pauseAlvaDialog(): boolean {
  if (currentClip && !currentClip.paused) {
    currentClip.pause();
    pauseClipTimeout?.();
    return true;
  }
  if (currentUtterance && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
    pauseSpeechTimeout?.();
    return true;
  }
  return false;
}

export function resumeAlvaDialog(): boolean {
  if (!soundEnabled) return false;
  if (currentClip?.paused) {
    resumeClipTimeout?.();
    void currentClip.play().catch((error: unknown) => {
      console.warn('No se pudo reanudar el audio de AlvaBot:', error);
      finishCurrentClip?.(false);
    });
    return true;
  }
  if (currentUtterance && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    resumeSpeechTimeout?.();
    return true;
  }
  return false;
}

function stopCurrentClip(): void {
  if (!currentClip) return;
  const clip = currentClip;
  clip.pause();
  clip.currentTime = 0;
  const finish = finishCurrentClip;
  finish?.(false);
}

function playClip(source: string): Promise<boolean> {
  if (!soundEnabled) return Promise.resolve(false);
  stopCurrentClip();
  const playableSource = source.replace(/\.m4a$/i, '.mp3');
  const audio = new Audio(encodeURI(playableSource));
  audio.volume = 0.9 * soundVolume;
  currentClip = audio;
  return new Promise((resolve) => {
    let timeout: number | null = null;
    const clearTimeout = () => {
      if (timeout === null) return;
      window.clearTimeout(timeout);
      timeout = null;
    };
    const finish = (played: boolean) => {
      clearTimeout();
      if (currentClip === audio) {
        currentClip = null;
        finishCurrentClip = null;
        pauseClipTimeout = null;
        resumeClipTimeout = null;
      }
      if (!played) audio.pause();
      resolve(played);
    };
    const scheduleTimeout = () => {
      clearTimeout();
      timeout = window.setTimeout(() => {
        console.warn(`Se agotó el tiempo de espera del audio: ${playableSource}`);
        finish(false);
      }, CLIP_TIMEOUT_MS);
    };
    finishCurrentClip = finish;
    pauseClipTimeout = clearTimeout;
    resumeClipTimeout = scheduleTimeout;
    scheduleTimeout();
    audio.addEventListener('ended', () => finish(true), { once: true });
    audio.addEventListener(
      'error',
      () => {
        console.warn(`El recurso de audio no se pudo cargar: ${playableSource}`);
        finish(false);
      },
      { once: true },
    );
    audio.addEventListener('abort', () => finish(false), { once: true });
    void audio.play().catch((error: unknown) => {
      console.warn(`No se pudo reproducir el audio ${playableSource}:`, error);
      finish(false);
    });
  });
}

export function playVoiceClip(source: string): Promise<boolean> {
  return playClip(source);
}

export function playCrisisAlert(eventId: string): void {
  const incidentClip = ALERT_CLIPS[eventId];
  if (!incidentClip || !soundEnabled) return;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  alertQueue = alertQueue.then(async () => {
    if (!soundEnabled) return;
    const basePlayed = await playClip(ALERT_BASE);
    if (!basePlayed) playAlertTone();
    const incidentPlayed = await playClip(incidentClip);
    if (!incidentPlayed) playAlertTone();
  }).catch((error: unknown) => {
    console.warn('No se pudo reproducir la secuencia de alerta:', error);
  });
}
