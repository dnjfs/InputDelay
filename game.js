"use strict";

const canvas = document.querySelector("#game-canvas");
const context = canvas.getContext("2d");

const lobbyScreen = document.querySelector("#lobby-screen");
const gameScreen = document.querySelector("#game-screen");
const resultPanel = document.querySelector("#result-panel");
const queueCount = document.querySelector("#queue-count");
const nextInputTime = document.querySelector("#next-input-time");
const leftState = document.querySelector("#left-state");
const rightState = document.querySelector("#right-state");
const gameMessage = document.querySelector("#game-message");

const VIEWPORT = Object.freeze({ width: canvas.width, height: canvas.height });
const FIXED_STEP = 1 / 60;
const MAX_FRAME_TIME = 0.1;

const STAGES = {
  1: {
    number: "01",
    title: "THE FIRST GAP",
    delay: 0.3,
    spawn: { x: 150, y: 416 },
    platforms: [
      { x: 30, y: 460, width: 270, height: 170 },
      { x: 450, y: 460, width: 220, height: 170 },
      { x: 820, y: 460, width: 270, height: 170 },
    ],
    goal: { x: 935, y: 320, width: 58, height: 140 },
    instruction: "깃발에 닿으면 클리어!",
  },
  2: {
    number: "02",
    title: "MOVING GROUND",
    delay: 0.3,
    spawn: { x: 90, y: 416 },
    platforms: [
      { x: 40, y: 460, width: 220, height: 170 },
      {
        x: 285,
        y: 405,
        width: 120,
        height: 24,
        moving: true,
        startX: 285,
        endX: 455,
        speed: 180,
      },
      {
        x: 825,
        y: 405,
        width: 120,
        height: 24,
        moving: true,
        startX: 825,
        endX: 655,
        speed: 180,
      },
      { x: 930, y: 460, width: 160, height: 170 },
    ],
    goal: { x: 1000, y: 320, width: 58, height: 140 },
    instruction: "빨간 이동 바닥을 타고 건너가세요.",
  },
  3: {
    number: "03",
    title: "CRUMBLING PATH",
    delay: 0.4,
    spawn: { x: 70, y: 456 },
    platforms: [
      { x: 40, y: 500, width: 110, height: 130 },
      { x: 215, y: 510, width: 50, height: 22, breakable: true, breakDelay: 0.5 },
      { x: 355, y: 510, width: 50, height: 22, breakable: true, breakDelay: 0.5 },
      { x: 495, y: 510, width: 50, height: 22, breakable: true, breakDelay: 0.5 },
      {
        x: 610,
        y: 510,
        width: 110,
        height: 22,
        moving: true,
        axis: "y",
        startY: 510,
        endY: 370,
        speed: 70,
      },
      { x: 776, y: 370, width: 50, height: 22, breakable: true, breakDelay: 0.5 },
      { x: 876, y: 305, width: 50, height: 22, breakable: true, breakDelay: 0.5 },
      { x: 976, y: 240, width: 50, height: 22, breakable: true, breakDelay: 0.5 },
      { x: 1040, y: 190, width: 80, height: 440 },
    ],
    goal: { x: 1050, y: 50, width: 58, height: 140 },
    instruction: "회색 바닥은 밟은 뒤 0.5초 후 부서집니다.",
  },
  4: {
    number: "04",
    title: "PHASE SHIFT",
    delay: 0.4,
    spawn: { x: 55, y: 476 },
    platforms: [
      { x: 30, y: 520, width: 100, height: 110 },
      { x: 160, y: 530, width: 60, height: 22, blinkPhase: 1, blinkInterval: 1 },
      { x: 240, y: 530, width: 60, height: 22, blinkPhase: 2, blinkInterval: 1 },
      { x: 320, y: 530, width: 60, height: 22, breakable: true, breakDelay: 0.5 },
      { x: 400, y: 530, width: 60, height: 22, blinkPhase: 2, blinkInterval: 1 },
      { x: 480, y: 530, width: 60, height: 22, blinkPhase: 1, blinkInterval: 1 },
      {
        x: 560,
        y: 530,
        width: 80,
        height: 22,
        moving: true,
        axis: "y",
        startY: 530,
        endY: 370,
        speed: 80,
        travelDuration: 2,
      },
      { x: 430, y: 290, width: 100, height: 22, blinkPhase: 1, blinkInterval: 1 },
      { x: 430, y: 210, width: 100, height: 22, blinkPhase: 2, blinkInterval: 1 },
      {
        x: 560,
        y: 210,
        width: 80,
        height: 22,
        moving: true,
        startX: 560,
        endX: 780,
        speed: 110,
      },
      { x: 870, y: 210, width: 70, height: 22, breakable: true, breakDelay: 0.5 },
      { x: 1010, y: 160, width: 110, height: 470 },
    ],
    goal: { x: 1050, y: 20, width: 58, height: 140 },
    instruction: "파란 발판은 1초마다 1번과 2번이 번갈아 나타납니다.",
  },
  5: {
    number: "05",
    title: "FINAL ASCENT",
    delay: 0.5,
    spawn: { x: 55, y: 456 },
    platforms: [
      { x: 30, y: 500, width: 110, height: 130 },
      { x: 190, y: 530, width: 100, height: 18, jumpPad: true, jumpPower: 900 },
      { x: 400, y: 520, width: 100, height: 22, blinkPhase: 2, blinkInterval: 1 },
      {
        x: 540,
        y: 520,
        width: 110,
        height: 22,
        moving: true,
        startX: 540,
        endX: 960,
        speed: 210,
        travelDuration: 2,
      },
      { x: 935, y: 430, width: 50, height: 24, breakable: true, breakDelay: 0.5 },
      { x: 870, y: 365, width: 50, height: 24, breakable: true, breakDelay: 0.5 },
      { x: 805, y: 300, width: 50, height: 24, breakable: true, breakDelay: 0.5 },
      { x: 740, y: 235, width: 50, height: 24, breakable: true, breakDelay: 0.5 },
      { x: 600, y: 195, width: 100, height: 22, blinkPhase: 1, blinkInterval: 1 },
      { x: 470, y: 210, width: 100, height: 18, jumpPad: true, jumpPower: 900 },
      { x: 300, y: 210, width: 100, height: 18, jumpPad: true, jumpPower: 900 },
      { x: 30, y: 110, width: 120, height: 90 },
    ],
    goal: { x: 50, y: 20, width: 58, height: 90 },
    instruction: "점프패드를 밟으면 즉시 높이 튀어 오릅니다.",
  },
};

