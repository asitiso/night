import {
  ANCHORS,
  CLUES,
  ITEM_IDS,
  ITEMS,
  PUZZLES,
  ROOMS,
  type Hotspot,
  type ItemId,
} from "@/game/content";

export type { ItemId };

export type GameState = {
  version: 2;
  started: boolean;
  escaped: boolean;
  room: number;
  inventory: ItemId[];
  sockets: [ItemId | null, ItemId | null, ItemId | null];
  seq: Record<string, string[]>;
  solved: Record<string, boolean>;
  dials: Record<string, number[]>;
  hour: number;
  minute: number;
  hints: number[];
  clues: string[];
  muted: boolean;
  line: string;
};

export type Fx = "tick" | "fail" | "success" | "take" | "advance" | "escape" | null;

export type Action =
  | { type: "start" }
  | { type: "reset" }
  | { type: "mute" }
  | { type: "hint" }
  | { type: "clue"; id: string }
  | { type: "say"; line: string }
  | { type: "seq"; puzzle: string; id: string }
  | { type: "dial"; puzzle: string; index: number }
  | { type: "confirm-dial"; puzzle: string }
  | { type: "take"; item: ItemId }
  | { type: "place"; item: ItemId; socket: 0 | 1 | 2 }
  | { type: "unplace"; socket: 0 | 1 | 2 }
  | { type: "hour"; delta: number }
  | { type: "minute"; delta: number }
  | { type: "handle" }
  | { type: "next" }
  | { type: "reset-room" }
  | { type: "inspect-item"; item: ItemId };

const SAVE_KEY = "midnight-manor-v1";

export function freshProgress(): Pick<GameState, "seq" | "solved" | "dials" | "hints"> {
  const seq: Record<string, string[]> = {};
  const solved: Record<string, boolean> = {};
  const dials: Record<string, number[]> = {};
  for (const puzzle of Object.values(PUZZLES)) {
    solved[puzzle.id] = false;
    if (puzzle.kind === "sequence") seq[puzzle.id] = [];
    else if (puzzle.kind === "dials") dials[puzzle.id] = puzzle.solution.map(() => 0);
  }
  return { seq, solved, dials, hints: ROOMS.map(() => 0) };
}

export const INITIAL: GameState = {
  version: 2,
  started: false,
  escaped: false,
  room: 0,
  inventory: [],
  sockets: [null, null, null],
  ...freshProgress(),
  hour: 11,
  minute: 45,
  clues: [],
  muted: false,
  line: "",
};

function isItem(value: unknown): value is ItemId {
  return typeof value === "string" && (ITEM_IDS as readonly string[]).includes(value);
}

function isAnchor(value: ItemId): boolean {
  return (ANCHORS as readonly ItemId[]).includes(value);
}

export function owns(state: GameState, id: ItemId): boolean {
  return state.inventory.includes(id) || state.sockets.includes(id);
}

export function heldItems(state: GameState): ItemId[] {
  return ITEM_IDS.filter((id) => owns(state, id));
}

export function locksClear(state: GameState, room = ROOMS[state.room]): boolean {
  if (!room) return false;
  return room.locks.every((id) => state.solved[id]);
}

export function lockCount(state: GameState, room = ROOMS[state.room]): number {
  if (!room) return 0;
  return room.locks.filter((id) => state.solved[id]).length;
}

export function canLeave(state: GameState): boolean {
  const room = ROOMS[state.room];
  if (!room || room.gate === "finale") return false;
  if (!locksClear(state, room)) return false;
  if (room.relic && !owns(state, room.relic)) return false;
  return true;
}

export function hotspotLive(spot: Hotspot, state: GameState): boolean {
  const room = ROOMS[state.room];
  if (!room) return false;
  if (spot.action === "door") return canLeave(state);
  if (spot.action === "finale") return !state.escaped;
  if (spot.action === "take") {
    return Boolean(room.relic && locksClear(state, room) && !owns(state, room.relic));
  }
  if (spot.action === "puzzle" && spot.puzzle) return !state.solved[spot.puzzle];
  if (spot.action === "clue" && spot.clue) return !state.clues.includes(spot.clue);
  return false;
}

function say(state: GameState, line: string, fx: Fx = null) {
  return { state: { ...state, line }, fx };
}

function pushSequence(current: string[], order: readonly string[], id: string) {
  if (current.includes(id)) return { next: current, done: false, bad: false };
  if (order[current.length] !== id) return { next: [] as string[], done: false, bad: true };
  const next = [...current, id];
  return { next, done: next.length === order.length, bad: false };
}

function blankRun(muted: boolean, started: boolean, line: string): GameState {
  return {
    ...INITIAL,
    ...freshProgress(),
    muted,
    started,
    line,
  };
}

