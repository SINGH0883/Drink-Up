import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { SoundTone } from '../types';

let audioCtx: AudioContext | null = null;
let currentBufferSource: AudioBufferSourceNode | null = null;
let currentAudio: HTMLAudioElement | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Stop all ongoing audio, TTS, and speech synthesis immediately.
 */
export function stopAllAudio(): void {
  // 1. Stop Web Speech Synthesis
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch {}

  // 2. Stop Native Text-to-Speech
  try {
    TextToSpeech.stop().catch(() => {});
  } catch {}

  // 3. Stop HTML5 Audio Element
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }

  // 4. Stop Web Audio Buffer Source
  if (currentBufferSource) {
    try {
      currentBufferSource.stop();
      currentBufferSource.disconnect();
    } catch {}
    currentBufferSource = null;
  }
}

/**
 * Helper to retrieve voices reliably from window.speechSynthesis
 */
function getWebSpeechVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      resolve(voices);
      return;
    }
    let timeoutId: number;
    const onVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      clearTimeout(timeoutId);
      resolve(window.speechSynthesis.getVoices() || []);
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    timeoutId = window.setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(window.speechSynthesis.getVoices() || []);
    }, 400);
  });
}

/**
 * Speaks a pleasant, sweet hydration reminder in Indian Girl / Female voice.
 */
export async function speakNotification(userName?: string, amountMl?: number): Promise<void> {
  stopAllAudio();

  const cleanName =
    userName && userName.trim() && userName.trim().toLowerCase() !== 'friend'
      ? userName.trim()
      : '';

  const greeting = cleanName ? `Hello ${cleanName}!` : 'Hello!';
  const amountText = amountMl
    ? ` Please drink ${amountMl} ml of fresh water`
    : ' Please drink a glass of fresh water';
  const text = `${greeting} It's time to drink water.${amountText} and stay healthy and hydrated!`;

  // 1. Dynamic Neural Indian Female Voice via endpoint (Plays exact user name + ml amount with Neerja Neural voice)
  try {
    const ttsUrl = `/api/tts?text=${encodeURIComponent(text)}`;
    const res = await fetch(ttsUrl);
    if (res && res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const ctx = getAudioContext();
      if (ctx) {
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        currentBufferSource = source;
        source.onended = () => {
          if (currentBufferSource === source) {
            currentBufferSource = null;
          }
        };
        source.start(0);
        return;
      }
    }
  } catch {}

  // 2. Pre-recorded studio Indian Girl audio file fallback (when offline or no custom name)
  if (!cleanName) {
    const played = await playAudioFile('indian_girl_voice');
    if (played) return;
  }

  // 3. Web Speech API Fallback (with Indian Female Voice selection)
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.06;
      utterance.volume = 1.0;

      const voices = await getWebSpeechVoices();
      if (voices.length > 0) {
        const topFemaleKeywords = [
          'neerja',
          'swara',
          'ananya',
          'aditi',
          'vidya',
          'en-in',
          'hi-in',
          'india',
          'female',
        ];

        let bestVoice = voices.find((v) => {
          const lower = (v.name + ' ' + v.voiceURI + ' ' + v.lang).toLowerCase();
          return topFemaleKeywords.some((k) => lower.includes(k)) && !lower.includes('male') && !lower.includes('david');
        });

        if (bestVoice) {
          utterance.voice = bestVoice;
          utterance.lang = bestVoice.lang || 'en-IN';
        } else {
          utterance.lang = 'en-IN';
        }
      } else {
        utterance.lang = 'en-IN';
      }

      window.speechSynthesis.speak(utterance);
      return;
    } catch {}
  }

  // 4. Native Android TTS Plugin Fallback
  try {
    let selectedVoiceIndex: number | undefined = undefined;
    let selectedLang = 'en-IN';

    try {
      const supported = await TextToSpeech.getSupportedVoices();
      if (supported && supported.voices && supported.voices.length > 0) {
        const indianFemaleIndex = supported.voices.findIndex((v) => {
          const lower = (v.name + ' ' + v.voiceURI + ' ' + v.lang).toLowerCase();
          return (
            (lower.includes('in') || lower.includes('india') || v.lang.startsWith('en-in') || v.lang.startsWith('hi-in')) &&
            (lower.includes('female') ||
              lower.includes('neerja') ||
              lower.includes('ananya') ||
              lower.includes('heera') ||
              lower.includes('swara') ||
              lower.includes('aditi'))
          );
        });

        if (indianFemaleIndex !== -1) {
          selectedVoiceIndex = indianFemaleIndex;
          selectedLang = supported.voices[indianFemaleIndex].lang || 'en-IN';
        }
      }
    } catch {}

    await TextToSpeech.speak({
      text,
      lang: selectedLang,
      rate: 0.94,
      pitch: 1.12,
      volume: 1.0,
      voice: selectedVoiceIndex,
      category: 'playback',
    });
    return;
  } catch {}

  // 5. Fallback tone
  await playAudioFile('gentle_chime');
}

