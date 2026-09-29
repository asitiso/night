export const APP_NAME = "심야의 저택";
export const APP_DESCRIPTION =
  "열 개의 방을 지나 아홉 개의 표식을 모으고, 자정에 시계탑을 열라.";

export const ITEM_IDS = [
  "wax",
  "cog",
  "emerald",
  "cuff",
  "locket",
  "pearl",
  "amber",
  "shard",
  "sigil",
] as const;

export type ItemId = (typeof ITEM_IDS)[number];

export const ANCHORS: readonly ItemId[] = ["wax", "cog", "emerald"];

export type PieceKind = "candle" | "book" | "goblet" | "portrait" | "moon" | "cask" | "glass";

export type Piece = {
  id: string;
  label: string;
  kind: PieceKind;
  tone: string;
  stars?: number;
  drops?: number;
  art?: string;
};

export type SequencePuzzle = {
  id: string;
  kind: "sequence";
  prompt: string;
  success: string;
  fail: string;
  tick: string;
  image?: string;
  quiet?: boolean;
  order: string[];
  pieces: Piece[];
};

export type DialFace = {
  word: string;
  icon?: "sun" | "moon" | "star" | "cloud";
  image?: string;
};

export type DialPuzzle = {
  id: string;
  kind: "dials";
  prompt: string;
  success: string;
  fail: string;
  modulus: number;
  image?: string;
  quiet?: boolean;
  solution: number[];
  faces: DialFace[];
};

export type PuzzleDef = SequencePuzzle | DialPuzzle;

export type CluePlate =
  | "letter"
  | "portrait"
  | "clock"
  | "note"
  | "globe"
  | "plaque"
  | "orchids"
  | "gears"
  | "blankclock"
  | "menu"
  | "lineage"
  | "moons"
  | "casks"
  | "glass"
  | "brass";

export type Clue = {
  title: string;
  body: string;
  plate: CluePlate;
  image?: string;
};

export type HotspotAction = "clue" | "puzzle" | "take" | "door" | "finale";

export type Hotspot = {
  id: string;
  label: string;
  x: number;
  y: number;
  action: HotspotAction;
  clue?: string;
  puzzle?: string;
};

export type RoomDef = {
  id: string;
  numeral: string;
  name: string;
  subtitle: string;
  image: string;
  intro: string;
  objective: string;
  locked: string;
  needItem: string;
  hints: [string, string, string];
  puzzle: string | null;
  relic: ItemId | null;
  gate: "sequence" | "dials" | "finale";
  locks: readonly [string, string, string];
  focus: number;
  hotspots: Hotspot[];
};

export const ITEMS: Record<
  ItemId,
  { name: string; take: string; place: string; blurb: string }
> = {
  wax: {
    name: "밀랍 인장",
    take: "밀랍 인장을 집어 들었다.",
    place: "밀랍 인장이 홈에 맞물렸다.",
    blurb: "아직 온기가 남은 밀랍. 응접실의 불꽃이 남긴 표식.",
  },
  cog: {
    name: "은빛 톱니",
    take: "은빛 톱니를 집어 들었다.",
    place: "은빛 톱니가 홈에 맞물렸다.",
    blurb: "손바닥보다 작은 톱니. 서가가 삼키고 있던 시간.",
  },
  emerald: {
    name: "에메랄드 파편",
    take: "에메랄드 파편을 집어 들었다.",
    place: "에메랄드 파편이 홈에 맞물렸다.",
    blurb: "분수 바닥의 빛. 차갑고, 이상하게 무겁다.",
  },
  cuff: {
    name: "루비 커프",
    take: "루비 커프를 집어 들었다.",
    place: "루비 커프가 홈에 닿지 않는다. 이것은 표식일 뿐이다.",
    blurb: "식탁 아래 굴러 있던 커프. 잔이 기억하는 밤.",
  },
  locket: {
    name: "금테 로켓",
    take: "금테 로켓을 집어 들었다.",
    place: "로켓은 세 기둥의 홈에 맞지 않는다.",
    blurb: "열리지 않는 로켓. 네 얼굴의 순서를 안에 가두고 있다.",
  },
  pearl: {
    name: "달의 진주",
    take: "달의 진주를 집어 들었다.",
    place: "진주는 홈을 거부한다.",
    blurb: "창에 걸린 달빛이 굳은 것. 손끝에서 차갑다.",
  },
  amber: {
    name: "호박 마개",
    take: "호박 마개를 집어 들었다.",
    place: "마개는 이 홈의 것이 아니다.",
    blurb: "오래된 병의 입. 안에 남은 것은 빛뿐이다.",
  },
  shard: {
    name: "성창 파편",
    take: "성창 파편을 집어 들었다.",
    place: "파편은 세 기둥의 홈에 들어가지 않는다.",
    blurb: "피, 황금, 하늘, 어둠이 한 점에 굳어 있다.",
  },
  sigil: {
    name: "흑요석 인장",
    take: "흑요석 인장을 집어 들었다.",
    place: "흑요석은 밀랍의 자리를 탐하지 않는다.",
    blurb: "금고가 마지막으로 내어 준 표식. 유난히 무겁다.",
  },
};