export function reduce(state: GameState, action: Action): { state: GameState; fx: Fx } {
  switch (action.type) {
    case "start":
      return { state: blankRun(state.muted, true, ROOMS[0]?.intro ?? ""), fx: null };
    case "reset":
      return { state: blankRun(state.muted, false, ""), fx: null };
    case "mute":
      return { state: { ...state, muted: !state.muted }, fx: null };
    case "say":
      return say(state, action.line);
    case "hint": {
      const index = state.room;
      const hints = state.hints.slice();
      while (hints.length < ROOMS.length) hints.push(0);
      if ((hints[index] ?? 0) >= 3) return say(state, "이 방에서 더 꺼낼 힌트는 없다.");
      hints[index] = (hints[index] ?? 0) + 1;
      const room = ROOMS[index];
      return say({ ...state, hints }, room?.hints[hints[index] - 1] ?? "", "tick");
    }
    case "clue": {
      if (!CLUES[action.id] || state.clues.includes(action.id)) return { state, fx: null };
      return { state: { ...state, clues: [...state.clues, action.id] }, fx: "tick" };
    }
    case "seq": {
      const puzzle = PUZZLES[action.puzzle];
      if (!puzzle || puzzle.kind !== "sequence") return { state, fx: null };
      if (state.solved[puzzle.id]) return { state, fx: null };
      const current = state.seq[puzzle.id] ?? [];
      const step = pushSequence(current, puzzle.order, action.id);
      if (step.bad) {
        return say(
          { ...state, seq: { ...state.seq, [puzzle.id]: [] } },
          puzzle.fail,
          "fail",
        );
      }
      if (step.done) {
        return say(
          {
            ...state,
            seq: { ...state.seq, [puzzle.id]: step.next },
            solved: { ...state.solved, [puzzle.id]: true },
          },
          puzzle.success,
          "success",
        );
      }
      if (step.next === current) return { state, fx: null };
      return say({ ...state, seq: { ...state.seq, [puzzle.id]: step.next } }, puzzle.tick, "tick");
    }
    case "dial": {
      const puzzle = PUZZLES[action.puzzle];
      if (!puzzle || puzzle.kind !== "dials" || state.solved[puzzle.id]) return { state, fx: null };
      const current = [...(state.dials[puzzle.id] ?? puzzle.solution.map(() => 0))];
      if (action.index < 0 || action.index >= current.length) return { state, fx: null };
      const value = current[action.index] ?? 0;
      current[action.index] = (value + 1) % puzzle.modulus;
      return {
        state: { ...state, dials: { ...state.dials, [puzzle.id]: current } },
        fx: "tick",
      };
    }
    case "confirm-dial": {
      const puzzle = PUZZLES[action.puzzle];
      if (!puzzle || puzzle.kind !== "dials" || state.solved[puzzle.id]) return { state, fx: null };
      const current = state.dials[puzzle.id] ?? [];
      const ok = puzzle.solution.every((value, index) => current[index] === value);
      if (!ok) return say(state, puzzle.fail, "fail");
      return say(
        { ...state, solved: { ...state.solved, [puzzle.id]: true } },
        puzzle.success,
        "success",
      );
    }
    case "take": {
      const item = action.item;
      if (owns(state, item)) return say(state, "이미 가지고 있다.");
      const room = ROOMS.find((entry) => entry.relic === item);
      if (!room || !locksClear(state, room)) return say(state, "아직 손이 닿지 않는다. 퍼즐 셋을 먼저.", "fail");
      return say(
        { ...state, inventory: [...state.inventory, item] },
        ITEMS[item].take,
        "take",
      );
    }
    case "place": {
      if (!state.inventory.includes(action.item)) return { state, fx: null };
      if (!isAnchor(action.item)) return say(state, "이 홈은 세 기둥만을 받는다.", "fail");
      if (state.sockets[action.socket]) return say(state, "이미 채워진 홈이다.", "fail");
      const sockets = [...state.sockets] as GameState["sockets"];
      sockets[action.socket] = action.item;
      return say(
        {
          ...state,
          sockets,
          inventory: state.inventory.filter((id) => id !== action.item),
        },
        ITEMS[action.item].place,
        "tick",
      );
    }
    case "unplace": {
      const item = state.sockets[action.socket];
      if (!item) return { state, fx: null };
      const sockets = [...state.sockets] as GameState["sockets"];
      sockets[action.socket] = null;
      return say(
        { ...state, sockets, inventory: [...state.inventory, item] },
        "표식을 다시 손에 쥐었다.",
        "tick",
      );
    }
    case "hour": {
      let hour = state.hour + action.delta;
      if (hour > 12) hour = 1;
      if (hour < 1) hour = 12;
      return { state: { ...state, hour }, fx: "tick" };
    }
    case "minute": {
      let minute = state.minute + action.delta;
      if (minute >= 60) minute = 0;
      if (minute < 0) minute = 55;
      return { state: { ...state, minute }, fx: "tick" };
    }
    case "handle": {
      if (state.escaped) return { state, fx: null };
      const missing = ITEM_IDS.filter((id) => !owns(state, id));
      if (missing.length > 0) {
        const name = ITEMS[missing[0] ?? "wax"].name;
        return say(state, `아직 없다 — ${name}. 열 개의 방을 모두 지나야 한다.`, "fail");
      }
      const tower = ROOMS[ROOMS.length - 1];
      if (tower && !locksClear(state, tower)) {
        return say(state, `시계탑의 퍼즐 ${lockCount(state, tower)}/3. 셋을 풀어야 한다.`, "fail");
      }
      const placed = state.sockets.filter((slot): slot is ItemId => slot !== null);
      if (!ANCHORS.every((id) => placed.includes(id))) {
        return say(state, "세 기둥 — 밀랍, 톱니, 에메랄드 — 이 홈에 있어야 한다.", "fail");
      }
      if (state.hour !== 12 || state.minute !== 0) return say(state, "아직 자정이 아니다.", "fail");
      return {
        state: {
          ...state,
          escaped: true,
          line: "자정. 거대한 톱니가 한 번 울리고, 문이 열렸다.",
        },
        fx: "escape",
      };
    }
    case "next": {
      const roomDef = ROOMS[state.room];
      if (!roomDef || roomDef.gate === "finale") return { state, fx: null };
      if (!locksClear(state, roomDef)) {
        return say(state, `퍼즐 ${lockCount(state, roomDef)}/3. 셋을 풀어야 문이 열린다.`, "fail");
      }
      if (roomDef.relic && !owns(state, roomDef.relic)) {
        return say(state, roomDef.needItem, "fail");
      }
      const room = state.room + 1;
      const nextRoom = ROOMS[room];
      if (!nextRoom) return { state, fx: null };
      return { state: { ...state, room, line: nextRoom.intro }, fx: "advance" };
    }
    case "inspect-item":
      return say(state, ITEMS[action.item].blurb);
    case "reset-room": {
      const roomDef = ROOMS[state.room];
      if (!roomDef) return { state, fx: null };
      if (roomDef.gate === "finale" && !state.escaped) {
        const back = state.sockets.filter((slot): slot is ItemId => slot !== null);
        const inventory = [...state.inventory];
        for (const item of back) {
          if (!inventory.includes(item)) inventory.push(item);
        }
        const solved = { ...state.solved };
        for (const id of roomDef.locks) solved[id] = false;
        return say(
          { ...state, sockets: [null, null, null], inventory, hour: 11, minute: 45, solved },
          "시계탑의 장치를 되돌렸다.",
        );
      }
      if (roomDef.relic && owns(state, roomDef.relic)) {
        return say(state, "이미 끝난 장치는 되돌릴 수 없다.");
      }
      const solved = { ...state.solved };
      const seq = { ...state.seq };
      const dials = { ...state.dials };
      for (const id of roomDef.locks) {
        solved[id] = false;
        const puzzle = PUZZLES[id];
        if (!puzzle) continue;
        if (puzzle.kind === "sequence") seq[id] = [];
        if (puzzle.kind === "dials") dials[id] = puzzle.solution.map(() => 0);
      }
      return say({ ...state, solved, seq, dials }, "이 방의 퍼즐을 되돌렸다.");
    }
    default:
      return { state, fx: null };
  }
}

