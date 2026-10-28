"use strict";

const WildSnakeGame = (() => {
    const canvas = document.getElementById("game-canvas");
    const context = canvas.getContext("2d");

    const CELL_SIZE = 24;
    const TICK_DELAY = 140;

    let state = null;
    let connected = false;
    let running = false;
    let paused = false;
    let gameOver = false;
    let loopTimer = null;
    let requestInProgress = false;

    function draw() {
        if (!state) {
            return;
        }

        const width = state.width * CELL_SIZE;
        const height = state.height * CELL_SIZE;

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        context.fillStyle = "#10271a";
        context.fillRect(0, 0, width, height);

        drawGrid(width, height);
        drawObstacles();
        drawFood();
        drawSnake();
    }

    function drawGrid(width, height) {
        context.strokeStyle = "rgba(150, 210, 160, 0.08)";
        context.lineWidth = 1;

        for (let x = 0; x <= width; x += CELL_SIZE) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, height);
            context.stroke();
        }

        for (let y = 0; y <= height; y += CELL_SIZE) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(width, y);
            context.stroke();
        }
    }

    function drawSnake() {
        if (!state || !Array.isArray(state.snake)) {
            return;
        }

        state.snake.forEach((segment, index) => {
            const padding = 2;
            const x = segment.x * CELL_SIZE + padding;
            const y = segment.y * CELL_SIZE + padding;
            const size = CELL_SIZE - padding * 2;

            context.fillStyle = index === 0 ? "#b3ffc2" : "#55c878";

            context.beginPath();
            context.roundRect(
                x,
                y,
                size,
                size,
                index === 0 ? 7 : 5
            );
            context.fill();

            if (index === 0) {
                drawEyes(segment);
            }
        });
    }

    function drawEyes(head) {
        const centerX = head.x * CELL_SIZE;
        const centerY = head.y * CELL_SIZE;

        context.fillStyle = "#10271a";

        const direction = state.direction || "RIGHT";

        let eyes;

        switch (direction) {
            case "UP":
                eyes = [[8, 7], [16, 7]];
                break;
            case "DOWN":
                eyes = [[8, 17], [16, 17]];
                break;
            case "LEFT":
                eyes = [[7, 8], [7, 16]];
                break;
            default:
                eyes = [[17, 8], [17, 16]];
                break;
        }

        for (const [offsetX, offsetY] of eyes) {
            context.beginPath();
            context.arc(
                centerX + offsetX,
                centerY + offsetY,
                2,
                0,
                Math.PI * 2
            );
            context.fill();
        }
    }

    function drawFood() {
        if (!state || !state.food) {
            return;
        }

        const centerX = state.food.x * CELL_SIZE + CELL_SIZE / 2;
        const centerY = state.food.y * CELL_SIZE + CELL_SIZE / 2;

        context.fillStyle = "#ff6868";
        context.beginPath();
        context.arc(
            centerX,
            centerY,
            CELL_SIZE * 0.34,
            0,
            Math.PI * 2
        );
        context.fill();

        context.fillStyle = "#ffc0a5";
        context.beginPath();
        context.arc(
            centerX - 3,
            centerY - 3,
            3,
            0,
            Math.PI * 2
        );
        context.fill();
    }

    function drawObstacles() {
        if (!state || !Array.isArray(state.obstacles)) {
            return;
        }

        context.fillStyle = "#64776b";

        state.obstacles.forEach((obstacle) => {
            context.fillRect(
                obstacle.x * CELL_SIZE + 2,
                obstacle.y * CELL_SIZE + 2,
                CELL_SIZE - 4,
                CELL_SIZE - 4
            );
        });
    }

    function renderState(newState) {
        state = newState;
        gameOver = Boolean(state.gameOver);

        draw();
        WildSnakeUI.updateScore(state.score);

        if (gameOver) {
            running = false;
            paused = false;
            clearTimeout(loopTimer);
            loopTimer = null;

            WildSnakeUI.setStatus(
                "Game over! Select Restart to play again."
            );
        } else if (paused) {
            WildSnakeUI.setStatus("Game paused.");
        } else if (running) {
            WildSnakeUI.setStatus("Game running. Collect the food!");
        } else {
            WildSnakeUI.setStatus("Ready! Select Start Game to begin.");
        }

        WildSnakeUI.setControls({
            connected,
            running,
            paused,
            gameOver
        });
    }

    async function initialize() {
        WildSnakeUI.setLoading(true);

        try {
            const initialState = await WildSnakeAPI.getState();

            connected = true;
            renderState(initialState);

            WildSnakeUI.setConnectionStatus(
                "connected",
                "C++ backend connected"
            );

            WildSnakeUI.setLoading(false);
        } catch (error) {
            connected = false;

            WildSnakeUI.setConnectionStatus(
                "disconnected",
                "Backend disconnected"
            );

            WildSnakeUI.setStatus(
                "Could not connect to the C++ server. Start the backend and try again.",
                true
            );

            WildSnakeUI.setLoading(
                true,
                "Waiting for the C++ backend..."
            );

            WildSnakeUI.setControls({ connected: false });

            console.error("Backend connection failed:", error);
        }
    }

    async function tickLoop() {
        if (!running || paused || gameOver || requestInProgress) {
            return;
        }

        requestInProgress = true;

        try {
            const updatedState = await WildSnakeAPI.tick();

            renderState(updatedState);

            if (gameOver) {
                return;
            }
        } catch (error) {
            running = false;
            connected = false;

            WildSnakeUI.setConnectionStatus(
                "disconnected",
                "Backend disconnected"
            );

            WildSnakeUI.setStatus(
                "Lost connection to the C++ backend.",
                true
            );

            WildSnakeUI.setControls({ connected: false });

            console.error("Game update failed:", error);
            return;
        } finally {
            requestInProgress = false;
        }

        if (running && !paused && !gameOver) {
            loopTimer = setTimeout(tickLoop, TICK_DELAY);
        }
    }

    function start() {
        if (!connected || gameOver || running) {
            return;
        }

        running = true;
        paused = false;

        WildSnakeUI.setControls({
            connected,
            running,
            paused,
            gameOver
        });

        WildSnakeUI.setStatus("Game running. Collect the food!");
        tickLoop();
    }

    function togglePause() {
        if (!connected || gameOver) {
            return;
        }

        if (!running && !paused) {
            start();
            return;
        }

        if (paused) {
            paused = false;
            running = true;

            WildSnakeUI.setStatus("Game running. Collect the food!");

            WildSnakeUI.setControls({
                connected,
                running,
                paused,
                gameOver
            });

            tickLoop();
        } else {
            paused = true;
            running = false;

            clearTimeout(loopTimer);
            loopTimer = null;

            WildSnakeUI.setStatus("Game paused.");

            WildSnakeUI.setControls({
                connected,
                running,
                paused,
                gameOver
            });
        }
    }

    async function reset() {
        if (!connected) {
            return;
        }

        running = false;
        paused = false;
        clearTimeout(loopTimer);
        loopTimer = null;

        try {
            const newState = await WildSnakeAPI.reset();

            renderState(newState);
            WildSnakeUI.setStatus("Game reset. Select Start Game to play.");
        } catch (error) {
            WildSnakeUI.setStatus(
                "Could not reset the game: " + error.message,
                true
            );
        }
    }

    async function changeDirection(direction) {
        if (!connected || !running || paused || gameOver) {
            return;
        }

        try {
            const updatedState =
                await WildSnakeAPI.changeDirection(direction);

            renderState(updatedState);
        } catch (error) {
            WildSnakeUI.setStatus(
                "Could not change direction: " + error.message,
                true
            );
        }
    }

    initialize();

    return {
        start,
        togglePause,
        reset,
        changeDirection
    };
})();

window.WildSnakeGame = WildSnakeGame;