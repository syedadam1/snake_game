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

  /*
    Put your actual wildlife photos inside the assets folder.
    If an image is missing, the game uses a bright emoji fallback.
  */
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
    // Avoid the snake, food, and existing obstacles.
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

    // A fallback for an unusually crowded board.
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
    // The thresholds are based on the current score.
    if (score > 200) {
      return [
        { asset: "pig", emoji: "🐷", name: "Pig" },
        { asset: "deer", emoji: "🦌", name: "Deer" },
        { asset: "boar", emoji: "🐗", name: "Wild boar" }
      ];
    }

    if (score > 100) {
      return [
        { asset: "frog", emoji: "🐸", name: "Frog" },
        { asset: "rabbit", emoji: "🐇", name: "Rabbit" }
      ];
    }

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

    // Border behavior.
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

    // Moving into the old tail position is allowed if the
    // snake isn't eating, because that tail moves away.
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

      /*
        FIFO obstacle queue:
        Add the new mongoose at the end.
        If the queue exceeds five, remove the oldest one.
      */
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

    // Prevent a 180-degree reversal.
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

    const image = assets[name];

    ctx.save();

    ctx.shadowColor = "#b8ff70";
    ctx.shadowBlur = name === "insect" ? 25 : 10;

    ctx.drawImage(
      image,
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

    // Use the supplied snake photo for the head if available.
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

    // Fallback snake head if the photo isn't installed.
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

    ctx.fillStyle = `hsl(${hue}, 60%, ${Math.max(32, 48 - index * 0.15)}%)`;

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
  // FOOD
  // --------------------------------------------------

  function drawFood() {
    if (!food) return;

    const centerX = (food.x + 0.5) * CELL_W;
    const centerY = (food.y + 0.5) * CELL_H;

    const size = 29;

    // Bright halo, particularly for insects.
    ctx.save();

    ctx.shadowColor = food.asset === "insect"
      ? "#fff06a"
      : "#b8ff70";

    ctx.shadowBlur = food.asset === "insect" ? 30 : 14;

    ctx.fillStyle = food.asset === "insect"
      ? "rgba(255,240,106,0.2)"
      : "rgba(184,255,112,0.12)";

    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Use the exact wildlife image when available.
    if (
      drawWildlifeImage(
        food.asset,
        centerX - size / 2,
        centerY - size / 2,
        size,
        size
      )
    ) {
      return;
    }

    // High-visibility fallback.
    ctx.save();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "27px serif";

    if (food.asset === "insect") {
      ctx.shadowColor = "#fff06a";
      ctx.shadowBlur = 24;
    }

    ctx.fillText(food.emoji, centerX, centerY);
    ctx.restore();
  }

  // --------------------------------------------------
  // MONGOOSE OBSTACLES
  // --------------------------------------------------

  function drawMongoose(position) {
    const x = position.x * CELL_W;
    const y = position.y * CELL_H;

    if (
      drawWildlifeImage(
        "mongoose",
        x - 1,
        y - 1,
        CELL_W + 2,
        CELL_H + 2
      )
    ) {
      return;
    }

    // Fallback illustration until mongoose.png is provided.
    const centerX = x + CELL_W / 2;
    const centerY = y + CELL_H / 2;

    ctx.save();

    ctx.shadowColor = "#ffb45e";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#a16b3c";

    // Body.
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      centerY,
      10,
      6,
      -0.15,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Head.
    ctx.beginPath();
    ctx.arc(centerX + 8, centerY - 3, 5, 0, Math.PI * 2);
    ctx.fill();

    // Tail.
    ctx.strokeStyle = "#c18a52";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(centerX - 8, centerY + 1);
    ctx.quadraticCurveTo(
      centerX - 15,
      centerY + 8,
      centerX - 11,
      centerY + 10
    );
    ctx.stroke();

    // Eye.
    ctx.fillStyle = "#fff0c7";

    ctx.beginPath();
    ctx.arc(centerX + 10, centerY - 4, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --------------------------------------------------
  // MAIN DRAW
  // --------------------------------------------------

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawForestFloor();

    obstacles.forEach(drawMongoose);

    drawFood();
    drawSnake();
  }

  // --------------------------------------------------
  // SOUND
  // --------------------------------------------------

  function playSound(frequency) {
    if ($("sound").value !== "on") return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      const audio = new AudioContextClass();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();

      oscillator.frequency.value = frequency;
      gain.gain.value = 0.035;

      oscillator.connect(gain);
      gain.connect(audio.destination);

      oscillator.start();
      oscillator.stop(audio.currentTime + 0.07);

      oscillator.onended = () => audio.close();
    } catch {
      // Audio isn't required for gameplay.
    }
  }

  // --------------------------------------------------
  // CONTROLS
  // --------------------------------------------------

  document.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    if (
      [
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        " "
      ].includes(key)
    ) {
      event.preventDefault();
    }

    if (key === "arrowup" || key === "w") {
      changeDirection(0, -1);
    } else if (key === "arrowdown" || key === "s") {
      changeDirection(0, 1);
    } else if (key === "arrowleft" || key === "a") {
      changeDirection(-1, 0);
    } else if (key === "arrowright" || key === "d") {
      changeDirection(1, 0);
    } else if (key === " ") {
      if (state === "running" || state === "paused") {
        pauseGame();
      }
    } else if (key === "enter") {
      if (state === "ready" || state === "paused") {
        startGame();
      } else if (state === "over") {
        resetGame();
        startGame();
      }
    }
  });

  // On-screen direction controls.
  document.querySelectorAll(".key").forEach(button => {
    button.addEventListener("click", () => {
      const directions = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0]
      };

      const [x, y] = directions[button.dataset.dir];

      changeDirection(x, y);
    });
  });

  // Mobile swipe controls.
  canvas.addEventListener("touchstart", event => {
    const touch = event.changedTouches[0];

    touchStart = {
      x: touch.clientX,
      y: touch.clientY
    };
  }, { passive: true });

  canvas.addEventListener("touchend", event => {
    if (!touchStart) return;

    const touch = event.changedTouches[0];

    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;

    if (Math.max(Math.abs(dx), Math.abs(dy)) > 18) {
      if (Math.abs(dx) > Math.abs(dy)) {
        changeDirection(dx > 0 ? 1 : -1, 0);
      } else {
        changeDirection(0, dy > 0 ? 1 : -1);
      }
    }

    touchStart = null;
  }, { passive: true });

  // --------------------------------------------------
  // BUTTONS AND SETTINGS
  // --------------------------------------------------

  $("startBtn").addEventListener("click", startGame);
  $("pauseBtn").addEventListener("click", pauseGame);
  $("resetBtn").addEventListener("click", resetGame);

  $("overlayBtn").addEventListener("click", () => {
    if (state === "over") {
      resetGame();
    }

    startGame();
  });

  $("speed").addEventListener("change", () => {
    if (state === "running") {
      scheduleTick();
    }
  });

  // Dark/light mode.
  function setTheme(theme) {
    document.body.classList.toggle("light", theme === "light");

    $("themeBtn").textContent = theme === "light"
      ? "☾ Dark Mode"
      : "☀ Light Mode";

    localStorage.setItem("wildsnake-theme", theme);
  }

  $("themeBtn").addEventListener("click", () => {
    const newTheme = document.body.classList.contains("light")
      ? "dark"
      : "light";

    setTheme(newTheme);
  });

  setTheme(localStorage.getItem("wildsnake-theme") || "dark");

  // Repaint when an image finishes loading.
  Object.values(assets).forEach(image => {
    image.addEventListener("load", () => {
      draw();
    });
  });

  // Start.
  resetGame();
})();