function clampRoom(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(ROOMS.length - 1, Math.floor(value)));
}

function readSockets(raw: unknown): GameState["sockets"] {
  const list = Array.isArray(raw) ? raw : [];
  return [0, 1, 2].map((index) => (isItem(list[index]) && isAnchor(list[index]) ? list[index] : null)) as GameState["sockets"];
}

export function loadState(): GameState {
  if (typeof window === "undefined") return INITIAL;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return INITIAL;
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (!data) return INITIAL;
    if (data.version === 1) return migrateV1(data);
    if (data.version !== 2) return INITIAL;
    return hydrate(data);
  } catch {
    return INITIAL;
  }
}

function migrateV1(data: Record<string, unknown>): GameState {
  const progress = freshProgress();
  progress.solved.candles = Boolean(data.candlesSolved);
  progress.solved.books = Boolean(data.booksSolved);
  progress.solved.rings = Boolean(data.ringsSolved);
  progress.seq.candles = Array.isArray(data.candles)
    ? data.candles.filter((id): id is string => typeof id === "string")
    : [];
  progress.seq.books = Array.isArray(data.books)
    ? data.books.filter((id): id is string => typeof id === "string")
    : [];
  const rings = [0, 1, 2].map((index) => {
    const value = Array.isArray(data.rings) ? data.rings[index] : 0;
    return typeof value === "number" && value >= 0 && value <= 3 ? Math.floor(value) : 0;
  });
  progress.dials.rings = rings;
  const oldHints = [0, 1, 2, 3].map((index) => {
    const value = Array.isArray(data.hints) ? data.hints[index] : 0;
    if (typeof value !== "number") return 0;
    return Math.max(0, Math.min(3, Math.floor(value)));
  });
  progress.hints[0] = oldHints[0] ?? 0;
  progress.hints[1] = oldHints[1] ?? 0;
  progress.hints[2] = oldHints[2] ?? 0;
  progress.hints[9] = oldHints[3] ?? 0;

  const escaped = Boolean(data.escaped);
  let room = data.room === 1 || data.room === 2 || data.room === 3 ? data.room : 0;
  let sockets = readSockets(data.sockets);
  const socketed = new Set(sockets.filter(isItem));
  const inventory = (Array.isArray(data.inventory) ? data.inventory.filter(isItem) : []).filter(
    (id) => !socketed.has(id),
  );
  if (room === 3 && !escaped) {
    for (const item of sockets) {
      if (item && !inventory.includes(item)) inventory.push(item);
    }
    sockets = [null, null, null];
    room = 3;
  } else if (room === 3 && escaped) {
    room = ROOMS.length - 1;
  }

  return finishLoad(data, {
    ...INITIAL,
    ...progress,
    started: Boolean(data.started),
    escaped,
    room,
    inventory,
    sockets,
  });
}

