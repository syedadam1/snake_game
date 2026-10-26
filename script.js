(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const $ = (id) => document.getElementById(id);

  const COLS = 24;
  const ROWS = 16;
  const CELL_W = canvas.width / COLS;
  const CELL_H = canvas.height / ROWS;

  let snake;
  let food;
  let mongoose;
  let direction;
  let nextDirection;
  let score = 0;
  let best = Number(localStorage.getItem("wildsnake-best") || 0);
  let state = "ready";
  let timer = null;
  let turnQueued = false;
  let touchStart = null;

  $("best").textContent = String(best).padStart(3, "0");

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
    let cell;
    let attempts = 0;

    do {
      cell = randomCell();
      attempts++;
    } while (
      attempts < 1000 &&
      (
        snake.some(p => samePosition(p, cell)) ||
        mongoose.some(p => samePosition(p, cell)) ||
        (food && samePosition(food, cell))
      )
    );

    return cell;
  }

  function wildlifeChoices() {
    if (score >= 500) {
      return [
        { emoji: "🦌", name: "Deer" },
        { emoji: "🐗", name: "Wild boar" }
      ];
    }

    if (score >= 200) {
      return [
        { emoji: "🐸", name: "Frog" },
        { emoji: "🐇", name: "Rabbit" }
      ];
    }

    return [
      { emoji: "🦗", name: "Insect" },
      { emoji: "🦎", name: "Lizard" }
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

  function reset() {
    clearInterval(timer);
    timer = null;

    snake = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
      { x: 5, y: 8 }
    ];

    mongoose = [];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };

    score = 0;
    turnQueued = false;
    food = null;
    food = spawnFood();

    state = "ready";

    updateStats();
    draw();

    showOverlay(
      "The forest is waiting.",
      "Collect wildlife food. Watch for the mongoose!",
      "Start expedition ↗"
    );

    $("status").textContent = "READY TO EXPLORE";
  }

  function start() {
    if (state === "running") return;

    if (state === "over") {
      reset();
    }

    state = "running";
    hideOverlay();

    $("status").textContent = "IN THE WILD";

    schedule();
  }

  function schedule() {
    clearInterval(timer);

    timer = setInterval(
      tick,
      Number($("speed").value)
    );
  }

  function pause() {
    if (state === "running") {
      state = "paused";
      clearInterval(timer);
      timer = null;

      showOverlay(
        "Take cover.",
        "Your jungle run is paused.",
        "Resume ↗"
      );

      $("status").textContent = "PAUSED";
    } else if (state === "paused") {
      start();
    }
  }

  function end(message) {
    state = "over";
    clearInterval(timer);
    timer = null;

    showOverlay(
      "Expedition ended.",
      `${message} Score: ${score}. Try another run?`,
      "Play again ↗"
    );

    $("status").textContent = "RUN ENDED";
  }

  function tick() {
    direction = nextDirection;
    turnQueued = false;

    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y
    };

    // Wall collision or wrap-around.
    if ($("walls").value === "off") {
      head.x = (head.x + COLS) % COLS;
      head.y = (head.y + ROWS) % ROWS;
    } else if (
      head.x < 0 ||
      head.x >= COLS ||
      head.y < 0 ||
      head.y >= ROWS
    ) {
      end("You lost the trail at the forest edge.");
      return;
    }

    const eating = samePosition(head, food);

    const body = eating
      ? snake
      : snake.slice(0, -1);

    // Snake hits itself.
    if (body.some(p => samePosition(p, head))) {
      end("You ran into your own trail.");
      return;
    }

    // Snake hits a mongoose.
    if (mongoose.some(p => samePosition(p, head))) {
      end("A mongoose blocked your path!");
      return;
    }

    snake.unshift(head);

    if (eating) {
      score += 10;

      if (score > best) {
        best = score;
        localStorage.setItem("wildsnake-best", best);
      }

      // A new mongoose appears after every meal.
      mongoose.push(freeCell());

      food = spawnFood();

      updateStats();
      playSound(620);

      if (score === 200) {
        $("status").textContent = "FROGS & RABBITS UNLOCKED";
      } else if (score === 500) {
        $("status").textContent = "DEER & BOAR UNLOCKED";
      }
    } else {
      snake.pop();
    }

    draw();
  }

  function playSound(frequency) {
    if ($("sound").value !== "on") return;

    try {
      const audio = new (
        window.AudioContext || window.webkitAudioContext
      )();

      const oscillator = audio.createOscillator();
      const gain = audio.createGain();

      oscillator.frequency.value = frequency;
      gain.gain.value = 0.035;

      oscillator.connect(gain);
      gain.connect(audio.destination);

      oscillator.start();
      oscillator.stop(audio.currentTime + 0.07);

      oscillator.onended = () => audio.close();
    } catch (error) {
      // The game still works if sound is unavailable.
    }
  }

  function roundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
  }

  function drawForestFloor() {
    const gradient = ctx.createLinearGradient(
      0, 0, canvas.width, canvas.height
    );

    gradient.addColorStop(0, "#163a25");
    gradient.addColorStop(0.5, "#0d2b1b");
    gradient.addColorStop(1, "#071a11");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative forest-floor leaves.
    for (let i = 0; i < 34; i++) {
      const x = (i * 137 + 23) % canvas.width;
      const y = (i * 83 + 17) % canvas.height;

      ctx.fillStyle = i % 2
        ? "rgba(98,154,73,0.12)"
        : "rgba(183,224,116,0.08)";

      ctx.beginPath();
      ctx.ellipse(
        x, y,
        18 + (i % 4) * 5,
        5 + (i % 3) * 2,
        (i % 5) * 0.4,
        0, Math.PI * 2
      );
      ctx.fill();
    }

    // Grid lines.
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

  function drawMongoose(position) {
    const x = (position.x + 0.5) * CELL_W;
    const y = (position.y + 0.5) * CELL_H;

    ctx.save();

    ctx.shadowColor = "#ffb45e";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#a16b3c";

    // Body.
    ctx.beginPath();
    ctx.ellipse(x, y, 10, 6, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Head.
    ctx.beginPath();
    ctx.arc(x + 8, y - 3, 5, 0, Math.PI * 2);
    ctx.fill();

    // Tail.
    ctx.strokeStyle = "#c18a52";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x - 8, y + 1);
    ctx.quadraticCurveTo(
      x - 15, y + 8,
      x - 11, y + 10
    );
    ctx.stroke();

    // Eye.
    ctx.fillStyle = "#fff0c7";
    ctx.beginPath();
    ctx.arc(x + 10, y - 4, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawFood() {
    const x = (food.x + 0.5) * CELL_W;
    const y = (food.y + 0.5) * CELL_H;

    ctx.save();
    ctx.shadowColor = "#d7ff8a";
    ctx.shadowBlur = 18;
    ctx.font = "27px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(food.emoji, x, y);
    ctx.restore();
  }

  function drawSnake() {
    snake.forEach((part, index) => {
      ctx.save();

      ctx.shadowColor = index === 0
        ? "#d7ff91"
        : "#67d66a";

      ctx.shadowBlur = index === 0 ? 14 : 5;

      ctx.fillStyle = index === 0
        ? "#d9ff9d"
        : `hsl(${118 - index * 1.2} 48% ${
            Math.max(27, 43 - index * 0.12)
          }%)`;

      roundedRect(
        part.x * CELL_W + 2,
        part.y * CELL_H + 2,
        CELL_W - 4,
        CELL_H - 4,
        index === 0 ? 8 : 5
      );

      // Eyes.
      if (index === 0) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#15321a";

        const ex = direction.x === 1
          ? CELL_W * 0.68
          : direction.x === -1
            ? CELL_W * 0.32
            : CELL_W * 0.5;

        const ey = direction.y === 1
          ? CELL_H * 0.68
          : direction.y === -1
            ? CELL_H * 0.32
            : CELL_H * 0.5;

        ctx.beginPath();
        ctx.arc(
          part.x * CELL_W + ex - direction.y * 4,
          part.y * CELL_H + ey + direction.x * 4,
          2.2, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.beginPath();
        ctx.arc(
          part.x * CELL_W + ex + direction.y * 4,
          part.y * CELL_H + ey - direction.x * 4,
          2.2, 0, Math.PI * 2
        );
        ctx.fill();
      }

      ctx.restore();
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawForestFloor();

    mongoose.forEach(drawMongoose);

    drawFood();
    drawSnake();
  }

  function changeDirection(x, y) {
    if (state === "ready") start();

    if (state !== "running" || turnQueued) return;

    // Prevent an instant 180-degree turn.
    if (
      x === -direction.x &&
      y === -direction.y
    ) {
      return;
    }

    nextDirection = { x, y };
    turnQueued = true;
  }

  // Keyboard controls.
  document.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    if (
      ["arrowup", "arrowdown", "arrowleft",
       "arrowright", " "].includes(key)
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
        pause();
      }
    } else if (key === "enter") {
      if (state === "paused" || state === "ready") {
        start();
      } else if (state === "over") {
        reset();
        start();
      }
    }
  });

  // On-screen direction buttons.
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

  // Game buttons.
  $("startBtn").addEventListener("click", start);
  $("overlayBtn").addEventListener("click", () => {
    if (state === "over") reset();
    start();
  });

  $("pauseBtn").addEventListener("click", pause);
  $("resetBtn").addEventListener("click", reset);

  $("speed").addEventListener("change", () => {
    if (state === "running") schedule();
  });

  // Dark/light theme.
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

  // Start the game.
  reset();
})();
