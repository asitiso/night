import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BookOpen, Lightbulb, Menu, Volume2, VolumeX } from "lucide-react";
import { ITEMS, ROOMS, type Hotspot } from "@/game/content";
import {
  canLeave,
  heldItems,
  hotspotLive,
  INITIAL,
  loadState,
  reduce,
  saveState,
  type Action,
  type GameState,
} from "@/game/logic";
import * as audio from "@/game/audio";
import { Dust } from "@/components/escape/Dust";
import { RoomSheets } from "@/components/escape/Panels";
import { ClueThumb, SpotThumb } from "@/components/escape/ClueArt";
import { RelicGlyph } from "@/components/escape/Relics";

type Mode = "title" | "play" | "ending";

function focusOffset(frameW: number, max: number, focus: number) {
  const view = frameW - max;
  const target = focus * frameW - view / 2;
  return Math.min(max, Math.max(0, target));
}

export function EscapeApp() {
  const [state, setState] = useState<GameState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<Mode>("title");
  const [panel, setPanel] = useState<string | null>(null);
  const [curtain, setCurtain] = useState<(typeof ROOMS)[number] | null>(null);
  const [shakeOn, setShakeOn] = useState(false);
  const [burst, setBurst] = useState(0);
  const [photoIn, setPhotoIn] = useState(false);
  const [panHint, setPanHint] = useState(true);
  const stateRef = useRef(state);
  const curtainRef = useRef(false);
  const photoRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef({ w: 0, h: 0, maxX: 0, maxY: 0 });
  const [frame, setFrame] = useState(frameRef.current);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ id: -1, x: 0, y: 0, ox: 0, oy: 0, moved: false });
  const panMoved = useRef(false);
  stateRef.current = state;

  const room = ROOMS[state.room] ?? ROOMS[0];

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  useEffect(() => {
    for (const entry of ROOMS) {
      const image = new Image();
      image.src = entry.image;
    }
    const exterior = new Image();
    exterior.src = "/art/exterior.jpg";
  }, []);

  useEffect(() => {
    if (mode !== "play") return;
    audio.setScene(room?.id ?? "parlor");
  }, [mode, room?.id]);

  useEffect(() => {
    setPhotoIn(false);
    const image = photoRef.current;
    if (image && image.complete && image.naturalWidth > 0) setPhotoIn(true);
  }, [room?.image]);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el || mode !== "play") return;
    const measure = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      const scale = Math.max(width / 16, height / 9);
      const w = 16 * scale;
      const h = 9 * scale;
      const maxX = Math.max(0, w - width);
      const maxY = Math.max(0, h - height);
      const next = { w, h, maxX, maxY };
      frameRef.current = next;
      setFrame(next);
      return next;
    };
    const next = measure();
    const focus = room?.focus ?? 0.5;
    setOffset({
      x: focusOffset(next.w, next.maxX, focus),
      y: next.maxY / 2,
    });
    const observer = new ResizeObserver(() => {
      const sized = measure();
      setOffset((prev) => ({
        x: Math.min(sized.maxX, Math.max(0, prev.x)),
        y: Math.min(sized.maxY, Math.max(0, prev.y)),
      }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [room?.id, mode]);

  useEffect(() => {
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

  function dispatch(action: Action) {
    if (curtainRef.current && action.type !== "mute") return;
    audio.unlock();
    const result = reduce(stateRef.current, action);
    stateRef.current = result.state;
    setState(result.state);
    if (action.type === "mute") audio.applyMuted(result.state.muted);
    if (result.fx === "tick") audio.playTick();
    if (result.fx === "fail") {
      audio.playFail();
      setShakeOn(false);
      requestAnimationFrame(() => setShakeOn(true));
    }
    if (result.fx === "success" || result.fx === "take") {
      if (result.fx === "success") audio.playSuccess();
      else audio.playTake();
      setBurst((value) => value + 1);
    }
    if (result.fx === "advance") {
      audio.playDoor();
      curtainRef.current = true;
      setCurtain(ROOMS[result.state.room] ?? null);
      setPanel(null);
    }
    if (result.fx === "escape") {
      audio.playEscape();
      curtainRef.current = true;
      setCurtain(ROOMS[ROOMS.length - 1] ?? null);
      setPanel(null);
    }
  }

  function beginAudio() {
    audio.unlock();
    audio.startDrone();
    audio.setScene(ROOMS[stateRef.current.room]?.id ?? "parlor");
    audio.applyMuted(stateRef.current.muted);
  }

  function onHotspot(spot: Hotspot) {
    if (curtainRef.current || panMoved.current) return;
    if (spot.action === "door") {
      dispatch({ type: "next" });
      return;
    }
    if (spot.action === "clue" && spot.clue) dispatch({ type: "clue", id: spot.clue });
    setPanel(spot.id);
  }

  function clampOffset(x: number, y: number) {
    const box = frameRef.current;
    return {
      x: Math.min(box.maxX, Math.max(0, x)),
      y: Math.min(box.maxY, Math.max(0, y)),
    };
  }

  if (!room) return null;

  if (mode === "ending") {
    return (
      <Ending
        onAgain={() => {
          beginAudio();
          dispatch({ type: "start" });
          setPanel(null);
          setMode("play");
        }}
        onTitle={() => {
          dispatch({ type: "reset" });
          setMode("title");
        }}
      />
    );
  }

  if (mode === "title") {
    const canContinue = hydrated && state.started && !state.escaped;
    const sawEnding = hydrated && state.escaped;
    return (
      <Title
        canContinue={canContinue}
        sawEnding={sawEnding}
        onStart={() => {
          beginAudio();
          dispatch({ type: "start" });
          setPanel(null);
          setMode("play");
        }}
        onContinue={() => {
          beginAudio();
          setMode("play");
        }}
        onReplay={() => setMode("ending")}
      />
    );
  }

  const line = state.line || room.intro;
  const held = heldItems(state);
  const hintCount = state.hints[state.room] ?? 0;

  return (
    <div className="play-shell" data-screen="play" data-room={room.id}>
      <div
        ref={wrapRef}
        className="stage-wrap"
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          panMoved.current = false;
          dragRef.current = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            ox: offset.x,
            oy: offset.y,
            moved: false,
          };
        }}
        onPointerMove={(event) => {
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
        }}
        onPointerUp={(event) => {
          const drag = dragRef.current;
          if (drag.id !== event.pointerId) return;
          panMoved.current = drag.moved;
          dragRef.current = { ...drag, id: -1 };
        }}
        onPointerCancel={() => {
          dragRef.current = { id: -1, x: 0, y: 0, ox: 0, oy: 0, moved: false };
        }}
      >
        <div
          className={shakeOn ? "stage-frame is-shake" : "stage-frame"}
          style={{
            width: frame.w || "100%",
            height: frame.h || "100%",
            transform: `translate3d(${-offset.x}px, ${-offset.y}px, 0)`,
          }}
        >
          <img
            ref={photoRef}
            src={room.image}
            alt=""
            className={photoIn ? (shakeOn ? "room-photo is-in is-shake" : "room-photo is-in") : "room-photo"}
            onLoad={() => setPhotoIn(true)}
            onAnimationEnd={(event) => {
              if (event.animationName === "manor-shake") setShakeOn(false);
            }}
          />
          <div className={`wash wash-${room.id}`} />
          <Dust burst={burst} />
          <div className="vignette" />
          {room.hotspots.map((hotspot) => {
            const live = hotspotLive(hotspot, state) || (hotspot.action === "door" && canLeave(state));
            const above = hotspot.y > 64;
            return (
              <button
                key={hotspot.id}
                type="button"
                className={`hotspot hotspot-art${live ? " is-live" : ""}${above ? " hotspot-above" : ""}`}
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                data-hotspot={hotspot.action === "puzzle" ? hotspot.puzzle : hotspot.action === "clue" ? hotspot.clue : hotspot.action}
                aria-label={hotspot.label}
                onClick={() => onHotspot(hotspot)}
              >
                {hotspot.action === "clue" && hotspot.clue ? (
                  <ClueThumb id={hotspot.clue} />
                ) : (
                  <SpotThumb hotspot={hotspot} />
                )}
                <span className="hotspot-label">{hotspot.label}</span>
              </button>
            );
          })}
        </div>
        {offset.x > 12 ? <div className="pan-edge pan-left" /> : null}
        {frame.maxX - offset.x > 12 ? <div className="pan-edge pan-right" /> : null}
      </div>

      <header className="hud">
        <div className="hud-copy">
          <p className="room-kicker">
            {room.numeral}
            <span> / X</span>
            <span className="room-sub"> · {room.subtitle}</span>
          </p>
          <h1 className="room-name font-display font-semibold">{room.name}</h1>
          <p className="objective">{room.objective}</p>
          <div className="trail" aria-hidden>
            <span style={{ width: `${((state.room + 1) / ROOMS.length) * 100}%` }} />
          </div>
        </div>
        <div className="hud-actions">
          <button type="button" className="icon-btn" aria-label="일지" onClick={() => setPanel("journal")}>
            <BookOpen className="size-5" />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label={`힌트 ${hintCount} / 3`}
            onClick={() => dispatch({ type: "hint" })}
          >
            <Lightbulb className="size-5" />
          </button>
          <button
            type="button"
            className={state.muted ? "icon-btn" : "icon-btn is-on"}
            aria-label={state.muted ? "소리 켜기" : "소리 끄기"}
            onClick={() => {
              audio.unlock();
              dispatch({ type: "mute" });
              audio.applyMuted(stateRef.current.muted);
            }}
          >
            {state.muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>
          <button type="button" className="icon-btn" aria-label="메뉴" onClick={() => setPanel("menu")}>
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {panHint && frame.maxX > 48 ? <p className="pan-hint">화면을 밀어 방을 살피세요</p> : null}

      <footer className="dock">
        <p className="narrator" aria-live="polite">
          {line}
        </p>
        <div className="relic-row">
          <span className="relic-count">{held.length}/9</span>
          <div className="inventory" aria-label="표식">
            {held.length === 0 ? <span className="relic-empty">아직 표식이 없다</span> : null}
            {held.map((item) => (
              <button key={item} type="button" className="slot" onClick={() => dispatch({ type: "inspect-item", item })}>
                <RelicGlyph id={item} className="slot-glyph" />
                <span>{ITEMS[item].name}</span>
              </button>
            ))}
          </div>
        </div>
      </footer>

      <RoomSheets
        panel={panel}
        state={state}
        dispatch={dispatch}
        onClose={() => setPanel(null)}
        onTitle={() => {
          setPanel(null);
          setMode("title");
        }}
        onReset={() => {
          dispatch({ type: "reset" });
          setPanel(null);
          setMode("title");
        }}
      />

      {curtain ? (
        <div
          className="curtain-layer"
          onAnimationEnd={(event) => {
            if (event.animationName === "curtain-cycle") finishCurtain();
          }}
        >
          <p className="eyebrow">{curtain.numeral}</p>
          <h2 className="font-display font-semibold">{curtain.name}</h2>
          <p className="muted">{curtain.subtitle}</p>
        </div>
      ) : null}
    </div>
  );
}

function Title({
  canContinue,
  sawEnding,
  onStart,
  onContinue,
  onReplay,
}: {
  canContinue: boolean;
  sawEnding: boolean;
  onStart: () => void;
  onContinue: () => void;
  onReplay: () => void;
}) {
  return (
    <main className="title-screen" data-screen="title">
      <img className="title-photo" src="/art/exterior.jpg" alt="" />
      <div className="title-scrim" />
      <div className="title-copy">
        <p className="eyebrow">Midnight Manor</p>
        <h1 className="title-name font-display font-semibold">심야의 저택</h1>
        <p className="deck">
          눈이 떠진 곳은 잠긴 저택이다. 열 개의 방이 자정을 기다리고, 방마다 남긴 표식이
          시계탑의 문을 연다.
        </p>
        <ol className="steps">
          <li>
            <span className="step-n">1</span>방 안의 그림을 눌러 살핀다
          </li>
          <li>
            <span className="step-n">2</span>방마다 하나의 순서를 맞춘다
          </li>
          <li>
            <span className="step-n">3</span>표식을 챙겨 다음 문으로
          </li>
          <li>
            <span className="step-n">4</span>아홉 표식과 자정으로 탈출
          </li>
        </ol>
        <div className="title-actions">
          <button type="button" className="btn btn-gold" data-start onClick={onStart}>
            저택에 든다
          </button>
          {canContinue ? (
            <button type="button" className="btn btn-ghost" data-continue onClick={onContinue}>
              이어하기
            </button>
          ) : null}
          {sawEnding ? (
            <button type="button" className="btn btn-ghost" onClick={onReplay}>
              지난 탈출
            </button>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function Ending({ onAgain, onTitle }: { onAgain: () => void; onTitle: () => void }) {
  return (
    <main className="title-screen" data-screen="ending">
      <img className="title-photo" src="/art/tower.jpg" alt="" />
      <div className="ending-scrim" />
      <div className="title-copy">
        <p className="eyebrow">Midnight</p>
        <h1 className="title-name font-display font-semibold">자정</h1>
        <p className="deck">
          문이 열리자 차가운 공기가 들어왔다. 밀랍에서 흑요석까지, 아홉 개의 표식이 한 박자로
          맞물렸고, 저택은 당신을 놓아주었다.
        </p>
        <ol className="timeline">
          {ROOMS.map((entry) => (
            <li key={entry.id}>
              <span className="step-n">{entry.numeral}</span>
              <span>
                {entry.name}
                <span className="muted"> · {entry.subtitle}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="title-actions">
          <button type="button" className="btn btn-gold" data-again onClick={onAgain}>
            다시 갇히기
          </button>
          <button type="button" className="btn btn-ghost" onClick={onTitle}>
            현관으로
          </button>
        </div>
      </div>
    </main>
  );
}
