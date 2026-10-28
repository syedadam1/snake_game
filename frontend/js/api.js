"use strict";

const API_BASE_URL = "http://127.0.0.1:8080";

const WildSnakeAPI = {
    async request(endpoint, options = {}) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error("The backend returned an invalid response.");
        }

        if (!response.ok) {
            throw new Error(data.error || `HTTP error ${response.status}`);
        }

        return data;
    },

    getState() {
        return this.request("/api/state");
    },

    changeDirection(direction) {
        return this.request("/api/direction", {
            method: "POST",
            body: JSON.stringify({ direction })
        });
    },

    tick() {
        return this.request("/api/tick", {
            method: "POST",
            body: JSON.stringify({})
        });
    },

    reset() {
        return this.request("/api/reset", {
            method: "POST",
            body: JSON.stringify({})
        });
    }
};

window.WildSnakeAPI = WildSnakeAPI;