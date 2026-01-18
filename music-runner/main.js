/* main.js — patched regen (applies your latest requests)

   ✅ Start screen:
   - Removed BIG parchment behind logo
   - Kept ONLY the scroll-style START button
   - Darkened the background overlay more

   ✅ End of game:
   - Added fade-away (fade to black) after gameOver triggers
   - End title orange made slightly darker

   Notes:
   - This is a full-file dump based on the last regenerated version I gave you.
   - Keeps the filename fallback loader for logo + Layer5.
*/

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/*************************
 * CONSTANTS
 *************************/
const BASE_H = 200;
let BASE_W = 900;
let MAP_LENGTH = 900;
let scale = 1;

const STEPS = 8;
const LANES = 3;
const TOTAL_INSTRUMENTS = 30;

const HUD_BORDER = 2;

const STRIP_CELL = 18;
const STRIP_GAP = 2;
const STRIP_LANES = 3;

const UI_WHITE = "#ffffff";
const UI_PANEL = "#0b0b12";
const UI_BORDER = "#cfcfd6";
const UI_YELLOW = "#ffd54a";

// NUS Hackers end-screen colors (slightly darker orange)
const NH_ORANGE = "#e56f00"; // darker than #ff8c1a
const NH_BLACK = "#000000";

const PLAYER_SPEED = 220;
const GRAVITY = 1400;
const JUMP_VY = -520;
const TIME_LIMIT = 60;

const GROUND_Y = 190;
const GROUND_HEIGHT = 40;
const GROUND_TEX_ZOOM_Y = 2.0;

const OBSTACLE_SIZE = 20;
const HITBOX_PADDING = 4;
const MIN_GAP = 220;
const MAX_GAP = 420;

const GROUND_COLOR = "#000000";

// End fade
const END_FADE_DURATION = 1.2; // seconds
let endFadeT = 0;

/*************************
 * FULLSCREEN CANVAS STYLES
 *************************/
document.documentElement.style.margin = "0";
document.documentElement.style.padding = "0";
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden";

canvas.style.position = "fixed";
canvas.style.left = "0";
canvas.style.top = "0";
canvas.style.width = "100vw";
canvas.style.height = "100vh";
canvas.style.display = "block";

/*************************
 * PLAYER (DECLARE EARLY)
 *************************/
const player = {
  screenX: 100,
  y: 150 - 20,
  w: 20,
  h: 20,
  vy: 0,
  onGround: true
};

/*************************
 * RESIZE / VIEWPORT
 *************************/
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);

  const aspect = canvas.width / canvas.height;
  BASE_W = Math.round(BASE_H * aspect);

  MAP_LENGTH = BASE_W;

  scale = canvas.height / BASE_H;
  ctx.imageSmoothingEnabled = false;

  if (player) player.screenX = Math.round(BASE_W * 0.28);
}

