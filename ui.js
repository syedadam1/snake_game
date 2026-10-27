"use strict";

const WildSnakeUI = (() => {
    const connectionStatus = document.getElementById("connection-status");
    const loadingOverlay = document.getElementById("loading-overlay");
    const gameStatus = document.getElementById("game-status");

    const currentScoreElement = document.getElementById("current-score");
    const highScoreElement = document.getElementById("high-score");

    const startButton = document.getElementById("start-button");
    const pauseButton = document.getElementById("pause-button");
    const restartButton = document.getElementById("restart-button");

    let highScore = 0;

    try {
        highScore = Number(localStorage.getItem("wildsnake-high-score")) || 0;
    } catch {
        highScore = 0;
    }

    function setConnectionStatus(status, message) {
        connectionStatus.textContent = message;
        connectionStatus.classList.remove(
            "connected",
            "disconnected"
        );

        if (status === "connected") {
            connectionStatus.classList.add("connected");
        } else if (status === "disconnected") {
            connectionStatus.classList.add("disconnected");
        }
    }

    function setLoading(visible, message = "Connecting to the game engine...") {
        loadingOverlay.textContent = message;
        loadingOverlay.classList.toggle("hidden", !visible);
    }

    function setStatus(message, isError = false) {
        gameStatus.textContent = message;
        gameStatus.classList.toggle("error", isError);
    }

    function updateScore(score) {
        currentScoreElement.textContent = String(score);

        if (score > highScore) {
            highScore = score;

            try {
                localStorage.setItem(
                    "wildsnake-high-score",
                    String(highScore)
                );
            } catch {
                // The game can continue if browser storage is unavailable.
            }
        }

        highScoreElement.textContent = String(highScore);
    }

    function setControls({
        connected = false,
        running = false,
        paused = false,
        gameOver = false
    } = {}) {
        startButton.disabled = !connected || running || gameOver;
        pauseButton.disabled = !connected || gameOver;
        restartButton.disabled = !connected;

        startButton.textContent = paused ? "Resume" : "Start Game";
        pauseButton.textContent = paused ? "Resume" : "Pause";

        document.querySelectorAll(".direction-button").forEach((button) => {
            button.disabled = !connected || !running || gameOver;
        });
    }

    function getHighScore() {
        return highScore;
    }

    highScoreElement.textContent = String(highScore);

    return {
        setConnectionStatus,
        setLoading,
        setStatus,
        updateScore,
        setControls,
        getHighScore
    };
})();

window.WildSnakeUI = WildSnakeUI;