/**
 * Helper to play an audio file with Web Audio buffer decoding and HTML5 Audio fallback.
 */
async function playAudioFile(toneName: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  stopAllAudio();

  const cacheBuster = `?t=${Date.now()}`;

  // Strategy 1: Web Audio API fetch & decode (Supports .wav and .mp3)
  try {
    const ctx = getAudioContext();
    if (ctx) {
      const candidates = [
        `/sounds/${toneName}.mp3${cacheBuster}`,
        `sounds/${toneName}.mp3${cacheBuster}`,
        `/sounds/${toneName}.wav${cacheBuster}`,
        `sounds/${toneName}.wav${cacheBuster}`,
        new URL(`sounds/${toneName}.mp3${cacheBuster}`, window.location.href).href,
        new URL(`sounds/${toneName}.wav${cacheBuster}`, window.location.href).href,
      ];

      for (const url of candidates) {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (res && res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            currentBufferSource = source;
            source.onended = () => {
              if (currentBufferSource === source) {
                currentBufferSource = null;
              }
            };
            source.start(0);
            return true;
          }
        } catch {}
      }
    }
  } catch {}

  // Strategy 2: HTML5 Audio Element
  const candidateUrls = [
    `/sounds/${toneName}.mp3${cacheBuster}`,
    `sounds/${toneName}.mp3${cacheBuster}`,
    `/sounds/${toneName}.wav${cacheBuster}`,
    `sounds/${toneName}.wav${cacheBuster}`,
    new URL(`sounds/${toneName}.mp3${cacheBuster}`, window.location.href).href,
  ];

  for (const url of candidateUrls) {
    try {
      const audio = new Audio(url);
      audio.volume = 1.0;
      currentAudio = audio;
      audio.onended = () => {
        if (currentAudio === audio) {
          currentAudio = null;
        }
      };
      await audio.play();
      return true;
    } catch {}
  }

  return false;
}

/**
 * Plays custom uploaded user audio data
 */
export async function playCustomAudio(customDataUrl?: string): Promise<boolean> {
  stopAllAudio();
  const data =
    customDataUrl ||
    (typeof window !== 'undefined' ? localStorage.getItem('drinkup_custom_audio') : null);

  if (!data) return false;

  try {
    const audio = new Audio(data);
    audio.volume = 1.0;
    currentAudio = audio;
    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
    };
    await audio.play();
    return true;
  } catch (err) {
    console.warn('Failed to play custom audio:', err);
    return false;
  }
}

/**
 * Plays soothing water tones or speaks voice reminder cleanly.
 */
export async function playTone(
  tone: SoundTone,
  userName?: string,
  amountMl?: number,
  customSoundData?: string
): Promise<void> {
  stopAllAudio();

  if (tone === 'voice_announcement') {
    await speakNotification(userName, amountMl);
    return;
  }

  if (tone === 'custom') {
    const playedCustom = await playCustomAudio(customSoundData);
    if (playedCustom) return;
    await playAudioFile('gentle_chime');
    return;
  }

  // 1. Try audio file playback from /sounds/
  const played = await playAudioFile(tone);
  if (played) return;

  // 2. Synthesized Web Audio API fallback (Rich & audible)
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (tone === 'water_drop') {
      const drops = [
        { offset: 0, fStart: 500, fPeak: 1300, fEnd: 800, dur: 0.35 },
        { offset: 0.2, fStart: 650, fPeak: 1650, fEnd: 950, dur: 0.4 },
        { offset: 0.45, fStart: 850, fPeak: 2000, fEnd: 1200, dur: 0.5 },
      ];

      for (const d of drops) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + d.offset;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(d.fStart, start);
        osc.frequency.exponentialRampToValueAtTime(d.fPeak, start + 0.09);
        osc.frequency.exponentialRampToValueAtTime(d.fEnd, start + d.dur);

        gain.gain.setValueAtTime(0.01, start);
        gain.gain.linearRampToValueAtTime(0.5, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + d.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + d.dur + 0.05);
      }
    } else if (tone === 'gentle_chime') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.16;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.01, startTime);
        gain.gain.linearRampToValueAtTime(0.4, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.25);
      });
    } else if (tone === 'soft_bell') {
      const baseFreq = 587.33;
      const harmonics = [1, 2.01, 3.02];
      harmonics.forEach((h, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * h, now);

        const amp = 0.5 / (idx + 1);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(amp, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 2.1);
      });
    } else if (tone === 'crystal_ping') {
      const freqs = [1174.66, 1567.98, 2093.0];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.01, startTime);
        gain.gain.linearRampToValueAtTime(0.45, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.95);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(880, now + 0.15);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.85);
    }
  } catch (err) {
    console.warn('Audio synthesis fallback error:', err);
  }
}