function applyViewportTransform() {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/*************************
 * FULLSCREEN TOGGLE
 *************************/
function isFullscreen() {
  return !!document.fullscreenElement;
}

async function toggleFullscreen() {
  try {
    if (!isFullscreen()) await canvas.requestFullscreen();
    else await document.exitFullscreen();
  } catch (err) {
    console.error("Fullscreen failed:", err);
  }
}

document.addEventListener("fullscreenchange", () => resizeCanvas());
canvas.addEventListener("dblclick", () => toggleFullscreen());

/*************************
 * ASSET HELPERS
 *************************/
function loadFirstExistingImage(nameCandidates, logLabel) {
  const img = new Image();
  const state = { idx: 0, srcUsed: null };

  function tryNext() {
    if (state.idx >= nameCandidates.length) {
      console.error(`${logLabel} FAILED TO LOAD (tried)`, nameCandidates);
      return;
    }
    const src = nameCandidates[state.idx++];
    img.src = src;
  }

  img.onload = () => {
    state.srcUsed = img.src;
    console.log(`${logLabel} LOADED`, img.src, img.naturalWidth, img.naturalHeight);
  };
  img.onerror = () => tryNext();

  tryNext();
  return { img, get srcUsed() { return state.srcUsed; } };
}

/*************************
 * ASSETS
 *************************/
const groundImg = new Image();
groundImg.src = "ground.png";
groundImg.onload = () => console.log("GROUND LOADED", groundImg.naturalWidth, groundImg.naturalHeight);
groundImg.onerror = (e) => console.error("GROUND FAILED TO LOAD", e);

const scrollImg = new Image();
scrollImg.src = "scroll.png";
scrollImg.onload = () => console.log("SCROLL UI LOADED", scrollImg.naturalWidth, scrollImg.naturalHeight);
scrollImg.onerror = (e) => console.error("SCROLL UI FAILED TO LOAD", e);

const logoPack = loadFirstExistingImage(
  ["logo.png", "Logo.png", "LOGO.png", "logo.PNG", "Logo.PNG"],
  "LOGO"
);
const logoImg = logoPack.img;

// layer4
const mountainsImg = new Image();
mountainsImg.src = "layer4.png";
mountainsImg.onload = () => console.log("MOUNTAINS (layer4) LOADED", mountainsImg.naturalWidth, mountainsImg.naturalHeight);
mountainsImg.onerror = (e) => console.error("MOUNTAINS (layer4) FAILED TO LOAD", e);

// layer5 (fallback casings)
const layer5Pack = loadFirstExistingImage(
  ["Layer5.png", "layer5.png", "LAYER5.png", "Layer5.PNG", "layer5.PNG"],
  "LAYER5"
);
const layer5Img = layer5Pack.img;

// layer23
const layer23Img = new Image();
layer23Img.src = "layer23.png";
layer23Img.onload = () => console.log("LAYER23 LOADED", layer23Img.naturalWidth, layer23Img.naturalHeight);
layer23Img.onerror = (e) => console.error("LAYER23 FAILED TO LOAD", e);

// layer1
const layer1Img = new Image();
layer1Img.src = "layer1.jpg";
layer1Img.onload = () => console.log("LAYER1 LOADED", layer1Img.naturalWidth, layer1Img.naturalHeight);
layer1Img.onerror = (e) => console.error("LAYER1 FAILED TO LOAD", e);

/*************************
 * PARALLAX SETTINGS
 *************************/
const MOUNTAINS_PARALLAX = 0.25;
const MOUNTAINS_Y = 90;
const MOUNTAINS_H = 95;

const LAYER5_PARALLAX = 0.55;
const LAYER5_Y = 98;
const LAYER5_H = 105;

const LAYER23_PARALLAX = 0.18;
const LAYER23_Y = 78;
const LAYER23_H = 90;

const LAYER1_PARALLAX = 0.02;
const LAYER1_Y = 70;
const LAYER1_H = 85;

function drawTiledParallax(img, y, h, parallax, cameraX, viewW) {
  if (!img.complete || img.naturalWidth <= 0) return;

  const aspect = img.naturalWidth / img.naturalHeight;
  const tileW = h * aspect;

  const scroll = ((cameraX * parallax) % tileW + tileW) % tileW;
  let x = -scroll - tileW;

  while (x < viewW + tileW) {
    ctx.drawImage(img, x, y, tileW, h);
    x += tileW;
  }
}

function drawTiledImageX(img, x, y, w, h) {
  if (!img.complete || img.naturalWidth <= 0) return false;

  const srcH = Math.min(img.naturalHeight, Math.max(1, Math.floor(h * GROUND_TEX_ZOOM_Y)));
  const srcY = img.naturalHeight - srcH;

  const sc = h / srcH;
  const tileW = img.naturalWidth * sc;
  if (tileW <= 0.001) return false;

  const offset = ((cameraX % tileW) + tileW) % tileW;
  let drawX = x - offset - tileW;
  const endX = x + w + tileW;

  ctx.imageSmoothingEnabled = false;
  while (drawX < endX) {
    ctx.drawImage(img, 0, srcY, img.naturalWidth, srcH, drawX, y, tileW, h);
    drawX += tileW;
  }
  return true;
}

/*************************
 * MAPS / ZONES
 *************************/
const BASE_MAPS = [
  { bg: "#1e1e2e", ground: "#444" },
  { bg: "#2e1e1e", ground: "#553333" },
  { bg: "#1e2e1e", ground: "#335533" },
  { bg: "#2e2e1e", ground: "#666633" },
  { bg: "#1e2e2e", ground: "#336666" },
  { bg: "#2e1e2e", ground: "#663366" },
  { bg: "#3a1e1e", ground: "#774444" },
  { bg: "#1e3a1e", ground: "#447744" },
  { bg: "#1e1e3a", ground: "#444477" },
  { bg: "#3a3a1e", ground: "#777744" }
];
const MAPS = Array.from({ length: TOTAL_INSTRUMENTS }, (_, i) => BASE_MAPS[i % BASE_MAPS.length]);

/*************************
 * ENEMIES (random sprite)
 *************************/
const enemySrcs = ["Assignments.png", "Linkedin.png", "Canvas.png"];
const enemyImgs = enemySrcs.map((src) => {
  const img = new Image();
  img.src = src;
  img.onload = () => console.log("ENEMY LOADED", src, img.naturalWidth, img.naturalHeight);
  img.onerror = (e) => console.error("ENEMY FAILED TO LOAD", src, e);
  return img;
});

/*************************
 * PLAYER SPRITES
 *************************/
const runFrameSrcs = ["run1.png", "run2.png", "run3.png"];
const runFrames = runFrameSrcs.map((src) => {
  const img = new Image();
  img.src = src;
  return img;
});

const jumpImg = new Image();
jumpImg.src = "jump.png";

let loadedRunFrames = [];
let runAnimIndex = 0;
let runFrameTimer = 0;
const RUN_FRAME_TIME = 0.10;

function initPlayerSpriteLoading() {
  loadedRunFrames = [];
  runFrames.forEach((img) => {
    img.onload = () => {
      loadedRunFrames.push(img);
      console.log("RUN FRAME LOADED:", img.src, img.naturalWidth, img.naturalHeight);
    };
    img.onerror = () => console.error("RUN FRAME FAILED:", img.src, "(check path/case)");
  });

  jumpImg.onload = () => console.log("JUMP SPRITE LOADED:", jumpImg.src, jumpImg.naturalWidth, jumpImg.naturalHeight);
  jumpImg.onerror = () => console.error("JUMP SPRITE FAILED:", jumpImg.src, "(check path/case)");
}
initPlayerSpriteLoading();

/*************************
 * GAME STATE
 *************************/
let gameStarted = false;
let timeRemaining = TIME_LIMIT;
let lastTime = performance.now();
let gameOver = false;
let endReason = "";
let worldX = 0;
let cameraX = 0;
let currentMapIndex = 0;

const obstacles = [];
let nextObstacleX = 0;

/*************************
 * DASH TRAIL
 *************************/
let dashes = [];
const DASH_LIFE = 0.7;

function spawnDash() {
  const px = worldX + player.screenX;
  const py = player.y + player.h * 0.55;
  dashes.push({ x: px - 10, y: py, w: 18, h: 3, life: DASH_LIFE });
}

function updateDashes(dt) {
  for (const d of dashes) d.life -= dt;
  dashes = dashes.filter(d => d.life > 0);
}

/*************************
 * NOTE BURSTS
 *************************/
let noteBursts = [];
const NOTE_LIFE = 0.9;

function spawnEighthNote() {
  const px = worldX + player.screenX;
  const py = player.y - 6;
  noteBursts.push({
    x: px - 6,
    y: py,
    vy: -18,
    life: NOTE_LIFE,
    tilt: -0.25 + Math.random() * 0.5
  });
}

function updateNoteBursts(dt) {
  for (const n of noteBursts) {
    n.life -= dt;
    n.y += n.vy * dt;
  }
  noteBursts = noteBursts.filter(n => n.life > 0);
}

function drawEighthNoteGlyph(screenX, screenY, alpha, tilt) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(screenX, screenY);
  ctx.rotate(tilt);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 6, 6, 4);
  ctx.fillRect(5, -10, 2, 18);
  ctx.fillRect(7, -10, 6, 2);
  ctx.fillRect(8, -8, 6, 2);
  ctx.fillRect(9, -6, 6, 2);

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 10, 6, 1);
  ctx.restore();
}

