(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const WINDOW_W = 640;
  const WINDOW_H = 480;
  const TILE = 32;
  const COLS = 15;
  const ROWS = 10;
  const BOARD_W = COLS * TILE;
  const BOARD_H = ROWS * TILE;
  const BOARD_X = (WINDOW_W - BOARD_W) / 2;
  const BOARD_Y = 96;
  const CENTER_COL = 7;
  const MID_ROW = 5;
  const LEFT_GAP = 2;
  const RIGHT_GAP = COLS - 1 - LEFT_GAP;

  const LEFT_GOAL = [6, 0];
  const RIGHT_GOAL = [8, 0];
  const NOVA_START = [2, 9];
  const VEGA_START = [12, 9];
  const BRAND_NAME = "小寶貝飛飛雙向奔赴";
  const BRAND_SUBTITLE = "飛飛和淳忻忻的鏡像奔赴";
  const BRAND_TAGLINE = "雙人同步解謎 / Two-way Mirror Puzzle";
  const FEIFEI_NAME = "飛飛";
  const CHUNXINXIN_NAME = "淳忻忻";
  const HIGH_SCORE_KEY = "baby-feifei-high-score";

  const STATE_TITLE = "title";
  const STATE_HELP = "help";
  const STATE_PLAYING = "playing";
  const STATE_PAUSED = "paused";
  const STATE_LIFE_LOST = "life_lost";
  const STATE_LEVEL_CLEAR = "level_clear";
  const STATE_GAME_OVER = "game_over";
  const STATE_WIN = "win";

  const DIR_VECTORS = new Map([
    ["ArrowLeft", [-1, 0]],
    ["ArrowRight", [1, 0]],
    ["ArrowUp", [0, -1]],
    ["ArrowDown", [0, 1]],
  ]);
  const TRAP_ESCAPE_STEPS = 4;

  const DIFFICULTIES = {
    easy: {
      label: "簡單 Easy",
      time: 125,
      drone: 0.72,
      bolt: 0.58,
    },
    normal: {
      label: "普通 Normal",
      time: 105,
      drone: 0.56,
      bolt: 0.46,
    },
    hard: {
      label: "困難 Hard",
      time: 90,
      drone: 0.42,
      bolt: 0.36,
    },
  };

  const COLORS = {
    bg: "#0c0e1c",
    panel: "#1a1e36",
    board: "#121626",
    grid: "#22283e",
    wall: "#405eaa",
    wallHi: "#6688e2",
    centerWall: "#26305c",
    goal: "#ffd662",
    core: "#ff5082",
    text: "#eef2ff",
    muted: "#a0accc",
    danger: "#ff5c50",
    nova: "#ffd94a",
    vega: "#f5f7ff",
    white: "#f5f7ff",
    black: "#080a10",
    yellow: "#ffdc5c",
    pulse: "#8ef0ff",
    snare: "#c6cde0",
    bolt: "#ff6e28",
    switcher: "#ff66c4",
  };

  const CHARACTER_ASSETS = {
    feifei: {
      name: FEIFEI_NAME,
      color: COLORS.nova,
      src: "assets/characters/feifei.jpg",
      crop: { x: 20, y: 54, w: 156, h: 150 },
    },
    chunxinxin: {
      name: CHUNXINXIN_NAME,
      color: COLORS.vega,
      src: "assets/characters/chunxinxin.jpg",
      crop: { x: 0, y: 0, w: 188, h: 180 },
    },
  };

  const CHARACTER_IMAGE_STATE = new Map();

  function preloadCharacterImages() {
    for (const [key, asset] of Object.entries(CHARACTER_ASSETS)) {
      const image = new Image();
      const state = { image, loaded: false, failed: false };
      image.onload = () => {
        state.loaded = true;
      };
      image.onerror = () => {
        state.failed = true;
      };
      image.src = asset.src;
      CHARACTER_IMAGE_STATE.set(key, state);
    }
  }

  preloadCharacterImages();

  const ITEM_TYPES = ["battery", "shield", "metronome", "scanner", "prism"];
  const ITEM_LABELS = {
    battery: "能量電池 Battery",
    shield: "緩速護盾 Shield",
    metronome: "節拍核心 Metronome",
    scanner: "掃描模組 Scanner",
    prism: "稜鏡護場 Prism",
    life: "備用核心 1UP",
    score: "資料庫 Bonus",
  };

  const LEVEL_WALLS = [
    [
      [3, 1], [4, 1],
      [1, 2], [5, 2],
      [3, 3], [4, 3],
      [1, 4], [2, 4], [5, 4],
      [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5],
      [3, 7], [4, 7],
      [1, 8], [5, 8],
      [10, 1], [11, 1],
      [9, 2], [13, 2],
      [10, 3], [11, 3],
      [9, 4], [12, 4], [13, 4],
      [8, 5], [9, 5], [10, 5], [11, 5], [12, 5], [13, 5],
      [10, 7], [11, 7],
      [9, 8], [13, 8],
    ],
    [
      [1, 1], [3, 1], [5, 2], [1, 3], [2, 3], [5, 4], [3, 5],
      [4, 5], [1, 6], [5, 7], [2, 8], [4, 8],
      [9, 1], [13, 1], [9, 2], [11, 3], [12, 3], [13, 4],
      [9, 5], [10, 5], [12, 6], [13, 7], [9, 8], [10, 8],
    ],
    [
      [3, 1], [1, 2], [2, 2], [5, 2], [5, 3], [1, 4], [3, 4],
      [4, 4], [2, 5], [5, 6], [1, 7], [2, 7], [4, 8],
      [10, 1], [11, 1], [13, 2], [9, 3], [10, 3], [13, 4],
      [11, 5], [12, 5], [9, 6], [13, 7], [10, 8], [11, 8],
    ],
    [
      [1, 1], [2, 1], [4, 1], [4, 2], [1, 3], [3, 4], [5, 4],
      [2, 5], [3, 5], [5, 6], [1, 7], [4, 7], [5, 8],
      [12, 1], [13, 1], [9, 2], [11, 2], [13, 3], [9, 4],
      [10, 4], [12, 5], [14, 5], [10, 6], [11, 7], [13, 8],
    ],
    [
      [2, 1], [4, 1], [1, 2], [5, 2], [3, 3], [4, 3], [1, 4],
      [2, 5], [5, 5], [1, 6], [3, 7], [5, 7], [2, 8], [4, 8],
      [9, 1], [11, 1], [13, 1], [10, 2], [13, 3], [9, 4],
      [11, 4], [12, 4], [14, 5], [10, 6], [12, 7], [9, 8], [13, 8],
    ],
    [
      [1, 1], [5, 1], [3, 2], [4, 2], [1, 3], [2, 4], [5, 4],
      [3, 5], [1, 6], [4, 6], [5, 7], [2, 8],
      [10, 1], [12, 1], [13, 2], [9, 3], [11, 3], [13, 4],
      [9, 5], [10, 5], [12, 6], [14, 6], [9, 7], [11, 8], [12, 8],
    ],
    [
      [2, 1], [3, 1], [5, 2], [1, 3], [3, 3], [4, 4], [1, 5],
      [5, 5], [2, 6], [4, 7], [1, 8], [3, 8],
      [9, 1], [11, 2], [12, 2], [14, 2], [10, 3], [13, 4],
      [9, 5], [11, 5], [12, 6], [14, 7], [10, 8], [12, 8],
    ],
    [
      [1, 1], [4, 1], [5, 1], [2, 2], [4, 3], [1, 4], [3, 4],
      [5, 5], [2, 6], [3, 6], [1, 7], [5, 8],
      [10, 1], [13, 1], [9, 2], [12, 2], [14, 3], [11, 4],
      [12, 4], [9, 5], [13, 6], [10, 7], [11, 7], [14, 8],
    ],
    [
      [3, 1], [5, 1], [1, 2], [2, 3], [5, 3], [1, 4], [3, 5],
      [4, 5], [1, 6], [5, 6], [2, 7], [4, 8],
      [9, 1], [12, 1], [14, 1], [10, 2], [13, 3], [9, 4],
      [11, 4], [14, 5], [10, 6], [12, 6], [9, 7], [13, 8],
    ],
    [
      [1, 1], [2, 1], [4, 2], [5, 2], [1, 3], [3, 3], [5, 4],
      [2, 5], [4, 5], [1, 6], [3, 7], [5, 7], [2, 8],
      [10, 1], [13, 1], [9, 2], [11, 2], [14, 3], [10, 4],
      [12, 4], [9, 5], [13, 5], [11, 6], [14, 7], [10, 8], [12, 8],
    ],
  ];

  const cellKey = ([x, y]) => `${x},${y}`;
  const sameCell = (a, b) => a[0] === b[0] && a[1] === b[1];
  const addPos = ([x, y], [dx, dy]) => [x + dx, y + dy];
  const mirrorCell = ([x, y]) => [COLS - 1 - x, y];
  const inBounds = ([x, y]) => x >= 0 && x < COLS && y >= 0 && y < ROWS;
  const randomChoice = (items) => items[Math.floor(Math.random() * items.length)];

  function gridToPx([x, y]) {
    return [BOARD_X + x * TILE, BOARD_Y + y * TILE];
  }

  function cellCenter(pos) {
    const [x, y] = gridToPx(pos);
    return [x + TILE / 2, y + TILE / 2];
  }

  function passableInLayout(layout, pos) {
    if (!inBounds(pos)) return false;
    const [x, y] = pos;
    return layout[y][x] === ".";
  }

  function reachable(layout, start, goal) {
    if (!passableInLayout(layout, start) || !passableInLayout(layout, goal)) return false;
    const seen = new Set([cellKey(start)]);
    const frontier = [start];
    while (frontier.length) {
      const pos = frontier.pop();
      if (sameCell(pos, goal)) return true;
      for (const vec of DIR_VECTORS.values()) {
        const next = addPos(pos, vec);
        const key = cellKey(next);
        if (!seen.has(key) && passableInLayout(layout, next)) {
          seen.add(key);
          frontier.push(next);
        }
      }
    }
    return false;
  }

  function buildBaseLayout(walls) {
    const rows = Array.from({ length: ROWS }, () => Array(COLS).fill("."));
    rows[0][CENTER_COL] = "C";
    for (let y = 1; y < ROWS; y += 1) rows[y][CENTER_COL] = "#";

    const protectedCells = new Set([
      cellKey(LEFT_GOAL),
      cellKey(RIGHT_GOAL),
      cellKey(NOVA_START),
      cellKey(VEGA_START),
    ]);

    for (const [x, y] of walls) {
      if (protectedCells.has(cellKey([x, y]))) continue;
      if (inBounds([x, y]) && x !== CENTER_COL && y !== 0) rows[y][x] = "#";
    }

    for (let x = 0; x < COLS; x += 1) {
      if (x === CENTER_COL) continue;
      rows[MID_ROW][x] = (x === LEFT_GAP || x === RIGHT_GAP) ? "." : "#";
    }

    let layout = rows.map((row) => row.join(""));
    if (!reachable(layout, NOVA_START, LEFT_GOAL)) {
      for (let y = 1; y < ROWS; y += 1) {
        for (let x = 0; x < CENTER_COL; x += 1) {
          if (y === MID_ROW && x !== LEFT_GAP) continue;
          rows[y][x] = ".";
        }
      }
    }

    layout = rows.map((row) => row.join(""));
    if (!reachable(layout, VEGA_START, RIGHT_GOAL)) {
      for (let y = 1; y < ROWS; y += 1) {
        for (let x = CENTER_COL + 1; x < COLS; x += 1) {
          if (y === MID_ROW && x !== RIGHT_GAP) continue;
          rows[y][x] = ".";
        }
      }
    }

    return rows.map((row) => row.join(""));
  }

  function nearestFloor(layout, pos, reserved = new Set()) {
    if (passableInLayout(layout, pos) && !reserved.has(cellKey(pos))) return [...pos];
    const [x0, y0] = pos;
    for (let radius = 1; radius < 12; radius += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const candidate = [x0 + dx, y0 + dy];
          if (passableInLayout(layout, candidate) && !reserved.has(cellKey(candidate))) {
            return candidate;
          }
        }
      }
    }
    return [...NOVA_START];
  }

  function reserveNearest(layout, pos, reserved) {
    const floor = nearestFloor(layout, pos, reserved);
    reserved.add(cellKey(floor));
    return floor;
  }

  function balancedPairPositions(layout, leftSeeds, countPerSide, reserved) {
    const positions = [];
    for (let i = 0; i < countPerSide; i += 1) {
      const seed = leftSeeds[i % leftSeeds.length];
      positions.push(reserveNearest(layout, seed, reserved));
      positions.push(reserveNearest(layout, mirrorCell(seed), reserved));
    }
    return positions;
  }

  function makeLevel(number) {
    const layout = buildBaseLayout(LEVEL_WALLS[number - 1]);
    const reserved = new Set([
      cellKey(LEFT_GOAL),
      cellKey(RIGHT_GOAL),
      cellKey(NOVA_START),
      cellKey(VEGA_START),
    ]);

    const snareSeeds = [
      [(1 + number) % 6, 3 + (number % 5)],
      [5, 5 + (number % 4)],
      [2 + ((number * 3) % 4), 1 + ((number * 2) % 7)],
    ];
    const snarePairs = 1 + (number >= 4 ? 1 : 0) + (number >= 8 ? 1 : 0);
    const snares = new Set(balancedPairPositions(layout, snareSeeds, snarePairs, reserved).map(cellKey));

    const droneSeeds = [
      [1 + ((number * 2) % 6), 1 + (number % 8)],
      [1 + ((number + 3) % 6), 1 + ((number * 2) % 8)],
      [1 + ((number * 5) % 6), 1 + ((number + 5) % 8)],
    ];
    const dronePairs = 1 + (number >= 3 ? 1 : 0) + (number >= 7 ? 1 : 0);
    const drones = balancedPairPositions(layout, droneSeeds, dronePairs, reserved);

    const surges = [];
    if (number >= 3) {
      const leftSeed = [4, 1 + (number % 7)];
      surges.push({ pos: reserveNearest(layout, leftSeed, reserved), direction: [0, 1], timer: 0 });
      surges.push({ pos: reserveNearest(layout, mirrorCell(leftSeed), reserved), direction: [0, -1], timer: 0 });
    }
    if (number >= 7) {
      const leftSeed = [2 + (number % 3), 2 + ((number * 2) % 6)];
      surges.push({ pos: reserveNearest(layout, leftSeed, reserved), direction: [1, 0], timer: 0 });
      surges.push({ pos: reserveNearest(layout, mirrorCell(leftSeed), reserved), direction: [-1, 0], timer: 0 });
    }

    const switchers = [];
    if (number >= 9) {
      const leftSeed = [2, 5];
      switchers.push({ pos: reserveNearest(layout, leftSeed, reserved), direction: [1, 0], timer: 0, cooldown: 0 });
      switchers.push({ pos: reserveNearest(layout, mirrorCell(leftSeed), reserved), direction: [-1, 0], timer: 0, cooldown: 0 });
    }

    const hiddenPos = reserveNearest(layout, [1 + (number % 5), 2 + ((number * 2) % 6)], reserved);
    const hiddenKind = new Set([3, 8]).has(number) ? "life" : "score";

    return {
      number,
      name: `TWO-WAY MAZE ${number}`,
      layout,
      snares,
      drones,
      surges,
      switchers,
      hiddenPos,
      hiddenKind,
      bonus: false,
      bonusCores: new Set(),
    };
  }

  function makeBonusLevel(afterLevel) {
    const layout = buildBaseLayout([]);
    const reserved = new Set([
      cellKey(LEFT_GOAL),
      cellKey(RIGHT_GOAL),
      cellKey(NOVA_START),
      cellKey(VEGA_START),
    ]);
    const coreSeeds = [
      [1, 1], [3, 2], [5, 4], [2, 6], [4, 8],
      [9, 1], [11, 3], [13, 2], [10, 6], [12, 8],
    ];
    const cores = new Set(coreSeeds.map((pos) => cellKey(nearestFloor(layout, pos, reserved))));
    return {
      number: afterLevel,
      name: `BONUS RUN ${afterLevel}`,
      layout,
      snares: new Set(),
      drones: [],
      surges: [],
      switchers: [],
      hiddenPos: [1, 1],
      hiddenKind: "score",
      bonus: true,
      bonusCores: cores,
    };
  }

  function drawCore(context, [x, y], size, color) {
    const r = Math.max(5, Math.floor(size / 2));
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x, y - r);
    context.lineTo(x + r, y);
    context.lineTo(x, y + r);
    context.lineTo(x - r, y);
    context.closePath();
    context.fill();
    context.strokeStyle = COLORS.white;
    context.lineWidth = Math.max(1, Math.floor(size / 12));
    context.stroke();
    context.fillStyle = "rgba(255, 255, 255, 0.75)";
    context.beginPath();
    context.arc(x, y, Math.max(2, Math.floor(size / 8)), 0, Math.PI * 2);
    context.fill();
  }

  function roundedRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + width - r, y);
    context.quadraticCurveTo(x + width, y, x + width, y + r);
    context.lineTo(x + width, y + height - r);
    context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    context.lineTo(x + r, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
  }

  class BabyFeifeiGame {
    constructor() {
      this.keysDown = new Set();
      this.heldOrder = [];
      this.running = true;
      this.state = STATE_TITLE;
      this.primary = FEIFEI_NAME;
      this.difficulty = "normal";
      this.syncBuffer = "";
      this.syncMode = false;
      this.highScore = this.loadHighScore();

      this.score = 0;
      this.lives = 3;
      this.levelNo = 1;
      this.stageIsBonus = false;
      this.bonusAfter = 0;

      this.level = makeLevel(1);
      this.nova = this.makeRunner(FEIFEI_NAME, COLORS.nova, NOVA_START, "feifei");
      this.vega = this.makeRunner(CHUNXINXIN_NAME, COLORS.vega, VEGA_START, "chunxinxin");
      this.snares = new Set();
      this.drones = [];
      this.surges = [];
      this.switchers = [];
      this.items = [];
      this.bonusCores = new Set();
      this.hiddenRevealed = false;
      this.hiddenCollected = false;

      this.timeLeft = 100;
      this.elapsedStage = 0;
      this.moveCooldown = 0;
      this.pulseCooldown = 0;
      this.pulses = [];

      this.enemySlowTimer = 0;
      this.boltFreezeTimer = 0;
      this.invincibleTimer = 0;
      this.message = "";
      this.messageTimer = 0;
      this.clearTimer = 0;
      this.lifeLostTimer = 0;
      this.lastTime = performance.now();
    }

    makeRunner(name, color, pos, spriteKey) {
      return {
        name,
        color,
        spriteKey,
        pos: [...pos],
        facing: [0, -1],
        trapped: false,
        trapEscape: 0,
      };
    }

    loadHighScore() {
      try {
        return Number.parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0", 10) || 0;
      } catch {
        return 0;
      }
    }

    saveHighScore() {
      if (this.score <= this.highScore) return;
      this.highScore = this.score;
      try {
        localStorage.setItem(HIGH_SCORE_KEY, String(this.highScore));
      } catch {
        // Local storage can be blocked in private contexts; the game still runs.
      }
    }

    newGame() {
      this.score = 0;
      this.lives = 3;
      this.levelNo = 1;
      this.stageIsBonus = false;
      this.bonusAfter = 0;
      this.loadStage();
      this.state = STATE_PLAYING;
    }

    loadStage() {
      this.level = this.stageIsBonus ? makeBonusLevel(this.bonusAfter) : makeLevel(this.levelNo);
      this.nova = this.makeRunner(FEIFEI_NAME, COLORS.nova, NOVA_START, "feifei");
      this.vega = this.makeRunner(CHUNXINXIN_NAME, COLORS.vega, VEGA_START, "chunxinxin");

      this.snares = new Set(this.level.snares);
      this.drones = this.level.drones.map((pos) => ({ pos: [...pos], timer: Math.random() * 0.4 }));
      this.surges = this.level.surges.map((surge) => ({
        pos: [...surge.pos],
        direction: [...surge.direction],
        timer: Math.random() * 0.3,
      }));
      this.switchers = this.level.switchers.map((switcher) => ({
        pos: [...switcher.pos],
        direction: [...switcher.direction],
        timer: 0,
        cooldown: 0,
      }));
      this.items = [];
      this.bonusCores = new Set(this.level.bonusCores);
      this.hiddenRevealed = false;
      this.hiddenCollected = false;

      this.timeLeft = this.level.bonus ? 45 : DIFFICULTIES[this.difficulty].time;
      this.elapsedStage = 0;
      this.moveCooldown = 0;
      this.pulseCooldown = 0;
      this.pulses = [];
      this.enemySlowTimer = 0;
      this.boltFreezeTimer = 0;
      this.invincibleTimer = 0;
      this.message = this.level.bonus ? "Bonus Stage: 收集所有同步核心!" : "";
      this.messageTimer = this.level.bonus ? 3 : 0;
    }

    loseLife(reason) {
      if (this.state !== STATE_PLAYING) return;
      this.lives -= 1;
      this.message = reason;
      this.messageTimer = 1.5;
      if (this.lives <= 0) {
        this.saveHighScore();
        this.state = STATE_GAME_OVER;
      } else {
        this.lifeLostTimer = 1.25;
        this.state = STATE_LIFE_LOST;
      }
    }

    clearStage() {
      if (this.state !== STATE_PLAYING) return;
      const timeBonus = Math.max(0, Math.floor(this.timeLeft)) * (this.level.bonus ? 30 : 10);
      this.score += timeBonus;
      this.saveHighScore();
      this.clearTimer = 2.8;
      this.state = STATE_LEVEL_CLEAR;
    }

    advanceAfterClear() {
      if (this.stageIsBonus) {
        if (this.bonusAfter >= 10) {
          this.saveHighScore();
          this.state = STATE_WIN;
          return;
        }
        this.levelNo = this.bonusAfter + 1;
        this.stageIsBonus = false;
        this.bonusAfter = 0;
      } else if (this.levelNo % 5 === 0) {
        this.stageIsBonus = true;
        this.bonusAfter = this.levelNo;
      } else {
        this.levelNo += 1;
      }

      this.loadStage();
      this.state = STATE_PLAYING;
    }

    handleKeyDown(code, key = code) {
      if (DIR_VECTORS.has(code)) {
        this.keysDown.add(code);
        this.heldOrder = this.heldOrder.filter((held) => held !== code);
        this.heldOrder.push(code);
      }

      if (code === "KeyF") {
        this.primary = FEIFEI_NAME;
      } else if (code === "KeyC") {
        this.primary = CHUNXINXIN_NAME;
      }

      if (this.state === STATE_TITLE) {
        if (code === "Enter") {
          this.newGame();
        } else if (code === "KeyH") {
          this.state = STATE_HELP;
        } else if (code === "Digit1") {
          this.difficulty = "easy";
        } else if (code === "Digit2") {
          this.difficulty = "normal";
        } else if (code === "Digit3") {
          this.difficulty = "hard";
        } else if (/^[a-z]$/i.test(key)) {
          this.syncBuffer = (this.syncBuffer + key.toLowerCase()).slice(-8);
          if (this.syncBuffer.endsWith("love")) {
            this.syncMode = !this.syncMode;
            this.message = this.syncMode ? "雙向奔赴彩蛋 ON" : "雙向奔赴彩蛋 OFF";
            this.messageTimer = 2;
          }
        }
      } else if (this.state === STATE_HELP) {
        if (["Escape", "Enter", "KeyH"].includes(code)) this.state = STATE_TITLE;
      } else if (this.state === STATE_PLAYING) {
        if (code === "KeyP") {
          this.state = STATE_PAUSED;
        } else if (code === "KeyZ" || code === "Space") {
          this.pulse();
        }
      } else if (this.state === STATE_PAUSED) {
        if (code === "KeyP") {
          this.state = STATE_PLAYING;
        } else if (code === "Escape") {
          this.state = STATE_TITLE;
        }
      } else if (this.state === STATE_GAME_OVER || this.state === STATE_WIN) {
        if (code === "Enter") {
          this.state = STATE_TITLE;
        }
      }
    }

    handleKeyUp(code) {
      this.keysDown.delete(code);
      this.heldOrder = this.heldOrder.filter((held) => held !== code);
    }

    currentDirection() {
      for (let i = this.heldOrder.length - 1; i >= 0; i -= 1) {
        const code = this.heldOrder[i];
        if (this.keysDown.has(code)) return DIR_VECTORS.get(code);
      }
      return null;
    }

    isPassable(pos) {
      return passableInLayout(this.level.layout, pos);
    }

    actualVectors(inputVec) {
      const [dx, dy] = inputVec;
      const normal = [dx, dy];
      const mirrored = dx ? [-dx, dy] : [0, dy];
      return this.primary === FEIFEI_NAME ? [normal, mirrored] : [mirrored, normal];
    }

    trapRunner(runner) {
      if (!runner.trapped) runner.trapEscape = 0;
      runner.trapped = true;
      this.message = `${runner.name} 被靜滯場困住，按方向或 Z 充能掙脫!`;
      this.messageTimer = 1.8;
    }

    freeRunner(runner, message = `${runner.name} 掙脫靜滯場!`) {
      const key = cellKey(runner.pos);
      if (this.snares.has(key)) this.snares.delete(key);
      runner.trapped = false;
      runner.trapEscape = 0;
      this.score += 80;
      this.message = message;
      this.messageTimer = 1.4;
    }

    struggleRunner(runner, amount = 1) {
      if (!runner.trapped) return false;
      runner.trapEscape = Math.min(TRAP_ESCAPE_STEPS, runner.trapEscape + amount);
      if (runner.trapEscape >= TRAP_ESCAPE_STEPS) {
        this.freeRunner(runner);
      } else {
        this.message = `${runner.name} 掙脫中 ${runner.trapEscape}/${TRAP_ESCAPE_STEPS}`;
        this.messageTimer = 0.8;
      }
      return true;
    }

    moveRunners(inputVec) {
      const [novaVec, vegaVec] = this.actualVectors(inputVec);
      const oldFeifei = [...this.nova.pos];
      const oldChunxinxin = [...this.vega.pos];
      let newFeifei = oldFeifei;
      let newChunxinxin = oldChunxinxin;

      if (!this.nova.trapped) {
        this.nova.facing = novaVec;
        const candidate = addPos(oldFeifei, novaVec);
        if (this.isPassable(candidate)) newFeifei = candidate;
      } else {
        this.nova.facing = novaVec;
        this.struggleRunner(this.nova);
      }

      if (!this.vega.trapped) {
        this.vega.facing = vegaVec;
        const candidate = addPos(oldChunxinxin, vegaVec);
        if (this.isPassable(candidate)) newChunxinxin = candidate;
      } else {
        this.vega.facing = vegaVec;
        this.struggleRunner(this.vega);
      }

      if (sameCell(newFeifei, newChunxinxin)) {
        newFeifei = oldFeifei;
        newChunxinxin = oldChunxinxin;
      } else if (sameCell(newFeifei, oldChunxinxin) && sameCell(newChunxinxin, oldChunxinxin)) {
        newFeifei = oldFeifei;
      } else if (sameCell(newChunxinxin, oldFeifei) && sameCell(newFeifei, oldFeifei)) {
        newChunxinxin = oldChunxinxin;
      }

      this.nova.pos = newFeifei;
      this.vega.pos = newChunxinxin;
      this.afterRunnerPositionsChanged();
    }

    afterRunnerPositionsChanged() {
      for (const runner of [this.nova, this.vega]) {
        if (this.snares.has(cellKey(runner.pos))) {
          this.trapRunner(runner);
        }
        this.collectAt(runner.pos);
      }

      if (this.nova.trapped && this.vega.trapped) {
        this.message = "飛飛和淳忻忻同時被困，連按方向或 Z 掙脫!";
        this.messageTimer = 1.4;
      }

      this.checkCollisions();
      this.checkStageGoal();
    }

    pulse() {
      if (this.pulseCooldown > 0 || this.state !== STATE_PLAYING) return;
      this.pulseCooldown = 0.22;

      for (const runner of [this.nova, this.vega]) {
        if (runner.trapped) {
          this.struggleRunner(runner, 2);
          continue;
        }
        const target = addPos(runner.pos, runner.facing);
        if (!inBounds(target)) continue;
        this.pulses.push({ origin: [...runner.pos], target, timer: 0.14 });
        this.applyPulseToCell(target, true);

        const mirror = mirrorCell(target);
        if (!sameCell(mirror, target)) this.applyPulseToCell(mirror, false);
      }
    }

    applyPulseToCell(cell, allowAttack) {
      const key = cellKey(cell);
      if (this.snares.has(key)) {
        this.snares.delete(key);
        if (sameCell(this.nova.pos, cell)) {
          this.nova.trapped = false;
          this.nova.trapEscape = 0;
        }
        if (sameCell(this.vega.pos, cell)) {
          this.vega.trapped = false;
          this.vega.trapEscape = 0;
        }
        this.score += 120;
        this.message = "靜滯場被脈衝打散!";
        this.messageTimer = 1.4;
      }

      if (sameCell(this.level.hiddenPos, cell) && !this.hiddenCollected) {
        this.revealHiddenItem();
      }

      if (allowAttack) {
        for (const drone of [...this.drones]) {
          if (sameCell(drone.pos, cell)) this.killDrone(drone);
        }
      }
    }

    killDrone(drone) {
      const index = this.drones.indexOf(drone);
      if (index === -1) return;
      this.drones.splice(index, 1);
      this.score += 250;
      const kind = randomChoice(ITEM_TYPES);
      this.items.push({ kind, pos: [...drone.pos], life: 12 });
      this.message = `巡邏器停止! 掉落 ${ITEM_LABELS[kind]}`;
      this.messageTimer = 1.6;
    }

    revealHiddenItem() {
      if (this.hiddenCollected) return;
      this.hiddenRevealed = true;
      this.items.push({ kind: this.level.hiddenKind, pos: [...this.level.hiddenPos], life: 20 });
      this.hiddenCollected = true;
      this.message = `發現隱藏道具: ${ITEM_LABELS[this.level.hiddenKind]}`;
      this.messageTimer = 2;
    }

    collectAt(pos) {
      if (sameCell(pos, this.level.hiddenPos) && !this.hiddenCollected) this.revealHiddenItem();

      const coreKey = cellKey(pos);
      if (this.bonusCores.has(coreKey)) {
        this.bonusCores.delete(coreKey);
        this.score += 150;
      }

      for (const item of [...this.items]) {
        if (sameCell(item.pos, pos)) {
          this.applyItem(item.kind);
          this.items.splice(this.items.indexOf(item), 1);
        }
      }
    }

    applyItem(kind) {
      if (kind === "battery") {
        this.score += 300;
      } else if (kind === "shield") {
        this.score += 500;
        this.enemySlowTimer = 8;
      } else if (kind === "metronome") {
        this.score += 800;
        this.boltFreezeTimer = 5;
      } else if (kind === "scanner") {
        this.score += 1000;
        if (!this.hiddenCollected) this.revealHiddenItem();
      } else if (kind === "prism") {
        this.score += 1500;
        this.invincibleTimer = 8;
      } else if (kind === "life") {
        this.score += 1000;
        this.lives += 1;
      } else if (kind === "score") {
        this.score += 2200;
      }
      this.message = `取得 ${ITEM_LABELS[kind]}`;
      this.messageTimer = 1.5;
    }

    checkCollisions() {
      if (this.state !== STATE_PLAYING) return;

      for (const runner of [this.nova, this.vega]) {
        for (const drone of [...this.drones]) {
          if (sameCell(drone.pos, runner.pos)) {
            if (this.invincibleTimer > 0) {
              this.killDrone(drone);
            } else {
              this.loseLife(`${runner.name} 碰到巡邏器!`);
              return;
            }
          }
        }

        for (const surge of this.surges) {
          if (sameCell(surge.pos, runner.pos) && this.invincibleTimer <= 0) {
            this.loseLife(`${runner.name} 碰到能量浪湧!`);
            return;
          }
        }

        for (const switcher of this.switchers) {
          if (switcher.cooldown <= 0 && sameCell(switcher.pos, runner.pos)) {
            const novaPos = this.nova.pos;
            this.nova.pos = this.vega.pos;
            this.vega.pos = novaPos;
            switcher.cooldown = 1.2;
            this.message = "相位轉換器啟動：飛飛和淳忻忻交換位置!";
            this.messageTimer = 2;
            for (const candidate of [this.nova, this.vega]) {
              if (this.snares.has(cellKey(candidate.pos))) this.trapRunner(candidate);
            }
            return;
          }
        }
      }
    }

    checkStageGoal() {
      if (this.nova.trapped || this.vega.trapped) return;
      const bothAtGoal =
        (sameCell(this.nova.pos, LEFT_GOAL) && sameCell(this.vega.pos, RIGHT_GOAL)) ||
        (sameCell(this.nova.pos, RIGHT_GOAL) && sameCell(this.vega.pos, LEFT_GOAL));
      if (this.level.bonus && bothAtGoal && this.bonusCores.size === 0) {
        this.clearStage();
      } else if (!this.level.bonus && bothAtGoal) {
        this.clearStage();
      }
    }

    update(dt) {
      if (this.messageTimer > 0) {
        this.messageTimer -= dt;
        if (this.messageTimer <= 0) this.message = "";
      }

      if (this.state === STATE_PLAYING) {
        this.updatePlaying(dt);
      } else if (this.state === STATE_LIFE_LOST) {
        this.lifeLostTimer -= dt;
        if (this.lifeLostTimer <= 0) {
          this.loadStage();
          this.state = STATE_PLAYING;
        }
      } else if (this.state === STATE_LEVEL_CLEAR) {
        this.clearTimer -= dt;
        if (this.clearTimer <= 0) this.advanceAfterClear();
      }
    }

    updatePlaying(dt) {
      this.elapsedStage += dt;
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.loseLife("時間到 Time Up!");
        return;
      }

      this.moveCooldown = Math.max(0, this.moveCooldown - dt);
      this.pulseCooldown = Math.max(0, this.pulseCooldown - dt);
      this.enemySlowTimer = Math.max(0, this.enemySlowTimer - dt);
      this.boltFreezeTimer = Math.max(0, this.boltFreezeTimer - dt);
      this.invincibleTimer = Math.max(0, this.invincibleTimer - dt);

      for (const pulse of [...this.pulses]) {
        pulse.timer -= dt;
        if (pulse.timer <= 0) this.pulses.splice(this.pulses.indexOf(pulse), 1);
      }

      for (const item of [...this.items]) {
        item.life -= dt;
        if (item.life <= 0 && !["life", "score"].includes(item.kind)) {
          this.items.splice(this.items.indexOf(item), 1);
        }
      }

      const direction = this.currentDirection();
      if (direction && this.moveCooldown <= 0) {
        this.moveRunners(direction);
        this.moveCooldown = this.invincibleTimer > 0 ? 0.08 : 0.135;
        if (this.state !== STATE_PLAYING) return;
      }

      this.updateDrones(dt);
      this.updateSurges(dt);
      this.updateSwitchers(dt);
      this.checkCollisions();
      if (this.state === STATE_PLAYING) this.checkStageGoal();
    }

    updateDrones(dt) {
      if (!this.drones.length) return;
      const base = DIFFICULTIES[this.difficulty].drone;
      const speedup = Math.min(0.28, this.elapsedStage / 230);
      let interval = Math.max(0.18, base - speedup);
      if (this.enemySlowTimer > 0) interval *= 1.7;

      for (const drone of this.drones) {
        drone.timer += dt;
        if (drone.timer < interval) continue;
        drone.timer = 0;
        const choices = [...DIR_VECTORS.values()].map((vec) => addPos(drone.pos, vec)).filter((pos) => this.isPassable(pos));
        if (choices.length) drone.pos = randomChoice(choices);
      }
    }

    updateSurges(dt) {
      if (this.boltFreezeTimer > 0) return;
      const interval = DIFFICULTIES[this.difficulty].bolt;
      for (const surge of this.surges) {
        surge.timer += dt;
        if (surge.timer < interval) continue;
        surge.timer = 0;
        let candidate = addPos(surge.pos, surge.direction);
        if (!this.isPassable(candidate)) {
          surge.direction = [-surge.direction[0], -surge.direction[1]];
          candidate = addPos(surge.pos, surge.direction);
        }
        if (this.isPassable(candidate)) surge.pos = candidate;
      }
    }

    updateSwitchers(dt) {
      for (const switcher of this.switchers) {
        switcher.cooldown = Math.max(0, switcher.cooldown - dt);
        switcher.timer += dt;
        if (switcher.timer < 0.48) continue;
        switcher.timer = 0;
        let candidate = addPos(switcher.pos, switcher.direction);
        if (!this.isPassable(candidate)) {
          switcher.direction = [-switcher.direction[0], -switcher.direction[1]];
          candidate = addPos(switcher.pos, switcher.direction);
        }
        if (this.isPassable(candidate)) switcher.pos = candidate;
      }
    }

    text(text, x, y, size, color = COLORS.text, options = {}) {
      const weight = options.bold ? 800 : 500;
      ctx.font = `${weight} ${size}px "PingFang TC", "PingFang HK", "Hiragino Sans GB", "Microsoft JhengHei", Arial, sans-serif`;
      ctx.textAlign = options.center ? "center" : "left";
      ctx.textBaseline = options.center ? "middle" : "top";
      ctx.fillStyle = "#000000";
      ctx.fillText(text, x + 2, y + 2);
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
    }

    draw() {
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, WINDOW_W, WINDOW_H);

      if (this.state === STATE_TITLE) {
        this.drawTitle();
      } else if (this.state === STATE_HELP) {
        this.drawHelp();
      } else if ([STATE_PLAYING, STATE_PAUSED, STATE_LIFE_LOST, STATE_LEVEL_CLEAR].includes(this.state)) {
        this.drawHud();
        this.drawBoard();
        if (this.state === STATE_PAUSED) {
          this.drawOverlay("PAUSED", "按 P 繼續 / Press P to resume");
        } else if (this.state === STATE_LIFE_LOST) {
          this.drawOverlay("MISS!", this.message || "再試一次");
        } else if (this.state === STATE_LEVEL_CLEAR) {
          this.drawSyncAnimation();
        }
      } else if (this.state === STATE_GAME_OVER) {
        this.drawGameOver(false);
      } else if (this.state === STATE_WIN) {
        this.drawGameOver(true);
      }
    }

    drawTitle() {
      this.text(BRAND_NAME, WINDOW_W / 2, 72, 42, COLORS.yellow, { center: true, bold: true });
      this.text(BRAND_SUBTITLE, WINDOW_W / 2, 120, 30, COLORS.core, { center: true, bold: true });
      this.text(BRAND_TAGLINE, WINDOW_W / 2, 156, 22, COLORS.text, { center: true });

      const left = 100;
      const y = 210;
      this.text(`主要控制: ${this.primary}   [F/C 切換]`, left, y, 22);
      this.text(`難度 Difficulty: ${DIFFICULTIES[this.difficulty].label}   [1/2/3]`, left, y + 34, 22);
      this.text("方向鍵移動，Z/Space 發出心意，P 暫停", left, y + 78, 22, COLORS.muted);
      this.text("Press ENTER to Start    H: Help", left, y + 112, 22, COLORS.yellow);
      this.text("彩蛋: LOVE", WINDOW_W / 2, y + 148, 16, COLORS.muted, { center: true });

      if (this.message) this.text(this.message, WINDOW_W / 2, 452, 22, COLORS.core, { center: true });

      this.drawRunnerAt([154, 426], COLORS.nova, FEIFEI_NAME, [1, 0], false, "feifei", 68);
      this.drawRunnerAt([486, 426], COLORS.vega, CHUNXINXIN_NAME, [-1, 0], false, "chunxinxin", 68);
      drawCore(ctx, [320, 422], 34, COLORS.core);
    }

    drawHelp() {
      const lines = [
        ["玩法說明 / How to Play", 34, COLORS.yellow, true],
        ["", 16, COLORS.text, false],
        ["你同時控制飛飛和淳忻忻。主要角色左右正常，另一名左右相反，上下相同。", 16, COLORS.text, false],
        ["You control both characters at once. The partner mirrors left/right.", 16, COLORS.text, false],
        ["", 16, COLORS.text, false],
        ["目標：飛飛和淳忻忻必須同時站在上方同步核心左右兩格。", 16, COLORS.text, false],
        ["Goal: stand on both sides of the relay core at the same time.", 16, COLORS.text, false],
        ["", 16, COLORS.text, false],
        ["Z 或 Space：向前 1 格發出心意。可停止巡邏器、打散靜滯場。", 16, COLORS.text, false],
        ["Z or Space: send a pulse one tile forward to clear drones and snares.", 16, COLORS.text, false],
        ["", 16, COLORS.text, false],
        ["靜滯場：踩中會被困；按方向鍵或 Z 會累積掙脫進度。", 16, COLORS.text, false],
        ["Surges cannot be stopped. Phase switchers after level 9 swap the runners.", 16, COLORS.text, false],
        ["", 16, COLORS.text, false],
        ["每 5 關有 Bonus Stage：收集所有同步核心，再一起抵達目標。", 16, COLORS.text, false],
        ["", 16, COLORS.text, false],
        ["按 Enter / H / Esc 返回標題。", 16, COLORS.text, false],
      ];
      let y = 42;
      for (const [line, size, color, bold] of lines) {
        this.text(line, WINDOW_W / 2, y, size, color, { center: true, bold });
        y += size === 34 ? 34 : 24;
      }
    }

    drawHud() {
      ctx.fillStyle = COLORS.panel;
      ctx.fillRect(0, 0, WINDOW_W, 84);
      const levelLabel = this.stageIsBonus ? `BONUS ${this.bonusAfter}` : `LEVEL ${this.levelNo}`;
      this.text(`SCORE ${String(this.score).padStart(6, "0")}`, 20, 14, 22, COLORS.yellow);
      this.text(`HI ${String(this.highScore).padStart(6, "0")}`, 230, 14, 22, COLORS.muted);
      this.text(levelLabel, 430, 14, 22);
      this.text(`LIVES ${this.lives}`, 20, 48, 22);
      this.text(`TIME ${String(Math.max(0, Math.floor(this.timeLeft))).padStart(3, "0")}`, 170, 48, 22, this.timeLeft < 15 ? COLORS.danger : COLORS.text);
      this.text(`主控 ${this.primary}`, 320, 48, 16, COLORS.muted);
      if (this.invincibleTimer > 0) {
        this.text("PRISM", 515, 48, 22, COLORS.yellow);
      } else if (this.enemySlowTimer > 0) {
        this.text("SLOW", 530, 48, 22, COLORS.pulse);
      } else if (this.boltFreezeTimer > 0) {
        this.text("FREEZE", 510, 48, 22, COLORS.pulse);
      }
    }

    drawBoard() {
      ctx.fillStyle = COLORS.board;
      ctx.fillRect(BOARD_X, BOARD_Y, BOARD_W, BOARD_H);
      for (let y = 0; y < ROWS; y += 1) {
        for (let x = 0; x < COLS; x += 1) {
          const rectX = BOARD_X + x * TILE;
          const rectY = BOARD_Y + y * TILE;
          const cell = this.level.layout[y][x];
          if (cell === "#") {
            const isStructural = x === CENTER_COL || y === MID_ROW;
            ctx.fillStyle = isStructural ? COLORS.centerWall : COLORS.wall;
            ctx.fillRect(rectX, rectY, TILE, TILE);
            ctx.strokeStyle = COLORS.wallHi;
            ctx.lineWidth = 2;
            ctx.strokeRect(rectX + 1, rectY + 1, TILE - 2, TILE - 2);
          } else if (cell === "C") {
            this.drawRelayCore([x, y]);
          } else {
            ctx.strokeStyle = COLORS.grid;
            ctx.lineWidth = 1;
            ctx.strokeRect(rectX + 0.5, rectY + 0.5, TILE - 1, TILE - 1);
          }
        }
      }

      this.drawGoalMarkers();

      for (const core of this.bonusCores) {
        const pos = core.split(",").map(Number);
        const [cx, cy] = cellCenter(pos);
        const bob = Math.sin(performance.now() * 0.008 + pos[0]) * 2;
        drawCore(ctx, [cx, cy + bob], 18, COLORS.core);
      }

      for (const snare of this.snares) this.drawSnare(snare.split(",").map(Number));
      if (this.hiddenRevealed && !this.hiddenCollected) this.drawItemIcon(this.level.hiddenKind, this.level.hiddenPos);
      for (const item of this.items) this.drawItemIcon(item.kind, item.pos);
      for (const drone of this.drones) this.drawDrone(drone.pos);
      for (const surge of this.surges) this.drawSurge(surge.pos);
      for (const switcher of this.switchers) this.drawSwitcher(switcher.pos);
      for (const pulse of this.pulses) this.drawPulse(pulse);

      this.drawRunner(this.nova);
      this.drawRunner(this.vega);

      if (this.message) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(BOARD_X, BOARD_Y + BOARD_H + 8, BOARD_W, 28);
        this.text(this.message, WINDOW_W / 2, BOARD_Y + BOARD_H + 22, 16, COLORS.yellow, { center: true });
      }

      let footer = "Arrows 移動 | Z/Space 心意 | P 暫停";
      if (this.level.bonus) footer += ` | Cores left: ${this.bonusCores.size}`;
      this.text(footer, WINDOW_W / 2, WINDOW_H - 20, 16, COLORS.muted, { center: true });
    }

    drawGoalMarkers() {
      for (const pos of [LEFT_GOAL, RIGHT_GOAL]) {
        const [x, y] = gridToPx(pos);
        ctx.strokeStyle = "#5a4420";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
        drawCore(ctx, [x + TILE / 2, y + TILE / 2], 12, COLORS.goal);
      }
    }

    drawRelayCore(pos) {
      const [x, y] = gridToPx(pos);
      ctx.fillStyle = "#182531";
      ctx.fillRect(x, y, TILE, TILE);
      drawCore(ctx, [x + TILE / 2, y + TILE / 2], 18, COLORS.core);
      ctx.strokeStyle = COLORS.goal;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + TILE / 2, y + 4);
      ctx.lineTo(x + TILE - 4, y + TILE / 2);
      ctx.lineTo(x + TILE / 2, y + TILE - 4);
      ctx.lineTo(x + 4, y + TILE / 2);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeStyle = COLORS.pulse;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 8);
      ctx.lineTo(x + TILE - 8, y + TILE - 8);
      ctx.moveTo(x + TILE - 8, y + 8);
      ctx.lineTo(x + 8, y + TILE - 8);
      ctx.stroke();
      ctx.strokeRect(x + 2, y + 2, TILE - 4, TILE - 4);
    }

    drawRunner(runner) {
      this.drawRunnerAt(cellCenter(runner.pos), runner.color, runner.name, runner.facing, runner.trapped, runner.spriteKey);
    }

    drawRunnerAt([cx, cy], color, name, facing, trapped, spriteKey = null, size = 32) {
      const half = size / 2;
      const labelSize = Math.max(14, Math.min(18, Math.floor(size * 0.42)));
      const character = spriteKey ? CHARACTER_ASSETS[spriteKey] : null;
      const imageState = spriteKey ? CHARACTER_IMAGE_STATE.get(spriteKey) : null;
      const pulseGlow = Math.sin(performance.now() * 0.01) * 0.18 + 0.72;
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.beginPath();
      ctx.ellipse(cx, cy + half * 0.82, half * 0.72, Math.max(3, size * 0.09), 0, 0, Math.PI * 2);
      ctx.fill();

      if (character && imageState?.loaded) {
        const x = cx - half;
        const y = cy - half;
        ctx.save();
        roundedRect(ctx, x, y, size, size, Math.max(6, size * 0.22));
        ctx.clip();
        ctx.fillStyle = COLORS.black;
        ctx.fillRect(x, y, size, size);
        const { crop } = character;
        ctx.drawImage(imageState.image, crop.x, crop.y, crop.w, crop.h, x, y, size, size);
        ctx.restore();

        ctx.strokeStyle = trapped ? COLORS.snare : COLORS.white;
        ctx.lineWidth = Math.max(2, size * 0.07);
        roundedRect(ctx, x + 1, y + 1, size - 2, size - 2, Math.max(5, size * 0.2));
        ctx.stroke();
      } else {
        const scale = size / 32;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 14 * scale);
        ctx.lineTo(cx + 12 * scale, cy - 4 * scale);
        ctx.lineTo(cx + 9 * scale, cy + 12 * scale);
        ctx.lineTo(cx, cy + 16 * scale);
        ctx.lineTo(cx - 9 * scale, cy + 12 * scale);
        ctx.lineTo(cx - 12 * scale, cy - 4 * scale);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = COLORS.white;
        ctx.lineWidth = Math.max(2, 2 * scale);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${pulseGlow})`;
        roundedRect(ctx, cx - 5 * scale, cy - 8 * scale, 10 * scale, 15 * scale, 4 * scale);
        ctx.fill();
      }

      if (facing[0] || facing[1]) {
        const arrow = Math.max(5, size * 0.17);
        const normal = [-facing[1], facing[0]];
        const tip = [cx + facing[0] * (half + 6), cy + facing[1] * (half + 6)];
        const base = [cx + facing[0] * (half - 3), cy + facing[1] * (half - 3)];
        ctx.fillStyle = COLORS.pulse;
        ctx.beginPath();
        ctx.moveTo(tip[0], tip[1]);
        ctx.lineTo(base[0] + normal[0] * arrow, base[1] + normal[1] * arrow);
        ctx.lineTo(base[0] - normal[0] * arrow, base[1] - normal[1] * arrow);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (this.invincibleTimer > 0 && !trapped) {
        const pulse = Math.sin(performance.now() * 0.02) > 0 ? 3 : 2;
        ctx.strokeStyle = COLORS.yellow;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 0.5, half * 0.72 + pulse * 2, half * 0.84 + pulse * 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (trapped) {
        ctx.strokeStyle = COLORS.snare;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(cx - half, cy - half, size, size);
        ctx.stroke();
        for (let i = 0; i < TRAP_ESCAPE_STEPS; i += 1) {
          ctx.fillStyle = i < this.escapePipsFor(name) ? COLORS.pulse : "rgba(198, 205, 224, 0.35)";
          ctx.fillRect(cx - half + 4 + i * (size - 8) / TRAP_ESCAPE_STEPS, cy + half + 2, Math.max(4, size * 0.15), 3);
        }
      }

      this.text(name, cx, cy - half - 9, labelSize, COLORS.text, { center: true });
    }

    escapePipsFor(name) {
      for (const runner of [this.nova, this.vega]) {
        if (runner.name === name) return runner.trapEscape;
      }
      return 0;
    }

    drawSnare(pos) {
      const [cx, cy] = cellCenter(pos);
      ctx.strokeStyle = COLORS.snare;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx + 13, cy - 5);
      ctx.lineTo(cx + 9, cy + 12);
      ctx.lineTo(cx - 9, cy + 12);
      ctx.lineTo(cx - 13, cy - 5);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeStyle = COLORS.pulse;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 2);
      ctx.lineTo(cx + 10, cy - 2);
      ctx.moveTo(cx - 6, cy + 5);
      ctx.lineTo(cx + 6, cy + 5);
      ctx.moveTo(cx, cy - 12);
      ctx.lineTo(cx, cy + 12);
      ctx.stroke();
      ctx.fillStyle = COLORS.snare;
      for (const [dx, dy] of [[0, -14], [13, -5], [9, 12], [-9, 12], [-13, -5]]) {
        ctx.beginPath();
        ctx.arc(cx + dx, cy + dy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawDrone(pos) {
      const [cx, cy] = cellCenter(pos);
      const spin = performance.now() * 0.006;
      ctx.strokeStyle = COLORS.danger;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 14, 8, spin, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, 14, 8, -spin, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#2b2639";
      ctx.beginPath();
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx + 10, cy);
      ctx.lineTo(cx, cy + 10);
      ctx.lineTo(cx - 10, cy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = COLORS.white;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = COLORS.pulse;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    drawSurge(pos) {
      const [cx, cy] = cellCenter(pos);
      const tick = performance.now() * 0.012;
      const r = 10 + Math.sin(tick) * 2;
      ctx.fillStyle = "rgba(255, 110, 40, 0.75)";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COLORS.yellow;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy - 12);
      ctx.lineTo(cx + 4, cy - 2);
      ctx.lineTo(cx - 2, cy - 2);
      ctx.lineTo(cx + 3, cy + 12);
      ctx.stroke();
      ctx.strokeStyle = COLORS.white;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawSwitcher(pos) {
      const [cx, cy] = cellCenter(pos);
      const twist = performance.now() * 0.004;
      ctx.fillStyle = COLORS.switcher;
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COLORS.pulse;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 16, 6, twist, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, 16, 6, twist + Math.PI / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = COLORS.white;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    drawItemIcon(kind, pos) {
      const [cx, cy] = cellCenter(pos);
      roundedRect(ctx, cx - 11, cy - 11, 22, 22, 3);
      ctx.fillStyle = "#2e2446";
      ctx.fill();
      ctx.strokeStyle = COLORS.yellow;
      ctx.lineWidth = 2;
      ctx.stroke();

      if (kind === "battery") {
        ctx.fillStyle = COLORS.pulse;
        ctx.fillRect(cx - 8, cy - 6, 16, 12);
        ctx.fillStyle = COLORS.white;
        ctx.fillRect(cx + 8, cy - 3, 3, 6);
        ctx.fillRect(cx - 5, cy - 2, 10, 4);
      } else if (kind === "shield") {
        ctx.strokeStyle = COLORS.pulse;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 9);
        ctx.lineTo(cx + 8, cy - 4);
        ctx.lineTo(cx + 5, cy + 8);
        ctx.lineTo(cx, cy + 11);
        ctx.lineTo(cx - 5, cy + 8);
        ctx.lineTo(cx - 8, cy - 4);
        ctx.closePath();
        ctx.stroke();
      } else if (kind === "metronome") {
        ctx.strokeStyle = COLORS.yellow;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy + 8);
        ctx.lineTo(cx, cy - 9);
        ctx.lineTo(cx + 7, cy + 8);
        ctx.closePath();
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 4);
        ctx.lineTo(cx + 5, cy + 4);
        ctx.stroke();
      } else if (kind === "scanner") {
        ctx.strokeStyle = COLORS.yellow;
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 7, cy - 8, 14, 16);
        ctx.strokeStyle = COLORS.pulse;
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy - 3);
        ctx.lineTo(cx + 4, cy - 3);
        ctx.moveTo(cx - 4, cy + 2);
        ctx.lineTo(cx + 4, cy + 2);
        ctx.stroke();
      } else if (kind === "prism") {
        ctx.fillStyle = COLORS.pulse;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10);
        ctx.lineTo(cx + 9, cy + 8);
        ctx.lineTo(cx - 9, cy + 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = COLORS.white;
        ctx.stroke();
      } else if (kind === "life") {
        drawCore(ctx, [cx, cy], 18, COLORS.core);
        this.text("1", cx, cy, 16, COLORS.white, { center: true });
      } else if (kind === "score") {
        this.text("*", cx, cy - 9, 22, COLORS.yellow, { center: true });
      }
    }

    drawPulse(pulse) {
      const start = cellCenter(pulse.origin);
      const end = cellCenter(pulse.target);
      ctx.strokeStyle = COLORS.pulse;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(start[0], start[1]);
      ctx.lineTo(end[0], end[1]);
      ctx.stroke();
      ctx.fillStyle = COLORS.white;
      ctx.beginPath();
      ctx.arc(end[0], end[1], 5, 0, Math.PI * 2);
      ctx.fill();
    }

    drawOverlay(title, subtitle) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.58)";
      ctx.fillRect(0, 0, WINDOW_W, WINDOW_H);
      this.text(title, WINDOW_W / 2, 210, 46, COLORS.yellow, { center: true, bold: true });
      this.text(subtitle, WINDOW_W / 2, 260, 22, COLORS.text, { center: true });
    }

    drawSyncAnimation() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
      ctx.fillRect(0, 0, WINDOW_W, WINDOW_H);
      const t = performance.now() * 0.006;
      this.text("奔赴成功!", WINDOW_W / 2, 166, 46, COLORS.core, { center: true, bold: true });
      this.text("飛飛和淳忻忻完成同步", WINDOW_W / 2, 210, 22, COLORS.yellow, { center: true });
      for (let i = 0; i < 8; i += 1) {
        const x = 230 + i * 26;
        const y = 260 + Math.sin(t + i) * 16;
        drawCore(ctx, [x, y], 18, COLORS.core);
      }
      this.drawRunnerAt([280, 318], COLORS.nova, this.nova.name, [1, 0], false, this.nova.spriteKey);
      this.drawRunnerAt([360, 318], COLORS.vega, this.vega.name, [-1, 0], false, this.vega.spriteKey);
      drawCore(ctx, [320, 308], 32, COLORS.core);
    }

    drawGameOver(win) {
      const title = win ? "YOU WIN!" : "GAME OVER";
      const color = win ? COLORS.yellow : COLORS.danger;
      this.text(title, WINDOW_W / 2, 110, 46, color, { center: true, bold: true });
      if (win) {
        this.text("飛飛和淳忻忻完成 10 關 + Bonus!", WINDOW_W / 2, 170, 22, COLORS.text, { center: true });
      } else {
        this.text("同步路徑尚未完成，再挑戰一次吧。", WINDOW_W / 2, 170, 22, COLORS.text, { center: true });
      }
      this.text(`Score: ${String(this.score).padStart(6, "0")}`, WINDOW_W / 2, 230, 34, COLORS.yellow, { center: true, bold: true });
      this.text(`High Score: ${String(this.highScore).padStart(6, "0")}`, WINDOW_W / 2, 270, 22, COLORS.muted, { center: true });
      this.text("ENTER: 回標題    ESC: 離開", WINDOW_W / 2, 340, 22, COLORS.text, { center: true });
      this.drawRunnerAt([250, 400], COLORS.nova, FEIFEI_NAME, [1, 0], false, "feifei", 56);
      this.drawRunnerAt([390, 400], COLORS.vega, CHUNXINXIN_NAME, [-1, 0], false, "chunxinxin", 56);
      drawCore(ctx, [320, 394], 30, COLORS.core);
    }

    frame(now) {
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.update(dt);
      this.draw();
      requestAnimationFrame((time) => this.frame(time));
    }
  }

  const game = new BabyFeifeiGame();

  window.addEventListener("keydown", (event) => {
    if (DIR_VECTORS.has(event.code) || ["Space", "KeyZ", "KeyP", "KeyF", "KeyC", "Enter"].includes(event.code)) {
      event.preventDefault();
    }
    game.handleKeyDown(event.code, event.key);
  });

  window.addEventListener("keyup", (event) => {
    game.handleKeyUp(event.code);
  });

  canvas.addEventListener("pointerdown", () => canvas.focus());

  function keyForCode(code) {
    if (code.startsWith("Key")) return code.slice(3).toLowerCase();
    if (code === "Enter") return "Enter";
    if (code === "Space") return " ";
    return code;
  }

  for (const button of document.querySelectorAll("[data-key]")) {
    const code = button.dataset.key;
    const release = () => {
      button.classList.remove("is-held");
      game.handleKeyUp(code);
    };

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      button.classList.add("is-held");
      canvas.focus();
      game.handleKeyDown(code, keyForCode(code));
    });
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  }

  for (const button of document.querySelectorAll("[data-tap]")) {
    const code = button.dataset.tap;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      canvas.focus();
      button.classList.add("is-held");
      game.handleKeyDown(code, keyForCode(code));
    });
    button.addEventListener("pointerup", () => button.classList.remove("is-held"));
    button.addEventListener("pointercancel", () => button.classList.remove("is-held"));
  }

  requestAnimationFrame((time) => game.frame(time));
})();
