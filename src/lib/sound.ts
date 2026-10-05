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
 * Speaks a pleasant, sweet hydration reminder in Indian Girl / Female voice announcing user's name.
 * Uses exact Web Speech API first (same as web localhost).
 */
export async function speakNotification(userName?: string, amountMl?: number): Promise<void> {
  stopAllAudio();

  const cleanName =
    userName && userName.trim() && userName.trim().toLowerCase() !== 'friend'
      ? userName.trim()
      : '';
  const greeting = cleanName ? `Hello ${cleanName}!` : 'Hello!';
  const amountText = amountMl
    ? ` Please drink ${amountMl} ml of water.`
    : ' Please drink a glass of fresh water.';
  const text = `${greeting} It is time to drink water.${amountText} Stay fresh, hydrated and healthy!`;

  // 1. EXACT Web Speech API (Direct web localhost implementation)
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.90;
      utterance.pitch = 1.25;
      utterance.volume = 1.0;

      const voices = await getWebSpeechVoices();
      if (voices.length > 0) {
        const indianFemaleKeywords = [
          'neerja',
          'heera',
          'swara',
          'aditi',
          'kangana',
          'veena',
          'ananya',
          'deepa',
          'geeta',
          'en-in',
          'hi-in',
          'india',
          'hindi',
        ];
        const generalFemaleKeywords = [
          'female',
          'woman',
          'girl',
          'zira',
          'samantha',
          'karen',
          'victoria',
          'jenny',
          'aria',
          'google',
        ];

        let bestVoice = voices.find((v) => {
          const lower = (v.name + ' ' + v.voiceURI + ' ' + v.lang).toLowerCase();
          const isIndian =
            lower.includes('in') ||
            lower.includes('india') ||
            v.lang.startsWith('en-in') ||
            v.lang.startsWith('hi-in');
          const isFemale =
            indianFemaleKeywords.some((k) => lower.includes(k)) ||
            generalFemaleKeywords.some((k) => lower.includes(k));
          return isIndian && isFemale;
        });

        if (!bestVoice) {
          bestVoice = voices.find((v) => {
            const lower = (v.name + ' ' + v.voiceURI + ' ' + v.lang).toLowerCase();
            return (
              (lower.includes('in') || lower.includes('india') || v.lang.startsWith('en-in')) &&
              !lower.includes('male')
            );
          });
        }

        if (!bestVoice) {
          bestVoice = voices.find((v) => {
            const lower = (v.name + ' ' + v.voiceURI).toLowerCase();
            return v.lang.startsWith('en') && (lower.includes('female') || lower.includes('zira'));
          });
        }

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

  // 2. Native Android TTS Plugin Fallback
  try {
    await TextToSpeech.speak({
      text,
      lang: 'en-IN',
      rate: 0.90,
      pitch: 1.25,
      volume: 1.0,
      category: 'playback',
    });
    return;
  } catch {}

  // 3. Fallback to audio file
  const played = await playAudioFile('indian_girl_voice');
  if (played) return;

  // 4. Tone fallback
  await playAudioFile('gentle_chime');
}

/**
 * Speaks a sweet, polite hydration reminder in pure Hindi (नमस्ते / पानी पीजिए).
 * Uses exact Web Speech API first (same as web localhost).
 */
export async function speakHindiNotification(userName?: string, amountMl?: number): Promise<void> {
  stopAllAudio();

  const cleanName =
    userName && userName.trim() && userName.trim().toLowerCase() !== 'friend'
      ? userName.trim()
      : '';
  const greeting = cleanName ? `नमस्ते ${cleanName} जी!` : 'नमस्ते!';
  const amountText = amountMl
    ? ` कृपया ${amountMl} मिलीलीटर पानी पी लीजिए।`
    : ' कृपया एक गिलास ताज़ा पानी पी लीजिए।';
  const text = `${greeting} पानी पीने का समय हो गया है।${amountText} स्वस्थ और तरोताज़ा रहें।`;

  // 1. EXACT Web Speech API (Direct web localhost implementation)
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88;
      utterance.pitch = 1.25;
      utterance.volume = 1.0;
      utterance.lang = 'hi-IN';

      const voices = await getWebSpeechVoices();
      const hindiVoice = voices.find(
        (v) =>
          (v.lang && (v.lang.startsWith('hi') || v.lang.includes('IN'))) ||
          v.name.toLowerCase().includes('hindi')
      );
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
      window.speechSynthesis.speak(utterance);
      return;
    } catch {}
  }

  // 2. Native Android TTS Plugin Fallback
  try {
    await TextToSpeech.speak({
      text,
      lang: 'hi-IN',
      rate: 0.88,
      pitch: 1.25,
      volume: 1.0,
      category: 'playback',
    });
    return;
  } catch {}

  // 3. Fallback to audio file
  const played = await playAudioFile('hindi_girl_voice');
  if (played) return;

  await playAudioFile('gentle_chime');
}

/**
 * Helper to play an audio file with Web Audio buffer decoding and HTML5 Audio fallback.
 */
async function playAudioFile(toneName: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  stopAllAudio();

  // Strategy 1: Web Audio API fetch & decode
  try {
    const ctx = getAudioContext();
    if (ctx) {
      const candidates = [
        `/sounds/${toneName}.wav`,
        `sounds/${toneName}.wav`,
        new URL(`sounds/${toneName}.wav`, window.location.href).href,
      ];

      for (const url of candidates) {
        try {
          const res = await fetch(url);
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
    `sounds/${toneName}.wav`,
    `/sounds/${toneName}.wav`,
    new URL(`sounds/${toneName}.wav`, window.location.href).href,
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
 * Plays soothing water tones or speaks voice reminder cleanly.
 */
export async function playTone(
  tone: SoundTone,
  userName?: string,
  amountMl?: number
): Promise<void> {
  stopAllAudio();

  if (tone === 'voice_announcement') {
    await speakNotification(userName, amountMl);
    return;
  }

  if (tone === 'voice_hindi') {
    await speakHindiNotification(userName, amountMl);
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