/*************************
 * MUSIC DATA
 *************************/
const instruments = Array.from({ length: TOTAL_INSTRUMENTS }, () => ({
  notes: Array.from({ length: STEPS }, () => Array(LANES).fill(null))
}));

let audioStarted = false;
let master = null;
let recorder = null;
let synths = [];
let recordedBlob = null;
let finalizingRecording = false;

let globalStep = 0;
const INTRO_LOOPS = 3;

/*************************
 * AUDIO INIT
 *************************/
async function startAudio() {
  if (audioStarted) return;

  await Tone.start();
  await Tone.context.resume();

  const saturator = new Tone.Distortion(0.12);
  const compressor = new Tone.Compressor({
    threshold: -18,
    ratio: 3,
    attack: 0.01,
    release: 0.2
  });

  master = new Tone.Gain(0.9);
  master.chain(saturator, compressor, Tone.Destination);

  recorder = new Tone.Recorder();
  master.connect(recorder);

  const snappyEnv = { attack: 0.005, decay: 0.08, sustain: 0.35, release: 0.15 };

  function makeSynth(i) {
    const t = i % 10;
    switch (t) {
      case 0: return new Tone.Synth({ oscillator: { type: "square" }, envelope: snappyEnv });
      case 1: return new Tone.FMSynth({ envelope: { attack: 0.005, decay: 0.12, sustain: 0.2, release: 0.15 } });
      case 2: return new Tone.AMSynth({ envelope: { attack: 0.005, decay: 0.10, sustain: 0.25, release: 0.18 } });
      case 3: return new Tone.MembraneSynth();
      case 4: return new Tone.MetalSynth({ envelope: { attack: 0.001, decay: 0.12, release: 0.02 } });
      case 5: return new Tone.PluckSynth();
      case 6: return new Tone.DuoSynth();
      case 7: return new Tone.MonoSynth({ envelope: { attack: 0.005, decay: 0.10, sustain: 0.3, release: 0.12 } });
      case 8: return new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "square" },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.4, release: 0.2 }
      });
      case 9: return new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.02 } });
      default: return new Tone.Synth({ oscillator: { type: "square" }, envelope: snappyEnv });
    }
  }

  synths = Array.from({ length: TOTAL_INSTRUMENTS }, (_, i) => makeSynth(i).connect(master));

  Tone.Transport.stop();
  Tone.Transport.cancel();
  globalStep = 0;

  Tone.Transport.scheduleRepeat((time) => {
    if (gameOver) return;

    const step = globalStep % STEPS;
    const loopIndex = Math.floor(globalStep / STEPS);
    const isIntro = loopIndex < INTRO_LOOPS;

    const baseVel = isIntro ? 0.95 : 0.7;
    const downbeatBoost = step === 0 ? 1.15 : 1.0;
    const vel = Math.min(1, baseVel * downbeatBoost);

    for (let i = 0; i < synths.length; i++) {
      const synth = synths[i];
      const lanes = instruments[i].notes[step];

      for (let l = 0; l < LANES; l++) {
        const note = lanes[l];
        if (!note) continue;

        const dur = step === 0 ? "8n" : "16n";
        if (synth instanceof Tone.NoiseSynth) synth.triggerAttackRelease(dur, time);
        else synth.triggerAttackRelease(note, dur, time, vel);
      }
    }

    globalStep++;
  }, "8n");

  recorder.start();
  Tone.Transport.start("+0.05");
  audioStarted = true;
}

