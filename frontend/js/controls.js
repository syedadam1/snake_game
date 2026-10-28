"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-button");
    const pauseButton = document.getElementById("pause-button");
    const restartButton = document.getElementById("restart-button");

    const directionKeys = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",

        w: "UP",
        W: "UP",
        s: "DOWN",
        S: "DOWN",
        a: "LEFT",
        A: "LEFT",
        d: "RIGHT",
        D: "RIGHT"
    };

    startButton.addEventListener("click", () => {
        WildSnakeGame.start();
    });

    pauseButton.addEventListener("click", () => {
        WildSnakeGame.togglePause();
    });

    restartButton.addEventListener("click", () => {
        WildSnakeGame.reset();
    });

    document.querySelectorAll(".direction-button").forEach((button) => {
        button.addEventListener("click", () => {
            WildSnakeGame.changeDirection(button.dataset.direction);
        });
    });

    document.addEventListener("keydown", (event) => {
        const direction = directionKeys[event.key];

        if (direction) {
            event.preventDefault();
            WildSnakeGame.changeDirection(direction);
            return;
        }

        if (event.code === "Space") {
            event.preventDefault();
            WildSnakeGame.togglePause();
        }
    });
});