export const CLUES: Record<string, Clue> = {
  letter: {
    title: "응접실의 편지",
    plate: "letter",
    image: "/art/clue-letter.jpg",
    body: "가장 낮은 불꽃이 먼저 깨어나고, 그다음이 중간, 마지막이 가장 높은 불꽃이다. 장식장은 그 순서를 기억한다.\n\n이 집의 시계는 모두 거짓말을 한다. 오직 자정만이 진실이다.",
  },
  portrait: {
    title: "초상",
    plate: "portrait",
    image: "/art/clue-portrait.jpg",
    body: "초상 속의 사람이 촛대를 내려다본다. 세 불꽃의 키가 모두 다르다. 편지가 키의 순서를 알고 있다.",
  },
  clock: {
    title: "멈춘 벽시계",
    plate: "clock",
    image: "/art/clue-clock.jpg",
    body: "바늘은 열한 시 마흔다섯 분에서 죽어 있다. 이 집은 자정을 정답으로 안다.",
  },
  note: {
    title: "서재의 메모",
    plate: "note",
    image: "/art/clue-note.jpg",
    body: "별이 가장 많은 책에서 시작하라. 한 개씩 줄어, 별이 없는 책에서 끝내라. 순서가 틀리면 서가는 침묵한다.",
  },
  globe: {
    title: "지구본",
    plate: "globe",
    body: "지구본은 멈춰 있다. 이 방에서 별은 책이 품고 있다. 하늘이 아니라 책등을 세어라.",
  },
  plaque: {
    title: "분수의 석판",
    plate: "plaque",
    image: "/art/clue-plaque.jpg",
    body: "낮의 눈이 먼저 뜨고, 밤의 눈이 따르며, 가장 먼 빛이 문을 닫는다. 구름은 거짓이다.",
  },
  orchids: {
    title: "난초",
    plate: "orchids",
    image: "/art/clue-orchids.jpg",
    body: "흰 꽃이 달빛을 받아 창백하다. 단서는 꽃에 있지 않다. 석판이 고리의 문양을 말한다.",
  },
  gears: {
    title: "거대한 톱니",
    plate: "gears",
    image: "/art/clue-gears.jpg",
    body: "톱니가 서로를 물고 있으나, 한 박자가 비어 있다. 아홉 표식과 세 기둥이 그 빈자리다.",
  },
  towerclock: {
    title: "숫자 없는 시계",
    plate: "blankclock",
    body: "숫자 없는 얼굴. 열두 시 영 분이 이 방의 정답이다. 손잡이는 세 기둥이 홈에 앉은 뒤에만 움직인다.",
  },
  menu: {
    title: "식순 카드",
    plate: "menu",
    image: "/art/clue-goblets.jpg",
    body: "빛은 마지막에 온다. 가장 어두운 잔이 입을 열고, 그다음이 루비, 장미빛이 따르며, 비어 있는 잔이 문을 닫는다.",
  },
  lineage: {
    title: "가문의 명판",
    plate: "lineage",
    body: "가문은 나이로 문을 연다. 먼저 태어난 얼굴부터, 가장 나중의 얼굴에서 끝낸다.",
  },
  diary: {
    title: "베개 곁의 일기",
    plate: "moons",
    body: "어둠이 먼저 숨을 쉬고, 낫이 뜨며, 반쪽이 서고, 가득 찬 빛이 문을 연다.",
  },
  chalk: {
    title: "벽돌의 분필",
    plate: "casks",
    body: "가장 많이 남은 통에서 시작하라. 한 방울씩 줄어, 거의 마른 통에서 끝내라.",
  },
  hymn: {
    title: "제단의 성가",
    plate: "glass",
    image: "/art/clue-glass.jpg",
    body: "피가 먼저 타오르고, 황금이 따르며, 하늘이 열리고, 어둠이 문을 닫는다.",
  },
  brass: {
    title: "놋쇠 명판",
    plate: "brass",
    body: "일곱이 문을 열고, 둘이 문을 지키며, 넷이 문을 닫는다.",
  },
};

