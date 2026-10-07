import { speechFile } from "@/lib/speech-files";
import { PRAISE_PHRASES } from "@/lib/labels";

/**
 * Spoken words come from pre-recorded neural clips in public/speech/
 * (female vi-VN voice). Device speechSynthesis is only a fallback for
 * phrases without a clip.
 */

let fallbackVoice: SpeechSynthesisVoice | null = null;
let primed = false;
let current: HTMLAudioElement | null = null;

type Spoken = { text: string; ended?: () => void };

const queued: Spoken[] = [];

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

function synthSay(text: string, ended?: () => void): void {
  const synth = synthesizer();
  if (!synth) {
    ended?.();
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
  if (ended) {
    utterance.onend = () => {
      ended();
      const next = queued.shift();
      if (next) {
        playClip(next);
      }
    };
  }
  synth.speak(utterance);
}

function playClip(clip: Spoken): void {
  const audio = new Audio(speechFile(clip.text));
  current = audio;
  let fellBack = false;
  const fallback = () => {
    if (fellBack) {
      return;
    }
    fellBack = true;
    current = null;
    synthSay(clip.text, clip.ended);
  };
  audio.onerror = fallback;
  audio.onended = () => {
    if (fellBack) {
      return;
    }
    current = null;
    clip.ended?.();
    const next = queued.shift();
    if (next) {
      playClip(next);
    }
  };
  audio.play().catch(fallback);
}

function say(
  text: string,
  enabled: boolean,
  replace: boolean,
  ended?: () => void,
): void {
  if (!enabled || !text) {
    return;
  }
  if (replace) {
    stopSpeaking();
    playClip({ text, ended });
    return;
  }
  if (current || queued.length > 0) {
    queued.push({ text, ended });
    return;
  }
  playClip({ text, ended });
}

/**
 * Speak now, replacing whatever is playing — rapid taps never build a backlog
 * of words.
 */
export function speak(
  text: string,
  enabled: boolean,
  ended?: () => void,
): void {
  say(text, enabled, true, ended);
}

/**
 * Speak after the current clip finishes — used for a round's goal so it does
 * not cut off the word the child just heard.
 */
export function announce(
  text: string,
  enabled: boolean,
  ended?: () => void,
): void {
  say(text, enabled, false, ended);
}

const PRAISE_SILENT_MS = 600;
const PRAISE_WATCHDOG_MS = 5000;

/**
 * Congratulate the child on a correct pick, then run onDone only after the
 * praise clip finishes (or a short beat when sound is off) so the next round
 * never starts mid-word. Watchdog: advance even if the clip and the fallback
 * voice both die.
 */
export function playPraise(enabled: boolean, onDone?: () => void): void {
  const text = PRAISE_PHRASES[
    Math.floor(Math.random() * PRAISE_PHRASES.length)
  ];
  if (!onDone) {
    announce(text, enabled);
    return;
  }
  if (!enabled) {
    window.setTimeout(onDone, PRAISE_SILENT_MS);
    return;
  }
  let fired = false;
  const done = () => {
    if (fired) {
      return;
    }
    fired = true;
    window.clearTimeout(guard);
    onDone();
  };
  const guard = window.setTimeout(done, PRAISE_WATCHDOG_MS);
  announce(text, enabled, done);
}