/*************************
 * START SCREEN (NO BIG SCROLL)
 *************************/
let startBtn = { x: 0, y: 0, w: 120, h: 54 };

function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

async function startGame() {
  if (gameStarted) return;
  gameStarted = true;

  timeRemaining = TIME_LIMIT;
  lastTime = performance.now();

  if (!audioStarted) await startAudio();
}

function drawScrollStatBox(x, y, label, value) {
  const w = 120;
  const h = 54;

  if (scrollImg.complete && scrollImg.naturalWidth > 0) {
    const iw = scrollImg.naturalWidth;
    const ih = scrollImg.naturalHeight;
    const looksLikeTwo = iw >= ih * 1.8;
    const sw = looksLikeTwo ? Math.floor(iw / 2) : iw;
    const sh = ih;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(scrollImg, 0, 0, sw, sh, x, y, w, h);
  } else {
    ctx.fillStyle = "#cbb98d";
    ctx.fillRect(x, y, w, h);
  }

  ctx.save();
  ctx.textBaseline = "top";
  ctx.fillStyle = "#2b1b10";

  if (label) {
    ctx.font = "11px 'Press Start 2P', monospace";
    ctx.fillText(label + ":", x + 16, y + 10);
  }
  if (value) {
    ctx.font = "20px 'Press Start 2P', monospace";
    ctx.fillText(value, x + 16, y + 28);
  }
  ctx.restore();

  return w;
}

function drawParchmentBox(x, y, w, h) {
  // Used for end dialog only
  if (scrollImg.complete && scrollImg.naturalWidth > 0) {
    const iw = scrollImg.naturalWidth;
    const ih = scrollImg.naturalHeight;
    const looksLikeTwo = iw >= ih * 1.8;
    const sw = looksLikeTwo ? Math.floor(iw / 2) : iw;
    const sh = ih;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(scrollImg, 0, 0, sw, sh, x, y, w, h);
  } else {
    ctx.fillStyle = "#cbb98d";
    ctx.fillRect(x, y, w, h);
  }
}