export const PUZZLES: Record<string, PuzzleDef> = {
  candles: {
    id: "candles",
    kind: "sequence",
    quiet: true,
    image: "/art/prop-candles.jpg",
    prompt: "이름표는 없다. 편지가 말한 키를 그림에서 찾으십시오. 틀리면 모두 꺼집니다.",
    success: "세 불꽃이 고르게 타오른다. 장식장이 작게 클릭했다.",
    fail: "불꽃이 스러졌다. 순서가 아니다.",
    tick: "불꽃이 붙었다.",
    order: ["short", "mid", "tall"],
    pieces: [
      { id: "tall", label: "큰 초", kind: "candle", tone: "wax-tall", art: "/art/piece-candle-tall.jpg" },
      { id: "short", label: "작은 초", kind: "candle", tone: "wax-short", art: "/art/piece-candle-short.jpg" },
      { id: "mid", label: "중간 초", kind: "candle", tone: "wax-mid", art: "/art/piece-candle-mid.jpg" },
    ],
  },
  books: {
    id: "books",
    kind: "sequence",
    quiet: true,
    image: "/art/prop-books.jpg",
    prompt: "글자는 없다. 책등에 찍힌 별을 세십시오. 메모가 방향을 압니다.",
    success: "책등이 가라앉으며 서랍이 튀어나왔다.",
    fail: "서가가 침묵한다. 순서가 어긋났다.",
    tick: "책이 제자리를 기억한다.",
    order: ["a", "c", "b", "d"],
    pieces: [
      { id: "b", label: "별 하나", kind: "book", tone: "cloth-parchment", stars: 1, art: "/art/piece-book-1.jpg" },
      { id: "d", label: "별 없음", kind: "book", tone: "cloth-ink", stars: 0, art: "/art/piece-book-0.jpg" },
      { id: "a", label: "별 셋", kind: "book", tone: "cloth-wine", stars: 3, art: "/art/piece-book-3.jpg" },
      { id: "c", label: "별 둘", kind: "book", tone: "cloth-gold", stars: 2, art: "/art/piece-book-2.jpg" },
    ],
  },
  rings: {
    id: "rings",
    kind: "dials",
    quiet: true,
    prompt: "낮의 눈이 먼저 뜨고, 밤의 눈이 따르며, 가장 먼 빛이 문을 닫는다. 구름은 거짓이다.",
    success: "물이 갈라지며 깊은 곳에서 푸른 빛이 떠올랐다. 수면을 살피십시오.",
    fail: "분수가 잠잠하다. 문양이 어긋났다.",
    modulus: 4,
    solution: [0, 1, 2],
    image: "/art/prop-rings.jpg",
    faces: [
      { word: "해", icon: "sun", image: "/art/piece-sun.jpg" },
      { word: "달", icon: "moon", image: "/art/piece-moon-medal.jpg" },
      { word: "별", icon: "star", image: "/art/piece-star.jpg" },
      { word: "구름", icon: "cloud", image: "/art/piece-cloud.jpg" },
    ],
  },
  goblets: {
    id: "goblets",
    kind: "sequence",
    quiet: true,
    image: "/art/clue-goblets.jpg",
    prompt: "이름표는 없다. 가장 어두운 잔이 입을 열고, 붉은 보석이 따르며, 옅은 꽃이 지나고, 비어 있는 잔이 문을 닫는다.",
    success: "잔이 한 소리로 울린다. 왼쪽 의자 틈에서 뭔가 빛났다.",
    fail: "잔이 깨질 듯 떨린다. 순서가 아니다.",
    tick: "잔이 낮게 울린다.",
    order: ["wine", "ruby", "rose", "crystal"],
    pieces: [
      { id: "crystal", label: "빈 잔", kind: "goblet", tone: "crystal", art: "/art/piece-goblet-empty.jpg" },
      { id: "wine", label: "포도주", kind: "goblet", tone: "wine", art: "/art/piece-goblet-wine.jpg" },
      { id: "rose", label: "장미빛", kind: "goblet", tone: "rose", art: "/art/piece-goblet-rose.jpg" },
      { id: "ruby", label: "루비", kind: "goblet", tone: "ruby", art: "/art/piece-goblet-ruby.jpg" },
      { id: "ash", label: "재", kind: "goblet", tone: "crystal", art: "/art/piece-ash.jpg" },
    ],
  },
  portraits: {
    id: "portraits",
    kind: "sequence",
    quiet: true,
    image: "/art/prop-portraits.jpg",
    prompt: "이름표는 없다. 액자 아래 숫자를 읽고, 먼저 태어난 얼굴부터.",
    success: "초상들이 고개를 돌린다. 진열대가 열렸다.",
    fail: "복도가 침묵한다. 순서가 어긋났다.",
    tick: "초상이 눈을 감는다.",
    order: ["y1642", "y1711", "y1830", "y1899"],
    pieces: [
      { id: "y1830", label: "1830", kind: "portrait", tone: "ivory", art: "/art/piece-1830.jpg" },
      { id: "y1642", label: "1642", kind: "portrait", tone: "crimson", art: "/art/piece-1642.jpg" },
      { id: "y1899", label: "1899", kind: "portrait", tone: "ink", art: "/art/piece-1899.jpg" },
      { id: "y1711", label: "1711", kind: "portrait", tone: "cobalt", art: "/art/piece-1711.jpg" },
      { id: "stranger", label: "이방인", kind: "portrait", tone: "ivory", art: "/art/piece-child.jpg" },
    ],
  },
  moons: {
    id: "moons",
    kind: "sequence",
    quiet: true,
    image: "/art/clue-moons.jpg",
    prompt: "이름표는 없다. 어둠이 먼저 숨을 쉬고, 낫이 뜨며, 반쪽이 서고, 가득 찬 빛이 문을 연다. 구름은 거짓.",
    success: "창에 보름이 걸린다. 함의 잠금이 풀렸다.",
    fail: "창이 다시 어두워진다. 순서가 아니다.",
    tick: "달이 한 칸 기울었다.",
    order: ["new", "crescent", "half", "full"],
    pieces: [
      { id: "full", label: "보름", kind: "moon", tone: "full", art: "/art/piece-moon-full.jpg" },
      { id: "new", label: "그믐", kind: "moon", tone: "new", art: "/art/piece-moon-new.jpg" },
      { id: "half", label: "반달", kind: "moon", tone: "half", art: "/art/piece-moon-half.jpg" },
      { id: "crescent", label: "초승", kind: "moon", tone: "crescent", art: "/art/piece-moon-crescent.jpg" },
      { id: "false", label: "구름", kind: "moon", tone: "new", art: "/art/piece-cloud.jpg" },
    ],
  },
  casks: {
    id: "casks",
    kind: "sequence",
    quiet: true,
    image: "/art/prop-casks.jpg",
    prompt: "이름표는 없다. 방울을 세십시오. 가장 많은 통에서 시작해 거의 마른 통에서 끝내십시오. 초는 세지 않습니다.",
    success: "통이 낮게 울린다. 선반의 병이 돌아왔다.",
    fail: "등불이 깜박인다. 순서가 아니다.",
    tick: "통이 낮게 대답한다.",
    order: ["d7", "d5", "d3", "d1"],
    pieces: [
      { id: "d3", label: "세 방울", kind: "cask", tone: "oak", drops: 3, art: "/art/piece-cask-3.jpg" },
      { id: "d7", label: "일곱 방울", kind: "cask", tone: "oak", drops: 7, art: "/art/piece-cask-7.jpg" },
      { id: "d1", label: "한 방울", kind: "cask", tone: "oak", drops: 1, art: "/art/piece-cask-1.jpg" },
      { id: "d5", label: "다섯 방울", kind: "cask", tone: "oak", drops: 5, art: "/art/piece-cask-5.jpg" },
      { id: "lamp", label: "등", kind: "candle", tone: "wax-short", art: "/art/piece-candle-short.jpg" },
    ],
  },
  glass: {
    id: "glass",
    kind: "sequence",
    quiet: true,
    image: "/art/clue-glass.jpg",
    prompt: "이름표는 없다. 피가 먼저 타고, 황금이 따르며, 하늘이 열리고, 어둠이 문을 닫는다. 낮은 거짓.",
    success: "유리가 한 박자로 빛난다. 제단 아래가 따뜻하다.",
    fail: "색이 흩어진다. 순서가 아니다.",
    tick: "유리가 숨을 고른다.",
    order: ["blood", "gold", "sky", "night"],
    pieces: [
      { id: "sky", label: "하늘", kind: "glass", tone: "sky", art: "/art/piece-glass-sky.jpg" },
      { id: "blood", label: "피", kind: "glass", tone: "blood", art: "/art/piece-glass-blood.jpg" },
      { id: "night", label: "어둠", kind: "glass", tone: "night", art: "/art/piece-glass-night.jpg" },
      { id: "gold", label: "황금", kind: "glass", tone: "gold", art: "/art/piece-glass-gold.jpg" },
      { id: "day", label: "낮", kind: "glass", tone: "gold", art: "/art/piece-sun.jpg" },
    ],
  },
  vault: {
    id: "vault",
    kind: "dials",
    image: "/art/prop-dials.jpg",
    prompt: "일곱이 문을 열고, 둘이 지키며, 넷이 닫는다. 왼쪽부터.",
    success: "다이얼이 맞물린다. 옆 함이 열렸다.",
    fail: "다이얼이 헛돈다. 수가 아니다.",
    modulus: 10,
    solution: [7, 2, 4],
    faces: [],
  },
  "parlor-gaze": {
    id: "parlor-gaze",
    kind: "sequence",
    quiet: true,
    image: "/art/clue-portrait.jpg",
    prompt: "이름표는 없다. 가장 어린 얼굴에서 시작해 세월을 따라가십시오.",
    success: "세 얼굴이 같은 쪽을 본다. 퍼즐이 하나 잠겼다.",
    fail: "초상이 고개를 돌린다. 순서가 아니다.",
    tick: "초상이 눈을 감는다.",
    order: ["child", "adult", "elder"],
    pieces: [
      { id: "elder", label: "노인", kind: "portrait", tone: "ink", art: "/art/piece-elder.jpg" },
      { id: "child", label: "아이", kind: "portrait", tone: "ivory", art: "/art/piece-child.jpg" },
      { id: "adult", label: "어른", kind: "portrait", tone: "crimson", art: "/art/piece-adult.jpg" },
    ],
  },
  "parlor-hour": {
    id: "parlor-hour",
    kind: "sequence",
    image: "/art/clue-clock.jpg",
    prompt: "시계는 거짓에서 멈췄다. 그 시각에서 출발해, 진실인 자정을 지나 한 눈금에서 멈추십시오.",
    success: "바늘이 자정을 지나 한 칸 숨 고른다.",
    fail: "시계가 다시 멈춘다. 순서가 아니다.",
    tick: "태엽이 한 눈금 돈다.",
    order: ["xi", "xii", "i"],
    pieces: [
      { id: "i", label: "한 시", kind: "moon", tone: "new", art: "/art/piece-hour-1.jpg" },
      { id: "xi", label: "열한 시", kind: "moon", tone: "crescent", art: "/art/piece-hour-11.jpg" },
      { id: "xii", label: "열두 시", kind: "moon", tone: "full", art: "/art/piece-hour-12.jpg" },
    ],
  },
  "library-sky": {
    id: "library-sky",
    kind: "sequence",
    image: "/art/prop-books.jpg",
    prompt: "발밑의 칸이 문을 연다. 그다음이 눈높이, 마지막이 손이 닿지 않는 칸.",
    success: "세 칸이 제 높이를 기억한다.",
    fail: "서가가 침묵한다. 높이가 아니다.",
    tick: "칸이 낮게 맞물린다.",
    order: ["low", "mid", "high"],
    pieces: [
      { id: "high", label: "위 칸", kind: "book", tone: "cloth-ink", stars: 1, art: "/art/piece-shelf-high.jpg" },
      { id: "low", label: "아래 칸", kind: "book", tone: "cloth-wine", stars: 3, art: "/art/piece-shelf-low.jpg" },
      { id: "mid", label: "가운데", kind: "book", tone: "cloth-gold", stars: 2, art: "/art/piece-shelf-mid.jpg" },
    ],
  },
  "library-count": {
    id: "library-count",
    kind: "sequence",
    image: "/art/clue-note.jpg",
    prompt: "추신은 거짓이다. 제목이 문을 열고, 본문이 따르며, 서명만이 닫는다.",
    success: "세 줄이 한 장으로 붙는다.",
    fail: "잉크가 번진다. 순서가 아니다.",
    tick: "줄이 제자리를 찾는다.",
    order: ["title", "body", "sign"],
    pieces: [
      { id: "sign", label: "서명", kind: "book", tone: "cloth-parchment", stars: 0, art: "/art/piece-page-sign.jpg" },
      { id: "title", label: "제목", kind: "book", tone: "cloth-wine", stars: 3, art: "/art/piece-page-title.jpg" },
      { id: "body", label: "본문", kind: "book", tone: "cloth-gold", stars: 2, art: "/art/piece-page-body.jpg" },
      { id: "ps", label: "추신", kind: "book", tone: "cloth-ink", stars: 1, art: "/art/piece-page-ps.jpg" },
    ],
  },
  "green-false": {
    id: "green-false",
    kind: "sequence",
    image: "/art/prop-water.jpg",
    prompt: "접시의 물이 먼저, 반쯤 찬 물이 따르고, 깊은 우물이 문을 닫는다.",
    success: "수면이 세 단으로 잔잔해진다.",
    fail: "물이 도로 빠진다. 순서가 아니다.",
    tick: "물결이 한 단 오른다.",
    order: ["shallow", "mid", "deep"],
    pieces: [
      { id: "deep", label: "깊은 물", kind: "cask", tone: "oak", drops: 7, art: "/art/piece-water-deep.jpg" },
      { id: "shallow", label: "얕은 물", kind: "cask", tone: "oak", drops: 1, art: "/art/piece-water-shallow.jpg" },
      { id: "mid", label: "중간", kind: "cask", tone: "oak", drops: 3, art: "/art/piece-water-mid.jpg" },
    ],
  },
  "green-bloom": {
    id: "green-bloom",
    kind: "sequence",
    quiet: true,
    image: "/art/clue-orchids.jpg",
    prompt: "닫힌 밤에서 반쯤 열린 밤을 지나, 가득한 밤이 문을 연다. 시든 꽃은 거짓.",
    success: "꽃이 세 밤을 기억하고 고개를 든다.",
    fail: "꽃이 다시 오므라든다. 순서가 아니다.",
    tick: "꽃잎이 한 겹 열린다.",
    order: ["bud", "half", "bloom"],
    pieces: [
      { id: "bloom", label: "만개", kind: "moon", tone: "full", art: "/art/piece-bloom.jpg" },
      { id: "bud", label: "봉오리", kind: "moon", tone: "new", art: "/art/piece-bud.jpg" },
      { id: "half", label: "반개", kind: "moon", tone: "half", art: "/art/piece-halfbloom.jpg" },
      { id: "dead", label: "시든 꽃", kind: "moon", tone: "new", art: "/art/piece-wilt.jpg" },
    ],
  },
  "banquet-last": {
    id: "banquet-last",
    kind: "sequence",
    image: "/art/clue-goblets.jpg",
    prompt: "전채가 입을 열고, 본식이 따르며, 후식이 문을 닫는다. 재는 음식이 아니다.",
    success: "세 접시가 한 박자로 식는다.",
    fail: "식기가 부딪친다. 순서가 아니다.",
    tick: "접시가 한 칸 내려앉는다.",
    order: ["first", "main", "sweet"],
    pieces: [
      { id: "sweet", label: "후식", kind: "goblet", tone: "crystal", art: "/art/piece-dessert.jpg" },
      { id: "first", label: "전채", kind: "goblet", tone: "wine", art: "/art/piece-appetizer.jpg" },
      { id: "main", label: "본식", kind: "goblet", tone: "ruby", art: "/art/piece-roast.jpg" },
      { id: "ash", label: "재", kind: "goblet", tone: "crystal", art: "/art/piece-ash.jpg" },
    ],
  },
  "banquet-count": {
    id: "banquet-count",
    kind: "sequence",
    image: "/art/prop-candles.jpg",
    prompt: "식탁의 서쪽 끝이 먼저다. 가운데가 따르고, 동쪽 끝이 닫는다.",
    success: "세 불꽃이 식탁을 가로지른다.",
    fail: "불꽃이 스러진다. 자리가 아니다.",
    tick: "초에 불이 붙는다.",
    order: ["left", "center", "right"],
    pieces: [
      { id: "right", label: "오른쪽", kind: "candle", tone: "wax-tall", art: "/art/piece-seat-right.jpg" },
      { id: "left", label: "왼쪽", kind: "candle", tone: "wax-short", art: "/art/piece-seat-left.jpg" },
      { id: "center", label: "가운데", kind: "candle", tone: "wax-mid", art: "/art/piece-seat-center.jpg" },
    ],
  },
  "gallery-rule": {
    id: "gallery-rule",
    kind: "sequence",
    image: "/art/prop-portraits.jpg",
    prompt: "가문이 문을 열고, 연도가 따르며, 이름이 닫는다. 칭호는 거짓.",
    success: "명판의 세 줄이 가지런해진다.",
    fail: "글자가 흐려진다. 순서가 아니다.",
    tick: "한 줄이 또렷해진다.",
    order: ["house", "year", "name"],
    pieces: [
      { id: "name", label: "이름", kind: "portrait", tone: "ivory", art: "/art/piece-card.jpg" },
      { id: "house", label: "가문", kind: "portrait", tone: "crimson", art: "/art/piece-crest.jpg" },
      { id: "year", label: "연도", kind: "portrait", tone: "cobalt", art: "/art/piece-calendar.jpg" },
    ],
  },
  "gallery-count": {
    id: "gallery-count",
    kind: "sequence",
    image: "/art/prop-portraits.jpg",
    prompt: "바닥에 가까운 액자부터. 가운데가 따르고, 가장 높은 액자가 닫는다.",
    success: "세 액자가 벽에 맞춰 앉는다.",
    fail: "액자가 비뚤어진다. 높이가 아니다.",
    tick: "액자가 한 칸 올라간다.",
    order: ["low", "mid", "high"],
    pieces: [
      { id: "high", label: "높은 액자", kind: "portrait", tone: "ink", art: "/art/piece-frame-high.jpg" },
      { id: "low", label: "낮은 액자", kind: "portrait", tone: "ivory", art: "/art/piece-frame-low.jpg" },
      { id: "mid", label: "가운데", kind: "portrait", tone: "crimson", art: "/art/piece-frame-mid.jpg" },
    ],
  },
  "bed-first": {
    id: "bed-first",
    kind: "sequence",
    image: "/art/clue-moons.jpg",
    prompt: "밤이 깊어지는 시각. 열 시에서 열두 시로. 새벽 그림은 거짓이다.",
    success: "세 경이 밤을 나누어 가진다.",
    fail: "일기가 덮인다. 순서가 아니다.",
    tick: "한 경이 지나간다.",
    order: ["w1", "w2", "w3"],
    pieces: [
      { id: "w3", label: "열두 시", kind: "moon", tone: "full", art: "/art/piece-hour-12.jpg" },
      { id: "w1", label: "열 시", kind: "moon", tone: "new", art: "/art/piece-hour-10.jpg" },
      { id: "w2", label: "열한 시", kind: "moon", tone: "crescent", art: "/art/piece-hour-11.jpg" },
      { id: "dawn", label: "새벽", kind: "moon", tone: "full", art: "/art/piece-sunrise.jpg" },
    ],
  },
  "bed-count": {
    id: "bed-count",
    kind: "sequence",
    image: "/art/prop-casket.jpg",
    prompt: "열쇠를 세십시오. 하나에서 셋으로. 그림 속 열쇠의 수다.",
    success: "고리가 세 번 울리고 잠이 느슨해진다.",
    fail: "고리가 헛돈다. 횟수가 아니다.",
    tick: "고리가 한 번 맞물린다.",
    order: ["one", "two", "three"],
    pieces: [
      { id: "two", label: "두 번", kind: "cask", tone: "oak", drops: 2, art: "/art/piece-key-2.jpg" },
      { id: "three", label: "세 번", kind: "cask", tone: "oak", drops: 3, art: "/art/piece-key-3.jpg" },
      { id: "one", label: "한 번", kind: "cask", tone: "oak", drops: 1, art: "/art/piece-key-1.jpg" },
    ],
  },
  "cellar-measure": {
    id: "cellar-measure",
    kind: "sequence",
    image: "/art/prop-casks.jpg",
    prompt: "가장 아래 칸이 문을 연다. 중간이 따르고, 위 칸이 닫는다. 난간은 계단이 아니다.",
    success: "세 칸이 위층을 가리킨다.",
    fail: "계단이 삐걱인다. 순서가 아니다.",
    tick: "한 칸을 디딘다.",
    order: ["bottom", "mid", "top"],
    pieces: [
      { id: "top", label: "위 칸", kind: "cask", tone: "oak", drops: 1, art: "/art/piece-step-high.jpg" },
      { id: "bottom", label: "아래 칸", kind: "cask", tone: "oak", drops: 7, art: "/art/piece-step-low.jpg" },
      { id: "mid", label: "중간", kind: "cask", tone: "oak", drops: 3, art: "/art/piece-step-mid.jpg" },
      { id: "rail", label: "난간", kind: "cask", tone: "oak", drops: 0, art: "/art/piece-rail.jpg" },
    ],
  },
  "cellar-count": {
    id: "cellar-count",
    kind: "sequence",
    quiet: true,
    image: "/art/prop-candles.jpg",
    prompt: "이름표는 없다. 가장 낮은 불꽃에서 가장 높은 불꽃으로.",
    success: "세 등불이 저장고를 밝힌다.",
    fail: "심지가 꺼진다. 순서가 아니다.",
    tick: "등불이 한 칸 밝아진다.",
    order: ["dim", "mid", "bright"],
    pieces: [
      { id: "bright", label: "밝은 등", kind: "candle", tone: "wax-tall", art: "/art/piece-candle-tall.jpg" },
      { id: "dim", label: "어두운 등", kind: "candle", tone: "wax-short", art: "/art/piece-candle-short.jpg" },
      { id: "mid", label: "중간", kind: "candle", tone: "wax-mid", art: "/art/piece-candle-mid.jpg" },
    ],
  },
  "chapel-call": {
    id: "chapel-call",
    kind: "sequence",
    image: "/art/clue-glass.jpg",
    prompt: "첫 절이 문을 열고, 후렴이 따르며, 아멘이 닫는다. 침묵은 소절이 아니다.",
    success: "세 소절이 제단 위에 내려앉는다.",
    fail: "노랫말이 흩어진다. 순서가 아니다.",
    tick: "한 소절이 울린다.",
    order: ["verse", "refrain", "amen"],
    pieces: [
      { id: "amen", label: "아멘", kind: "glass", tone: "gold", art: "/art/piece-amen.jpg" },
      { id: "verse", label: "첫 절", kind: "glass", tone: "blood", art: "/art/piece-hymn.jpg" },
      { id: "refrain", label: "후렴", kind: "glass", tone: "sky", art: "/art/piece-notes.jpg" },
      { id: "hush", label: "침묵", kind: "glass", tone: "night", art: "/art/piece-silence.jpg" },
    ],
  },
  "chapel-count": {
    id: "chapel-count",
    kind: "sequence",
    quiet: true,
    image: "/art/prop-glass.jpg",
    prompt: "이름표는 없다. 가장 작은 종부터, 가장 큰 종이 문을 닫는다.",
    success: "세 종이 한 박자로 울린다.",
    fail: "종이 엇갈린다. 순서가 아니다.",
    tick: "종이 한 번 울린다.",
    order: ["small", "mid", "large"],
    pieces: [
      { id: "large", label: "큰 종", kind: "candle", tone: "wax-tall", art: "/art/piece-bell-l.jpg" },
      { id: "small", label: "작은 종", kind: "candle", tone: "wax-short", art: "/art/piece-bell-s.jpg" },
      { id: "mid", label: "중간 종", kind: "candle", tone: "wax-mid", art: "/art/piece-bell-m.jpg" },
    ],
  },
  "vault-places": {
    id: "vault-places",
    kind: "sequence",
    image: "/art/prop-dials.jpg",
    prompt: "바깥 빗장이 문을 연다. 중간이 따르고, 안쪽이 닫는다. 경첩은 빗장이 아니다.",
    success: "세 빗장이 차례로 빠진다.",
    fail: "빗장이 다시 걸린다. 순서가 아니다.",
    tick: "빗장이 한 칸 물러난다.",
    order: ["outer", "mid", "inner"],
    pieces: [
      { id: "inner", label: "안쪽", kind: "glass", tone: "night", art: "/art/piece-bolt-inner.jpg" },
      { id: "hinge", label: "경첩", kind: "glass", tone: "gold", art: "/art/piece-hinge.jpg" },
      { id: "outer", label: "바깥", kind: "glass", tone: "gold", art: "/art/piece-bolt-outer.jpg" },
      { id: "mid", label: "중간", kind: "glass", tone: "sky", art: "/art/piece-bolt-mid.jpg" },
    ],
  },
  "vault-metal": {
    id: "vault-metal",
    kind: "sequence",
    image: "/art/prop-coffer.jpg",
    prompt: "구리가 문을 열고, 놋쇠가 따르며, 쇠가 닫는다. 유리는 금속이 아니다.",
    success: "세 판이 무게대로 쌓인다.",
    fail: "판이 미끄러진다. 무게가 아니다.",
    tick: "판이 한 장 내려앉는다.",
    order: ["copper", "brass", "iron"],
    pieces: [
      { id: "iron", label: "쇠", kind: "goblet", tone: "wine", art: "/art/piece-iron.jpg" },
      { id: "copper", label: "구리", kind: "goblet", tone: "rose", art: "/art/piece-copper.jpg" },
      { id: "brass", label: "놋쇠", kind: "goblet", tone: "ruby", art: "/art/piece-brass.jpg" },
      { id: "glassfalse", label: "유리", kind: "glass", tone: "sky", art: "/art/piece-glass-sky.jpg" },
    ],
  },
  "tower-marks": {
    id: "tower-marks",
    kind: "sequence",
    quiet: true,
    image: "/art/clue-gears.jpg",
    prompt: "이름표는 없다. 가장 작은 톱니부터, 가장 큰 톱니에서 끝내십시오. 구름은 톱니가 아니다.",
    success: "세 톱니가 한 방향으로 돈다.",
    fail: "톱니가 걸린다. 순서가 아니다.",
    tick: "톱니가 한 칸 맞물린다.",
    order: ["small", "mid", "large"],
    pieces: [
      { id: "large", label: "큰 톱니", kind: "cask", tone: "oak", drops: 7, art: "/art/piece-gear-l.jpg" },
      { id: "small", label: "작은 톱니", kind: "cask", tone: "oak", drops: 1, art: "/art/piece-gear-s.jpg" },
      { id: "mid", label: "중간 톱니", kind: "cask", tone: "oak", drops: 3, art: "/art/piece-gear-m.jpg" },
      { id: "mist", label: "구름", kind: "cask", tone: "oak", drops: 0, art: "/art/piece-cloud.jpg" },
    ],
  },
  "tower-hour": {
    id: "tower-hour",
    kind: "sequence",
    image: "/art/clue-clock.jpg",
    prompt: "열 시가 문을 연다. 열한 시가 따르고, 열두 시가 닫는다. 한 시는 이 종이 아니다.",
    success: "세 번의 종이 자정을 예고한다.",
    fail: "종이 멈춘다. 순서가 아니다.",
    tick: "종이 한 번 울린다.",
    order: ["ten", "eleven", "twelve"],
    pieces: [
      { id: "twelve", label: "열두 시", kind: "moon", tone: "full", art: "/art/piece-hour-12.jpg" },
      { id: "ten", label: "열 시", kind: "moon", tone: "new", art: "/art/piece-hour-10.jpg" },
      { id: "eleven", label: "열한 시", kind: "moon", tone: "crescent", art: "/art/piece-hour-11.jpg" },
      { id: "one", label: "한 시", kind: "moon", tone: "new", art: "/art/piece-hour-1.jpg" },
    ],
  },
  "tower-pillars": {
    id: "tower-pillars",
    kind: "sequence",
    image: "/art/prop-gate.jpg",
    prompt: "밀랍은 톱니보다 가볍고, 톱니는 에메랄드보다 가볍다. 철은 기둥이 아니다.",
    success: "세 기둥이 무게대로 이름을 밝힌다.",
    fail: "홈이 거부한다. 무게가 아니다.",
    tick: "기둥이 한 칸 기울어진다.",
    order: ["wax", "cog", "emerald"],
    pieces: [
      { id: "emerald", label: "에메랄드", kind: "glass", tone: "sky", art: "/art/piece-emerald.jpg" },
      { id: "wax", label: "밀랍", kind: "candle", tone: "wax-short", art: "/art/piece-seal.jpg" },
      { id: "cog", label: "톱니", kind: "cask", tone: "oak", drops: 3, art: "/art/piece-gear-m.jpg" },
      { id: "iron", label: "철", kind: "goblet", tone: "wine", art: "/art/piece-iron.jpg" },
    ],
  },
};