const player = {
  x: 0,
  y: 0,
  width: 44,
  height: 44,
  velocityX: 0,
  velocityY: 0,
  moveSpeed: 300,
  jumpSpeed: 650,
  grounded: false,
  groundedPlatform: null,
};

const inputState = {
  left: false,
  right: false,
};

let activeStage = null;
let inputQueue = [];
let simulationTime = 0;
let accumulator = 0;
let previousFrameTime = 0;
let isPlaying = false;
let animationFrameId = null;

function startStage(stageNumber) {
  const stage = STAGES[stageNumber];
  if (!stage) return;

  activeStage = stage;
  document.querySelector("#stage-number").textContent = stage.number;
  document.querySelector("#stage-title").textContent = stage.title;
  document.querySelector("#delay-value").textContent = `${stage.delay.toFixed(1)}s`;

  lobbyScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  resetStage();

  if (animationFrameId === null) {
    previousFrameTime = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);
  }
}

function resetStage() {
  if (!activeStage) return;

  player.x = activeStage.spawn.x;
  player.y = activeStage.spawn.y;
  player.velocityX = 0;
  player.velocityY = 0;
  player.grounded = true;
  player.groundedPlatform = activeStage.platforms[0];

  for (const platform of activeStage.platforms) {
    if (platform.breakable) {
      platform.broken = false;
      platform.breakTimer = null;
    }

    if (!platform.moving) continue;
    const axis = platform.axis ?? "x";
    const positionKey = axis;
    const startKey = axis === "x" ? "startX" : "startY";
    const endKey = axis === "x" ? "endX" : "endY";
    platform[positionKey] = platform[startKey];
    platform.direction = Math.sign(platform[endKey] - platform[startKey]) || 1;
    platform.motionFrame = 0;
    platform.deltaX = 0;
    platform.deltaY = 0;
  }

  inputQueue = [];
  inputState.left = false;
  inputState.right = false;
  simulationTime = 0;
  accumulator = 0;
  isPlaying = true;

  resultPanel.classList.add("hidden");
  gameMessage.textContent = activeStage.instruction;
  updateInputDisplay();
  draw();
}

