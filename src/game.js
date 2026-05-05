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

  const LEFT_GOAL = [6, 0];
  const RIGHT_GOAL = [8, 0];
  const GURIN_START = [2, 9];
  const MALON_START = [12, 9];

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

  const DIFFICULTIES = {
    easy: {
      label: "簡單 Easy",
      time: 125,
      spider: 0.72,
      fire: 0.58,
    },
    normal: {
      label: "普通 Normal",
      time: 105,
      spider: 0.56,
      fire: 0.46,
    },
    hard: {
      label: "困難 Hard",
      time: 90,
      spider: 0.42,
      fire: 0.36,
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
    heart: "#ff5082",
    text: "#eef2ff",
    muted: "#a0accc",
    danger: "#ff5c50",
    gurin: "#46d673",
    malon: "#ff80b9",
    white: "#f5f7ff",
    black: "#080a10",
    yellow: "#ffdc5c",
    spray: "#8ef0ff",
    web: "#c6cde0",
    fire: "#ff6e28",
    bird: "#ff66c4",
  };

  const ITEM_TYPES = ["cake", "umbrella", "harp", "card", "whale"];
  const ITEM_LABELS = {
    cake: "蛋糕 Cake",
    umbrella: "雨傘 Umbrella",
    harp: "豎琴 Harp",
    card: "卡片 Card",
    whale: "鯨魚卡 Whale",
    life: "額外生命 1UP",
    score: "高分道具 Bonus",
  };

  const LEVEL_WALLS = [
    [
      [2, 1], [2, 2], [4, 2], [4, 3], [1, 4], [2, 4], [3, 5],
      [3, 6], [5, 6], [1, 7], [1, 8], [3, 8], [4, 8],
      [12, 1], [9, 2], [10, 2], [12, 2], [12, 3], [10, 4],
      [10, 5], [11, 5], [14, 6], [9, 7], [10, 7], [11, 7], [12, 8],
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
      cellKey(GURIN_START),
      cellKey(MALON_START),
    ]);

    for (const [x, y] of walls) {
      if (protectedCells.has(cellKey([x, y]))) continue;
      if (inBounds([x, y]) && x !== CENTER_COL && y !== 0) rows[y][x] = "#";
    }

    let layout = rows.map((row) => row.join(""));
    if (!reachable(layout, GURIN_START, LEFT_GOAL)) {
      for (let y = 1; y < ROWS; y += 1) {
        for (let x = 0; x < CENTER_COL; x += 1) rows[y][x] = ".";
      }
    }

    layout = rows.map((row) => row.join(""));
    if (!reachable(layout, MALON_START, RIGHT_GOAL)) {
      for (let y = 1; y < ROWS; y += 1) {
        for (let x = CENTER_COL + 1; x < COLS; x += 1) rows[y][x] = ".";
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
    return [...GURIN_START];
  }

  function makeLevel(number) {
    const layout = buildBaseLayout(LEVEL_WALLS[number - 1]);
    const reserved = new Set([
      cellKey(LEFT_GOAL),
      cellKey(RIGHT_GOAL),
      cellKey(GURIN_START),
      cellKey(MALON_START),
    ]);

    const webSeeds = [
      [(1 + number) % 6, 3 + (number % 5)],
      [5, 5 + (number % 4)],
      [9 + (number % 5), 2 + (number % 6)],
      [13, 4 + (number % 4)],
    ];
    const webCount = 2 + Math.min(2, Math.floor(number / 3));
    const webs = new Set(webSeeds.slice(0, webCount).map((pos) => cellKey(nearestFloor(layout, pos, reserved))));
    for (const web of webs) reserved.add(web);

    const spiderCount = 2 + Math.min(3, Math.floor(number / 3));
    const spiderSeeds = [];
    for (let i = 0; i < spiderCount; i += 1) {
      spiderSeeds.push([1 + ((number * 2 + i) % 6), 1 + ((number + i * 2) % 8)]);
    }
    for (let i = 0; i < spiderCount; i += 1) {
      spiderSeeds.push([9 + ((number + i * 3) % 6), 1 + ((number * 2 + i) % 8)]);
    }
    const spiders = spiderSeeds.slice(0, spiderCount).map((pos) => nearestFloor(layout, pos, reserved));
    for (const pos of spiders) reserved.add(cellKey(pos));

    const fireballs = [];
    if (number >= 3) fireballs.push({ pos: nearestFloor(layout, [4, 1 + (number % 7)], reserved), direction: [0, 1], timer: 0 });
    if (number >= 6) fireballs.push({ pos: nearestFloor(layout, [11, 2 + (number % 6)], reserved), direction: [0, -1], timer: 0 });
    for (const fireball of fireballs) reserved.add(cellKey(fireball.pos));

    const birds = [];
    if (number >= 9) birds.push({ pos: nearestFloor(layout, [12, 5], reserved), direction: [-1, 0], timer: 0, cooldown: 0 });

    const hiddenPos = nearestFloor(layout, [1 + (number % 5), 2 + ((number * 2) % 6)], reserved);
    const hiddenKind = new Set([3, 8]).has(number) ? "life" : "score";

    return {
      number,
      name: `LOVE MAZE ${number}`,
      layout,
      webs,
      spiders,
      fireballs,
      birds,
      hiddenPos,
      hiddenKind,
      bonus: false,
      bonusHearts: new Set(),
    };
  }

  function makeBonusLevel(afterLevel) {
    const layout = buildBaseLayout([]);
    const reserved = new Set([
      cellKey(LEFT_GOAL),
      cellKey(RIGHT_GOAL),
      cellKey(GURIN_START),
      cellKey(MALON_START),
    ]);
    const heartSeeds = [
      [1, 1], [3, 2], [5, 4], [2, 6], [4, 8],
      [9, 1], [11, 3], [13, 2], [10, 6], [12, 8],
    ];
    const hearts = new Set(heartSeeds.map((pos) => cellKey(nearestFloor(layout, pos, reserved))));
    return {
      number: afterLevel,
      name: `BONUS LOVE ${afterLevel}`,
      layout,
      webs: new Set([cellKey(MALON_START)]),
      spiders: [],
      fireballs: [],
      birds: [],
      hiddenPos: [1, 1],
      hiddenKind: "score",
      bonus: true,
      bonusHearts: hearts,
    };
  }

  function drawHeart(context, [x, y], size, color) {
    const r = Math.max(2, Math.floor(size / 4));
    context.fillStyle = color;
    context.beginPath();
    context.arc(x - r, y - r, r, Math.PI, 0);
    context.arc(x + r, y - r, r, Math.PI, 0);
    context.lineTo(x + 2 * r, y - Math.floor(r / 2));
    context.lineTo(x, y + 2 * r);
    context.lineTo(x - 2 * r, y - Math.floor(r / 2));
    context.closePath();
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

  class BinaryLandGame {
    constructor() {
      this.keysDown = new Set();
      this.heldOrder = [];
      this.running = true;
      this.state = STATE_TITLE;
      this.primary = "Gurin";
      this.difficulty = "normal";
      this.loveBuffer = "";
      this.loveMode = false;
      this.highScore = this.loadHighScore();

      this.score = 0;
      this.lives = 3;
      this.levelNo = 1;
      this.stageIsBonus = false;
      this.bonusAfter = 0;

      this.level = makeLevel(1);
      this.gurin = this.makePenguin("Gurin", COLORS.gurin, GURIN_START);
      this.malon = this.makePenguin("Malon", COLORS.malon, MALON_START);
      this.webs = new Set();
      this.spiders = [];
      this.fireballs = [];
      this.birds = [];
      this.items = [];
      this.bonusHearts = new Set();
      this.hiddenRevealed = false;
      this.hiddenCollected = false;

      this.timeLeft = 100;
      this.elapsedStage = 0;
      this.moveCooldown = 0;
      this.sprayCooldown = 0;
      this.sprays = [];

      this.enemySlowTimer = 0;
      this.fireFreezeTimer = 0;
      this.invincibleTimer = 0;
      this.message = "";
      this.messageTimer = 0;
      this.clearTimer = 0;
      this.lifeLostTimer = 0;
      this.lastTime = performance.now();
    }

    makePenguin(name, color, pos) {
      return {
        name,
        color,
        pos: [...pos],
        facing: [0, -1],
        trapped: false,
      };
    }

    loadHighScore() {
      try {
        return Number.parseInt(localStorage.getItem("binary-land-high-score") || "0", 10) || 0;
      } catch {
        return 0;
      }
    }

    saveHighScore() {
      if (this.score <= this.highScore) return;
      this.highScore = this.score;
      try {
        localStorage.setItem("binary-land-high-score", String(this.highScore));
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
      const gurinName = this.loveMode ? "Ryan" : "Gurin";
      const malonName = this.loveMode ? "Codex" : "Malon";
      this.gurin = this.makePenguin(gurinName, COLORS.gurin, GURIN_START);
      this.malon = this.makePenguin(malonName, COLORS.malon, MALON_START);

      if (this.level.bonus) {
        this.malon.trapped = true;
        this.malon.facing = [-1, 0];
        this.gurin.facing = [-1, 0];
      }

      this.webs = new Set(this.level.webs);
      this.spiders = this.level.spiders.map((pos) => ({ pos: [...pos], timer: Math.random() * 0.4 }));
      this.fireballs = this.level.fireballs.map((fireball) => ({
        pos: [...fireball.pos],
        direction: [...fireball.direction],
        timer: Math.random() * 0.3,
      }));
      this.birds = this.level.birds.map((bird) => ({
        pos: [...bird.pos],
        direction: [...bird.direction],
        timer: 0,
        cooldown: 0,
      }));
      this.items = [];
      this.bonusHearts = new Set(this.level.bonusHearts);
      this.hiddenRevealed = false;
      this.hiddenCollected = false;

      this.timeLeft = this.level.bonus ? 45 : DIFFICULTIES[this.difficulty].time;
      this.elapsedStage = 0;
      this.moveCooldown = 0;
      this.sprayCooldown = 0;
      this.sprays = [];
      this.enemySlowTimer = 0;
      this.fireFreezeTimer = 0;
      this.invincibleTimer = 0;
      this.message = this.level.bonus ? "Bonus Stage: 先救出 Malon!" : "";
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

      if (this.state === STATE_TITLE) {
        if (code === "Enter") {
          this.newGame();
        } else if (code === "KeyH") {
          this.state = STATE_HELP;
        } else if (code === "KeyG") {
          this.primary = "Gurin";
        } else if (code === "KeyM") {
          this.primary = "Malon";
        } else if (code === "Digit1") {
          this.difficulty = "easy";
        } else if (code === "Digit2") {
          this.difficulty = "normal";
        } else if (code === "Digit3") {
          this.difficulty = "hard";
        } else if (/^[a-z]$/i.test(key)) {
          this.loveBuffer = (this.loveBuffer + key.toLowerCase()).slice(-8);
          if (this.loveBuffer.endsWith("love")) {
            this.loveMode = !this.loveMode;
            this.message = this.loveMode ? "Love Story mode ON" : "Love Story mode OFF";
            this.messageTimer = 2;
          }
        }
      } else if (this.state === STATE_HELP) {
        if (["Escape", "Enter", "KeyH"].includes(code)) this.state = STATE_TITLE;
      } else if (this.state === STATE_PLAYING) {
        if (code === "KeyP") {
          this.state = STATE_PAUSED;
        } else if (code === "KeyZ" || code === "Space") {
          this.spray();
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
      return this.primary === "Gurin" ? [normal, mirrored] : [mirrored, normal];
    }

    movePenguins(inputVec) {
      const [gurinVec, malonVec] = this.actualVectors(inputVec);
      const oldG = [...this.gurin.pos];
      const oldM = [...this.malon.pos];
      let newG = oldG;
      let newM = oldM;

      if (!this.gurin.trapped) {
        this.gurin.facing = gurinVec;
        const candidate = addPos(oldG, gurinVec);
        if (this.isPassable(candidate)) newG = candidate;
      }

      if (!this.malon.trapped) {
        this.malon.facing = malonVec;
        const candidate = addPos(oldM, malonVec);
        if (this.isPassable(candidate)) newM = candidate;
      }

      if (sameCell(newG, newM)) {
        newG = oldG;
        newM = oldM;
      } else if (sameCell(newG, oldM) && sameCell(newM, oldM)) {
        newG = oldG;
      } else if (sameCell(newM, oldG) && sameCell(newG, oldG)) {
        newM = oldM;
      }

      this.gurin.pos = newG;
      this.malon.pos = newM;
      this.afterPenguinPositionsChanged();
    }

    afterPenguinPositionsChanged() {
      for (const penguin of [this.gurin, this.malon]) {
        if (this.webs.has(cellKey(penguin.pos))) {
          penguin.trapped = true;
          this.message = `${penguin.name} 被蛛網困住!`;
          this.messageTimer = 1.6;
        }
        this.collectAt(penguin.pos);
      }

      if (this.gurin.trapped && this.malon.trapped) {
        this.loseLife("兩隻企鵝同時被困，失敗!");
        return;
      }

      this.checkCollisions();
      this.checkStageGoal();
    }

    spray() {
      if (this.sprayCooldown > 0 || this.state !== STATE_PLAYING) return;
      this.sprayCooldown = 0.22;

      for (const penguin of [this.gurin, this.malon]) {
        if (penguin.trapped) continue;
        const target = addPos(penguin.pos, penguin.facing);
        if (!inBounds(target)) continue;
        this.sprays.push({ origin: [...penguin.pos], target, timer: 0.14 });
        this.applySprayToCell(target, true);

        const mirror = mirrorCell(target);
        if (!sameCell(mirror, target)) this.applySprayToCell(mirror, false);
      }
    }

    applySprayToCell(cell, allowAttack) {
      const key = cellKey(cell);
      if (this.webs.has(key)) {
        this.webs.delete(key);
        if (sameCell(this.gurin.pos, cell)) this.gurin.trapped = false;
        if (sameCell(this.malon.pos, cell)) this.malon.trapped = false;
        this.score += 120;
        this.message = "蛛網被殺蟲劑溶解!";
        this.messageTimer = 1.4;
      }

      if (sameCell(this.level.hiddenPos, cell) && !this.hiddenCollected) {
        this.revealHiddenItem();
      }

      if (allowAttack) {
        for (const spider of [...this.spiders]) {
          if (sameCell(spider.pos, cell)) this.killSpider(spider);
        }
      }
    }

    killSpider(spider) {
      const index = this.spiders.indexOf(spider);
      if (index === -1) return;
      this.spiders.splice(index, 1);
      this.score += 250;
      const kind = randomChoice(ITEM_TYPES);
      this.items.push({ kind, pos: [...spider.pos], life: 12 });
      this.message = `蜘蛛消滅! 掉落 ${ITEM_LABELS[kind]}`;
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

      const heartKey = cellKey(pos);
      if (this.bonusHearts.has(heartKey)) {
        this.bonusHearts.delete(heartKey);
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
      if (kind === "cake") {
        this.score += 300;
      } else if (kind === "umbrella") {
        this.score += 500;
        this.enemySlowTimer = 8;
      } else if (kind === "harp") {
        this.score += 800;
        this.fireFreezeTimer = 5;
      } else if (kind === "card") {
        this.score += 1000;
        if (!this.hiddenCollected) this.revealHiddenItem();
      } else if (kind === "whale") {
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

      for (const penguin of [this.gurin, this.malon]) {
        for (const spider of [...this.spiders]) {
          if (sameCell(spider.pos, penguin.pos)) {
            if (this.invincibleTimer > 0) {
              this.killSpider(spider);
            } else {
              this.loseLife(`${penguin.name} 碰到蜘蛛!`);
              return;
            }
          }
        }

        for (const fireball of this.fireballs) {
          if (sameCell(fireball.pos, penguin.pos) && this.invincibleTimer <= 0) {
            this.loseLife(`${penguin.name} 碰到火球!`);
            return;
          }
        }

        for (const bird of this.birds) {
          if (bird.cooldown <= 0 && sameCell(bird.pos, penguin.pos)) {
            const gurinPos = this.gurin.pos;
            this.gurin.pos = this.malon.pos;
            this.malon.pos = gurinPos;
            bird.cooldown = 1.2;
            this.message = "粉紅鳥作怪：兩隻企鵝交換位置!";
            this.messageTimer = 2;
            for (const candidate of [this.gurin, this.malon]) {
              if (this.webs.has(cellKey(candidate.pos))) candidate.trapped = true;
            }
            return;
          }
        }
      }
    }

    checkStageGoal() {
      if (this.gurin.trapped || this.malon.trapped) return;
      const bothAtGoal =
        (sameCell(this.gurin.pos, LEFT_GOAL) && sameCell(this.malon.pos, RIGHT_GOAL)) ||
        (sameCell(this.gurin.pos, RIGHT_GOAL) && sameCell(this.malon.pos, LEFT_GOAL));
      if (this.level.bonus && bothAtGoal && this.bonusHearts.size === 0) {
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
      this.sprayCooldown = Math.max(0, this.sprayCooldown - dt);
      this.enemySlowTimer = Math.max(0, this.enemySlowTimer - dt);
      this.fireFreezeTimer = Math.max(0, this.fireFreezeTimer - dt);
      this.invincibleTimer = Math.max(0, this.invincibleTimer - dt);

      for (const spray of [...this.sprays]) {
        spray.timer -= dt;
        if (spray.timer <= 0) this.sprays.splice(this.sprays.indexOf(spray), 1);
      }

      for (const item of [...this.items]) {
        item.life -= dt;
        if (item.life <= 0 && !["life", "score"].includes(item.kind)) {
          this.items.splice(this.items.indexOf(item), 1);
        }
      }

      const direction = this.currentDirection();
      if (direction && this.moveCooldown <= 0) {
        this.movePenguins(direction);
        this.moveCooldown = this.invincibleTimer > 0 ? 0.08 : 0.135;
        if (this.state !== STATE_PLAYING) return;
      }

      this.updateSpiders(dt);
      this.updateFireballs(dt);
      this.updateBirds(dt);
      this.checkCollisions();
      if (this.state === STATE_PLAYING) this.checkStageGoal();
    }

    updateSpiders(dt) {
      if (!this.spiders.length) return;
      const base = DIFFICULTIES[this.difficulty].spider;
      const speedup = Math.min(0.28, this.elapsedStage / 230);
      let interval = Math.max(0.18, base - speedup);
      if (this.enemySlowTimer > 0) interval *= 1.7;

      for (const spider of this.spiders) {
        spider.timer += dt;
        if (spider.timer < interval) continue;
        spider.timer = 0;
        const choices = [...DIR_VECTORS.values()].map((vec) => addPos(spider.pos, vec)).filter((pos) => this.isPassable(pos));
        if (choices.length) spider.pos = randomChoice(choices);
      }
    }

    updateFireballs(dt) {
      if (this.fireFreezeTimer > 0) return;
      const interval = DIFFICULTIES[this.difficulty].fire;
      for (const fireball of this.fireballs) {
        fireball.timer += dt;
        if (fireball.timer < interval) continue;
        fireball.timer = 0;
        let candidate = addPos(fireball.pos, fireball.direction);
        if (!this.isPassable(candidate)) {
          fireball.direction = [-fireball.direction[0], -fireball.direction[1]];
          candidate = addPos(fireball.pos, fireball.direction);
        }
        if (this.isPassable(candidate)) fireball.pos = candidate;
      }
    }

    updateBirds(dt) {
      for (const bird of this.birds) {
        bird.cooldown = Math.max(0, bird.cooldown - dt);
        bird.timer += dt;
        if (bird.timer < 0.48) continue;
        bird.timer = 0;
        let candidate = addPos(bird.pos, bird.direction);
        if (!this.isPassable(candidate)) {
          bird.direction = [-bird.direction[0], -bird.direction[1]];
          candidate = addPos(bird.pos, bird.direction);
        }
        if (this.isPassable(candidate)) bird.pos = candidate;
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
          this.drawLoveAnimation();
        }
      } else if (this.state === STATE_GAME_OVER) {
        this.drawGameOver(false);
      } else if (this.state === STATE_WIN) {
        this.drawGameOver(true);
      }
    }

    drawTitle() {
      this.text("Binary Land Remake", WINDOW_W / 2, 72, 46, COLORS.yellow, { center: true, bold: true });
      this.text("企鵝先生", WINDOW_W / 2, 120, 34, COLORS.heart, { center: true, bold: true });
      this.text("雙企鵝鏡像迷宮 / Twin Penguin Mirror Maze", WINDOW_W / 2, 158, 22, COLORS.text, { center: true });

      const left = 100;
      const y = 210;
      this.text(`主要控制 Primary: ${this.primary}   [G/M 切換]`, left, y, 22);
      this.text(`難度 Difficulty: ${DIFFICULTIES[this.difficulty].label}   [1/2/3]`, left, y + 34, 22);
      this.text("方向鍵移動，Z/Space 噴殺蟲劑，P 暫停", left, y + 78, 22, COLORS.muted);
      this.text("Press ENTER to Start    H: Help", left, y + 112, 22, COLORS.yellow);
      this.text("彩蛋 Easter egg: 在標題畫面輸入 LOVE", left, y + 148, 16, COLORS.muted);

      if (this.message) this.text(this.message, WINDOW_W / 2, 452, 22, COLORS.heart, { center: true });

      this.drawPenguinAt([154, 412], COLORS.gurin, "Gurin", [1, 0], false);
      this.drawPenguinAt([486, 412], COLORS.malon, "Malon", [-1, 0], false);
      drawHeart(ctx, [320, 408], 34, COLORS.heart);
    }

    drawHelp() {
      const lines = [
        ["玩法說明 / How to Play", 34, COLORS.yellow, true],
        ["", 16, COLORS.text, false],
        ["你同時控制兩隻企鵝。主要企鵝左右正常，另一隻左右相反，上下相同。", 16, COLORS.text, false],
        ["You control both penguins at once. The partner mirrors left/right.", 16, COLORS.text, false],
        ["", 16, COLORS.text, false],
        ["目標：兩隻企鵝必須同時站在上方籠中愛心左右兩格。", 16, COLORS.text, false],
        ["Goal: stand on both sides of the caged heart at the same time.", 16, COLORS.text, false],
        ["", 16, COLORS.text, false],
        ["Z 或 Space：向前 1 格噴殺蟲劑。可消滅蜘蛛、蛛網與救出同伴。", 16, COLORS.text, false],
        ["Z or Space: spray one tile forward to clear spiders/webs.", 16, COLORS.text, false],
        ["", 16, COLORS.text, false],
        ["蛛網：踩中會被困；兩隻同時被困會扣生命。", 16, COLORS.text, false],
        ["Fireballs cannot be killed. Pink birds after level 9 swap the penguins.", 16, COLORS.text, false],
        ["", 16, COLORS.text, false],
        ["每 5 關有 Bonus Stage：救出同伴、收集所有愛心，再一起抵達目標。", 16, COLORS.text, false],
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
      this.text(`PRIMARY ${this.primary}`, 320, 48, 16, COLORS.muted);
      if (this.invincibleTimer > 0) {
        this.text("WHALE!", 520, 48, 22, COLORS.yellow);
      } else if (this.enemySlowTimer > 0) {
        this.text("SLOW", 530, 48, 22, COLORS.spray);
      } else if (this.fireFreezeTimer > 0) {
        this.text("FREEZE", 510, 48, 22, COLORS.spray);
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
            ctx.fillStyle = x === CENTER_COL ? COLORS.centerWall : COLORS.wall;
            ctx.fillRect(rectX, rectY, TILE, TILE);
            ctx.strokeStyle = COLORS.wallHi;
            ctx.lineWidth = 2;
            ctx.strokeRect(rectX + 1, rectY + 1, TILE - 2, TILE - 2);
          } else if (cell === "C") {
            this.drawCagedHeart([x, y]);
          } else {
            ctx.strokeStyle = COLORS.grid;
            ctx.lineWidth = 1;
            ctx.strokeRect(rectX + 0.5, rectY + 0.5, TILE - 1, TILE - 1);
          }
        }
      }

      this.drawGoalMarkers();

      for (const heart of this.bonusHearts) {
        const pos = heart.split(",").map(Number);
        const [cx, cy] = cellCenter(pos);
        const bob = Math.sin(performance.now() * 0.008 + pos[0]) * 2;
        drawHeart(ctx, [cx, cy + bob], 18, COLORS.heart);
      }

      for (const web of this.webs) this.drawWeb(web.split(",").map(Number));
      if (this.hiddenRevealed && !this.hiddenCollected) this.drawItemIcon(this.level.hiddenKind, this.level.hiddenPos);
      for (const item of this.items) this.drawItemIcon(item.kind, item.pos);
      for (const spider of this.spiders) this.drawSpider(spider.pos);
      for (const fireball of this.fireballs) this.drawFireball(fireball.pos);
      for (const bird of this.birds) this.drawBird(bird.pos);
      for (const spray of this.sprays) this.drawSpray(spray);

      this.drawPenguin(this.gurin);
      this.drawPenguin(this.malon);

      if (this.message) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(BOARD_X, BOARD_Y + BOARD_H + 8, BOARD_W, 28);
        this.text(this.message, WINDOW_W / 2, BOARD_Y + BOARD_H + 22, 16, COLORS.yellow, { center: true });
      }

      let footer = "Arrows 移動 | Z/Space 噴射 | P 暫停";
      if (this.level.bonus) footer += ` | Hearts left: ${this.bonusHearts.size}`;
      this.text(footer, WINDOW_W / 2, WINDOW_H - 20, 16, COLORS.muted, { center: true });
    }

    drawGoalMarkers() {
      for (const pos of [LEFT_GOAL, RIGHT_GOAL]) {
        const [x, y] = gridToPx(pos);
        ctx.strokeStyle = "#5a4420";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
        drawHeart(ctx, [x + TILE / 2, y + TILE / 2], 12, COLORS.goal);
      }
    }

    drawCagedHeart(pos) {
      const [x, y] = gridToPx(pos);
      ctx.fillStyle = "#281e2c";
      ctx.fillRect(x, y, TILE, TILE);
      drawHeart(ctx, [x + TILE / 2, y + TILE / 2], 18, COLORS.heart);
      ctx.strokeStyle = COLORS.goal;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i += 1) {
        const barX = x + 6 + i * 6;
        ctx.beginPath();
        ctx.moveTo(barX, y + 3);
        ctx.lineTo(barX, y + TILE - 3);
        ctx.stroke();
      }
      ctx.strokeRect(x + 2, y + 2, TILE - 4, TILE - 4);
    }

    drawPenguin(penguin) {
      this.drawPenguinAt(cellCenter(penguin.pos), penguin.color, penguin.name, penguin.facing, penguin.trapped);
    }

    drawPenguinAt([cx, cy], color, name, facing, trapped) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 0.5, 11, 13.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = COLORS.white;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, 6.5, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = COLORS.black;
      ctx.beginPath();
      ctx.arc(cx - 4, cy - 5, 2, 0, Math.PI * 2);
      ctx.arc(cx + 4, cy - 5, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = COLORS.yellow;
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy);
      ctx.lineTo(cx + 3, cy);
      ctx.lineTo(cx + facing[0] * 8, cy - 1 + facing[1] * 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(cx - 9, cy + 11, 7, 3);
      ctx.fillRect(cx + 2, cy + 11, 7, 3);

      if (this.invincibleTimer > 0 && !trapped) {
        const pulse = Math.sin(performance.now() * 0.02) > 0 ? 3 : 2;
        ctx.strokeStyle = COLORS.yellow;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 0.5, 11 + pulse * 2, 13.5 + pulse * 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (trapped) {
        ctx.strokeStyle = COLORS.web;
        ctx.lineWidth = 1;
        for (let offset = -9; offset <= 9; offset += 6) {
          ctx.beginPath();
          ctx.moveTo(cx - 12, cy + offset);
          ctx.lineTo(cx + 12, cy - offset);
          ctx.moveTo(cx + offset, cy - 12);
          ctx.lineTo(cx - offset, cy + 12);
          ctx.stroke();
        }
      }

      this.text(name, cx, cy - 24, 16, COLORS.text, { center: true });
    }

    drawWeb(pos) {
      const [cx, cy] = cellCenter(pos);
      ctx.strokeStyle = COLORS.web;
      ctx.lineWidth = 1;
      for (const radius of [5, 10, 14]) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let angle = 0; angle < 180; angle += 30) {
        const dx = Math.cos((angle * Math.PI) / 180) * 15;
        const dy = Math.sin((angle * Math.PI) / 180) * 15;
        ctx.beginPath();
        ctx.moveTo(cx - dx, cy - dy);
        ctx.lineTo(cx + dx, cy + dy);
        ctx.stroke();
      }
    }

    drawSpider(pos) {
      const [cx, cy] = cellCenter(pos);
      ctx.strokeStyle = COLORS.black;
      ctx.lineWidth = 2;
      for (const side of [-1, 1]) {
        for (const dy of [-6, -2, 2, 6]) {
          ctx.beginPath();
          ctx.moveTo(cx + side * 5, cy + dy);
          ctx.lineTo(cx + side * 15, cy + dy + side * 2);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "#1c161e";
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#322a38";
      ctx.beginPath();
      ctx.arc(cx, cy - 7, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.danger;
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 9, 2, 0, Math.PI * 2);
      ctx.arc(cx + 3, cy - 9, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    drawFireball(pos) {
      const [cx, cy] = cellCenter(pos);
      const tick = performance.now() * 0.012;
      const r = 10 + Math.sin(tick) * 2;
      ctx.fillStyle = COLORS.fire;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.yellow;
      ctx.beginPath();
      ctx.arc(cx - 2, cy - 1, Math.max(4, r - 5), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.danger;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 16);
      ctx.lineTo(cx - 8, cy);
      ctx.lineTo(cx + 8, cy);
      ctx.closePath();
      ctx.fill();
    }

    drawBird(pos) {
      const [cx, cy] = cellCenter(pos);
      const flap = Math.sin(performance.now() * 0.015) * 4;
      ctx.fillStyle = COLORS.bird;
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy);
      ctx.lineTo(cx - 17, cy - 7 - flap);
      ctx.lineTo(cx - 13, cy + 7);
      ctx.closePath();
      ctx.moveTo(cx + 7, cy);
      ctx.lineTo(cx + 17, cy - 7 - flap);
      ctx.lineTo(cx + 13, cy + 7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = COLORS.white;
      ctx.beginPath();
      ctx.arc(cx + 3, cy - 3, 2, 0, Math.PI * 2);
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

      if (kind === "cake") {
        ctx.fillStyle = "#ffb4aa";
        ctx.fillRect(cx - 8, cy - 2, 16, 8);
        ctx.fillStyle = COLORS.white;
        ctx.fillRect(cx - 8, cy - 7, 16, 5);
      } else if (kind === "umbrella") {
        ctx.strokeStyle = COLORS.heart;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, 10, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = COLORS.white;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, cy + 9);
        ctx.stroke();
      } else if (kind === "harp") {
        ctx.strokeStyle = COLORS.yellow;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, 9, Math.PI / 2, (3 * Math.PI) / 2);
        ctx.stroke();
        ctx.strokeStyle = COLORS.white;
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i += 1) {
          ctx.beginPath();
          ctx.moveTo(cx - 2 + i * 3, cy - 7);
          ctx.lineTo(cx - 2 + i * 3, cy + 7);
          ctx.stroke();
        }
      } else if (kind === "card") {
        ctx.fillStyle = COLORS.white;
        ctx.fillRect(cx - 7, cy - 9, 14, 18);
        drawHeart(ctx, [cx, cy], 8, COLORS.heart);
      } else if (kind === "whale") {
        ctx.fillStyle = COLORS.spray;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 9, 5.5, 0, 0, Math.PI * 2);
        ctx.moveTo(cx + 8, cy);
        ctx.lineTo(cx + 13, cy - 5);
        ctx.lineTo(cx + 13, cy + 5);
        ctx.closePath();
        ctx.fill();
      } else if (kind === "life") {
        drawHeart(ctx, [cx, cy], 18, COLORS.heart);
        this.text("1", cx, cy, 16, COLORS.white, { center: true });
      } else if (kind === "score") {
        this.text("$", cx, cy - 9, 22, COLORS.yellow, { center: true });
      }
    }

    drawSpray(spray) {
      const start = cellCenter(spray.origin);
      const end = cellCenter(spray.target);
      ctx.strokeStyle = COLORS.spray;
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

    drawLoveAnimation() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
      ctx.fillRect(0, 0, WINDOW_W, WINDOW_H);
      const t = performance.now() * 0.006;
      this.text("LOVE CLEAR!", WINDOW_W / 2, 166, 46, COLORS.heart, { center: true, bold: true });
      this.text("兩隻企鵝終於重逢", WINDOW_W / 2, 210, 22, COLORS.yellow, { center: true });
      for (let i = 0; i < 8; i += 1) {
        const x = 230 + i * 26;
        const y = 260 + Math.sin(t + i) * 16;
        drawHeart(ctx, [x, y], 18, COLORS.heart);
      }
      this.drawPenguinAt([280, 318], COLORS.gurin, this.gurin.name, [1, 0], false);
      this.drawPenguinAt([360, 318], COLORS.malon, this.malon.name, [-1, 0], false);
      drawHeart(ctx, [320, 308], 32, COLORS.heart);
    }

    drawGameOver(win) {
      const title = win ? "YOU WIN!" : "GAME OVER";
      const color = win ? COLORS.yellow : COLORS.danger;
      this.text(title, WINDOW_W / 2, 110, 46, color, { center: true, bold: true });
      if (win) {
        this.text("Gurin 和 Malon 完成 10 關 + Bonus!", WINDOW_W / 2, 170, 22, COLORS.text, { center: true });
      } else {
        this.text("愛情迷宮仍未破解，再挑戰一次吧。", WINDOW_W / 2, 170, 22, COLORS.text, { center: true });
      }
      this.text(`Score: ${String(this.score).padStart(6, "0")}`, WINDOW_W / 2, 230, 34, COLORS.yellow, { center: true, bold: true });
      this.text(`High Score: ${String(this.highScore).padStart(6, "0")}`, WINDOW_W / 2, 270, 22, COLORS.muted, { center: true });
      this.text("ENTER: 回標題    ESC: 離開", WINDOW_W / 2, 340, 22, COLORS.text, { center: true });
      this.drawPenguinAt([250, 400], COLORS.gurin, "Gurin", [1, 0], false);
      this.drawPenguinAt([390, 400], COLORS.malon, "Malon", [-1, 0], false);
      drawHeart(ctx, [320, 394], 30, COLORS.heart);
    }

    frame(now) {
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.update(dt);
      this.draw();
      requestAnimationFrame((time) => this.frame(time));
    }
  }

  const game = new BinaryLandGame();

  window.addEventListener("keydown", (event) => {
    if (DIR_VECTORS.has(event.code) || ["Space", "KeyZ", "KeyP", "Enter"].includes(event.code)) {
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
