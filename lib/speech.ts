let cachedVoice: SpeechSynthesisVoice | null = null;
let primed = false;

function synthesizer(): SpeechSynthesis | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.speechSynthesis ?? null;
}

function findVietnameseVoice(): SpeechSynthesisVoice | null {
  const synth = synthesizer();
  if (!synth) {
    return null;
  }
  const voices = synth.getVoices();
  return (
    voices.find((voice) => voice.lang.toLowerCase() === "vi-vn") ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("vi")) ??
    null
  );
}

/** Warm the voice list once; browsers load it asynchronously. */
export function primeSpeech(): void {
  const synth = synthesizer();
  if (!synth || primed) {
    return;
  }
  primed = true;
  cachedVoice = findVietnameseVoice();
  synth.addEventListener("voiceschanged", () => {
    cachedVoice = findVietnameseVoice();
  });
}

export function stopSpeaking(): void {
  synthesizer()?.cancel();
}

function say(text: string, enabled: boolean, replace: boolean): void {
  if (!enabled || !text) {
    return;
  }
  const synth = synthesizer();
  if (!synth) {
    return;
  }

  if (replace && (synth.speaking || synth.pending)) {
    synth.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "vi-VN";
  const voice = cachedVoice ?? findVietnameseVoice();
  if (voice) {
    utterance.voice = voice;
  }
  utterance.rate = 0.9;
  utterance.pitch = 1;

  synth.speak(utterance);
}

/**
 * Speak now, replacing whatever is mid-sentence — so rapid taps stay
 * responsive instead of queueing a backlog of words.
 */
export function speak(text: string, enabled: boolean): void {
  say(text, enabled, true);
}

/**
 * Speak after whatever is currently playing finishes — used for a round's goal
 * so it does not cut off the word the child just heard.
 */
export function announce(text: string, enabled: boolean): void {
  say(text, enabled, false);
}