function returnToLobby() {
  isPlaying = false;
  activeStage = null;
  inputQueue = [];
  inputState.left = false;
  inputState.right = false;
  gameScreen.classList.add("hidden");
  lobbyScreen.classList.remove("hidden");
  updateInputDisplay();
}

function scheduleInput(type, value = true) {
  if (!isPlaying || !activeStage) return;

  inputQueue.push({
    type,
    value,
    executeAt: simulationTime + activeStage.delay,
  });
  updateInputDisplay();
}

function executeQueuedInputs() {
  while (inputQueue.length > 0 && inputQueue[0].executeAt <= simulationTime) {
    const input = inputQueue.shift();

    if (input.type === "jump") {
      if (player.grounded) {
        player.velocityY = -player.jumpSpeed;
        player.grounded = false;
        player.groundedPlatform = null;
      }
    } else {
      inputState[input.type] = input.value;
    }
  }
}

function update(deltaTime) {
  if (!isPlaying || !activeStage) return;

  simulationTime += deltaTime;
  updateMovingPlatforms(deltaTime);
  executeQueuedInputs();
  updateBreakablePlatforms(deltaTime);
  updateBlinkingPlatforms();

  const horizontalDirection = Number(inputState.right) - Number(inputState.left);
  player.velocityX = horizontalDirection * player.moveSpeed;

  movePlayerHorizontally(deltaTime);
  movePlayerVertically(deltaTime);

  if (player.y > VIEWPORT.height + 100) {
    const stageToRestart = activeStage;
    resetStage();
    activeStage = stageToRestart;
    gameMessage.textContent = "낙하했습니다. 스테이지를 다시 시작합니다.";
    return;
  }

  if (rectanglesOverlap(player, activeStage.goal)) {
    completeStage();
  }
}

function updateMovingPlatforms(deltaTime) {
  for (const platform of activeStage.platforms) {
    if (!platform.moving) continue;

    const axis = platform.axis ?? "x";
    const positionKey = axis;
    const startKey = axis === "x" ? "startX" : "startY";
    const endKey = axis === "x" ? "endX" : "endY";
    const previousPosition = platform[positionKey];

    if (platform.travelDuration) {
      updateTimedMovingPlatform(platform, positionKey, startKey, endKey);
    } else {
      platform[positionKey] += platform.direction * platform.speed * deltaTime;

      const minimumPosition = Math.min(platform[startKey], platform[endKey]);
      const maximumPosition = Math.max(platform[startKey], platform[endKey]);
      if (platform[positionKey] <= minimumPosition) {
        platform[positionKey] = minimumPosition;
        platform.direction = 1;
      } else if (platform[positionKey] >= maximumPosition) {
        platform[positionKey] = maximumPosition;
        platform.direction = -1;
      }
    }

    platform.deltaX = axis === "x" ? platform.x - previousPosition : 0;
    platform.deltaY = axis === "y" ? platform.y - previousPosition : 0;
    if (player.groundedPlatform === platform) {
      player.x += platform.deltaX;
      player.y += platform.deltaY;
    }
  }
}

