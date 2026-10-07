export type CueName = "complete";

type Note = {
  freq: number;
  duration: number;
  delay?: number;
};

const CUES: Record<CueName, Note[]> = {
  complete: [
    { freq: 523, duration: 0.1 },
    { freq: 659, duration: 0.1, delay: 0.1 },
    { freq: 784, duration: 0.18, delay: 0.2 },
  ],
};

let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }
  const ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!ctor) {
    return null;
  }
  if (!context) {
    context = new ctor();
  }
  return context;
}

function playNote(audio: AudioContext, note: Note): void {
  const start = audio.currentTime + (note.delay ?? 0);
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = "square";
  oscillator.frequency.value = note.freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.15, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + note.duration);

  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + note.duration + 0.02);
}

export function playCue(name: CueName, enabled: boolean): void {
  if (!enabled) {
    return;
  }
  const audio = getContext();
  if (!audio) {
    return;
  }
  if (audio.state === "suspended") {
    void audio.resume();
  }
  for (const note of CUES[name]) {
    playNote(audio, note);
  }
}