function drawStartScreen() {
  // Darker overlay
  ctx.save();
  ctx.globalAlpha = 0.72; // darker than before
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, BASE_W, BASE_H);
  ctx.restore();

  // Logo (no big scroll behind it)
  const logoMaxW = 220;
  const logoMaxH = 90;
  const logoCX = BASE_W / 2;
  const logoTopY = 40;

  if (logoImg.complete && logoImg.naturalWidth > 0) {
    const ar = logoImg.naturalWidth / logoImg.naturalHeight;
    let dw = logoMaxW;
    let dh = dw / ar;
    if (dh > logoMaxH) { dh = logoMaxH; dw = dh * ar; }

    const dx = logoCX - dw / 2;
    const dy = logoTopY;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(logoImg, dx, dy, dw, dh);
  } else {
    ctx.save();
    ctx.font = "10px 'Press Start 2P', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("LOADING LOGO...", BASE_W / 2, logoTopY + 20);
    ctx.restore();
  }

  // START button only scroll
  const btnW = 120;
  const btnH = 54;
  const btnX = (BASE_W - btnW) / 2;
  const btnY = 125;

  startBtn = { x: btnX, y: btnY, w: btnW, h: btnH };

  drawScrollStatBox(btnX, btnY, "", "");

  ctx.save();
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.font = "10px 'Press Start 2P', monospace";
  ctx.fillStyle = "#6b4a2b";
  ctx.fillText("START", btnX + btnW / 2, btnY + btnH / 2 + 1);
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "6px 'Press Start 2P', monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("PRESS ENTER / SPACE", BASE_W / 2, btnY + btnH + 6);
  ctx.restore();
}

/*************************
 * INPUT
 *************************/
window.addEventListener("keydown", async (e) => {
  if (e.code === "KeyF") {
    e.preventDefault();
    toggleFullscreen();
    return;
  }

  if (!gameStarted && (e.code === "Enter" || e.code === "Space")) {
    e.preventDefault();
    await startGame();
    return;
  }

  if (!gameStarted) return;

  if (e.code === "Space" && !gameOver) {
    if (!e.repeat) {
      spawnDash();
      spawnEighthNote();
      jumpAndAddNote();
    }
  }

  if (gameOver && e.code === "KeyE") exportRecording();
});

document.addEventListener("pointerdown", async (e) => {
  const rect = canvas.getBoundingClientRect();
  const sx = ((e.clientX - rect.left) / rect.width) * BASE_W;
  const sy = ((e.clientY - rect.top) / rect.height) * BASE_H;

  if (!gameStarted) {
    if (pointInRect(sx, sy, startBtn)) await startGame();
    return;
  }

  if (!audioStarted) await startAudio();
});

/*************************
 * NOTE LOGIC
 *************************/
const SCALE_LOW  = ["C3", "D3", "E3", "G3", "A3"];
const SCALE_MID  = ["C4", "D4", "E4", "G4", "A4"];
const SCALE_HIGH = ["C5", "D5", "E5", "G5", "A5"];

function getStepIndex() {
  const stepW = MAP_LENGTH / STEPS;
  const localX = (worldX % MAP_LENGTH);
  return Math.max(0, Math.min(STEPS - 1, Math.floor(localX / stepW)));
}

function getLaneFromJumpHeight() {
  if (player.y < 70) return 2;
  if (player.y < 110) return 1;
  return 0;
}

function randomNoteForLane(lane) {
  const bank = lane === 2 ? SCALE_HIGH : lane === 1 ? SCALE_MID : SCALE_LOW;
  return bank[Math.floor(Math.random() * bank.length)];
}

function addOrOverwriteNoteAtCurrentPosition() {
  const step = getStepIndex();
  const lane = getLaneFromJumpHeight();
  instruments[currentMapIndex].notes[step][lane] = randomNoteForLane(lane);
}

function jumpAndAddNote() {
  if (player.onGround) {
    player.vy = JUMP_VY;
    player.onGround = false;
  }
  addOrOverwriteNoteAtCurrentPosition();
}

/*************************
 * OBSTACLES
 *************************/
