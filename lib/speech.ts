import { speechFile } from "@/lib/speech-files";

/**
 * Spoken words come from pre-recorded neural clips in public/speech/
 * (female vi-VN voice). Device speechSynthesis is only a fallback for
 * phrases without a clip.
 */

let fallbackVoice: SpeechSynthesisVoice | null = null;
let primed = false;
let current: HTMLAudioElement | null = null;
const queued: string[] = [];

function synthesizer(): SpeechSynthesis | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.speechSynthesis ?? null;
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = synthesizer()?.getVoices() ?? [];
  const vietnamese = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("vi"),
  );
  const female = vietnamese.find((voice) =>
    /hoai|my|lan|female|nữ/i.test(voice.name),
  );
  return female ?? vietnamese[0] ?? null;
}

/** Warm the fallback voice list once; browsers load it asynchronously. */
export function primeSpeech(): void {
  const synth = synthesizer();
  if (!synth || primed) {
    return;
  }
  primed = true;
  fallbackVoice = pickVoice();
  synth.addEventListener("voiceschanged", () => {
    fallbackVoice = pickVoice();
  });
}

export function stopSpeaking(): void {
  queued.length = 0;
  current?.pause();
  current = null;
  synthesizer()?.cancel();
}

function synthSay(text: string): void {
  const synth = synthesizer();
  if (!synth) {
    return;
  }
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "vi-VN";
  const voice = fallbackVoice ?? pickVoice();
  if (voice) {
    try {
      utterance.voice = voice;
    } catch {
      // A few engines expose voice objects they then refuse; `lang` alone
      // still selects a Vietnamese voice where the platform has one.
    }
  }
  utterance.rate = 0.9;
  synth.speak(utterance);
}

function playClip(text: string): void {
  const audio = new Audio(speechFile(text));
  current = audio;
  let fellBack = false;
  const fallback = () => {
    if (fellBack) {
      return;
    }
    fellBack = true;
    current = null;
    synthSay(text);
  };
  audio.onerror = fallback;
  audio.onended = () => {
    current = null;
    const next = queued.shift();
    if (next) {
      playClip(next);
    }
  };
  audio.play().catch(fallback);
}

function say(text: string, enabled: boolean, replace: boolean): void {
  if (!enabled || !text) {
    return;
  }
  if (replace) {
    stopSpeaking();
    playClip(text);
    return;
  }
  if (current || queued.length > 0) {
    queued.push(text);
    return;
  }
  playClip(text);
}

/**
 * Speak now, replacing whatever is playing — rapid taps never build a backlog
 * of words.
 */
export function speak(text: string, enabled: boolean): void {
  say(text, enabled, true);
}

/**
 * Speak after the current clip finishes — used for a round's goal so it does
 * not cut off the word the child just heard.
 */
export function announce(text: string, enabled: boolean): void {
  say(text, enabled, false);
}