function updateTimedMovingPlatform(platform, positionKey, startKey, endKey) {
  const travelFrames = Math.round(platform.travelDuration / FIXED_STEP);
  const cycleFrames = travelFrames * 2;
  platform.motionFrame = (platform.motionFrame + 1) % cycleFrames;

  const returning = platform.motionFrame > travelFrames;
  const frameOnPath = returning
    ? cycleFrames - platform.motionFrame
    : platform.motionFrame;
  const progress = frameOnPath / travelFrames;
  const startPosition = platform[startKey];
  const endPosition = platform[endKey];

  platform[positionKey] = startPosition + (endPosition - startPosition) * progress;
  const outboundDirection = Math.sign(endPosition - startPosition) || 1;
  platform.direction = returning ? -outboundDirection : outboundDirection;
}

function updateBreakablePlatforms(deltaTime) {
  for (const platform of activeStage.platforms) {
    if (!platform.breakable || platform.broken || platform.breakTimer === null) continue;

    platform.breakTimer -= deltaTime;
    if (platform.breakTimer > 0) continue;

    platform.broken = true;
    if (player.groundedPlatform === platform) {
      player.grounded = false;
      player.groundedPlatform = null;
    }
  }
}

function updateBlinkingPlatforms() {
  const platform = player.groundedPlatform;
  if (!platform?.blinkPhase || isBlinkingPlatformActive(platform)) return;

  player.grounded = false;
  player.groundedPlatform = null;
}

function isBlinkingPlatformActive(platform) {
  if (!platform.blinkPhase) return true;

  const interval = platform.blinkInterval ?? 1;
  const activePhase = (Math.floor(simulationTime / interval) % 2) + 1;
  return platform.blinkPhase === activePhase;
}

function isPlatformSolid(platform) {
  return !platform.broken && isBlinkingPlatformActive(platform);
}

function movePlayerHorizontally(deltaTime) {
  const previousX = player.x;
  const previousLeft = previousX;
  const previousRight = previousX + player.width;
  player.x += player.velocityX * deltaTime;
  player.x = Math.max(0, Math.min(VIEWPORT.width - player.width, player.x));

  for (const platform of activeStage.platforms) {
    if (!isPlatformSolid(platform)) continue;
    if (!rectanglesOverlap(player, platform)) continue;

    const platformRight = platform.x + platform.width;
    if (player.velocityX > 0 && previousRight <= platform.x) {
      player.x = platform.x - player.width;
    } else if (player.velocityX < 0 && previousLeft >= platformRight) {
      player.x = platformRight;
    }
  }
}

function movePlayerVertically(deltaTime) {
  const previousBottom = player.y + player.height;
  player.velocityY += 1800 * deltaTime;
  player.y += player.velocityY * deltaTime;
  player.grounded = false;
  player.groundedPlatform = null;

  for (const platform of activeStage.platforms) {
    if (!isPlatformSolid(platform)) continue;
    if (!rectanglesOverlap(player, platform)) continue;

    if (player.velocityY >= 0 && previousBottom <= platform.y + 2) {
      player.y = platform.y - player.height;
      if (platform.jumpPad) {
        player.velocityY = -platform.jumpPower;
        player.grounded = false;
        player.groundedPlatform = null;
      } else {
        player.velocityY = 0;
        player.grounded = true;
        player.groundedPlatform = platform;
        if (platform.breakable && platform.breakTimer === null) {
          platform.breakTimer = platform.breakDelay;
        }
      }
    } else if (player.velocityY < 0) {
      player.y = platform.y + platform.height;
      player.velocityY = 0;
    }
  }
}

function rectanglesOverlap(first, second) {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}

function completeStage() {
  isPlaying = false;
  player.velocityX = 0;
  player.velocityY = 0;
  inputQueue = [];
  inputState.left = false;
  inputState.right = false;
  resultPanel.classList.remove("hidden");
  gameMessage.textContent = "STAGE CLEAR";
  updateInputDisplay();
}