export const ROOMS: RoomDef[] = [
  {
    id: "parlor",
    numeral: "I",
    name: "응접실",
    subtitle: "세 개의 불꽃",
    image: "/art/parlor.jpg",
    intro: "촛불이 꺼진 응접실이다. 문은 잠겨 있고, 책상 위에 편지 하나만 남았다.",
    objective: "세 퍼즐을 풀고, 인장을 챙겨 문을 열 것.",
    locked: "문은 꿈쩍하지 않는다.",
    needItem: "밀랍 인장을 두고 갈 수 없다.",
    hints: [
      "책상 위의 편지를 먼저 읽으십시오.",
      "초는 자리가 아니라 키 순서입니다. 작은 것부터.",
      "작은 초, 중간 초, 큰 초. 그리고 장식장.",
    ],
    puzzle: "candles",
    relic: "wax",
    gate: "sequence",
    locks: ["candles", "parlor-gaze", "parlor-hour"],
    focus: 0.5,
    hotspots: [
      { id: "portrait", label: "초상", x: 50, y: 28, action: "puzzle", puzzle: "parlor-gaze" },
      { id: "candles", label: "촛대", x: 50, y: 44, action: "puzzle", puzzle: "candles" },
      { id: "cabinet", label: "장식장", x: 18, y: 58, action: "take" },
      { id: "letter", label: "편지", x: 30, y: 70, action: "clue", clue: "letter" },
      { id: "clock", label: "벽시계", x: 76, y: 46, action: "puzzle", puzzle: "parlor-hour" },
      { id: "door", label: "문", x: 90, y: 58, action: "door" },
    ],
  },
  {
    id: "library",
    numeral: "II",
    name: "서재",
    subtitle: "별의 서열",
    image: "/art/library.jpg",
    intro: "서재는 달빛뿐이다. 탁자 위 네 권의 책이 당신을 기다린다.",
    objective: "세 퍼즐을 풀고, 톱니를 챙길 것.",
    locked: "이 문은 아직 열리지 않는다.",
    needItem: "은빛 톱니를 두고 갈 수 없다.",
    hints: [
      "탁자의 메모와 네 권의 책을 살피십시오.",
      "별이 많은 책에서 없는 책으로. 추신은 누르지 마십시오.",
      "별을 세십시오. 셋에서 없음으로.",
    ],
    puzzle: "books",
    relic: "cog",
    gate: "sequence",
    locks: ["books", "library-sky", "library-count"],
    focus: 0.48,
    hotspots: [
      { id: "door", label: "문", x: 12, y: 50, action: "door" },
      { id: "globe", label: "지구본", x: 74, y: 48, action: "puzzle", puzzle: "library-sky" },
      { id: "note", label: "메모", x: 34, y: 68, action: "clue", clue: "note" },
      { id: "books", label: "책", x: 50, y: 60, action: "puzzle", puzzle: "books" },
      { id: "count", label: "서가", x: 22, y: 58, action: "puzzle", puzzle: "library-count" },
      { id: "drawer", label: "서랍", x: 64, y: 72, action: "take" },
    ],
  },
  {
    id: "greenhouse",
    numeral: "III",
    name: "온실",
    subtitle: "밤의 고리",
    image: "/art/greenhouse.jpg",
    intro: "유리 너머로 밤이 식어 있다. 분수 위의 고리가 숨을 죽이고 있다.",
    objective: "세 퍼즐을 풀고, 파편을 건질 것.",
    locked: "유리문이 잠겨 있다.",
    needItem: "에메랄드 파편을 두고 갈 수 없다.",
    hints: [
      "분수 옆 석판을 읽으십시오.",
      "낮의 눈, 밤의 눈, 가장 먼 빛. 구름은 고리에 넣지 마십시오.",
      "해, 달, 별. 확인은 세 문양이 맞은 뒤에.",
    ],
    puzzle: "rings",
    relic: "emerald",
    gate: "dials",
    locks: ["rings", "green-false", "green-bloom"],
    focus: 0.5,
    hotspots: [
      { id: "door", label: "문", x: 50, y: 32, action: "door" },
      { id: "orchids", label: "난초", x: 20, y: 62, action: "puzzle", puzzle: "green-bloom" },
      { id: "rings", label: "고리", x: 50, y: 54, action: "puzzle", puzzle: "rings" },
      { id: "plaque", label: "석판", x: 34, y: 68, action: "puzzle", puzzle: "green-false" },
      { id: "water", label: "수면", x: 66, y: 70, action: "take" },
    ],
  },
  {
    id: "banquet",
    numeral: "IV",
    name: "연회장",
    subtitle: "잔의 농도",
    image: "/art/banquet.jpg",
    intro: "연회는 끝났으나 잔 네 개가 식을 줄을 모른다. 식순 카드가 식탁 위에 남아 있다.",
    objective: "세 퍼즐을 풀고, 커프를 챙길 것.",
    locked: "옆문은 잠겨 있다.",
    needItem: "루비 커프를 두고 갈 수 없다.",
    hints: [
      "식탁의 식순 카드를 보십시오. 잔의 빛깔이 그림으로 남아 있다.",
      "잔의 빛깔을 보십시오. 글자는 없습니다. 재는 잔이 아닙니다.",
      "가장 어두운 것에서 비어 있는 것으로.",
    ],
    puzzle: "goblets",
    relic: "cuff",
    gate: "sequence",
    locks: ["goblets", "banquet-last", "banquet-count"],
    focus: 0.52,
    hotspots: [
      { id: "menu", label: "식순", x: 34, y: 66, action: "puzzle", puzzle: "banquet-last" },
      { id: "goblets", label: "잔", x: 54, y: 62, action: "puzzle", puzzle: "goblets" },
      { id: "count", label: "잔 수", x: 72, y: 40, action: "puzzle", puzzle: "banquet-count" },
      { id: "chair", label: "의자", x: 18, y: 64, action: "take" },
      { id: "door", label: "옆문", x: 90, y: 48, action: "door" },
    ],
  },
  {
    id: "gallery",
    numeral: "V",
    name: "초상 회랑",
    subtitle: "태어난 순서",
    image: "/art/gallery.jpg",
    intro: "복도의 네 얼굴이 당신을 내려다본다. 가문의 순서는 명판에 새겨져 있다.",
    objective: "세 퍼즐을 풀고, 로켓을 챙길 것.",
    locked: "끝의 문은 대답하지 않는다.",
    needItem: "금테 로켓을 두고 갈 수 없다.",
    hints: [
      "벽의 명판을 읽으십시오. 연도가 적혀 있다.",
      "액자 밑의 숫자를 직접 읽으십시오. 이방인은 가문이 아닙니다.",
      "가장 이른 숫자에서 가장 늦은 숫자로.",
    ],
    puzzle: "portraits",
    relic: "locket",
    gate: "sequence",
    locks: ["portraits", "gallery-rule", "gallery-count"],
    focus: 0.48,
    hotspots: [
      { id: "portraits", label: "초상", x: 48, y: 42, action: "puzzle", puzzle: "portraits" },
      { id: "lineage", label: "명판", x: 22, y: 60, action: "puzzle", puzzle: "gallery-rule" },
      { id: "count", label: "얼굴", x: 68, y: 30, action: "puzzle", puzzle: "gallery-count" },
      { id: "pedestal", label: "진열", x: 72, y: 70, action: "take" },
      { id: "door", label: "끝문", x: 88, y: 46, action: "door" },
    ],
  },
  {
    id: "bedroom",
    numeral: "VI",
    name: "침실",
    subtitle: "어둠에서 빛으로",
    image: "/art/bedroom.jpg",
    intro: "침실의 창이 달을 네 번 기억한다. 일기가 베개 곁에 열려 있다.",
    objective: "세 퍼즐을 풀고, 진주를 챙길 것.",
    locked: "침실 문은 안쪽에서 잠겨 있다.",
    needItem: "달의 진주를 두고 갈 수 없다.",
    hints: [
      "일기를 읽으십시오. 달의 모양이 그려져 있다.",
      "달의 모양만 보십시오. 구름을 누르면 실패합니다.",
      "완전히 어두운 달에서 완전히 밝은 달로.",
    ],
    puzzle: "moons",
    relic: "pearl",
    gate: "sequence",
    locks: ["moons", "bed-first", "bed-count"],
    focus: 0.58,
    hotspots: [
      { id: "window", label: "달창", x: 78, y: 36, action: "puzzle", puzzle: "moons" },
      { id: "diary", label: "일기", x: 36, y: 66, action: "puzzle", puzzle: "bed-first" },
      { id: "count", label: "달", x: 52, y: 42, action: "puzzle", puzzle: "bed-count" },
      { id: "casket", label: "함", x: 58, y: 68, action: "take" },
      { id: "door", label: "문", x: 12, y: 52, action: "door" },
    ],
  },
  {
    id: "cellar",
    numeral: "VII",
    name: "저장고",
    subtitle: "남은 방울",
    image: "/art/cellar.jpg",
    intro: "등불 하나만이 통을 세고 있다. 분필로 쓴 문장이 벽돌에 남았다.",
    objective: "세 퍼즐을 풀고, 마개를 챙길 것.",
    locked: "계단 위 문은 잠겨 있다.",
    needItem: "호박 마개를 두고 갈 수 없다.",
    hints: [
      "벽돌의 분필과 통 위의 방울을 보십시오.",
      "통에 그려진 방울을 세십시오. 초는 방울이 아닙니다.",
      "많은 방울에서 하나뿐인 방울로.",
    ],
    puzzle: "casks",
    relic: "amber",
    gate: "sequence",
    locks: ["casks", "cellar-measure", "cellar-count"],
    focus: 0.5,
    hotspots: [
      { id: "chalk", label: "분필", x: 24, y: 46, action: "puzzle", puzzle: "cellar-measure" },
      { id: "casks", label: "통", x: 52, y: 68, action: "puzzle", puzzle: "casks" },
      { id: "count", label: "통 수", x: 40, y: 34, action: "puzzle", puzzle: "cellar-count" },
      { id: "shelf", label: "선반", x: 78, y: 42, action: "take" },
      { id: "door", label: "계단", x: 12, y: 40, action: "door" },
    ],
  },
  {
    id: "chapel",
    numeral: "VIII",
    name: "예배당",
    subtitle: "네 개의 빛",
    image: "/art/chapel.jpg",
    intro: "제단 위 성가가 창의 색깔을 부르고 있다. 유리는 아직 제각각이다.",
    objective: "세 퍼즐을 풀고, 파편을 챙길 것.",
    locked: "예배당의 옆문은 잠겨 있다.",
    needItem: "성창 파편을 두고 갈 수 없다.",
    hints: [
      "제단의 성가를 읽으십시오.",
      "유리의 색만 보십시오. 해 문양은 성가가 아닙니다.",
      "붉은색에서 검은색으로. 사이는 금과 하늘.",
    ],
    puzzle: "glass",
    relic: "shard",
    gate: "sequence",
    locks: ["glass", "chapel-call", "chapel-count"],
    focus: 0.5,
    hotspots: [
      { id: "window", label: "유리창", x: 50, y: 34, action: "puzzle", puzzle: "glass" },
      { id: "hymn", label: "성가", x: 36, y: 66, action: "puzzle", puzzle: "chapel-call" },
      { id: "count", label: "유리", x: 78, y: 48, action: "puzzle", puzzle: "chapel-count" },
      { id: "altar", label: "제단", x: 64, y: 66, action: "take" },
      { id: "door", label: "옆문", x: 14, y: 55, action: "door" },
    ],
  },
  {
    id: "vault",
    numeral: "IX",
    name: "금고",
    subtitle: "세 개의 수",
    image: "/art/vault.jpg",
    intro: "철문 앞에 초록 등만 켜져 있다. 옆 탁자의 놋쇠 명판이 수를 숨기지 않는다.",
    objective: "세 퍼즐을 풀고, 인장을 챙길 것.",
    locked: "금고 너머의 통로는 아직이다.",
    needItem: "흑요석 인장을 두고 갈 수 없다.",
    hints: [
      "초록 등 옆의 명판을 읽으십시오.",
      "명판의 말을 수로 바꾸십시오. 유리는 금속이 아닙니다.",
      "일곱, 둘, 넷. 왼쪽부터.",
    ],
    puzzle: "vault",
    relic: "sigil",
    gate: "dials",
    locks: ["vault", "vault-places", "vault-metal"],
    focus: 0.48,
    hotspots: [
      { id: "dials", label: "다이얼", x: 50, y: 48, action: "puzzle", puzzle: "vault" },
      { id: "brass", label: "명판", x: 82, y: 62, action: "puzzle", puzzle: "vault-places" },
      { id: "metal", label: "재질", x: 28, y: 38, action: "puzzle", puzzle: "vault-metal" },
      { id: "coffer", label: "함", x: 20, y: 64, action: "take" },
      { id: "door", label: "통로", x: 90, y: 42, action: "door" },
    ],
  },
  {
    id: "tower",
    numeral: "X",
    name: "시계탑",
    subtitle: "자정의 문",
    image: "/art/tower.jpg",
    intro: "시계탑의 톱니가 크게 숨을 쉰다. 세 개의 홈이 빈 채, 아홉 표식을 기다리고 있다.",
    objective: "세 퍼즐을 푼 뒤, 아홉 표식과 세 기둥, 자정으로 열 것.",
    locked: "",
    needItem: "",
    hints: [
      "일지에서 표식이 아홉인지 확인하십시오.",
      "홈에는 밀랍 인장, 은빛 톱니, 에메랄드만 들어갑니다.",
      "세 기둥을 끼우고 12시 00분에 손잡이를 돌리십시오.",
    ],
    puzzle: null,
    relic: null,
    gate: "finale",
    locks: ["tower-marks", "tower-hour", "tower-pillars"],
    focus: 0.46,
    hotspots: [
      { id: "gears", label: "톱니", x: 18, y: 52, action: "puzzle", puzzle: "tower-marks" },
      { id: "towerclock", label: "시계", x: 38, y: 34, action: "puzzle", puzzle: "tower-hour" },
      { id: "pillars", label: "홈", x: 72, y: 62, action: "puzzle", puzzle: "tower-pillars" },
      { id: "finale", label: "철문", x: 52, y: 50, action: "finale" },
    ],
  },
];
