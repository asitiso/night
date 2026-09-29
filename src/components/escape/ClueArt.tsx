import { CLUES, type CluePlate, type Hotspot } from "@/game/content";

export function ClockFace({
  hour,
  minute,
  numerals,
}: {
  hour: number;
  minute: number;
  numerals: boolean;
}) {
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minuteAngle = minute * 6;
  const romans = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  return (
    <svg className="clock-svg" viewBox="0 0 200 200" aria-hidden>
      <circle cx="100" cy="100" r="96" className="clock-rim" />
      <circle cx="100" cy="100" r="86" className="clock-face" />
      {Array.from({ length: 60 }, (_, index) => {
        const rad = ((index * 6 - 90) * Math.PI) / 180;
        const inner = index % 5 === 0 ? 72 : 78;
        return (
          <line
            key={index}
            x1={100 + Math.cos(rad) * inner}
            y1={100 + Math.sin(rad) * inner}
            x2={100 + Math.cos(rad) * 82}
            y2={100 + Math.sin(rad) * 82}
            stroke="currentColor"
            strokeWidth={index % 5 === 0 ? 2.2 : 0.7}
            opacity={index % 5 === 0 ? 0.9 : 0.35}
          />
        );
      })}
      {numerals
        ? romans.map((label, index) => {
            const rad = ((index * 30 - 90) * Math.PI) / 180;
            return (
              <text
                key={label}
                x={100 + Math.cos(rad) * 58}
                y={100 + Math.sin(rad) * 58}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
                fontSize="11"
                fontFamily="Noto Serif KR, serif"
              >
                {label}
              </text>
            );
          })
        : null}
      <line
        x1="100"
        y1="108"
        x2="100"
        y2="58"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        transform={`rotate(${hourAngle} 100 100)`}
      />
      <line
        x1="100"
        y1="114"
        x2="100"
        y2="36"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        transform={`rotate(${minuteAngle} 100 100)`}
      />
      <circle cx="100" cy="100" r="4.5" fill="currentColor" />
    </svg>
  );
}

function MoonRow() {
  const phases = [
    { id: "new", label: "그믐" },
    { id: "crescent", label: "초승" },
    { id: "half", label: "반달" },
    { id: "full", label: "보름" },
  ];
  return (
    <div className="moon-row" aria-hidden>
      {phases.map((phase, index) => (
        <div key={phase.id} className="moon-step">
          <span className="moon-index">{index + 1}</span>
          <span className={`moon moon-${phase.id}`} />
          <span>{phase.label}</span>
        </div>
      ))}
    </div>
  );
}

function CaskRow() {
  const counts = [7, 5, 3, 1];
  return (
    <div className="cask-row" aria-hidden>
      {counts.map((count, index) => (
        <div key={count} className="cask-step">
          <span className="cask-order">{index + 1}</span>
          <span className="cask-body">
            <span className="cask-band" />
            <span className="cask-drops">
              {Array.from({ length: count }, (_, drop) => (
                <i key={drop} />
              ))}
            </span>
          </span>
          <span>{count}</span>
        </div>
      ))}
    </div>
  );
}

function GlassRow() {
  const panes = [
    { id: "blood", label: "피" },
    { id: "gold", label: "황금" },
    { id: "sky", label: "하늘" },
    { id: "night", label: "어둠" },
  ];
  return (
    <div className="glass-row" aria-hidden>
      {panes.map((pane, index) => (
        <div key={pane.id} className="glass-step">
          <span className="glass-order">{index + 1}</span>
          <span className={`lancet lancet-${pane.id}`} />
          <span>{pane.label}</span>
        </div>
      ))}
    </div>
  );
}

function LineageRow() {
  const years = ["1642", "1711", "1830", "1899"];
  return (
    <ol className="lineage">
      {years.map((year) => (
        <li key={year}>
          <span className="lineage-year">{year}</span>
        </li>
      ))}
    </ol>
  );
}

function BrassMark() {
  return (
    <div className="brass-plate" aria-hidden>
      <span>VII</span>
      <i />
      <span>II</span>
      <i />
      <span>IV</span>
    </div>
  );
}

