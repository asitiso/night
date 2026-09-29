import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import {
  ANCHORS,
  CLUES,
  ITEM_IDS,
  ITEMS,
  PUZZLES,
  ROOMS,
  type DialPuzzle,
  type ItemId,
  type Piece,
  type SequencePuzzle,
} from "@/game/content";
import { locksClear, owns, type Action, type GameState } from "@/game/logic";
import { ClueCard, ClockFace } from "@/components/escape/ClueArt";
import { RelicGlyph } from "@/components/escape/Relics";

type Dispatch = (action: Action) => void;

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
  }, [title]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="sheet-scrim" onMouseDown={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="sheet-bar">
          <h2 id="sheet-title" className="sheet-title font-display font-semibold">
            {title}
          </h2>
          <button ref={closeRef} type="button" className="icon-btn" aria-label="닫기" onClick={onClose}>
            <X className="size-5" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

function PieceFace({ piece, on }: { piece: Piece; on: boolean }) {
  if (piece.art) {
    return <img src={piece.art} alt="" className={`piece-photo${on ? " is-lit" : ""}`} />;
  }
  if (piece.kind === "candle") {
    return (
      <span className="candle-stage">
        <span className="flame" style={on ? undefined : { visibility: "hidden" }} aria-hidden />
        <span className={`wax ${piece.tone}`} />
        <span className="wax-base" />
      </span>
    );
  }
  if (piece.kind === "book") {
    return (
      <span className="book-stars">
        {piece.stars === 0 ? (
          <span className="book-caption">별 없음</span>
        ) : (
          Array.from({ length: piece.stars ?? 0 }, (_, index) => (
            <Star key={index} className="size-3" fill="currentColor" aria-hidden />
          ))
        )}
      </span>
    );
  }
  if (piece.kind === "goblet") {
    return (
      <span className={`goblet tone-${piece.tone}`}>
        <span className="goblet-bowl">
          <span className="goblet-fill" />
        </span>
        <span className="goblet-stem" />
        <span className="goblet-foot" />
      </span>
    );
  }
  if (piece.kind === "portrait") {
    return (
      <span className={`portrait-card tone-${piece.tone}`}>
        <span className="portrait-bust" />
        <span className="portrait-year">{piece.label}</span>
      </span>
    );
  }
  if (piece.kind === "moon") {
    return <span className={`moon moon-${piece.tone}`} />;
  }
  if (piece.kind === "cask") {
    return (
      <span className="cask-body">
        <span className="cask-band" />
        <span className="cask-drops">
          {Array.from({ length: piece.drops ?? 0 }, (_, index) => (
            <i key={index} />
          ))}
        </span>
      </span>
    );
  }
  return <span className={`lancet lancet-${piece.tone}`} />;
}

function SequenceSheet({
  puzzle,
  state,
  dispatch,
}: {
  puzzle: SequencePuzzle;
  state: GameState;
  dispatch: Dispatch;
}) {
  const progress = state.seq[puzzle.id] ?? [];
  const solved = Boolean(state.solved[puzzle.id]);
  return (
    <div className="stack">
      <p className="prose muted">{puzzle.prompt}</p>
      <div className="spread">
        {puzzle.pieces.map((piece) => {
          const step = progress.indexOf(piece.id);
          const on = solved || step >= 0;
          const photo = Boolean(piece.art);
          return (
            <button
              key={piece.id}
              type="button"
              className={
                photo
                  ? `piece piece-photo-btn${on ? " is-on" : ""}`
                  : piece.kind === "book"
                    ? on
                      ? `book ${piece.tone} is-picked`
                      : `book ${piece.tone}`
                    : on
                      ? `piece piece-${piece.kind} is-on`
                      : `piece piece-${piece.kind}`
              }
              data-piece={piece.id}
              aria-label={piece.label}
              onClick={() => dispatch({ type: "seq", puzzle: puzzle.id, id: piece.id })}
            >
              {on ? <span className="step-badge">{step + 1}</span> : null}
              <PieceFace piece={piece} on={on} />
              {puzzle.quiet ? null : <span className="piece-label">{piece.label}</span>}
            </button>
          );
        })}
      </div>
      <p className="prose">{solved ? puzzle.success : `${progress.length} / ${puzzle.order.length}`}</p>
    </div>
  );
}

function DialSheet({
  puzzle,
  state,
  dispatch,
}: {
  puzzle: DialPuzzle;
  state: GameState;
  dispatch: Dispatch;
}) {
  const [turned, setTurned] = useState<number | null>(null);
  const values = state.dials[puzzle.id] ?? puzzle.solution.map(() => 0);
  const solved = Boolean(state.solved[puzzle.id]);
  const numeric = puzzle.faces.length === 0;
  return (
    <div className="stack">
      {puzzle.image ? <img src={puzzle.image} alt="" className="puzzle-plate" /> : null}
      <p className="prose muted">{puzzle.prompt}</p>
      <div className="spread">
        {puzzle.solution.map((_, index) => {
          const value = values[index] ?? 0;
          if (numeric) {
            return (
              <button
                key={index}
                type="button"
                className={turned === index ? "wheel is-turn" : "wheel"}
                data-dial={index}
                aria-label={`${index + 1}번째 다이얼, ${value}`}
                onClick={() => {
                  setTurned(index);
                  dispatch({ type: "dial", puzzle: puzzle.id, index });
                }}
              >
                <span className="wheel-num">{value}</span>
              </button>
            );
          }
          const face = puzzle.faces[value] ?? puzzle.faces[0];
          return (
            <button
              key={index}
              type="button"
              className={turned === index ? "ring-btn is-turn" : "ring-btn"}
              data-ring={index}
              aria-label={`${index + 1}번째 고리, 현재 ${face?.word ?? ""}`}
              onClick={() => {
                setTurned(index);
                dispatch({ type: "dial", puzzle: puzzle.id, index });
              }}
            >
              {face?.image ? <img src={face.image} alt="" className="ring-photo" /> : <span className="ring-core">{face?.word}</span>}
              {puzzle.quiet ? null : <span className="piece-label">{face?.word}</span>}
            </button>
          );
        })}
      </div>
      {solved ? (
        <p className="prose">{puzzle.success}</p>
      ) : (
        <div className="row">
          <button
            type="button"
            className="btn btn-gold"
            data-confirm-rings={puzzle.id === "rings" ? true : undefined}
            data-confirm-dial={puzzle.id}
            onClick={() => dispatch({ type: "confirm-dial", puzzle: puzzle.id })}
          >
            {puzzle.id === "rings" ? "분수에 맞춘다" : "다이얼을 맞춘다"}
          </button>
        </div>
      )}
    </div>
  );
}

function TakeItem({
  ready,
  owned,
  locked,
  readyText,
  item,
  dispatch,
}: {
  ready: boolean;
  owned: boolean;
  locked: string;
  readyText: string;
  item: ItemId;
  dispatch: Dispatch;
}) {
  return (
    <div className="stack">
      <div className="take-hero">
        <RelicGlyph id={item} className="take-glyph" />
      </div>
      <p className="prose">{owned ? "이미 비어 있다." : ready ? readyText : locked}</p>
      {ready && !owned ? (
        <button type="button" className="btn btn-gold" data-take={item} onClick={() => dispatch({ type: "take", item })}>
          집어 든다
        </button>
      ) : null}
    </div>
  );
}

const TAKE_COPY: Record<ItemId, { locked: string; ready: string }> = {
  wax: {
    locked: "잠겨 있다. 불꽃이 순서를 기억한다.",
    ready: "서랍 안쪽에 아직 따뜻한 밀랍 인장이 있다.",
  },
  cog: {
    locked: "서랍은 닫혀 있다. 책의 순서가 자물쇠다.",
    ready: "밀린 서랍 바닥에 은빛 톱니가 빛난다.",
  },
  emerald: {
    locked: "수면이 검다. 고리의 문양이 물을 가두고 있다.",
    ready: "갈라진 물 아래, 에메랄드 파편이 손끝에 닿는다.",
  },
  cuff: {
    locked: "의자 틈은 어둡다. 잔이 아직 순서를 모른다.",
    ready: "의자 다리 사이에 루비 커프가 걸려 있다.",
  },
  locket: {
    locked: "진열대는 잠겨 있다. 초상들이 순서를 기다린다.",
    ready: "열린 진열대 안에 금테 로켓이 놓여 있다.",
  },
  pearl: {
    locked: "함은 잠겨 있다. 달이 아직 차지 않았다.",
    ready: "함 안, 달의 진주가 차갑게 빛난다.",
  },
  amber: {
    locked: "선반의 병은 돌아앉지 않았다.",
    ready: "돌아선 병의 입에 호박 마개가 남아 있다.",
  },
  shard: {
    locked: "제단 아래는 차갑다. 유리가 아직 흩어져 있다.",
    ready: "제단 홈에 성창 파편이 따뜻하게 남아 있다.",
  },
  sigil: {
    locked: "함은 잠겨 있다. 다이얼이 수를 거부한다.",
    ready: "열린 함 바닥에 흑요석 인장이 깔려 있다.",
  },
};

function Finale({ state, dispatch }: { state: GameState; dispatch: Dispatch }) {
  const [sel, setSel] = useState<ItemId | null>(null);
  const midnight = state.hour === 12 && state.minute === 0;
  return (
    <div className="stack">
      <p className="prose">아홉 표식을 모은 뒤, 세 기둥을 홈에 끼우고 바늘을 자정에 맞추십시오.</p>
      <div className="relic-board" aria-label="모은 표식">
        {ITEM_IDS.map((id) => (
          <span key={id} className={owns(state, id) ? "relic-pip is-have" : "relic-pip"} title={ITEMS[id].name}>
            <RelicGlyph id={id} className="relic-glyph" />
          </span>
        ))}
      </div>
      <div className="row">
        {ANCHORS.map((id) => {
          if (!owns(state, id)) return null;
          const placed = state.sockets.includes(id);
          return (
            <button
              key={id}
              type="button"
              className={sel === id && !placed ? "chip is-on" : "chip"}
              aria-pressed={sel === id}
              disabled={placed}
              onClick={() => setSel(id)}
            >
              <RelicGlyph id={id} className="chip-glyph" />
              {ITEMS[id].name}
              {placed ? " · 끼움" : ""}
            </button>
          );
        })}
      </div>
      <div className="spread">
        {([0, 1, 2] as const).map((socket) => {
          const item = state.sockets[socket];
          return (
            <button
              key={socket}
              type="button"
              className={item ? "socket is-filled" : "socket"}
              data-socket={socket}
              onClick={() => {
                if (item) {
                  dispatch({ type: "unplace", socket });
                  return;
                }
                if (!sel) {
                  dispatch({ type: "say", line: "먼저 세 기둥 중 하나를 고르십시오." });
                  return;
                }
                dispatch({ type: "place", item: sel, socket });
                setSel(null);
              }}
            >
              {item ? <RelicGlyph id={item} className="chip-glyph" /> : null}
              {item ? ITEMS[item].name : "빈 홈"}
            </button>
          );
        })}
      </div>
      <div className="clock-wrap">
        <ClockFace hour={state.hour} minute={state.minute} numerals />
        <p className={midnight ? "time-readout is-midnight" : "time-readout"}>
          {state.hour}시 {String(state.minute).padStart(2, "0")}분
        </p>
        <div className="row">
          <div className="stepper">
            <button type="button" className="icon-btn" aria-label="시침 뒤로" data-hour="prev" onClick={() => dispatch({ type: "hour", delta: -1 })}>
              <ChevronLeft className="size-5" />
            </button>
            <span>시</span>
            <button type="button" className="icon-btn" aria-label="시침 앞으로" data-hour="next" onClick={() => dispatch({ type: "hour", delta: 1 })}>
              <ChevronRight className="size-5" />
            </button>
          </div>
          <div className="stepper">
            <button type="button" className="icon-btn" aria-label="분침 뒤로" data-minute="prev" onClick={() => dispatch({ type: "minute", delta: -5 })}>
              <ChevronLeft className="size-5" />
            </button>
            <span>분</span>
            <button type="button" className="icon-btn" aria-label="분침 앞으로" data-minute="next" onClick={() => dispatch({ type: "minute", delta: 5 })}>
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
        <button type="button" className="btn btn-gold" data-handle onClick={() => dispatch({ type: "handle" })}>
          손잡이를 돌린다
        </button>
      </div>
    </div>
  );
}

function Journal({ state, dispatch }: { state: GameState; dispatch: Dispatch }) {
  const hintHere = state.hints[state.room] ?? 0;
  return (
    <div className="stack">
      <button type="button" className="btn btn-ghost" data-next-hint onClick={() => dispatch({ type: "hint" })}>
        힌트 받기 ({hintHere}/3)
      </button>
      {state.clues.length === 0 && state.hints.every((count) => count === 0) ? (
        <p className="prose muted">아직 기록된 단서가 없다. 방 안의 그림을 눌러 읽으십시오.</p>
      ) : null}
      <ul className="clue-list">
        {state.clues.map((id) => {
          const clue = CLUES[id];
          if (!clue) return null;
          return (
            <li key={id} className="clue-entry">
              {clue.image ? <img src={clue.image} alt="" className="clue-thumb" /> : <span className="clue-thumb clue-thumb-blank" />}
              <div>
                <h3 className="font-display font-semibold">{clue.title}</h3>
                <p className="prose muted">{clue.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
      {ROOMS.map((room, index) =>
        (state.hints[index] ?? 0) > 0 ? (
          <section key={room.id}>
            <h3 className="font-display font-semibold">
              {room.numeral} {room.name}
            </h3>
            <ul className="hint-list">
              {room.hints.slice(0, state.hints[index]).map((hint) => (
                <li key={hint} className="prose">
                  {hint}
                </li>
              ))}
            </ul>
          </section>
        ) : null,
      )}
    </div>
  );
}

function Menu({
  state,
  dispatch,
  onTitle,
  onReset,
}: {
  state: GameState;
  dispatch: Dispatch;
  onTitle: () => void;
  onReset: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="menu-block">
      <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "mute" })}>
        {state.muted ? "소리 켜기" : "소리 끄기"}
      </button>
      <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "reset-room" })}>
        이 방 되돌리기
      </button>
      <button type="button" className="btn btn-ghost" onClick={onTitle}>
        현관으로
      </button>
      {confirm ? (
        <div className="stack">
          <p className="prose">지금까지의 방과 표식이 사라집니다.</p>
          <div className="row">
            <button type="button" className="btn btn-gold" data-reset onClick={onReset}>
              지운다
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirm(false)}>
              남긴다
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-ghost" onClick={() => setConfirm(true)}>
          처음부터
        </button>
      )}
    </div>
  );
}

