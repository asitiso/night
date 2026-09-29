import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Sun, c as Menu, d as ChevronRight, f as ChevronLeft, l as Lightbulb, n as VolumeX, o as Star, p as BookOpen, r as Volume2, s as Moon, t as X, u as Cloud } from "../_libs/lucide-react.mjs";
import { a as ITEM_IDS, i as ITEMS, n as ANCHORS, o as PUZZLES, r as CLUES, s as ROOMS } from "./router-DVgut7oE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-RM2a8d_f.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SAVE_KEY = "midnight-manor-v1";
function freshProgress() {
	const seq = {};
	const solved = {};
	const dials = {};
	for (const puzzle of Object.values(PUZZLES)) {
		solved[puzzle.id] = false;
		if (puzzle.kind === "sequence") seq[puzzle.id] = [];
		else dials[puzzle.id] = puzzle.solution.map(() => 0);
	}
	return {
		seq,
		solved,
		dials,
		hints: ROOMS.map(() => 0)
	};
}
var INITIAL = {
	version: 2,
	started: false,
	escaped: false,
	room: 0,
	inventory: [],
	sockets: [
		null,
		null,
		null
	],
	...freshProgress(),
	hour: 11,
	minute: 45,
	clues: [],
	muted: false,
	line: ""
};
function isItem(value) {
	return typeof value === "string" && ITEM_IDS.includes(value);
}
function isAnchor(value) {
	return ANCHORS.includes(value);
}
function owns(state, id) {
	return state.inventory.includes(id) || state.sockets.includes(id);
}
function heldItems(state) {
	return ITEM_IDS.filter((id) => owns(state, id));
}
function canLeave(state) {
	const room = ROOMS[state.room];
	if (!room || room.gate === "finale" || !room.puzzle) return false;
	if (!state.solved[room.puzzle]) return false;
	if (room.relic && !owns(state, room.relic)) return false;
	return true;
}
function hotspotLive(spot, state) {
	const room = ROOMS[state.room];
	if (!room) return false;
	if (spot.action === "door") return canLeave(state);
	if (spot.action === "finale") return !state.escaped;
	if (spot.action === "take") return Boolean(room.relic && room.puzzle && state.solved[room.puzzle] && !owns(state, room.relic));
	if (spot.action === "clue" && spot.clue) return !state.clues.includes(spot.clue);
	return false;
}
function say(state, line, fx = null) {
	return {
		state: {
			...state,
			line
		},
		fx
	};
}
function pushSequence(current, order, id) {
	if (current.includes(id)) return {
		next: current,
		done: false,
		bad: false
	};
	if (order[current.length] !== id) return {
		next: [],
		done: false,
		bad: true
	};
	const next = [...current, id];
	return {
		next,
		done: next.length === order.length,
		bad: false
	};
}
function blankRun(muted, started, line) {
	return {
		...INITIAL,
		...freshProgress(),
		muted,
		started,
		line
	};
}
function reduce(state, action) {
	switch (action.type) {
		case "start": return {
			state: blankRun(state.muted, true, ROOMS[0]?.intro ?? ""),
			fx: null
		};
		case "reset": return {
			state: blankRun(state.muted, false, ""),
			fx: null
		};
		case "mute": return {
			state: {
				...state,
				muted: !state.muted
			},
			fx: null
		};
		case "say": return say(state, action.line);
		case "hint": {
			const index = state.room;
			const hints = state.hints.slice();
			while (hints.length < ROOMS.length) hints.push(0);
			if ((hints[index] ?? 0) >= 3) return say(state, "이 방에서 더 꺼낼 힌트는 없다.");
			hints[index] = (hints[index] ?? 0) + 1;
			const room = ROOMS[index];
			return say({
				...state,
				hints
			}, room?.hints[hints[index] - 1] ?? "", "tick");
		}
		case "clue":
			if (!CLUES[action.id] || state.clues.includes(action.id)) return {
				state,
				fx: null
			};
			return {
				state: {
					...state,
					clues: [...state.clues, action.id]
				},
				fx: "tick"
			};
		case "seq": {
			const puzzle = PUZZLES[action.puzzle];
			if (!puzzle || puzzle.kind !== "sequence") return {
				state,
				fx: null
			};
			if (state.solved[puzzle.id]) return {
				state,
				fx: null
			};
			const current = state.seq[puzzle.id] ?? [];
			const step = pushSequence(current, puzzle.order, action.id);
			if (step.bad) return say({
				...state,
				seq: {
					...state.seq,
					[puzzle.id]: []
				}
			}, puzzle.fail, "fail");
			if (step.done) return say({
				...state,
				seq: {
					...state.seq,
					[puzzle.id]: step.next
				},
				solved: {
					...state.solved,
					[puzzle.id]: true
				}
			}, puzzle.success, "success");
			if (step.next === current) return {
				state,
				fx: null
			};
			return say({
				...state,
				seq: {
					...state.seq,
					[puzzle.id]: step.next
				}
			}, puzzle.tick, "tick");
		}
		case "dial": {
			const puzzle = PUZZLES[action.puzzle];
			if (!puzzle || puzzle.kind !== "dials" || state.solved[puzzle.id]) return {
				state,
				fx: null
			};
			const current = [...state.dials[puzzle.id] ?? puzzle.solution.map(() => 0)];
			if (action.index < 0 || action.index >= current.length) return {
				state,
				fx: null
			};
			const value = current[action.index] ?? 0;
			current[action.index] = (value + 1) % puzzle.modulus;
			return {
				state: {
					...state,
					dials: {
						...state.dials,
						[puzzle.id]: current
					}
				},
				fx: "tick"
			};
		}
		case "confirm-dial": {
			const puzzle = PUZZLES[action.puzzle];
			if (!puzzle || puzzle.kind !== "dials" || state.solved[puzzle.id]) return {
				state,
				fx: null
			};
			const current = state.dials[puzzle.id] ?? [];
			if (!puzzle.solution.every((value, index) => current[index] === value)) return say(state, puzzle.fail, "fail");
			return say({
				...state,
				solved: {
					...state.solved,
					[puzzle.id]: true
				}
			}, puzzle.success, "success");
		}
		case "take": {
			const item = action.item;
			if (owns(state, item)) return say(state, "이미 가지고 있다.");
			const room = ROOMS.find((entry) => entry.relic === item);
			if (!room?.puzzle || !state.solved[room.puzzle]) return say(state, "아직 손이 닿지 않는다.", "fail");
			return say({
				...state,
				inventory: [...state.inventory, item]
			}, ITEMS[item].take, "take");
		}
		case "place": {
			if (!state.inventory.includes(action.item)) return {
				state,
				fx: null
			};
			if (!isAnchor(action.item)) return say(state, "이 홈은 세 기둥만을 받는다.", "fail");
			if (state.sockets[action.socket]) return say(state, "이미 채워진 홈이다.", "fail");
			const sockets = [...state.sockets];
			sockets[action.socket] = action.item;
			return say({
				...state,
				sockets,
				inventory: state.inventory.filter((id) => id !== action.item)
			}, ITEMS[action.item].place, "tick");
		}
		case "unplace": {
			const item = state.sockets[action.socket];
			if (!item) return {
				state,
				fx: null
			};
			const sockets = [...state.sockets];
			sockets[action.socket] = null;
			return say({
				...state,
				sockets,
				inventory: [...state.inventory, item]
			}, "표식을 다시 손에 쥐었다.", "tick");
		}
		case "hour": {
			let hour = state.hour + action.delta;
			if (hour > 12) hour = 1;
			if (hour < 1) hour = 12;
			return {
				state: {
					...state,
					hour
				},
				fx: "tick"
			};
		}
		case "minute": {
			let minute = state.minute + action.delta;
			if (minute >= 60) minute = 0;
			if (minute < 0) minute = 55;
			return {
				state: {
					...state,
					minute
				},
				fx: "tick"
			};
		}
		case "handle": {
			if (state.escaped) return {
				state,
				fx: null
			};
			const missing = ITEM_IDS.filter((id) => !owns(state, id));
			if (missing.length > 0) {
				const name = ITEMS[missing[0] ?? "wax"].name;
				return say(state, `아직 없다 — ${name}. 열 개의 방을 모두 지나야 한다.`, "fail");
			}
			const placed = state.sockets.filter((slot) => slot !== null);
			if (!ANCHORS.every((id) => placed.includes(id))) return say(state, "세 기둥 — 밀랍, 톱니, 에메랄드 — 이 홈에 있어야 한다.", "fail");
			if (state.hour !== 12 || state.minute !== 0) return say(state, "아직 자정이 아니다.", "fail");
			return {
				state: {
					...state,
					escaped: true,
					line: "자정. 거대한 톱니가 한 번 울리고, 문이 열렸다."
				},
				fx: "escape"
			};
		}
		case "next": {
			const roomDef = ROOMS[state.room];
			if (!roomDef || roomDef.gate === "finale") return {
				state,
				fx: null
			};
			if (roomDef.puzzle && !state.solved[roomDef.puzzle]) return say(state, roomDef.locked, "fail");
			if (roomDef.relic && !owns(state, roomDef.relic)) return say(state, roomDef.needItem, "fail");
			const room = state.room + 1;
			const nextRoom = ROOMS[room];
			if (!nextRoom) return {
				state,
				fx: null
			};
			return {
				state: {
					...state,
					room,
					line: nextRoom.intro
				},
				fx: "advance"
			};
		}
		case "inspect-item": return say(state, ITEMS[action.item].blurb);
		case "reset-room": {
			const roomDef = ROOMS[state.room];
			if (!roomDef) return {
				state,
				fx: null
			};
			if (roomDef.gate === "finale" && !state.escaped) {
				const back = state.sockets.filter((slot) => slot !== null);
				const inventory = [...state.inventory];
				for (const item of back) if (!inventory.includes(item)) inventory.push(item);
				return say({
					...state,
					sockets: [
						null,
						null,
						null
					],
					inventory,
					hour: 11,
					minute: 45
				}, "시계탑의 장치를 되돌렸다.");
			}
			if (roomDef.relic && owns(state, roomDef.relic)) return say(state, "이미 끝난 장치는 되돌릴 수 없다.");
			if (!roomDef.puzzle) return say(state, "되돌릴 장치가 없다.");
			const puzzle = PUZZLES[roomDef.puzzle];
			if (!puzzle) return {
				state,
				fx: null
			};
			const solved = {
				...state.solved,
				[puzzle.id]: false
			};
			if (puzzle.kind === "sequence") return say({
				...state,
				solved,
				seq: {
					...state.seq,
					[puzzle.id]: []
				}
			}, "이 방의 장치를 되돌렸다.");
			return say({
				...state,
				solved,
				dials: {
					...state.dials,
					[puzzle.id]: puzzle.solution.map(() => 0)
				}
			}, "이 방의 장치를 되돌렸다.");
		}
		default: return {
			state,
			fx: null
		};
	}
}
function clampRoom(value) {
	if (typeof value !== "number" || !Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(ROOMS.length - 1, Math.floor(value)));
}
function readSockets(raw) {
	const list = Array.isArray(raw) ? raw : [];
	return [
		0,
		1,
		2
	].map((index) => isItem(list[index]) && isAnchor(list[index]) ? list[index] : null);
}
function loadState() {
	if (typeof window === "undefined") return INITIAL;
	try {
		const raw = localStorage.getItem(SAVE_KEY);
		if (!raw) return INITIAL;
		const data = JSON.parse(raw);
		if (!data) return INITIAL;
		if (data.version === 1) return migrateV1(data);
		if (data.version !== 2) return INITIAL;
		return hydrate(data);
	} catch {
		return INITIAL;
	}
}
function migrateV1(data) {
	const progress = freshProgress();
	progress.solved.candles = Boolean(data.candlesSolved);
	progress.solved.books = Boolean(data.booksSolved);
	progress.solved.rings = Boolean(data.ringsSolved);
	progress.seq.candles = Array.isArray(data.candles) ? data.candles.filter((id) => typeof id === "string") : [];
	progress.seq.books = Array.isArray(data.books) ? data.books.filter((id) => typeof id === "string") : [];
	const rings = [
		0,
		1,
		2
	].map((index) => {
		const value = Array.isArray(data.rings) ? data.rings[index] : 0;
		return typeof value === "number" && value >= 0 && value <= 3 ? Math.floor(value) : 0;
	});
	progress.dials.rings = rings;
	const oldHints = [
		0,
		1,
		2,
		3
	].map((index) => {
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
	const inventory = (Array.isArray(data.inventory) ? data.inventory.filter(isItem) : []).filter((id) => !socketed.has(id));
	if (room === 3 && !escaped) {
		for (const item of sockets) if (item && !inventory.includes(item)) inventory.push(item);
		sockets = [
			null,
			null,
			null
		];
		room = 3;
	} else if (room === 3 && escaped) room = ROOMS.length - 1;
	return finishLoad(data, {
		...INITIAL,
		...progress,
		started: Boolean(data.started),
		escaped,
		room,
		inventory,
		sockets
	});
}
function hydrate(data) {
	const progress = freshProgress();
	const seqRaw = data.seq;
	if (seqRaw && typeof seqRaw === "object") {
		const source = seqRaw;
		for (const key of Object.keys(progress.seq)) {
			const value = source[key];
			progress.seq[key] = Array.isArray(value) ? value.filter((id) => typeof id === "string") : [];
		}
	}
	const solvedRaw = data.solved;
	if (solvedRaw && typeof solvedRaw === "object") {
		const source = solvedRaw;
		for (const key of Object.keys(progress.solved)) progress.solved[key] = Boolean(source[key]);
	}
	const dialsRaw = data.dials;
	if (dialsRaw && typeof dialsRaw === "object") {
		const source = dialsRaw;
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
	const inventory = (Array.isArray(data.inventory) ? data.inventory.filter(isItem) : []).filter((id) => !socketed.has(id));
	return finishLoad(data, {
		...INITIAL,
		...progress,
		hints,
		started: Boolean(data.started),
		escaped: Boolean(data.escaped),
		room: clampRoom(data.room),
		inventory,
		sockets
	});
}
function finishLoad(data, base) {
	const hour = typeof data.hour === "number" ? Math.max(1, Math.min(12, Math.floor(data.hour))) : 11;
	const rawMinute = typeof data.minute === "number" ? Math.floor(data.minute) : 45;
	const minute = Math.max(0, Math.min(55, rawMinute - rawMinute % 5));
	const clues = Array.isArray(data.clues) ? data.clues.filter((id) => typeof id === "string" && id in CLUES) : [];
	return {
		...base,
		version: 2,
		hour,
		minute,
		clues,
		muted: Boolean(data.muted),
		line: typeof data.line === "string" ? data.line : ""
	};
}
function saveState(state) {
	try {
		localStorage.setItem(SAVE_KEY, JSON.stringify(state));
	} catch {}
}
var ctx = null;
var master = null;
var music = null;
var sfx = null;
var droneOn = false;
var sceneId = "parlor";
var step = 0;
var nextAt = 0;
var melodyGain = null;
var clockGain = null;
var windGain = null;
var melodyFilter = null;
var SCALE = [
	0,
	2,
	3,
	5,
	7,
	8,
	10
];
var PHRASE = [
	0,
	2,
	4,
	6,
	4,
	2,
	3,
	0,
	5,
	4,
	2,
	0,
	4,
	6,
	5,
	-1
];
var ROOTS = [
	0,
	4,
	5,
	4
];
var MOODS = {
	parlor: {
		cutoff: 1500,
		melody: .09,
		clock: .03,
		wind: .012,
		fifth: false,
		drop: 0
	},
	library: {
		cutoff: 1100,
		melody: .075,
		clock: .02,
		wind: .008,
		fifth: false,
		drop: 0
	},
	greenhouse: {
		cutoff: 1900,
		melody: .08,
		clock: .015,
		wind: .022,
		fifth: false,
		drop: 0
	},
	banquet: {
		cutoff: 1300,
		melody: .095,
		clock: .025,
		wind: .01,
		fifth: false,
		drop: 0
	},
	gallery: {
		cutoff: 1e3,
		melody: .065,
		clock: .018,
		wind: .008,
		fifth: false,
		drop: 0
	},
	bedroom: {
		cutoff: 860,
		melody: .055,
		clock: .012,
		wind: .006,
		fifth: false,
		drop: 0
	},
	cellar: {
		cutoff: 680,
		melody: .07,
		clock: .028,
		wind: .02,
		fifth: false,
		drop: -1
	},
	chapel: {
		cutoff: 1700,
		melody: .08,
		clock: .016,
		wind: .012,
		fifth: true,
		drop: 0
	},
	vault: {
		cutoff: 900,
		melody: .06,
		clock: .05,
		wind: .008,
		fifth: false,
		drop: 0
	},
	tower: {
		cutoff: 1600,
		melody: .09,
		clock: .07,
		wind: .014,
		fifth: true,
		drop: 0
	}
};
function mood() {
	return MOODS[sceneId] ?? MOODS.parlor;
}
function noteFreq(index, octaveShift) {
	const wrapped = (index % 7 + 7) % 7;
	const oct = Math.floor(index / 7) + octaveShift;
	return 146.83 * 2 ** ((SCALE[wrapped] + oct * 12) / 12);
}
function voice(freq, when, dur, level, type, dest) {
	if (!ctx) return;
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, when);
	gain.gain.setValueAtTime(1e-4, when);
	gain.gain.exponentialRampToValueAtTime(Math.max(2e-4, level), when + .06);
	gain.gain.exponentialRampToValueAtTime(1e-4, when + dur);
	osc.connect(gain);
	gain.connect(dest);
	osc.start(when);
	osc.stop(when + dur + .05);
	osc.onended = () => {
		osc.disconnect();
		gain.disconnect();
	};
}
function clockTick(when) {
	if (!ctx || !clockGain) return;
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = "sine";
	osc.frequency.setValueAtTime(1480, when);
	osc.frequency.exponentialRampToValueAtTime(420, when + .08);
	gain.gain.setValueAtTime(1e-4, when);
	gain.gain.exponentialRampToValueAtTime(.7, when + .004);
	gain.gain.exponentialRampToValueAtTime(1e-4, when + .12);
	osc.connect(gain);
	gain.connect(clockGain);
	osc.start(when);
	osc.stop(when + .14);
	osc.onended = () => {
		osc.disconnect();
		gain.disconnect();
	};
}
function pump() {
	if (!ctx || !melodyFilter || !music || !scoreLive()) return;
	const horizon = ctx.currentTime + 1.4;
	while (nextAt < horizon) {
		const here = mood();
		const index = PHRASE[step % PHRASE.length];
		if (index >= 0) {
			const freq = noteFreq(index, here.drop);
			voice(freq, nextAt, 1.7, .55, "sine", melodyFilter);
			voice(freq * 2, nextAt, 1.15, .12, "triangle", melodyFilter);
			if (here.fifth) voice(freq * 1.5, nextAt + .03, 1.5, .22, "sine", melodyFilter);
		}
		if (step % 8 === 0) voice(noteFreq(ROOTS[step / 8 % ROOTS.length], -1), nextAt, 3.4, .22, "sine", music);
		if (step % 8 === 4) clockTick(nextAt);
		nextAt += here.drop < 0 ? .98 : .84;
		step += 1;
	}
	window.setTimeout(pump, 360);
}
function scoreLive() {
	return droneOn;
}
function setScene(id) {
	sceneId = id;
	if (!ctx || !melodyFilter || !melodyGain || !clockGain || !windGain) return;
	const here = mood();
	const time = ctx.currentTime;
	melodyFilter.frequency.setTargetAtTime(here.cutoff, time, .45);
	melodyGain.gain.setTargetAtTime(here.melody, time, .45);
	clockGain.gain.setTargetAtTime(here.clock, time, .3);
	windGain.gain.setTargetAtTime(here.wind, time, .6);
}
function startDrone() {
	unlock();
	if (!ctx || !music || droneOn) return;
	droneOn = true;
	const here = mood();
	const wet = ctx.createGain();
	wet.gain.value = .62;
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
	melodyFilter.Q.value = .6;
	melodyFilter.connect(melodyGain);
	melodyGain.connect(music);
	melodyGain.connect(hall);
	const drone = ctx.createGain();
	drone.gain.value = .8;
	const tremolo = ctx.createOscillator();
	const tremoloDepth = ctx.createGain();
	tremolo.frequency.value = .07;
	tremoloDepth.gain.value = .12;
	tremolo.connect(tremoloDepth);
	tremoloDepth.connect(drone.gain);
	tremolo.start();
	drone.connect(music);
	[
		73.42,
		110,
		174.61
	].forEach((freq, index) => {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sine";
		osc.frequency.value = freq;
		osc.detune.value = index === 1 ? 6 : -4;
		gain.gain.value = index === 0 ? .045 : .026;
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
	nextAt = ctx.currentTime + .15;
	step = 0;
	pump();
}
var wantMuted = false;
var visibilityBound = false;
function ctor() {
	if (typeof window === "undefined") return null;
	const w = window;
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
	music.gain.value = .7;
	sfx.gain.value = .9;
	master.gain.value = wantMuted ? 0 : 1;
	music.connect(master);
	sfx.connect(master);
	master.connect(ctx.destination);
}
function unlock() {
	try {
		ensure();
		if (ctx && ctx.state === "suspended") ctx.resume();
		if (!visibilityBound && typeof document !== "undefined") {
			visibilityBound = true;
			document.addEventListener("visibilitychange", () => {
				if (document.visibilityState === "visible" && ctx?.state === "suspended") ctx.resume();
			});
		}
	} catch {}
}
function applyMuted(muted) {
	wantMuted = muted;
	if (!ctx || !master) return;
	master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, .03);
}
function tone(freq, dur, type, gainValue, when = 0) {
	if (!ctx || !sfx) return;
	const t = ctx.currentTime + when;
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, t);
	gain.gain.setValueAtTime(1e-4, t);
	gain.gain.exponentialRampToValueAtTime(Math.max(2e-4, gainValue), t + .012);
	gain.gain.exponentialRampToValueAtTime(1e-4, t + dur);
	osc.connect(gain);
	gain.connect(sfx);
	osc.start(t);
	osc.stop(t + dur + .02);
	osc.onended = () => {
		osc.disconnect();
		gain.disconnect();
	};
}
function playTick() {
	tone(740 + Math.random() * 160, .05, "triangle", .045);
}
function playFail() {
	tone(110, .22, "sawtooth", .03);
	tone(82, .32, "sine", .04, .02);
}
function playSuccess() {
	[
		523.25,
		659.25,
		783.99,
		1046.5
	].forEach((freq, index) => {
		tone(freq, .28, "sine", .05, index * .08);
	});
}
function playTake() {
	tone(880, .1, "sine", .045);
	tone(1174, .16, "triangle", .04, .07);
}
function playDoor() {
	tone(130, .28, "sine", .05);
	tone(196, .22, "triangle", .035, .1);
}
function playEscape() {
	[
		392,
		494,
		587,
		784,
		988
	].forEach((freq, index) => {
		tone(freq, .42, "sine", .05, index * .11);
	});
}
function Dust({ burst }) {
	const ref = (0, import_react.useRef)(null);
	const burstRef = (0, import_react.useRef)(burst);
	burstRef.current = burst;
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		const parent = canvas?.parentElement;
		if (!canvas || !parent) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		let motes = [];
		let sparks = [];
		let seen = burstRef.current;
		let last = performance.now();
		let frame = 0;
		let width = 0;
		let height = 0;
		const resize = () => {
			const rect = parent.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			width = rect.width;
			height = rect.height;
			canvas.width = Math.max(1, Math.floor(width * dpr));
			canvas.height = Math.max(1, Math.floor(height * dpr));
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		const seed = () => {
			motes = Array.from({ length: 32 }, () => ({
				x: Math.random() * width,
				y: Math.random() * height,
				r: Math.random() * 1.3 + .4,
				v: Math.random() * 8 + 3,
				a: Math.random() * .28 + .08,
				gold: Math.random() > .4
			}));
		};
		resize();
		seed();
		const observer = new ResizeObserver(() => {
			resize();
			seed();
		});
		observer.observe(parent);
		const loop = (now) => {
			const dt = Math.min(.05, (now - last) / 1e3);
			last = now;
			if (burstRef.current !== seen) {
				seen = burstRef.current;
				for (let i = 0; i < 26; i++) {
					const angle = Math.random() * Math.PI * 2;
					const speed = Math.random() * 90 + 24;
					sparks.push({
						x: width * .5,
						y: height * .42,
						vx: Math.cos(angle) * speed,
						vy: Math.sin(angle) * speed,
						life: 1
					});
				}
			}
			ctx.clearRect(0, 0, width, height);
			for (const mote of motes) {
				mote.y -= mote.v * dt;
				mote.x += Math.sin(now / 900 + mote.y) * 6 * dt;
				if (mote.y < -4) {
					mote.y = height + 4;
					mote.x = Math.random() * width;
				}
				ctx.beginPath();
				ctx.fillStyle = mote.gold ? `rgba(201,161,91,${mote.a})` : `rgba(243,234,220,${mote.a})`;
				ctx.arc(mote.x, mote.y, mote.r, 0, Math.PI * 2);
				ctx.fill();
			}
			sparks = sparks.filter((spark) => spark.life > 0);
			for (const spark of sparks) {
				spark.life -= dt * .85;
				spark.x += spark.vx * dt;
				spark.y += spark.vy * dt;
				spark.vy += 36 * dt;
				ctx.beginPath();
				ctx.fillStyle = `rgba(228,200,138,${Math.max(0, spark.life)})`;
				ctx.arc(spark.x, spark.y, 2, 0, Math.PI * 2);
				ctx.fill();
			}
			frame = requestAnimationFrame(loop);
		};
		frame = requestAnimationFrame(loop);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "dust",
		"aria-hidden": true
	});
}
function ClockFace({ hour, minute, numerals }) {
	const hourAngle = (hour % 12 + minute / 60) * 30;
	const minuteAngle = minute * 6;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className: "clock-svg",
		viewBox: "0 0 200 200",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "100",
				r: "96",
				className: "clock-rim"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "100",
				r: "86",
				className: "clock-face"
			}),
			Array.from({ length: 60 }, (_, index) => {
				const rad = (index * 6 - 90) * Math.PI / 180;
				const inner = index % 5 === 0 ? 72 : 78;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: 100 + Math.cos(rad) * inner,
					y1: 100 + Math.sin(rad) * inner,
					x2: 100 + Math.cos(rad) * 82,
					y2: 100 + Math.sin(rad) * 82,
					stroke: "currentColor",
					strokeWidth: index % 5 === 0 ? 2.2 : .7,
					opacity: index % 5 === 0 ? .9 : .35
				}, index);
			}),
			numerals ? [
				"XII",
				"I",
				"II",
				"III",
				"IV",
				"V",
				"VI",
				"VII",
				"VIII",
				"IX",
				"X",
				"XI"
			].map((label, index) => {
				const rad = (index * 30 - 90) * Math.PI / 180;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: 100 + Math.cos(rad) * 58,
					y: 100 + Math.sin(rad) * 58,
					textAnchor: "middle",
					dominantBaseline: "middle",
					fill: "currentColor",
					fontSize: "11",
					fontFamily: "Noto Serif KR, serif",
					children: label
				}, label);
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "100",
				y1: "108",
				x2: "100",
				y2: "58",
				stroke: "currentColor",
				strokeWidth: "4",
				strokeLinecap: "round",
				transform: `rotate(${hourAngle} 100 100)`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "100",
				y1: "114",
				x2: "100",
				y2: "36",
				stroke: "currentColor",
				strokeWidth: "2.2",
				strokeLinecap: "round",
				transform: `rotate(${minuteAngle} 100 100)`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "100",
				r: "4.5",
				fill: "currentColor"
			})
		]
	});
}
function MoonRow() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "moon-row",
		"aria-hidden": true,
		children: [
			{
				id: "new",
				label: "그믐"
			},
			{
				id: "crescent",
				label: "초승"
			},
			{
				id: "half",
				label: "반달"
			},
			{
				id: "full",
				label: "보름"
			}
		].map((phase, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "moon-step",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "moon-index",
					children: index + 1
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `moon moon-${phase.id}` }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: phase.label })
			]
		}, phase.id))
	});
}
function CaskRow() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "cask-row",
		"aria-hidden": true,
		children: [
			7,
			5,
			3,
			1
		].map((count, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "cask-step",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "cask-order",
					children: index + 1
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "cask-body",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "cask-band" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "cask-drops",
						children: Array.from({ length: count }, (_, drop) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}, drop))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: count })
			]
		}, count))
	});
}
function GlassRow() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "glass-row",
		"aria-hidden": true,
		children: [
			{
				id: "blood",
				label: "피"
			},
			{
				id: "gold",
				label: "황금"
			},
			{
				id: "sky",
				label: "하늘"
			},
			{
				id: "night",
				label: "어둠"
			}
		].map((pane, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass-step",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "glass-order",
					children: index + 1
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `lancet lancet-${pane.id}` }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: pane.label })
			]
		}, pane.id))
	});
}
function LineageRow() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "lineage",
		children: [
			"1642",
			"1711",
			"1830",
			"1899"
		].map((year) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "lineage-year",
			children: year
		}) }, year))
	});
}
function BrassMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "brass-plate",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "VII" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "II" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "IV" })
		]
	});
}
function GlobeMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className: "globe-svg",
		viewBox: "0 0 160 160",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "80",
				cy: "80",
				r: "58",
				className: "globe-sphere"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "80",
				cy: "80",
				rx: "24",
				ry: "58",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "80",
				cy: "80",
				rx: "46",
				ry: "58",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1",
				opacity: "0.55"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M22 80h116M30 52h100M30 108h100",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M48 28c10 18 10 86 0 104M112 28c-10 18-10 86 0 104",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "80",
				cy: "80",
				r: "62",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "3"
			})
		]
	});
}
function PlateMark({ plate }) {
	if (plate === "clock") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockFace, {
		hour: 11,
		minute: 45,
		numerals: true
	});
	if (plate === "blankclock") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockFace, {
		hour: 12,
		minute: 0,
		numerals: false
	});
	if (plate === "globe") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobeMark, {});
	if (plate === "moons") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoonRow, {});
	if (plate === "casks") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaskRow, {});
	if (plate === "glass") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlassRow, {});
	if (plate === "lineage") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineageRow, {});
	if (plate === "brass") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrassMark, {});
	return null;
}
function ClueCard({ id }) {
	const clue = CLUES[id];
	if (!clue) return null;
	const mark = PlateMark({ plate: clue.plate });
	const showPhoto = Boolean(clue.image) && clue.plate !== "clock" && clue.plate !== "blankclock";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: `artifact plate-${clue.plate}`,
		children: [
			showPhoto ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "artifact-visual",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: clue.image,
					alt: "",
					className: "artifact-photo"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "artifact-frame" })]
			}) : null,
			mark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "artifact-mark",
				children: mark
			}) : null,
			clue.plate === "clock" && clue.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: clue.image,
				alt: "",
				className: "artifact-aside"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "artifact-body",
				children: clue.body
			})
		]
	});
}
function ClueThumb({ id }) {
	const clue = CLUES[id];
	if (!clue) return null;
	if (clue.image) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: clue.image,
		alt: "",
		className: "clue-pin-photo"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `clue-pin-mark mark-${clue.plate}`,
		"aria-hidden": true,
		children: [
			clue.plate === "brass" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "thumb-brass",
				children: "VII"
			}) : null,
			clue.plate === "lineage" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "thumb-year",
				children: "1642"
			}) : null,
			clue.plate === "moons" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "moon moon-crescent thumb-moon" }) : null,
			clue.plate === "blankclock" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "thumb-clock" }) : null,
			clue.plate === "globe" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "thumb-globe" }) : null,
			clue.plate === "casks" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "cask-body thumb-cask",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "cask-band" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "cask-drops",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
					]
				})]
			}) : null
		]
	});
}
var SPOT_SRC = {
	door: "/art/prop-door.jpg",
	finale: "/art/prop-gate.jpg",
	candles: "/art/prop-candles.jpg",
	cabinet: "/art/prop-cabinet.jpg",
	books: "/art/prop-books.jpg",
	drawer: "/art/prop-drawer.jpg",
	rings: "/art/prop-rings.jpg",
	water: "/art/prop-water.jpg",
	goblets: "/art/prop-goblets.jpg",
	chair: "/art/prop-chair.jpg",
	portraits: "/art/prop-portraits.jpg",
	pedestal: "/art/prop-pedestal.jpg",
	moons: "/art/prop-moon.jpg",
	casket: "/art/prop-casket.jpg",
	casks: "/art/prop-casks.jpg",
	shelf: "/art/prop-shelf.jpg",
	glass: "/art/prop-glass.jpg",
	altar: "/art/prop-altar.jpg",
	vault: "/art/prop-dials.jpg",
	coffer: "/art/prop-coffer.jpg"
};
function SpotThumb({ hotspot }) {
	const key = hotspot.action === "puzzle" ? hotspot.puzzle ?? hotspot.id : hotspot.action === "door" ? "door" : hotspot.action === "finale" ? "finale" : hotspot.id;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: SPOT_SRC[key] ?? "/art/prop-door.jpg",
		alt: "",
		className: "clue-pin-photo"
	});
}
function RelicGlyph({ id, className }) {
	const common = {
		className,
		viewBox: "0 0 32 32",
		fill: "none",
		"aria-hidden": true
	};
	switch (id) {
		case "wax": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			...common,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "16",
					cy: "16",
					r: "11",
					stroke: "currentColor",
					strokeWidth: "1.6"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "16",
					cy: "16",
					r: "6",
					stroke: "currentColor",
					strokeWidth: "1.4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M16 8.5v3.2M16 20.3V23.5M8.5 16h3.2M20.3 16H23.5",
					stroke: "currentColor",
					strokeWidth: "1.3"
				})
			]
		});
		case "cog": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			...common,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r: "4.2",
				stroke: "currentColor",
				strokeWidth: "1.6"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M16 4.5v3.2M16 24.3V27.5M4.5 16h3.2M24.3 16H27.5M7.2 7.2l2.3 2.3M22.5 22.5l2.3 2.3M24.8 7.2l-2.3 2.3M9.5 22.5l-2.3 2.3",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round"
			})]
		});
		case "emerald": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			...common,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M16 4.5 26 12.2 16 27.5 6 12.2Z",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinejoin: "round"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M6 12.2h20M16 4.5 12 12.2 16 27.5 20 12.2Z",
				stroke: "currentColor",
				strokeWidth: "1.2"
			})]
		});
		case "cuff": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			...common,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "7",
				y: "10",
				width: "18",
				height: "12",
				rx: "3",
				stroke: "currentColor",
				strokeWidth: "1.6"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r: "2.4",
				fill: "currentColor"
			})]
		});
		case "locket": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			...common,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "16",
					cy: "15",
					r: "8",
					stroke: "currentColor",
					strokeWidth: "1.6"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M16 7.2V4.2M12.2 4.2h7.6",
					stroke: "currentColor",
					strokeWidth: "1.5",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M16 12.2v5.2",
					stroke: "currentColor",
					strokeWidth: "1.4",
					strokeLinecap: "round"
				})
			]
		});
		case "pearl": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			...common,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r: "8",
				stroke: "currentColor",
				strokeWidth: "1.6"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M12 12.5c1.6 1.2 3.4 1.6 6.2.4",
				stroke: "currentColor",
				strokeWidth: "1.3",
				strokeLinecap: "round"
			})]
		});
		case "amber": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			...common,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M11 6h10l2 4.5v11.2a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V10.5Z",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinejoin: "round"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M10 11h12",
				stroke: "currentColor",
				strokeWidth: "1.3"
			})]
		});
		case "shard": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			...common,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M16 4.2 24.5 26.5H7.5Z",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinejoin: "round"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M16 10.5v8",
				stroke: "currentColor",
				strokeWidth: "1.3",
				strokeLinecap: "round"
			})]
		});
		case "sigil": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			...common,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r: "10",
				stroke: "currentColor",
				strokeWidth: "1.6"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M16 8.5 18.2 13.4 23.5 14.1 19.6 17.6 20.6 22.8 16 20.3 11.4 22.8 12.4 17.6 8.5 14.1 13.8 13.4Z",
				stroke: "currentColor",
				strokeWidth: "1.2",
				strokeLinejoin: "round"
			})]
		});
		default: return null;
	}
}
var RING_ICON = [
	Sun,
	Moon,
	Star,
	Cloud
];
function Sheet({ title, onClose, children }) {
	const closeRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		closeRef.current?.focus();
	}, [title]);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "sheet-scrim",
		onMouseDown: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "sheet",
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "sheet-title",
			onMouseDown: (event) => event.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sheet-bar",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "sheet-title",
					className: "sheet-title font-display font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					ref: closeRef,
					type: "button",
					className: "icon-btn",
					"aria-label": "닫기",
					onClick: onClose,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				})]
			}), children]
		})
	});
}
function PieceFace({ piece, on }) {
	if (piece.kind === "candle") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "candle-stage",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flame",
				style: on ? void 0 : { visibility: "hidden" },
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `wax ${piece.tone}` }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wax-base" })
		]
	});
	if (piece.kind === "book") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "book-stars",
		children: piece.stars === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "book-caption",
			children: "별 없음"
		}) : Array.from({ length: piece.stars ?? 0 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
			className: "size-3",
			fill: "currentColor",
			"aria-hidden": true
		}, index))
	});
	if (piece.kind === "goblet") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `goblet tone-${piece.tone}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "goblet-bowl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "goblet-fill" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "goblet-stem" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "goblet-foot" })
		]
	});
	if (piece.kind === "portrait") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `portrait-card tone-${piece.tone}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "portrait-bust" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "portrait-year",
			children: piece.label
		})]
	});
	if (piece.kind === "moon") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `moon moon-${piece.tone}` });
	if (piece.kind === "cask") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "cask-body",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "cask-band" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "cask-drops",
			children: Array.from({ length: piece.drops ?? 0 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}, index))
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `lancet lancet-${piece.tone}` });
}
function SequenceSheet({ puzzle, state, dispatch }) {
	const progress = state.seq[puzzle.id] ?? [];
	const solved = Boolean(state.solved[puzzle.id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "stack",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "prose muted",
				children: puzzle.prompt
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "spread",
				children: puzzle.pieces.map((piece) => {
					const on = solved || progress.includes(piece.id);
					const book = piece.kind === "book";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: book ? on ? `book ${piece.tone} is-picked` : `book ${piece.tone}` : on ? `piece piece-${piece.kind} is-on` : `piece piece-${piece.kind}`,
						"data-candle": piece.kind === "candle" ? piece.id : void 0,
						"data-book": piece.kind === "book" ? piece.id : void 0,
						"data-piece": piece.id,
						"aria-label": piece.label,
						onClick: () => dispatch({
							type: "seq",
							puzzle: puzzle.id,
							id: piece.id
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PieceFace, {
							piece,
							on
						}), piece.kind === "candle" || piece.kind === "goblet" || piece.kind === "cask" || piece.kind === "glass" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "piece-label",
							children: piece.label
						}) : null]
					}, piece.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "prose",
				children: solved ? puzzle.success : `${progress.length} / ${puzzle.order.length}`
			})
		]
	});
}
function DialSheet({ puzzle, state, dispatch }) {
	const [turned, setTurned] = (0, import_react.useState)(null);
	const values = state.dials[puzzle.id] ?? puzzle.solution.map(() => 0);
	const solved = Boolean(state.solved[puzzle.id]);
	const numeric = puzzle.faces.length === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "stack",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "prose muted",
				children: puzzle.prompt
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "spread",
				children: puzzle.solution.map((_, index) => {
					const value = values[index] ?? 0;
					if (numeric) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: turned === index ? "wheel is-turn" : "wheel",
						"data-dial": index,
						"aria-label": `${index + 1}번째 다이얼, ${value}`,
						onClick: () => {
							setTurned(index);
							dispatch({
								type: "dial",
								puzzle: puzzle.id,
								index
							});
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "wheel-num",
							children: value
						})
					}, index);
					const face = puzzle.faces[value] ?? puzzle.faces[0];
					const Icon = RING_ICON[value] ?? Sun;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: turned === index ? "ring-btn is-turn" : "ring-btn",
						"data-ring": index,
						"aria-label": `${index + 1}번째 고리, 현재 ${face?.word ?? ""}`,
						onClick: () => {
							setTurned(index);
							dispatch({
								type: "dial",
								puzzle: puzzle.id,
								index
							});
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ring-core",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5",
								"aria-hidden": true
							}), face?.word]
						})
					}, index);
				})
			}),
			solved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "prose",
				children: puzzle.success
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "row",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn btn-gold",
					"data-confirm-rings": puzzle.id === "rings" ? true : void 0,
					"data-confirm-dial": puzzle.id,
					onClick: () => dispatch({
						type: "confirm-dial",
						puzzle: puzzle.id
					}),
					children: puzzle.id === "rings" ? "분수에 맞춘다" : "다이얼을 맞춘다"
				})
			})
		]
	});
}
function TakeItem({ ready, owned, locked, readyText, item, dispatch }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "stack",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "take-hero",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RelicGlyph, {
					id: item,
					className: "take-glyph"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "prose",
				children: owned ? "이미 비어 있다." : ready ? readyText : locked
			}),
			ready && !owned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "btn btn-gold",
				"data-take": item,
				onClick: () => dispatch({
					type: "take",
					item
				}),
				children: "집어 든다"
			}) : null
		]
	});
}
var TAKE_COPY = {
	wax: {
		locked: "잠겨 있다. 불꽃이 순서를 기억한다.",
		ready: "서랍 안쪽에 아직 따뜻한 밀랍 인장이 있다."
	},
	cog: {
		locked: "서랍은 닫혀 있다. 책의 순서가 자물쇠다.",
		ready: "밀린 서랍 바닥에 은빛 톱니가 빛난다."
	},
	emerald: {
		locked: "수면이 검다. 고리의 문양이 물을 가두고 있다.",
		ready: "갈라진 물 아래, 에메랄드 파편이 손끝에 닿는다."
	},
	cuff: {
		locked: "의자 틈은 어둡다. 잔이 아직 순서를 모른다.",
		ready: "의자 다리 사이에 루비 커프가 걸려 있다."
	},
	locket: {
		locked: "진열대는 잠겨 있다. 초상들이 순서를 기다린다.",
		ready: "열린 진열대 안에 금테 로켓이 놓여 있다."
	},
	pearl: {
		locked: "함은 잠겨 있다. 달이 아직 차지 않았다.",
		ready: "함 안, 달의 진주가 차갑게 빛난다."
	},
	amber: {
		locked: "선반의 병은 돌아앉지 않았다.",
		ready: "돌아선 병의 입에 호박 마개가 남아 있다."
	},
	shard: {
		locked: "제단 아래는 차갑다. 유리가 아직 흩어져 있다.",
		ready: "제단 홈에 성창 파편이 따뜻하게 남아 있다."
	},
	sigil: {
		locked: "함은 잠겨 있다. 다이얼이 수를 거부한다.",
		ready: "열린 함 바닥에 흑요석 인장이 깔려 있다."
	}
};
function Finale({ state, dispatch }) {
	const [sel, setSel] = (0, import_react.useState)(null);
	const midnight = state.hour === 12 && state.minute === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "stack",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "prose",
				children: "아홉 표식을 모은 뒤, 세 기둥을 홈에 끼우고 바늘을 자정에 맞추십시오."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relic-board",
				"aria-label": "모은 표식",
				children: ITEM_IDS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: owns(state, id) ? "relic-pip is-have" : "relic-pip",
					title: ITEMS[id].name,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RelicGlyph, {
						id,
						className: "relic-glyph"
					})
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "row",
				children: ANCHORS.map((id) => {
					if (!owns(state, id)) return null;
					const placed = state.sockets.includes(id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: sel === id && !placed ? "chip is-on" : "chip",
						"aria-pressed": sel === id,
						disabled: placed,
						onClick: () => setSel(id),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RelicGlyph, {
								id,
								className: "chip-glyph"
							}),
							ITEMS[id].name,
							placed ? " · 끼움" : ""
						]
					}, id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "spread",
				children: [
					0,
					1,
					2
				].map((socket) => {
					const item = state.sockets[socket];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: item ? "socket is-filled" : "socket",
						"data-socket": socket,
						onClick: () => {
							if (item) {
								dispatch({
									type: "unplace",
									socket
								});
								return;
							}
							if (!sel) {
								dispatch({
									type: "say",
									line: "먼저 세 기둥 중 하나를 고르십시오."
								});
								return;
							}
							dispatch({
								type: "place",
								item: sel,
								socket
							});
							setSel(null);
						},
						children: [item ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RelicGlyph, {
							id: item,
							className: "chip-glyph"
						}) : null, item ? ITEMS[item].name : "빈 홈"]
					}, socket);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "clock-wrap",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockFace, {
						hour: state.hour,
						minute: state.minute,
						numerals: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: midnight ? "time-readout is-midnight" : "time-readout",
						children: [
							state.hour,
							"시 ",
							String(state.minute).padStart(2, "0"),
							"분"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "stepper",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "icon-btn",
									"aria-label": "시침 뒤로",
									"data-hour": "prev",
									onClick: () => dispatch({
										type: "hour",
										delta: -1
									}),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "시" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "icon-btn",
									"aria-label": "시침 앞으로",
									"data-hour": "next",
									onClick: () => dispatch({
										type: "hour",
										delta: 1
									}),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "stepper",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "icon-btn",
									"aria-label": "분침 뒤로",
									"data-minute": "prev",
									onClick: () => dispatch({
										type: "minute",
										delta: -5
									}),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "분" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "icon-btn",
									"aria-label": "분침 앞으로",
									"data-minute": "next",
									onClick: () => dispatch({
										type: "minute",
										delta: 5
									}),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-gold",
						"data-handle": true,
						onClick: () => dispatch({ type: "handle" }),
						children: "손잡이를 돌린다"
					})
				]
			})
		]
	});
}
function Journal({ state, dispatch }) {
	const hintHere = state.hints[state.room] ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "stack",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "btn btn-ghost",
				"data-next-hint": true,
				onClick: () => dispatch({ type: "hint" }),
				children: [
					"힌트 받기 (",
					hintHere,
					"/3)"
				]
			}),
			state.clues.length === 0 && state.hints.every((count) => count === 0) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "prose muted",
				children: "아직 기록된 단서가 없다. 방 안의 그림을 눌러 읽으십시오."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "clue-list",
				children: state.clues.map((id) => {
					const clue = CLUES[id];
					if (!clue) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "clue-entry",
						children: [clue.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: clue.image,
							alt: "",
							className: "clue-thumb"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "clue-thumb clue-thumb-blank" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display font-semibold",
							children: clue.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "prose muted",
							children: clue.body
						})] })]
					}, id);
				})
			}),
			ROOMS.map((room, index) => (state.hints[index] ?? 0) > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "font-display font-semibold",
				children: [
					room.numeral,
					" ",
					room.name
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "hint-list",
				children: room.hints.slice(0, state.hints[index]).map((hint) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "prose",
					children: hint
				}, hint))
			})] }, room.id) : null)
		]
	});
}
function Menu$1({ state, dispatch, onTitle, onReset }) {
	const [confirm, setConfirm] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "menu-block",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "btn btn-ghost",
				onClick: () => dispatch({ type: "mute" }),
				children: state.muted ? "소리 켜기" : "소리 끄기"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "btn btn-ghost",
				onClick: () => dispatch({ type: "reset-room" }),
				children: "이 방 되돌리기"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "btn btn-ghost",
				onClick: onTitle,
				children: "현관으로"
			}),
			confirm ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "stack",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "prose",
					children: "지금까지의 방과 표식이 사라집니다."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-gold",
						"data-reset": true,
						onClick: onReset,
						children: "지운다"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-ghost",
						onClick: () => setConfirm(false),
						children: "남긴다"
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "btn btn-ghost",
				onClick: () => setConfirm(true),
				children: "처음부터"
			})
		]
	});
}
function RoomSheets({ panel, state, dispatch, onClose, onTitle, onReset }) {
	if (!panel) return null;
	const room = ROOMS[state.room];
	const spot = room?.hotspots.find((entry) => entry.id === panel);
	let title = "살펴보기";
	let body = null;
	if (panel === "journal") {
		title = "일지";
		body = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Journal, {
			state,
			dispatch
		});
	} else if (panel === "menu") {
		title = "메뉴";
		body = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu$1, {
			state,
			dispatch,
			onTitle,
			onReset
		});
	} else if (spot?.action === "clue" && spot.clue && CLUES[spot.clue]) {
		title = CLUES[spot.clue]?.title ?? spot.label;
		body = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClueCard, { id: spot.clue });
	} else if (spot?.action === "puzzle" && spot.puzzle) {
		const puzzle = PUZZLES[spot.puzzle];
		title = spot.label;
		if (puzzle?.kind === "sequence") body = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SequenceSheet, {
			puzzle,
			state,
			dispatch
		});
		else if (puzzle?.kind === "dials") body = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialSheet, {
			puzzle,
			state,
			dispatch
		});
	} else if (spot?.action === "take" && room?.relic) {
		const relic = room.relic;
		const copy = TAKE_COPY[relic];
		title = spot.label;
		body = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TakeItem, {
			ready: Boolean(room.puzzle && state.solved[room.puzzle]),
			owned: owns(state, relic),
			locked: copy.locked,
			readyText: copy.ready,
			item: relic,
			dispatch
		});
	} else if (spot?.action === "finale") {
		title = "철문의 장치";
		body = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Finale, {
			state,
			dispatch
		});
	} else body = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "prose",
		children: "아무것도 없다."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		title,
		onClose,
		children: body
	});
}
function focusOffset(frameW, max, focus) {
	const view = frameW - max;
	const target = focus * frameW - view / 2;
	return Math.min(max, Math.max(0, target));
}
function EscapeApp() {
	const [state, setState] = (0, import_react.useState)(INITIAL);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const [mode, setMode] = (0, import_react.useState)("title");
	const [panel, setPanel] = (0, import_react.useState)(null);
	const [curtain, setCurtain] = (0, import_react.useState)(null);
	const [shakeOn, setShakeOn] = (0, import_react.useState)(false);
	const [burst, setBurst] = (0, import_react.useState)(0);
	const [photoIn, setPhotoIn] = (0, import_react.useState)(false);
	const [panHint, setPanHint] = (0, import_react.useState)(true);
	const stateRef = (0, import_react.useRef)(state);
	const curtainRef = (0, import_react.useRef)(false);
	const photoRef = (0, import_react.useRef)(null);
	const wrapRef = (0, import_react.useRef)(null);
	const frameRef = (0, import_react.useRef)({
		w: 0,
		h: 0,
		maxX: 0,
		maxY: 0
	});
	const [frame, setFrame] = (0, import_react.useState)(frameRef.current);
	const [offset, setOffset] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const dragRef = (0, import_react.useRef)({
		id: -1,
		x: 0,
		y: 0,
		ox: 0,
		oy: 0,
		moved: false
	});
	const panMoved = (0, import_react.useRef)(false);
	stateRef.current = state;
	const room = ROOMS[state.room] ?? ROOMS[0];
	(0, import_react.useEffect)(() => {
		setState(loadState());
		setHydrated(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		saveState(state);
	}, [state, hydrated]);
	(0, import_react.useEffect)(() => {
		for (const entry of ROOMS) {
			const image = new Image();
			image.src = entry.image;
		}
		const exterior = new Image();
		exterior.src = "/art/exterior.jpg";
	}, []);
	(0, import_react.useEffect)(() => {
		if (mode !== "play") return;
		setScene(room?.id ?? "parlor");
	}, [mode, room?.id]);
	(0, import_react.useEffect)(() => {
		setPhotoIn(false);
		const image = photoRef.current;
		if (image && image.complete && image.naturalWidth > 0) setPhotoIn(true);
	}, [room?.image]);
	(0, import_react.useLayoutEffect)(() => {
		const el = wrapRef.current;
		if (!el || mode !== "play") return;
		const measure = () => {
			const width = el.clientWidth;
			const height = el.clientHeight;
			const scale = Math.max(width / 16, height / 9);
			const w = 16 * scale;
			const h = 9 * scale;
			const next = {
				w,
				h,
				maxX: Math.max(0, w - width),
				maxY: Math.max(0, h - height)
			};
			frameRef.current = next;
			setFrame(next);
			return next;
		};
		const next = measure();
		const focus = room?.focus ?? .5;
		setOffset({
			x: focusOffset(next.w, next.maxX, focus),
			y: next.maxY / 2
		});
		const observer = new ResizeObserver(() => {
			const sized = measure();
			setOffset((prev) => ({
				x: Math.min(sized.maxX, Math.max(0, prev.x)),
				y: Math.min(sized.maxY, Math.max(0, prev.y))
			}));
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, [room?.id, mode]);
	(0, import_react.useEffect)(() => {
		if (!curtain) return;
		const timer = window.setTimeout(() => finishCurtain(), 1700);
		return () => window.clearTimeout(timer);
	}, [curtain]);
	function finishCurtain() {
		curtainRef.current = false;
		const escaped = stateRef.current.escaped;
		setCurtain(null);
		if (escaped) setMode("ending");
	}
	function dispatch(action) {
		if (curtainRef.current && action.type !== "mute") return;
		unlock();
		const result = reduce(stateRef.current, action);
		stateRef.current = result.state;
		setState(result.state);
		if (action.type === "mute") applyMuted(result.state.muted);
		if (result.fx === "tick") playTick();
		if (result.fx === "fail") {
			playFail();
			setShakeOn(false);
			requestAnimationFrame(() => setShakeOn(true));
		}
		if (result.fx === "success" || result.fx === "take") {
			if (result.fx === "success") playSuccess();
			else playTake();
			setBurst((value) => value + 1);
		}
		if (result.fx === "advance") {
			playDoor();
			curtainRef.current = true;
			setCurtain(ROOMS[result.state.room] ?? null);
			setPanel(null);
		}
		if (result.fx === "escape") {
			playEscape();
			curtainRef.current = true;
			setCurtain(ROOMS[ROOMS.length - 1] ?? null);
			setPanel(null);
		}
	}
	function beginAudio() {
		unlock();
		startDrone();
		setScene(ROOMS[stateRef.current.room]?.id ?? "parlor");
		applyMuted(stateRef.current.muted);
	}
	function onHotspot(spot) {
		if (curtainRef.current || panMoved.current) return;
		if (spot.action === "door") {
			dispatch({ type: "next" });
			return;
		}
		if (spot.action === "clue" && spot.clue) dispatch({
			type: "clue",
			id: spot.clue
		});
		setPanel(spot.id);
	}
	function clampOffset(x, y) {
		const box = frameRef.current;
		return {
			x: Math.min(box.maxX, Math.max(0, x)),
			y: Math.min(box.maxY, Math.max(0, y))
		};
	}
	if (!room) return null;
	if (mode === "ending") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ending, {
		onAgain: () => {
			beginAudio();
			dispatch({ type: "start" });
			setPanel(null);
			setMode("play");
		},
		onTitle: () => {
			dispatch({ type: "reset" });
			setMode("title");
		}
	});
	if (mode === "title") {
		const canContinue = hydrated && state.started && !state.escaped;
		const sawEnding = hydrated && state.escaped;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, {
			canContinue,
			sawEnding,
			onStart: () => {
				beginAudio();
				dispatch({ type: "start" });
				setPanel(null);
				setMode("play");
			},
			onContinue: () => {
				beginAudio();
				setMode("play");
			},
			onReplay: () => setMode("ending")
		});
	}
	const line = state.line || room.intro;
	const held = heldItems(state);
	const hintCount = state.hints[state.room] ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "play-shell",
		"data-screen": "play",
		"data-room": room.id,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: wrapRef,
				className: "stage-wrap",
				onPointerDown: (event) => {
					if (event.button !== 0) return;
					panMoved.current = false;
					dragRef.current = {
						id: event.pointerId,
						x: event.clientX,
						y: event.clientY,
						ox: offset.x,
						oy: offset.y,
						moved: false
					};
				},
				onPointerMove: (event) => {
					const drag = dragRef.current;
					if (drag.id !== event.pointerId) return;
					const dx = event.clientX - drag.x;
					const dy = event.clientY - drag.y;
					if (!drag.moved && Math.hypot(dx, dy) > 8) {
						drag.moved = true;
						event.currentTarget.setPointerCapture(event.pointerId);
					}
					if (!drag.moved) return;
					setPanHint(false);
					setOffset(clampOffset(drag.ox - dx, drag.oy - dy));
				},
				onPointerUp: (event) => {
					const drag = dragRef.current;
					if (drag.id !== event.pointerId) return;
					panMoved.current = drag.moved;
					dragRef.current = {
						...drag,
						id: -1
					};
				},
				onPointerCancel: () => {
					dragRef.current = {
						id: -1,
						x: 0,
						y: 0,
						ox: 0,
						oy: 0,
						moved: false
					};
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: shakeOn ? "stage-frame is-shake" : "stage-frame",
						style: {
							width: frame.w || "100%",
							height: frame.h || "100%",
							transform: `translate3d(${-offset.x}px, ${-offset.y}px, 0)`
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								ref: photoRef,
								src: room.image,
								alt: "",
								className: photoIn ? shakeOn ? "room-photo is-in is-shake" : "room-photo is-in" : "room-photo",
								onLoad: () => setPhotoIn(true),
								onAnimationEnd: (event) => {
									if (event.animationName === "manor-shake") setShakeOn(false);
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `wash wash-${room.id}` }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dust, { burst }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "vignette" }),
							room.hotspots.map((hotspot) => {
								const live = hotspotLive(hotspot, state) || hotspot.action === "door" && canLeave(state);
								const above = hotspot.y > 64;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: `hotspot hotspot-art${live ? " is-live" : ""}${above ? " hotspot-above" : ""}`,
									style: {
										left: `${hotspot.x}%`,
										top: `${hotspot.y}%`
									},
									"data-hotspot": hotspot.action === "puzzle" ? hotspot.puzzle : hotspot.action === "clue" ? hotspot.clue : hotspot.action,
									"aria-label": hotspot.label,
									onClick: () => onHotspot(hotspot),
									children: [hotspot.action === "clue" && hotspot.clue ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClueThumb, { id: hotspot.clue }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpotThumb, { hotspot }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hotspot-label",
										children: hotspot.label
									})]
								}, hotspot.id);
							})
						]
					}),
					offset.x > 12 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pan-edge pan-left" }) : null,
					frame.maxX - offset.x > 12 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pan-edge pan-right" }) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "hud",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hud-copy",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "room-kicker",
							children: [
								room.numeral,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: " / X" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "room-sub",
									children: [" · ", room.subtitle]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "room-name font-display font-semibold",
							children: room.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "objective",
							children: room.objective
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "trail",
							"aria-hidden": true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${(state.room + 1) / ROOMS.length * 100}%` } })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hud-actions",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-btn",
							"aria-label": "일지",
							onClick: () => setPanel("journal"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-btn",
							"aria-label": `힌트 ${hintCount} / 3`,
							onClick: () => dispatch({ type: "hint" }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: state.muted ? "icon-btn" : "icon-btn is-on",
							"aria-label": state.muted ? "소리 켜기" : "소리 끄기",
							onClick: () => {
								unlock();
								dispatch({ type: "mute" });
								applyMuted(stateRef.current.muted);
							},
							children: state.muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-btn",
							"aria-label": "메뉴",
							onClick: () => setPanel("menu"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
						})
					]
				})]
			}),
			panHint && frame.maxX > 48 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pan-hint",
				children: "화면을 밀어 방을 살피세요"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "dock",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "narrator",
					"aria-live": "polite",
					children: line
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relic-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "relic-count",
						children: [held.length, "/9"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inventory",
						"aria-label": "표식",
						children: [held.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "relic-empty",
							children: "아직 표식이 없다"
						}) : null, held.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "slot",
							onClick: () => dispatch({
								type: "inspect-item",
								item
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RelicGlyph, {
								id: item,
								className: "slot-glyph"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ITEMS[item].name })]
						}, item))]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomSheets, {
				panel,
				state,
				dispatch,
				onClose: () => setPanel(null),
				onTitle: () => {
					setPanel(null);
					setMode("title");
				},
				onReset: () => {
					dispatch({ type: "reset" });
					setPanel(null);
					setMode("title");
				}
			}),
			curtain ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "curtain-layer",
				onAnimationEnd: (event) => {
					if (event.animationName === "curtain-cycle") finishCurtain();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: curtain.numeral
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display font-semibold",
						children: curtain.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "muted",
						children: curtain.subtitle
					})
				]
			}) : null
		]
	});
}
function Title({ canContinue, sawEnding, onStart, onContinue, onReplay }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "title-screen",
		"data-screen": "title",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				className: "title-photo",
				src: "/art/exterior.jpg",
				alt: ""
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "title-scrim" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "title-copy",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Midnight Manor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "title-name font-display font-semibold",
						children: "심야의 저택"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "deck",
						children: "눈이 떠진 곳은 잠긴 저택이다. 열 개의 방이 자정을 기다리고, 방마다 남긴 표식이 시계탑의 문을 연다."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "steps",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "step-n",
								children: "1"
							}), "방 안의 그림을 눌러 살핀다"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "step-n",
								children: "2"
							}), "방마다 하나의 순서를 맞춘다"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "step-n",
								children: "3"
							}), "표식을 챙겨 다음 문으로"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "step-n",
								children: "4"
							}), "아홉 표식과 자정으로 탈출"] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "title-actions",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-gold",
								"data-start": true,
								onClick: onStart,
								children: "저택에 든다"
							}),
							canContinue ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-ghost",
								"data-continue": true,
								onClick: onContinue,
								children: "이어하기"
							}) : null,
							sawEnding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-ghost",
								onClick: onReplay,
								children: "지난 탈출"
							}) : null
						]
					})
				]
			})
		]
	});
}
function Ending({ onAgain, onTitle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "title-screen",
		"data-screen": "ending",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				className: "title-photo",
				src: "/art/tower.jpg",
				alt: ""
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ending-scrim" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "title-copy",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Midnight"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "title-name font-display font-semibold",
						children: "자정"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "deck",
						children: "문이 열리자 차가운 공기가 들어왔다. 밀랍에서 흑요석까지, 아홉 개의 표식이 한 박자로 맞물렸고, 저택은 당신을 놓아주었다."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "timeline",
						children: ROOMS.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "step-n",
							children: entry.numeral
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [entry.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "muted",
							children: [" · ", entry.subtitle]
						})] })] }, entry.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "title-actions",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-gold",
							"data-again": true,
							onClick: onAgain,
							children: "다시 갇히기"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-ghost",
							onClick: onTitle,
							children: "현관으로"
						})]
					})
				]
			})
		]
	});
}
var SplitComponent = EscapeApp;
//#endregion
export { SplitComponent as component };
