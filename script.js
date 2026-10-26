
(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const $ = id => document.getElementById(id);

  const COLS = 24;
  const ROWS = 16;
  const CELL_W = canvas.width / COLS;
  const CELL_H = canvas.height / ROWS;
  const MAX_OBSTACLES = 5;
  const FOOD_POINTS = 10;

  // Wildlife images are loaded from the assets folder.
  const assets = {};

  const imageFiles = {
    snake: "assets/snake.png",
    frog: "assets/frog.png",
    chameleon: "assets/chameleon.png",
    rabbit: "assets/rabbit.png",
    pig: "assets/pig.png",
    insect: "assets/insect.png",
    spider: "assets/spider.png",
    lizard: "assets/lizard.png",
    deer: "assets/deer.png",
    mongoose: "assets/mongoose.png",
    boar: "assets/boar.png"
  };

  for (const [name, src] of Object.entries(imageFiles)) {
    const image = new Image();
    image.src = src;
    assets[name] = image;
  }

  let snake = [];
  let food = null;
  let obstacles = [];

  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };

  let score = 0;
  let best = Number(localStorage.getItem("wildsnake-best") || 0);

  let state = "ready";
  let timer = null;
  let turnQueued = false;
  let touchStart = null;
  let foodAnimationFrame = null;

  $("best").textContent = String(best).padStart(3, "0");

  // --------------------------------------------------
  // GAME STATE
  // --------------------------------------------------

  function samePosition(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  function randomCell() {
    return {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS)
    };
  }

  function freeCell() {
    for (let attempt = 0; attempt < 2000; attempt++) {
      const cell = randomCell();

      const hitsSnake = snake.some(part =>
        samePosition(part, cell)
      );

      const hitsObstacle = obstacles.some(part =>
        samePosition(part, cell)
      );

      const hitsFood = food && samePosition(food, cell);

      if (!hitsSnake && !hitsObstacle && !hitsFood) {
        return cell;
      }
    }

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = { x, y };

        if (
          !snake.some(part => samePosition(part, cell)) &&
          !obstacles.some(part => samePosition(part, cell)) &&
          !(food && samePosition(food, cell))
        ) {
          return cell;
        }
      }
    }

    return { x: 1, y: 1 };
  }

  function wildlifeChoices() {
    // Above 200 points: pigs, deer and wild boars.
    if (score > 200) {
      return [
        { asset: "pig", emoji: "🐷", name: "Pig" },
        { asset: "deer", emoji: "🦌", name: "Deer" },
        { asset: "boar", emoji: "🐗", name: "Wild boar" }
      ];
    }

    // Above 100 points: rabbits and frogs.
    if (score > 100) {
      return [
        { asset: "frog", emoji: "🐸", name: "Frog" },
        { asset: "rabbit", emoji: "🐇", name: "Rabbit" }
      ];
    }

    // Starting level: insects and small reptiles.
    return [
      { asset: "insect", emoji: "🦗", name: "Insect" },
      { asset: "lizard", emoji: "🦎", name: "Lizard" },
      { asset: "spider", emoji: "🕷️", name: "Spider" },
      { asset: "chameleon", emoji: "🦎", name: "Chameleon" }
    ];
  }

  function spawnFood() {
    const choices = wildlifeChoices();
    const choice = choices[
      Math.floor(Math.random() * choices.length)
    ];

    return {
      ...freeCell(),
      ...choice
    };
  }

  function updateStats() {
    $("score").textContent = String(score).padStart(3, "0");
    $("best").textContent = String(best).padStart(3, "0");

    $("obstacleCount").textContent =
      `${obstacles.length} / ${MAX_OBSTACLES}`;
  }

  function updateStatus() {
    if (score > 200) {
      $("status").textContent = "LARGE WILDLIFE ZONE";
    } else if (score > 100) {
      $("status").textContent = "RABBITS & FROGS ZONE";
    } else {
      $("status").textContent = "JUNGLE EXPLORATION";
    }
  }

  function showOverlay(title, message, buttonText) {
    $("overlayTitle").textContent = title;
    $("overlayText").textContent = message;
    $("overlayBtn").textContent = buttonText;
    $("overlay").style.display = "grid";
  }

  function hideOverlay() {
    $("overlay").style.display = "none";
  }

  function resetGame() {
    clearInterval(timer);
    timer = null;
    stopFoodAnimation();

    snake = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
      { x: 5, y: 8 }
    ];

    obstacles = [];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };

    score = 0;
    turnQueued = false;
    food = null;

    state = "ready";

    food = spawnFood();

    updateStats();
    updateStatus();
    draw();

    showOverlay(
      "The forest is waiting.",
      "Collect wildlife food, grow longer, and avoid the mongoose.",
      "Start expedition ↗"
    );

    $("status").textContent = "READY TO EXPLORE";
  }

  function startGame() {
    if (state === "running") return;

    if (state === "over") {
      resetGame();
    }

    state = "running";
    hideOverlay();
    updateStatus();

    scheduleTick();
    startFoodAnimation();
  }

  function scheduleTick() {
    clearInterval(timer);

    timer = setInterval(
      gameTick,
      Number($("speed").value)
    );
  }

  function pauseGame() {
    if (state === "running") {
      state = "paused";

      clearInterval(timer);
      timer = null;
      stopFoodAnimation();

      showOverlay(
        "Take cover.",
        "Your jungle expedition is paused.",
        "Resume ↗"
      );

      $("status").textContent = "PAUSED";
    } else if (state === "paused") {
      startGame();
    }
  }

  function endGame(message) {
    state = "over";

    clearInterval(timer);
    timer = null;
    stopFoodAnimation();

    showOverlay(
      "Expedition ended.",
      `${message} Your score: ${score}.`,
      "Play again ↗"
    );

    $("status").textContent = "RUN ENDED";
  }

  // --------------------------------------------------
  // GAME LOGIC
  // --------------------------------------------------

  function gameTick() {
    direction = nextDirection;
    turnQueued = false;

    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y
    };

    // Choose whether the snake can cross the borders.
    if ($("walls").value === "off") {
      head.x = (head.x + COLS) % COLS;
      head.y = (head.y + ROWS) % ROWS;
    } else if (
      head.x < 0 ||
      head.x >= COLS ||
      head.y < 0 ||
      head.y >= ROWS
    ) {
      endGame("You reached the edge of the forest.");
      return;
    }

    const eating = samePosition(head, food);

    // The tail moves away if the snake isn't eating.
    const bodyToCheck = eating
      ? snake
      : snake.slice(0, -1);

    if (bodyToCheck.some(part => samePosition(part, head))) {
      endGame("You collided with your own body.");
      return;
    }

    if (obstacles.some(part => samePosition(part, head))) {
      endGame("The mongoose blocked your path!");
      return;
    }

    snake.unshift(head);

    if (eating) {
      score += FOOD_POINTS;

      if (score > best) {
        best = score;
        localStorage.setItem("wildsnake-best", String(best));
      }

      // FIFO queue: keep a maximum of five obstacles.
      // When a sixth is added, remove the oldest obstacle.
      obstacles.push(freeCell());

      if (obstacles.length > MAX_OBSTACLES) {
        obstacles.shift();
      }

      food = spawnFood();

      updateStats();
      updateStatus();
      playSound(650);
    } else {
      snake.pop();
    }

    draw();
  }

  function changeDirection(x, y) {
    if (state === "ready") {
      startGame();
    }

    if (state !== "running" || turnQueued) return;

    // Don't allow a 180-degree reversal.
    if (
      x === -direction.x &&
      y === -direction.y
    ) {
      return;
    }

    nextDirection = { x, y };
    turnQueued = true;
  }

  // --------------------------------------------------
  // DRAWING HELPERS
  // --------------------------------------------------

  function drawForestFloor() {
    const gradient = ctx.createLinearGradient(
      0, 0, canvas.width, canvas.height
    );

    gradient.addColorStop(0, "#173d26");
    gradient.addColorStop(0.5, "#0d2b1b");
    gradient.addColorStop(1, "#07170f");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Forest-floor foliage.
    for (let i = 0; i < 42; i++) {
      const x = (i * 137 + 23) % canvas.width;
      const y = (i * 83 + 17) % canvas.height;

      ctx.fillStyle = i % 2
        ? "rgba(98,154,73,0.13)"
        : "rgba(183,224,116,0.08)";

      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        18 + (i % 4) * 5,
        5 + (i % 3) * 2,
        (i % 5) * 0.4,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }

    // Subtle grid.
    ctx.strokeStyle = "rgba(158,207,116,0.09)";
    ctx.lineWidth = 1;

    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_W, 0);
      ctx.lineTo(x * CELL_W, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_H);
      ctx.lineTo(canvas.width, y * CELL_H);
      ctx.stroke();
    }
  }

  function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
  }

  function imageIsReady(name) {
    const image = assets[name];

    return Boolean(
      image &&
      image.complete &&
      image.naturalWidth > 0
    );
  }

  function drawWildlifeImage(name, x, y, width, height) {
    if (!imageIsReady(name)) return false;

    ctx.save();

    ctx.shadowColor = name === "insect"
      ? "#fff36b"
      : "#b8ff70";

    ctx.shadowBlur = name === "insect" ? 25 : 10;

    ctx.drawImage(
      assets[name],
      x,
      y,
      width,
      height
    );

    ctx.restore();

    return true;
  }

  // --------------------------------------------------
  // SNAKE
  // --------------------------------------------------

  function drawSnakeHead(part) {
    const x = part.x * CELL_W;
    const y = part.y * CELL_H;

    ctx.save();

    if (imageIsReady("snake")) {
      ctx.shadowColor = "#6be8ee";
      ctx.shadowBlur = 14;

      ctx.beginPath();
      ctx.roundRect(
        x + 1,
        y + 1,
        CELL_W - 2,
        CELL_H - 2,
        8
      );

      ctx.clip();

      ctx.drawImage(
        assets.snake,
        x + 1,
        y + 1,
        CELL_W - 2,
        CELL_H - 2
      );

      ctx.restore();
      return;
    }

    // Fallback snake head.
    ctx.shadowColor = "#7df5f2";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#55d7ce";

    drawRoundedRect(
      x + 1,
      y + 1,
      CELL_W - 2,
      CELL_H - 2,
      8
    );

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#15332b";

    const eyeOffsetX = direction.x === 1
      ? CELL_W * 0.7
      : direction.x === -1
        ? CELL_W * 0.3
        : CELL_W * 0.5;

    const eyeOffsetY = direction.y === 1
      ? CELL_H * 0.7
      : direction.y === -1
        ? CELL_H * 0.3
        : CELL_H * 0.5;

    ctx.beginPath();
    ctx.arc(
      x + eyeOffsetX - direction.y * 4,
      y + eyeOffsetY + direction.x * 4,
      2.2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      x + eyeOffsetX + direction.y * 4,
      y + eyeOffsetY - direction.x * 4,
      2.2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }

  function drawSnakeBody(part, index) {
    const x = part.x * CELL_W;
    const y = part.y * CELL_H;

    ctx.save();

    const hue = 174 + (index % 4) * 5;

    ctx.fillStyle =
      `hsl(${hue}, 60%, ${Math.max(32, 48 - index * 0.15)}%)`;

    ctx.shadowColor = "#3ee5d2";
    ctx.shadowBlur = 5;

    drawRoundedRect(
      x + 2,
      y + 2,
      CELL_W - 4,
      CELL_H - 4,
      6
    );

    // Subtle scale pattern.
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(235,255,244,0.3)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(x + 5, y + 6);
    ctx.lineTo(x + CELL_W - 5, y + CELL_H - 6);
    ctx.stroke();

    ctx.restore();
  }

  function drawSnake() {
    snake.forEach((part, index) => {
      if (index === 0) {
        drawSnakeHead(part);
      } else {
        drawSnakeBody(part, index);
      }
    });
  }

  // --------------------------------------------------
  // FOOD: HIGH VISIBILITY + PULSING GLOW
  // --------------------------------------------------

  function drawFood() {
    if (!food) return;

    const centerX = (food.x + 0.5) * CELL_W;
    const centerY = (food.y + 0.5) * CELL_H;

    // Smooth animation based on elapsed time.
    const time = performance.now() / 250;
    const pulse = 1 + 0.12 * Math.sin(time);
    const radius = 13 * pulse;

    ctx.save();

    // 1. Large golden glow.
    const glow = ctx.createRadialGradient(
      centerX, centerY, 2,
      centerX, centerY, 36 * pulse
    );

    glow.addColorStop(0, "rgba(255,255,190,1)");
    glow.addColorStop(0.20, "rgba(255,235,65,0.95)");
    glow.addColorStop(0.50, "rgba(255,170,20,0.48)");
    glow.addColorStop(1, "rgba(255,140,0,0)");

    ctx.fillStyle = glow;

    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      36 * pulse,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // 2. Thick dark border for contrast.
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#17200b";
    ctx.lineWidth = 7;

    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      radius + 5,
      0,
      Math.PI * 2
    );

    ctx.stroke();

    // 3. Bright yellow pulsing ring.
    ctx.strokeStyle = "#fff700";