export function RoomSheets({
  panel,
  state,
  dispatch,
  onClose,
  onTitle,
  onReset,
}: {
  panel: string | null;
  state: GameState;
  dispatch: Dispatch;
  onClose: () => void;
  onTitle: () => void;
  onReset: () => void;
}) {
  if (!panel) return null;
  const room = ROOMS[state.room];
  const spot = room?.hotspots.find((entry) => entry.id === panel);
  let title = "살펴보기";
  let body: ReactNode = null;

  if (panel === "journal") {
    title = "일지";
    body = <Journal state={state} dispatch={dispatch} />;
  } else if (panel === "menu") {
    title = "메뉴";
    body = <Menu state={state} dispatch={dispatch} onTitle={onTitle} onReset={onReset} />;
  } else if (spot?.action === "clue" && spot.clue && CLUES[spot.clue]) {
    title = CLUES[spot.clue]?.title ?? spot.label;
    body = <ClueCard id={spot.clue} />;
  } else if (spot?.action === "puzzle" && spot.puzzle) {
    const puzzle = PUZZLES[spot.puzzle];
    title = spot.label;
    if (puzzle?.kind === "sequence") body = <SequenceSheet puzzle={puzzle} state={state} dispatch={dispatch} />;
    else if (puzzle?.kind === "dials") body = <DialSheet puzzle={puzzle} state={state} dispatch={dispatch} />;
  } else if (spot?.action === "take" && room?.relic) {
    const relic = room.relic;
    const copy = TAKE_COPY[relic];
    title = spot.label;
    body = (
      <TakeItem
        ready={Boolean(room && locksClear(state, room))}
        owned={owns(state, relic)}
        locked={copy.locked}
        readyText={copy.ready}
        item={relic}
        dispatch={dispatch}
      />
    );
  } else if (spot?.action === "finale") {
    title = "철문의 장치";
    body = <Finale state={state} dispatch={dispatch} />;
  } else {
    body = <p className="prose">아무것도 없다.</p>;
  }

  return (
    <Sheet title={title} onClose={onClose}>
      {body}
    </Sheet>
  );
}