function generateObstacles() {
  while (nextObstacleX < worldX + BASE_W + 300) {
    obstacles.push({
      x: nextObstacleX,
      y: GROUND_Y - OBSTACLE_SIZE,
      w: OBSTACLE_SIZE,
      h: OBSTACLE_SIZE,
      enemyIndex: Math.floor(Math.random() * enemyImgs.length)
    });
    nextObstacleX += MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
  }
}

/*************************
 * COLLISION
 *************************/
function checkCollision(a, b) {
  return (
    a.x < b.x + b.w + 15.5 &&
    a.x + a.w > b.x + 15.5 &&
    a.y < b.y + b.h + 15.5 &&
    a.y + a.h > b.y + 15.5
  );
}

/*************************
 * END GAME + RECORD + FADE
 *************************/
function requestEndGame(reason) {
  if (gameOver) return;
  gameOver = true;
  endReason = reason;
  endFadeT = 0; // start fade timer
  finalizeRecording();
}

async function finalizeRecording() {
  finalizingRecording = true;
  try {
    Tone.Transport.stop();
    if (!recorder) {
      recordedBlob = null;
      return;
    }
    recordedBlob = await recorder.stop();
  } finally {
    finalizingRecording = false;
  }
}

/*************************
 * EXPORT
 *************************/