function GlobeMark() {
  return (
    <svg className="globe-svg" viewBox="0 0 160 160" aria-hidden>
      <circle cx="80" cy="80" r="58" className="globe-sphere" />
      <ellipse cx="80" cy="80" rx="24" ry="58" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="80" cy="80" rx="46" ry="58" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      <path d="M22 80h116M30 52h100M30 108h100" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d="M48 28c10 18 10 86 0 104M112 28c-10 18-10 86 0 104" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="80" cy="80" r="62" fill="none" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

function PlateMark({ plate }: { plate: CluePlate }) {
  if (plate === "clock") return <ClockFace hour={11} minute={45} numerals />;
  if (plate === "blankclock") return <ClockFace hour={12} minute={0} numerals={false} />;
  if (plate === "globe") return <GlobeMark />;
  if (plate === "moons") return <MoonRow />;
  if (plate === "casks") return <CaskRow />;
  if (plate === "glass") return <GlassRow />;
  if (plate === "lineage") return <LineageRow />;
  if (plate === "brass") return <BrassMark />;
  return null;
}

export function ClueCard({ id }: { id: string }) {
  const clue = CLUES[id];
  if (!clue) return null;
  const mark = PlateMark({ plate: clue.plate });
  const showPhoto = Boolean(clue.image) && clue.plate !== "clock" && clue.plate !== "blankclock";
  return (
    <article className={`artifact plate-${clue.plate}`}>
      {showPhoto ? (
        <div className="artifact-visual">
          <img src={clue.image} alt="" className="artifact-photo" />
          <span className="artifact-frame" />
        </div>
      ) : null}
      {mark ? <div className="artifact-mark">{mark}</div> : null}
      {clue.plate === "clock" && clue.image ? (
        <img src={clue.image} alt="" className="artifact-aside" />
      ) : null}
      <p className="artifact-body">{clue.body}</p>
    </article>
  );
}

export function ClueThumb({ id }: { id: string }) {
  const clue = CLUES[id];
  if (!clue) return null;
  if (clue.image) return <img src={clue.image} alt="" className="clue-pin-photo" />;
  return (
    <span className={`clue-pin-mark mark-${clue.plate}`} aria-hidden>
      {clue.plate === "brass" ? <span className="thumb-brass">VII</span> : null}
      {clue.plate === "lineage" ? <span className="thumb-year">1642</span> : null}
      {clue.plate === "moons" ? <span className="moon moon-crescent thumb-moon" /> : null}
      {clue.plate === "blankclock" ? <span className="thumb-clock" /> : null}
      {clue.plate === "globe" ? <span className="thumb-globe" /> : null}
      {clue.plate === "casks" ? (
        <span className="cask-body thumb-cask">
          <span className="cask-band" />
          <span className="cask-drops">
            <i />
            <i />
            <i />
          </span>
        </span>
      ) : null}
    </span>
  );
}

const SPOT_SRC: Record<string, string> = {
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
  coffer: "/art/prop-coffer.jpg",
  "parlor-gaze": "/art/clue-portrait.jpg",
  "parlor-hour": "/art/clue-clock.jpg",
  "library-sky": "/art/prop-books.jpg",
  "library-count": "/art/clue-note.jpg",
  "green-false": "/art/clue-plaque.jpg",
  "green-bloom": "/art/clue-orchids.jpg",
  "banquet-last": "/art/clue-goblets.jpg",
  "banquet-count": "/art/prop-candles.jpg",
  "gallery-rule": "/art/prop-portraits.jpg",
  "gallery-count": "/art/clue-portrait.jpg",
  "bed-first": "/art/clue-moons.jpg",
  "bed-count": "/art/prop-casket.jpg",
  "cellar-measure": "/art/prop-casks.jpg",
  "cellar-count": "/art/prop-candles.jpg",
  "chapel-call": "/art/clue-glass.jpg",
  "chapel-count": "/art/prop-glass.jpg",
  "vault-places": "/art/prop-dials.jpg",
  "vault-metal": "/art/prop-coffer.jpg",
  "tower-marks": "/art/clue-gears.jpg",
  "tower-hour": "/art/clue-clock.jpg",
  "tower-pillars": "/art/prop-gate.jpg",
};

export function SpotThumb({ hotspot }: { hotspot: Hotspot }) {
  const key =
    hotspot.action === "puzzle"
      ? hotspot.puzzle ?? hotspot.id
      : hotspot.action === "door"
        ? "door"
        : hotspot.action === "finale"
          ? "finale"
          : hotspot.id;
  return <img src={SPOT_SRC[key] ?? "/art/prop-door.jpg"} alt="" className="clue-pin-photo" />;
}
