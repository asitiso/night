let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let music: GainNode | null = null;
let sfx: GainNode | null = null;
let droneOn = false;
let sceneId = "parlor";
let step = 0;
let nextAt = 0;
let pumpTimer = 0;
let melodyGain: GainNode | null = null;
let clockGain: GainNode | null = null;
let windGain: GainNode | null = null;
let melodyFilter: BiquadFilterNode | null = null;

const SCALE = [0, 1, 3, 5, 6, 8, 10];
const PHRASE = [0, 6, 0, 5, 0, 6, 1, -1, 0, 3, 6, 0, 5, 1, 6, -1];
const ROOTS = [0, 6, 3, 5];

type Mood = {
  cutoff: number;
  melody: number;
  clock: number;
  wind: number;
  fifth: boolean;
  drop: number;
};

const MOODS: Record<string, Mood> = {
  parlor: { cutoff: 980, melody: 0.11, clock: 0.05, wind: 0.02, fifth: true, drop: 0 },
  library: { cutoff: 820, melody: 0.1, clock: 0.045, wind: 0.016, fifth: true, drop: 0 },
  greenhouse: { cutoff: 1100, melody: 0.1, clock: 0.04, wind: 0.028, fifth: true, drop: 0 },
  banquet: { cutoff: 900, melody: 0.11, clock: 0.05, wind: 0.018, fifth: true, drop: 0 },
  gallery: { cutoff: 760, melody: 0.09, clock: 0.055, wind: 0.014, fifth: true, drop: 0 },
  bedroom: { cutoff: 680, melody: 0.08, clock: 0.04, wind: 0.012, fifth: true, drop: -1 },
  cellar: { cutoff: 560, melody: 0.1, clock: 0.06, wind: 0.03, fifth: true, drop: -1 },
  chapel: { cutoff: 1040, melody: 0.1, clock: 0.05, wind: 0.02, fifth: true, drop: 0 },
  vault: { cutoff: 640, melody: 0.09, clock: 0.08, wind: 0.016, fifth: true, drop: -1 },
  tower: { cutoff: 1200, melody: 0.12, clock: 0.09, wind: 0.022, fifth: true, drop: 0 },
};

function mood(): Mood {
  return MOODS[sceneId] ?? MOODS.parlor;
}

function noteFreq(index: number, octaveShift: number) {
  const wrapped = ((index % 7) + 7) % 7;
  const oct = Math.floor(index / 7) + octaveShift;
  return 146.83 * 2 ** ((SCALE[wrapped] + oct * 12) / 12);
}

function voice(freq: number, when: number, dur: number, level: number, type: OscillatorType, dest: AudioNode) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, level), when + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(when);
  osc.stop(when + dur + 0.05);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

function clockTick(when: number) {
  if (!ctx || !clockGain) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1480, when);
  osc.frequency.exponentialRampToValueAtTime(420, when + 0.08);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.7, when + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.12);
  osc.connect(gain);
  gain.connect(clockGain);
  osc.start(when);
  osc.stop(when + 0.14);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

function heartbeat(when: number) {
  if (!music) return;
  voice(49, when, 0.16, 0.42, "sine", music);
  voice(42, when + 0.16, 0.2, 0.28, "sine", music);
}

function pump() {
  if (!ctx || !melodyFilter || !music || !scoreLive()) return;
  const horizon = ctx.currentTime + 1.2;
  while (nextAt < horizon) {
    const here = mood();
    const index = PHRASE[step % PHRASE.length];
    if (index >= 0) {
      const freq = noteFreq(index, here.drop);
      voice(freq, nextAt, 0.72, 0.42, "triangle", melodyFilter);
      voice(freq * 1.498, nextAt + 0.02, 0.55, 0.16, "sine", melodyFilter);
      if (here.fifth) voice(freq * 1.059, nextAt, 0.4, 0.1, "sawtooth", melodyFilter);
    }
    if (step % 4 === 0) {
      const root = noteFreq(ROOTS[(step / 4) % ROOTS.length], -1);
      voice(root, nextAt, 1.6, 0.2, "sine", music);
      heartbeat(nextAt);
    }
    if (step % 2 === 0) clockTick(nextAt);
    nextAt += here.drop < 0 ? 0.62 : 0.5;
    step += 1;
  }
  pumpTimer = window.setTimeout(pump, 280);
}

function scoreLive() {
  return droneOn;
}

export function setScene(id: string) {
  sceneId = id;
  if (!ctx || !melodyFilter || !melodyGain || !clockGain || !windGain) return;
  const here = mood();
  const time = ctx.currentTime;
  melodyFilter.frequency.setTargetAtTime(here.cutoff, time, 0.45);
  melodyGain.gain.setTargetAtTime(here.melody, time, 0.45);
  clockGain.gain.setTargetAtTime(here.clock, time, 0.3);
  windGain.gain.setTargetAtTime(here.wind, time, 0.6);
}

