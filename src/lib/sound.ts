import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { SoundTone } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
 * Speaks a polite, pleasant hydration reminder in sweet Indian Female Voice (en-IN).
 */
export async function speakNotification(userName?: string, amountMl?: number): Promise<void> {
  const name = userName && userName.trim() ? userName.trim() : 'Friend';
  const amountText = amountMl ? ` Please drink ${amountMl} ml of water.` : ' Please drink a glass of fresh water.';
  const text = `Hello ${name}, it's time to drink water!${amountText}`;

  // 1. Play a soothing intro chime before speech
  await playAudioFile('beep').catch(() => {});

  // 2. Try native Android Text-to-Speech with Indian Female Voice (en-IN)
  try {
    await TextToSpeech.stop().catch(() => {});

    let selectedVoiceIndex: number | undefined = undefined;
    let selectedLang = 'en-IN';

    try {
      const supported = await TextToSpeech.getSupportedVoices();
      if (supported && supported.voices && supported.voices.length > 0) {
        // Priority 1: Indian Female Voice
        const indianFemaleIndex = supported.voices.findIndex((v) => {
          const lower = (v.name + ' ' + v.voiceURI + ' ' + v.lang).toLowerCase();
          const isIndian = lower.includes('in') || lower.includes('india') || v.lang.startsWith('en-in') || v.lang.startsWith('hi-in');
          const isFemale =
            lower.includes('female') ||
            lower.includes('woman') ||
            lower.includes('neerja') ||
            lower.includes('heera') ||
            lower.includes('swara') ||
            lower.includes('aditi') ||
            lower.includes('kangana') ||
            lower.includes('ahp') ||
            lower.includes('cxx') ||
            lower.includes('gfn') ||
            lower.includes('iip');
          return isIndian && isFemale;
        });

        // Priority 2: Any Indian Voice (en-IN)
        const anyIndianIndex = supported.voices.findIndex((v) => {
          return v.lang.toLowerCase().startsWith('en-in') || v.lang.toLowerCase().startsWith('hi-in') || v.name.toLowerCase().includes('india');
        });

        // Priority 3: Any English Female Voice
        const anyFemaleIndex = supported.voices.findIndex((v) => {
          const lower = (v.name + ' ' + v.voiceURI).toLowerCase();
          return (
            v.lang.startsWith('en') &&
            (lower.includes('female') ||
              lower.includes('woman') ||
              lower.includes('zira') ||
              lower.includes('samantha') ||
              lower.includes('karen') ||
              lower.includes('victoria') ||
              lower.includes('jenny'))
          );
        });

        if (indianFemaleIndex !== -1) {
          selectedVoiceIndex = indianFemaleIndex;
          selectedLang = supported.voices[indianFemaleIndex].lang || 'en-IN';
        } else if (anyIndianIndex !== -1) {
          selectedVoiceIndex = anyIndianIndex;
          selectedLang = supported.voices[anyIndianIndex].lang || 'en-IN';
        } else if (anyFemaleIndex !== -1) {
          selectedVoiceIndex = anyFemaleIndex;
        }
      }
    } catch {
      // voice lookup error fallback
    }

    await TextToSpeech.speak({
      text,
      lang: selectedLang,
      rate: 0.94,
      pitch: 1.15, // Sweet, natural melodic Indian female pitch
      volume: 1.0,
      voice: selectedVoiceIndex,
      category: 'playback',
    });
    return;
  } catch (nativeErr) {
    console.warn('Native TTS failed, trying Web Speech API:', nativeErr);
  }

  // 3. Fallback to Web Speech API with Indian Female Voice
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.94;
      utterance.pitch = 1.15;

      const voices = window.speechSynthesis.getVoices();

      // Find Indian Female Voice
      const indianFemaleVoice =
        voices.find((v) => {
          const lower = (v.name + ' ' + v.voiceURI + ' ' + v.lang).toLowerCase();
          const isIndian = lower.includes('in') || lower.includes('india') || v.lang.startsWith('en-in') || v.lang.startsWith('hi-in');
          const isFemale =
            lower.includes('female') ||
            lower.includes('heera') ||
            lower.includes('neerja') ||
            lower.includes('swara') ||
            lower.includes('aditi') ||
            lower.includes('kangana') ||
            lower.includes('veena') ||
            lower.includes('google');
          return isIndian && isFemale;
        }) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en-in') || v.lang.toLowerCase().startsWith('hi-in')) ||
        voices.find((v) => {
          const lower = (v.name + ' ' + v.voiceURI).toLowerCase();
          return v.lang.startsWith('en') && (lower.includes('female') || lower.includes('zira') || lower.includes('samantha'));
        });

      if (indianFemaleVoice) {
        utterance.voice = indianFemaleVoice;
      }

      window.speechSynthesis.speak(utterance);
      return;
    } catch (err) {
      console.warn('Web speech synthesis playback error:', err);
    }
  }

  // 4. Final fallback to water drop tone
  await playTone('water_drop', userName, amountMl);
}

/**
 * Helper to play an audio file directly from sounds/ with multiple path resolution strategies.
 */
async function playAudioFile(toneName: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const candidateUrls = [
    `sounds/${toneName}.wav`,
    `/sounds/${toneName}.wav`,
    new URL(`sounds/${toneName}.wav`, window.location.href).href,
  ];

  for (const url of candidateUrls) {
    try {
      const audio = new Audio(url);
      audio.volume = 1.0;
      await audio.play();
      return true;
    } catch {
      // try next candidate url
    }
  }
  return false;
}

/**
 * Plays soothing water tones or speaks voice reminder.
 */
export async function playTone(tone: SoundTone, userName?: string, amountMl?: number): Promise<void> {
  if (tone === 'voice_announcement') {
    await speakNotification(userName, amountMl);
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
      // Multi-droplet soothing cascade (1.5s)
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
      // 4-Note melodic chime (2.0s)
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
      // Singing bowl / bell tone (2.2s)
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
      // Sparkling crystal ping (1.8s)
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
      // Beep / alert
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