function hydrate(data: Record<string, unknown>): GameState {
  const progress = freshProgress();
  const seqRaw = data.seq;
  if (seqRaw && typeof seqRaw === "object") {
    const source = seqRaw as Record<string, unknown>;
    for (const key of Object.keys(progress.seq)) {
      const value = source[key];
      progress.seq[key] = Array.isArray(value)
        ? value.filter((id): id is string => typeof id === "string")
        : [];
    }
  }
  const solvedRaw = data.solved;
  if (solvedRaw && typeof solvedRaw === "object") {
    const source = solvedRaw as Record<string, unknown>;
    for (const key of Object.keys(progress.solved)) progress.solved[key] = Boolean(source[key]);
  }
  const dialsRaw = data.dials;
  if (dialsRaw && typeof dialsRaw === "object") {
    const source = dialsRaw as Record<string, unknown>;
    for (const key of Object.keys(progress.dials)) {
      const puzzle = PUZZLES[key];
      const value = source[key];
      if (!puzzle || puzzle.kind !== "dials" || !Array.isArray(value)) continue;
      progress.dials[key] = puzzle.solution.map((_, index) => {
        const digit = value[index];
        if (typeof digit !== "number" || digit < 0) return 0;
        return Math.min(puzzle.modulus - 1, Math.floor(digit));
      });
    }
  }
  const hints = progress.hints.map((fallback, index) => {
    const value = Array.isArray(data.hints) ? data.hints[index] : fallback;
    if (typeof value !== "number") return 0;
    return Math.max(0, Math.min(3, Math.floor(value)));
  });
  const sockets = readSockets(data.sockets);
  const socketed = new Set(sockets.filter(isItem));
  const inventory = (Array.isArray(data.inventory) ? data.inventory.filter(isItem) : []).filter(
    (id) => !socketed.has(id),
  );
  return finishLoad(data, {
    ...INITIAL,
    ...progress,
    hints,
    started: Boolean(data.started),
    escaped: Boolean(data.escaped),
    room: clampRoom(data.room),
    inventory,
    sockets,
  });
}

function finishLoad(data: Record<string, unknown>, base: GameState): GameState {
  const hour = typeof data.hour === "number" ? Math.max(1, Math.min(12, Math.floor(data.hour))) : 11;
  const rawMinute = typeof data.minute === "number" ? Math.floor(data.minute) : 45;
  const minute = Math.max(0, Math.min(55, rawMinute - (rawMinute % 5)));
  const clues = Array.isArray(data.clues)
    ? data.clues.filter((id): id is string => typeof id === "string" && id in CLUES)
    : [];
  return {
    ...base,
    version: 2,
    hour,
    minute,
    clues,
    muted: Boolean(data.muted),
    line: typeof data.line === "string" ? data.line : "",
  };
}

export function saveState(state: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota */
  }
}