export function startDrone() {
  unlock();
  if (!ctx || !music || droneOn) return;
  droneOn = true;
  const here = mood();

  const wet = ctx.createGain();
  wet.gain.value = 0.62;
  const length = Math.floor(ctx.sampleRate * 2.4);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.5;
  }
  const hall = ctx.createConvolver();
  hall.buffer = impulse;
  hall.connect(wet);
  wet.connect(music);

  melodyGain = ctx.createGain();
  melodyGain.gain.value = here.melody;
  melodyFilter = ctx.createBiquadFilter();
  melodyFilter.type = "lowpass";
  melodyFilter.frequency.value = here.cutoff;
  melodyFilter.Q.value = 0.6;
  melodyFilter.connect(melodyGain);
  melodyGain.connect(music);
  melodyGain.connect(hall);

  const drone = ctx.createGain();
  drone.gain.value = 0.8;
  const tremolo = ctx.createOscillator();
  const tremoloDepth = ctx.createGain();
  tremolo.frequency.value = 3.4;
  tremoloDepth.gain.value = 0.22;
  tremolo.connect(tremoloDepth);
  tremoloDepth.connect(drone.gain);
  tremolo.start();
  drone.connect(music);
  [73.42, 77.78, 110, 155.56].forEach((freq, index) => {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();
    osc.type = index === 3 ? "sawtooth" : "sine";
    osc.frequency.value = freq;
    osc.detune.value = index === 1 ? 8 : -6;
    gain.gain.value = index === 0 ? 0.05 : index === 3 ? 0.008 : 0.028;
    osc.connect(gain);
    gain.connect(drone);
    osc.start();
  });

  windGain = ctx.createGain();
  windGain.gain.value = here.wind;
  const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const wind = ctx.createBufferSource();
  wind.buffer = noise;
  wind.loop = true;
  const windFilter = ctx.createBiquadFilter();
  windFilter.type = "lowpass";
  windFilter.frequency.value = 380;
  wind.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(music);
  wind.start();

  clockGain = ctx.createGain();
  clockGain.gain.value = here.clock;
  clockGain.connect(music);

  nextAt = ctx.currentTime + 0.15;
  step = 0;
  pump();
}
let wantMuted = false;
let visibilityBound = false;

function ctor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & { webkitAudioContext?: typeof AudioContext };
  return window.AudioContext ?? w.webkitAudioContext ?? null;
}

function ensure() {
  if (ctx) return;
  const AudioCtx = ctor();
  if (!AudioCtx) return;
  ctx = new AudioCtx({ latencyHint: "interactive" });
  master = ctx.createGain();
  music = ctx.createGain();
  sfx = ctx.createGain();
  music.gain.value = 0.7;
  sfx.gain.value = 0.9;
  master.gain.value = wantMuted ? 0 : 1;
  music.connect(master);
  sfx.connect(master);
  master.connect(ctx.destination);
}

export function unlock() {
  try {
    ensure();
    if (ctx && ctx.state === "suspended") void ctx.resume();
    if (!visibilityBound && typeof document !== "undefined") {
      visibilityBound = true;
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && ctx?.state === "suspended") {
          void ctx.resume();
        }
      });
    }
  } catch {
    /* audio is optional */
  }
}

export function applyMuted(muted: boolean) {
  wantMuted = muted;
  if (!ctx || !master) return;
  master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.03);
}

function tone(freq: number, dur: number, type: OscillatorType, gainValue: number, when = 0) {
  if (!ctx || !sfx) return;
  const t = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainValue), t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain);
  gain.connect(sfx);
  osc.start(t);
  osc.stop(t + dur + 0.02);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

export function playTick() {
  tone(740 + Math.random() * 160, 0.05, "triangle", 0.045);
}

export function playFail() {
  tone(110, 0.22, "sawtooth", 0.03);
  tone(82, 0.32, "sine", 0.04, 0.02);
}

export function playSuccess() {
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
    tone(freq, 0.28, "sine", 0.05, index * 0.08);
  });
}

export function playTake() {
  tone(880, 0.1, "sine", 0.045);
  tone(1174, 0.16, "triangle", 0.04, 0.07);
}

export function playDoor() {
  tone(130, 0.28, "sine", 0.05);
  tone(196, 0.22, "triangle", 0.035, 0.1);
}

export function playEscape() {
  [392, 494, 587, 784, 988].forEach((freq, index) => {
    tone(freq, 0.42, "sine", 0.05, index * 0.11);
  });
}
