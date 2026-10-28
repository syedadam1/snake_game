# 🐍 WildSnake — C++ Snake Game

**WildSnake** is a Snake game project developed using **C++ for the backend game engine** and **HTML, CSS, and JavaScript for the frontend**. The project demonstrates Object-Oriented Programming (OOP), game logic, frontend–backend communication, and software development practices.

Players control a snake, collect food to earn points, and avoid collisions with the walls and their own body.

---

## 📌 Project Overview

- **Repository:** `snake_game`
- **Project Name:** WildSnake
- **Project Type:** C++ Mini Project
- **Backend:** C++
- **Frontend:** HTML, CSS, JavaScript
- **Build System:** CMake
- **Version Control:** Git and GitHub
- **Status:** In Development

## ✨ Features

- 🐍 Classic Snake gameplay.
- 🎮 Keyboard controls using arrow keys or WASD.
- 🌿 Jungle-inspired user interface.
- 🍎 Food collection and score tracking.
- 💥 Collision detection.
- ⏸️ Pause and resume controls.
- 🔗 HTTP API for communication between the frontend and C++ backend.
- 🧩 Object-Oriented Programming architecture.
- 🧪 Automated tests for game logic.
- 💾 High-score persistence through file handling, subject to implementation and verification.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| C++ | Game engine and backend logic |
| HTML5 | Frontend structure |
| CSS3 | Styling and responsive layout |
| JavaScript | Keyboard input, rendering, and API requests |
| CMake | Build configuration |
| HTTP and JSON | Frontend–backend communication |
| Git | Version control |
| GitHub | Repository hosting |

## 📂 Project Structure

```text
snake_game/
├── backend/
│   ├── include/
│   │   ├── Food.h
│   │   ├── Game.h
│   │   ├── Point.h
│   │   ├── ScoreManager.h
│   │   ├── Snake.h
│   │   └── World.h
│   ├── src/
│   │   ├── Food.cpp
│   │   ├── Game.cpp
│   │   ├── main.cpp
│   │   ├── ScoreManager.cpp
│   │   ├── Snake.cpp
│   │   └── World.cpp
│   ├── server.cpp
│   └── CMakeLists.txt
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js
│   │   ├── controls.js
│   │   ├── game.js
│   │   └── ui.js
│   └── index.html
├── tests/
│   └── game_tests.cpp
├── docs/
│   └── UML.md
├── README.md
└── .gitignore
```

## ⚙️ Requirements

Before running the project, ensure that you have:

- Linux, Windows, or macOS.
- A C++ compiler that supports C++17.
- CMake 3.20 or later.
- Git.
- Python 3.
- An internet connection for the initial download of external C++ dependencies, if they are not already available.

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/syedadam1/snake_game.git
cd snake_game
```

### 2. Build the C++ Backend

Configure the project:

```bash
cmake -S backend -B backend/build
```

Compile the project:

```bash
cmake --build backend/build -j2
```

### 3. Run the Backend Server

After the server target builds successfully, start it:

```bash
./backend/build/wildsnake_server
```

The backend is expected to listen on:

```text
http://127.0.0.1:8080
```

Keep the terminal running while playing the game.

### 4. Run the Frontend

Open a second terminal in the repository root and execute:

```bash
python -m http.server 5500 --directory frontend
```

Open your browser and visit:

**http://127.0.0.1:5500**

The frontend should communicate with the running C++ backend through its HTTP API.

### 5. Test the Backend API

To check whether the backend returns the current game state, run:

```bash
curl -i http://127.0.0.1:8080/api/state
```

A successful response should return HTTP status `200 OK` and JSON containing the game state.

> **Note:** The frontend and backend must both be running locally for the complete game to work.

## 🎮 Controls

| Key | Action |
|---|---|
| ↑ or W | Move up |
| ↓ or S | Move down |
| ← or A | Move left |
| → or D | Move right |
| Space | Pause or resume |

## 🧠 Object-Oriented Programming

The project is designed to demonstrate important C++ OOP concepts:

- **Encapsulation:** Organizing data and behavior within classes.
- **Abstraction:** Separating game operations from their internal implementation.
- **Inheritance:** Using base and derived classes where appropriate.
- **Polymorphism:** Supporting interchangeable implementations through virtual functions where implemented.
- **Templates:** Creating reusable generic data structures where implemented.
- **Operator Overloading:** Defining useful operations for custom types where implemented.
- **Exception Handling:** Handling errors safely where appropriate.
- **File Handling:** Reading and writing persistent data where implemented.

Refer to [`docs/UML.md`](docs/UML.md) for the proposed class diagram and architecture documentation.

## 🧪 Testing

The project includes a C++ test source file at `tests/game_tests.cpp`.

Build the project and run the configured tests with:

```bash
ctest --test-dir backend/build --output-on-failure
```

Tests should pass before the project is considered fully validated. If the test executable fails to build, resolve the compilation or linking errors first.

## 🌐 Deployment

The project can be run locally using the instructions above.

To publish the complete game online, the frontend and C++ backend must be hosted appropriately:

- **Frontend:** A static hosting service such as GitHub Pages.
- **Backend:** A server or hosting platform capable of running the compiled C++ HTTP server.
- **Communication:** The frontend must use the deployed backend's public HTTPS address, with suitable CORS configuration.

GitHub Pages alone cannot run the persistent C++ backend server.

SCREENSHOTS:

<img width="1009" height="840" alt="8fdbc99b-8f41-43d2-adaf-abd600d2cfd2" src="https://github.com/user-attachments/assets/530d2a77-1388-4740-a67a-02f0dc25b2d4" />
<img width="1337" height="872" alt="e9ed5855-59dc-49e5-8caa-0c6afb6bcd3c" src="https://github.com/user-attachments/assets/881aea9f-2072-44e8-ae56-104a016b6de4" />


## 👥 Contributors

This project is developed collaboratively by:

| Contributor | GitHub Username | GitHub Profile |
|---|---|---|
| **Syed Adam** | `syedadam1` | [@syedadam1](https://github.com/syedadam1) |
| **Sampath** | `sampath-2008` | [@sampath-2008](https://github.com/sampath-2008) |

### Contribution Workflow

1. Clone the repository.
2. Create a branch for your changes.
3. Implement and test your changes.
4. Commit with a descriptive message.
5. Push your branch and open a pull request.

## 📄 License

No license has been specified yet. A license can be added by including a `LICENSE` file in the repository root.

---

**Developed by Syed Adam and Sampath**  
**Project:** WildSnake — C++ Snake Game  
**Repository:** [`syedadam1/snake_game`](https://github.com/syedadam1/snake_game)