function gameLoop(frameTime) {
  const elapsed = Math.min((frameTime - previousFrameTime) / 1000, MAX_FRAME_TIME);
  previousFrameTime = frameTime;
  accumulator += elapsed;

  while (accumulator >= FIXED_STEP) {
    update(FIXED_STEP);
    accumulator -= FIXED_STEP;
  }

  draw();
  updateInputDisplay();
  animationFrameId = requestAnimationFrame(gameLoop);
}

function draw() {
  if (!activeStage) return;

  drawBackground();
  drawPlatforms();
  drawGoal();
  drawPlayer();
}

function drawBackground() {
  context.fillStyle = "#eef0f3";
  context.fillRect(0, 0, VIEWPORT.width, VIEWPORT.height);

  context.strokeStyle = "rgba(22, 26, 34, 0.055)";
  context.lineWidth = 1;
  for (let x = 0; x <= VIEWPORT.width; x += 40) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, VIEWPORT.height);
    context.stroke();
  }
  for (let y = 0; y <= VIEWPORT.height; y += 40) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(VIEWPORT.width, y);
    context.stroke();
  }
}

function drawPlatforms() {
  for (const platform of activeStage.platforms) {
    if (!platform.moving) continue;

    context.save();
    context.strokeStyle = "rgba(232, 61, 75, 0.3)";
    context.lineWidth = 3;
    context.setLineDash([10, 10]);
    context.beginPath();
    if ((platform.axis ?? "x") === "x") {
      const pathStart = Math.min(platform.startX, platform.endX);
      const pathEnd = Math.max(platform.startX, platform.endX) + platform.width;
      context.moveTo(pathStart, platform.y + platform.height / 2);
      context.lineTo(pathEnd, platform.y + platform.height / 2);
    } else {
      const pathStart = Math.min(platform.startY, platform.endY);
      const pathEnd = Math.max(platform.startY, platform.endY) + platform.height;
      context.moveTo(platform.x + platform.width / 2, pathStart);
      context.lineTo(platform.x + platform.width / 2, pathEnd);
    }
    context.stroke();
    context.restore();
  }

  for (const platform of activeStage.platforms) {
    if (!isPlatformSolid(platform)) continue;

    if (platform.jumpPad) {
      drawJumpPad(platform);
      continue;
    }

    if (platform.moving) {
      context.fillStyle = "#e83d4b";
    } else if (platform.blinkPhase) {
      context.fillStyle = "#238be6";
    } else if (platform.breakable) {
      context.fillStyle = platform.breakTimer === null ? "#aeb4c0" : "#ff8976";
    } else {
      context.fillStyle = "#161a22";
    }
    context.fillRect(platform.x, platform.y, platform.width, platform.height);

    if (platform.blinkPhase) {
      drawBlinkingPlatformLabel(platform);
    } else if (!platform.moving && !platform.breakable) {
      context.fillStyle = "#ffcf3f";
      context.fillRect(platform.x, platform.y, platform.width, 8);
    } else if (platform.breakable) {
      context.strokeStyle = "#737a88";
      context.lineWidth = 3;
      context.strokeRect(platform.x, platform.y, platform.width, platform.height);

      if (platform.breakTimer !== null) {
        drawCracks(platform);
      }
    }
  }
}

function drawJumpPad(platform) {
  const centerX = platform.x + platform.width / 2;
  const centerY = platform.y + platform.height / 2;

  context.fillStyle = "rgba(78, 91, 218, 0.16)";
  context.strokeStyle = "#4e5bda";
  context.lineWidth = 4;
  context.beginPath();
  context.ellipse(centerX, centerY, platform.width / 2, 15, 0, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.strokeStyle = "#252a63";
  context.lineWidth = 3;
  for (const offsetY of [5, -3]) {
    context.beginPath();
    context.moveTo(centerX - 9, centerY + offsetY);
    context.lineTo(centerX, centerY + offsetY - 10);
    context.lineTo(centerX + 9, centerY + offsetY);
    context.stroke();
  }
}

function drawBlinkingPlatformLabel(platform) {
  context.fillStyle = "#ffffff";
  context.font = "800 16px Inter, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(
    String(platform.blinkPhase),
    platform.x + platform.width / 2,
    platform.y + platform.height / 2 + 1,
  );
  context.textAlign = "start";
  context.textBaseline = "alphabetic";
}