function exportRecording() {
  if (finalizingRecording) return;
  if (!recordedBlob) return;

  const url = URL.createObjectURL(recordedBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gameplay_recording.webm";
  a.click();
  URL.revokeObjectURL(url);
}

/*************************
 * UPDATE
 *************************/
function update(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  if (!gameStarted) return;

  // advance fade timer after game over
  if (gameOver) {
    endFadeT = Math.min(END_FADE_DURATION, endFadeT + dt);
    return;
  }

  if (loadedRunFrames.length > 1) {
    runFrameTimer += dt;
    if (runFrameTimer >= RUN_FRAME_TIME) {
      runFrameTimer -= RUN_FRAME_TIME;
      runAnimIndex = (runAnimIndex + 1) % loadedRunFrames.length;
    }
  }

  updateDashes(dt);
  updateNoteBursts(dt);

  timeRemaining -= dt;
  if (timeRemaining <= 0) {
    timeRemaining = 0;
    requestEndGame("TIME");
    return;
  }

  worldX += PLAYER_SPEED * dt;
  cameraX += (worldX - cameraX) * 0.12;

  currentMapIndex = Math.min(Math.floor(worldX / MAP_LENGTH), MAPS.length - 1);

  player.vy += GRAVITY * dt;
  player.y += player.vy * dt;

  const groundTop = GROUND_Y - player.h;
  if (player.y >= groundTop) {
    player.y = groundTop;
    player.vy = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }

  generateObstacles();

  const playerBox = {
    x: worldX + player.screenX,
    y: player.y,
    w: player.w,
    h: player.h
  };

  for (const obs of obstacles) {
    const paddedObs = {
      x: obs.x + HITBOX_PADDING,
      y: obs.y + HITBOX_PADDING,
      w: obs.w - HITBOX_PADDING * 2,
      h: obs.h - HITBOX_PADDING * 2
    };
    if (checkCollision(playerBox, paddedObs)) {
      requestEndGame("HIT");
      return;
    }
  }
}

/*************************
 * HUD + DRAW HELPERS
 *************************/
function uiText(text, x, y, color = UI_WHITE) {
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawPanel(x, y, w, h) {
  ctx.fillStyle = UI_PANEL;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = UI_BORDER;
  ctx.fillRect(x, y, w, HUD_BORDER);
  ctx.fillRect(x, y + h - HUD_BORDER, w, HUD_BORDER);
  ctx.fillRect(x, y, HUD_BORDER, h);
  ctx.fillRect(x + w - HUD_BORDER, y, HUD_BORDER, h);
}

function drawWorldMusicGrid() {
  const stepW = MAP_LENGTH / STEPS;
  const laneCuts = [70, 110];
  const yTop = 0;
  const yBottom = GROUND_Y;

  const viewWorldLeft = cameraX;
  const viewWorldRight = cameraX + BASE_W;

  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#ffffff";

  const firstStepIndex = Math.floor(viewWorldLeft / stepW);
  const x0 = firstStepIndex * stepW;

  for (let x = x0; x <= viewWorldRight + stepW; x += stepW) {
    const sx = x - cameraX;
    ctx.beginPath();
    ctx.moveTo(sx, yTop);
    ctx.lineTo(sx, yBottom);
    ctx.stroke();
  }

  for (const y of laneCuts) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(BASE_W, y);
    ctx.stroke();
  }

  const curStep = getStepIndex();
  const mapStart = Math.floor(cameraX / MAP_LENGTH) * MAP_LENGTH;
  const curStepWorldX = mapStart + curStep * stepW;
  const curStepScreenX = curStepWorldX - cameraX;

  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#ffd54a";
  ctx.fillRect(curStepScreenX, yTop, stepW, yBottom - yTop);

  ctx.restore();
}

/* PATCH: drawHUD() ONLY
   - Removed end fadeaway (you can delete the fade block in draw() too — notes below)
   - Move "GAME OVER"/"TIME UP" text +100px right
   - Move end subtext ("PRESS E TO EXPORT" etc.) +20px right
*/

function drawHUD() {
    const t = Math.ceil(timeRemaining);
    const zone = currentMapIndex + 1;
    const playStep = (globalStep % STEPS);
  
    // Top-left parchment
    const x = 10;
    const y = 4;
    drawScrollStatBox(x, y, "", "");
  
    ctx.save();
    ctx.textBaseline = "top";
    ctx.font = "6px 'Press Start 2P', monospace";
    ctx.fillStyle = "#6b4a2b";
  
    const textX = x + 40;
    const line1Y = y + 16;
    const lineGap = 10;
  
    ctx.fillText(`TIME  ${String(t).padStart(2, "0")}`, textX, line1Y);
    ctx.fillText(`ZONE  ${zone}/${TOTAL_INSTRUMENTS}`, textX, line1Y + lineGap);
    ctx.fillText(`STEP  ${playStep + 1}/${STEPS}`, textX, line1Y + lineGap * 2);
    ctx.restore();
  
    // Bosca grid top-right
    const stripW = STEPS * STRIP_CELL + (STEPS - 1) * STRIP_GAP + 10;
    const stripH = STRIP_LANES * STRIP_CELL + (STRIP_LANES - 1) * STRIP_GAP + 10;
  
    const stripX = BASE_W - stripW;
    const stripY = 8;
  
    drawPanel(stripX, stripY, stripW, stripH);
  
    const gx = stripX + 5;
    const gy = stripY + 5;
  
    ctx.font = "10px 'Press Start 2P', monospace";
  
    for (let s = 0; s < STEPS; s++) {
      for (let l = 0; l < STRIP_LANES; l++) {
        const cx = gx + s * (STRIP_CELL + STRIP_GAP);
        const cy = gy + (STRIP_LANES - 1 - l) * (STRIP_CELL + STRIP_GAP);
  
        ctx.fillStyle = "#151522";
        ctx.fillRect(cx, cy, STRIP_CELL, STRIP_CELL);
  
        if (s === playStep) {
          ctx.fillStyle = "rgba(255, 213, 74, 0.18)";
          ctx.fillRect(cx, cy, STRIP_CELL, STRIP_CELL);
        }
  
        const note = instruments[currentMapIndex].notes[s][l];
        if (note) {
          ctx.fillStyle = UI_WHITE;
          ctx.fillRect(cx + 5, cy + 5, STRIP_CELL - 10, STRIP_CELL - 10);
        }
      }
    }
  
    // Fullscreen hint
    ctx.font = "8px 'Press Start 2P', monospace";
    if (!isFullscreen()) uiText("PRESS F FOR FULLSCREEN", 18, 60, UI_WHITE);
  
    // End parchment dialog
    if (gameOver) {
      const dialogW = 260;
      const dialogH = 92;
      const dialogX = (BASE_W / 2) - (dialogW / 2);
      const dialogY = (BASE_H / 2) - 44;
  
      drawParchmentBox(dialogX, dialogY, dialogW, dialogH);
  
      // Move title +100px right
      ctx.font = "12px 'Press Start 2P', monospace";
      uiText(
        endReason === "HIT" ? "GAME OVER" : "TIME UP",
        (BASE_W / 2 - 90) + 50,
        BASE_H / 2 - 10,
        NH_ORANGE
      );
  
      // Move subtext +20px right
      ctx.font = "8px 'Press Start 2P', monospace";
      const subX = (BASE_W / 2 - 70) + 20; // base used for "PRESS E TO EXPORT"
      const ySub = BASE_H / 2 + 10;
  
      if (finalizingRecording) uiText("FINALIZING...", (BASE_W / 2 - 60) + 20, ySub, NH_BLACK);
      else if (recordedBlob) uiText("PRESS E TO EXPORT", subX, ySub, NH_BLACK);
      else uiText("NO AUDIO RECORDED", (BASE_W / 2 - 80) + 20, ySub, NH_BLACK);
    }
  }

/*************************
 * DRAW
 *************************/
function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  applyViewportTransform();

  const startMap = Math.floor(cameraX / MAP_LENGTH);
  const endMap = startMap + 1;

  // Ground
  for (let i = startMap; i <= endMap; i++) {
    if (!MAPS[i]) continue;
    const mapX = i * MAP_LENGTH - cameraX;

    const ok = drawTiledImageX(
      groundImg,
      mapX,
      GROUND_Y - 40,
      MAP_LENGTH + 40,
      GROUND_HEIGHT + 100
    );
    if (!ok) {
      ctx.fillStyle = GROUND_COLOR;
      ctx.fillRect(mapX, GROUND_Y, MAP_LENGTH, GROUND_HEIGHT);
    }
  }

  // Parallax
  drawTiledParallax(layer1Img, LAYER1_Y - 70, LAYER1_H * 2, LAYER1_PARALLAX - 0.019, cameraX, BASE_W);
  drawTiledParallax(layer23Img, LAYER23_Y, LAYER23_H - 30, LAYER23_PARALLAX - 0.12, cameraX, BASE_W);
  drawTiledParallax(mountainsImg, MOUNTAINS_Y, MOUNTAINS_H, MOUNTAINS_PARALLAX - 0.1, cameraX, BASE_W);
  drawTiledParallax(layer5Img, LAYER5_Y, LAYER5_H, LAYER5_PARALLAX, cameraX, BASE_W);

  // World grid
  drawWorldMusicGrid();

  // Dash trail
  for (const d of dashes) {
    const a = Math.max(0, Math.min(1, d.life / DASH_LIFE));
    ctx.globalAlpha = a;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(d.x - cameraX, d.y, d.w, d.h);

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(d.x - cameraX, d.y + d.h, d.w, 2);
  }
  ctx.globalAlpha = 1;

  // Notes
  for (const n of noteBursts) {
    const a = Math.max(0, Math.min(1, n.life / NOTE_LIFE));
    drawEighthNoteGlyph(n.x - cameraX, n.y, a * a, n.tilt);
  }
  ctx.globalAlpha = 1;

  // Obstacles
  for (const obs of obstacles) {
    const idx = (typeof obs.enemyIndex === "number") ? obs.enemyIndex : 0;
    const img = enemyImgs[idx] || enemyImgs[0];

    if (img && img.complete && img.naturalWidth > 0) {
      const sc = obs.w / img.naturalWidth;
      const drawW = img.naturalWidth * 2 * sc;
      const drawH = img.naturalHeight * 2 * sc;

      const dx = obs.x - cameraX;
      const dy = obs.y - (drawH - obs.h);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, dx, dy, drawW, drawH);
    } else {
      ctx.fillStyle = "#ff5555";
      ctx.fillRect(obs.x - cameraX, obs.y, obs.w, obs.h);
    }
  }

  // Player sprite
  let pImg = null;
  if (!player.onGround) {
    if (jumpImg.complete && jumpImg.naturalWidth > 0) pImg = jumpImg;
    else if (loadedRunFrames.length > 0) pImg = loadedRunFrames[0];
  } else {
    if (loadedRunFrames.length > 0) pImg = loadedRunFrames[runAnimIndex % loadedRunFrames.length];
  }

  if (pImg && pImg.complete && pImg.naturalWidth > 0) {
    ctx.imageSmoothingEnabled = false;

    const dw = player.w * 2;
    const dh = player.h * 2;

    const dx = player.screenX - (dw - player.w) / 2;
    const dy = player.y - (dh - player.h);

    ctx.drawImage(pImg, dx, dy, dw, dh);
  }

  // HUD
  drawHUD();

  // Start overlay
  if (!gameStarted) {
    drawStartScreen();
  }

  // End fade overlay (after game over)
}

/*************************
 * LOOP
 *************************/
function loop(now) {
  update(now);
  draw();
  requestAnimationFrame(loop);
}

/*************************
 * INIT
 *************************/
nextObstacleX = worldX + BASE_W * 1.2;
requestAnimationFrame(loop);