function drawCracks(platform) {
  const centerX = platform.x + platform.width / 2;
  const centerY = platform.y + platform.height / 2;
  context.strokeStyle = "#6d3034";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(centerX, platform.y);
  context.lineTo(centerX - 8, centerY);
  context.lineTo(centerX + 4, platform.y + platform.height);
  context.moveTo(centerX - 8, centerY);
  context.lineTo(centerX - 18, centerY + 3);
  context.moveTo(centerX - 4, centerY + 5);
  context.lineTo(centerX + 13, centerY + 2);
  context.stroke();
}

function drawGoal() {
  const goal = activeStage.goal;
  const poleX = goal.x + 10;

  context.strokeStyle = "#161a22";
  context.lineWidth = 6;
  context.beginPath();
  context.moveTo(poleX, goal.y);
  context.lineTo(poleX, goal.y + goal.height);
  context.stroke();

  context.fillStyle = "#ffcf3f";
  context.beginPath();
  context.moveTo(poleX + 3, goal.y + 4);
  context.lineTo(poleX + 58, goal.y + 28);
  context.lineTo(poleX + 3, goal.y + 52);
  context.closePath();
  context.fill();
}

function drawPlayer() {
  context.fillStyle = "#ffcf3f";
  context.fillRect(player.x, player.y, player.width, player.height);

  context.strokeStyle = "#161a22";
  context.lineWidth = 5;
  context.strokeRect(player.x, player.y, player.width, player.height);

  const direction = inputState.left ? -1 : 1;
  const eyeX = direction > 0 ? player.x + 29 : player.x + 10;
  context.fillStyle = "#161a22";
  context.fillRect(eyeX, player.y + 12, 6, 6);
}

function updateInputDisplay() {
  leftState.classList.toggle("active", inputState.left);
  rightState.classList.toggle("active", inputState.right);
  queueCount.textContent = String(inputQueue.length);

  if (inputQueue.length === 0 || !isPlaying) {
    nextInputTime.textContent = "—";
    return;
  }

  const remainingTime = Math.max(0, inputQueue[0].executeAt - simulationTime);
  nextInputTime.textContent = `${remainingTime.toFixed(2)}s`;
}

function handleKeyDown(event) {
  if (!["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) return;
  if (!gameScreen.classList.contains("hidden")) event.preventDefault();
  if (event.repeat) return;

  if (event.code === "ArrowLeft") scheduleInput("left", true);
  if (event.code === "ArrowRight") scheduleInput("right", true);
  if (event.code === "Space") scheduleInput("jump");
}

function handleKeyUp(event) {
  if (!["ArrowLeft", "ArrowRight"].includes(event.code)) return;
  if (!gameScreen.classList.contains("hidden")) event.preventDefault();

  if (event.code === "ArrowLeft") scheduleInput("left", false);
  if (event.code === "ArrowRight") scheduleInput("right", false);
}

function releaseAllDirections() {
  inputQueue = inputQueue.filter((input) => input.type === "jump");
  inputState.left = false;
  inputState.right = false;
  updateInputDisplay();
}

for (const stageButton of document.querySelectorAll("[data-stage]")) {
  stageButton.addEventListener("click", () => startStage(Number(stageButton.dataset.stage)));
}
document.querySelector("#lobby-button").addEventListener("click", returnToLobby);
document.querySelector("#result-lobby-button").addEventListener("click", returnToLobby);
document.querySelector("#retry-button").addEventListener("click", resetStage);
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
window.addEventListener("blur", releaseAllDirections);
