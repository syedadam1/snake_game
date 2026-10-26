🐍 WildSnake — Jungle Survival Game

WildSnake is a browser-based snake survival game inspired by the wildlife and atmosphere of a tropical jungle. Control your snake, hunt for food, grow longer, and avoid dangerous mongoose obstacles as you survive in the forest.

The game features a forest-themed interface, glowing food, wildlife progression, and responsive controls for desktop and mobile devices.

🌿 Features

🐍 Snake Survival: Control your snake and grow longer by collecting food.

🌳 Jungle Environment: Enjoy a forest-inspired background with foliage and a subtle grid.

✨ Glowing Food: Bright golden food effects and a pulsing ring make food easier to spot.

🦎 Wildlife Progression: Different food options appear as your score increases.

🐇 Progressive Difficulty: Encounter new wildlife as you reach higher scores.

🐾 Mongoose Obstacles: Obstacles appear as you collect food.

🔄 Maximum Five Obstacles: The game keeps at most five obstacles. When a new obstacle is added beyond this limit, the oldest one is removed using the FIFO (First In, First Out) principle.

🌙 Dark and Light Modes: Switch between themes.

🎮 Multiple Controls: Play using your keyboard, on-screen buttons, or mobile swipe gestures.

⚡ Adjustable Speed: Choose your preferred game speed.

🔊 Sound Effects: Optional audio feedback when collecting food.

🏆 Score Tracking: Track your current score and save your best score locally in your browser.

📱 Responsive Design: Designed to work across desktop and mobile screens.

🐾 Wildlife Progression

The food available in the game changes according to your score.

Score

Wildlife

0–100

Insects, lizards, spiders, and chameleons

110–200

Frogs and rabbits

Above 200

Pigs, deer, and wild boars

The exact food selection depends on the current score tier and the wildlife configured in the game.

🎮 Controls

Action

Control

Move Up

↑ or W

Move Down

↓ or S

Move Left

← or A

Move Right

→ or D

Pause / Resume

Space

Start Game

Enter

Mobile Movement

Swipe on the game board

You can also use the on-screen direction buttons.

🛠️ Technologies Used

HTML5 — Game structure and interface.

CSS3 — Styling, layout, themes, and visual effects.

JavaScript — Game logic, movement, collision detection, scoring, and animation.

HTML5 Canvas — Rendering the snake, food, obstacles, and jungle environment.

Local Storage — Saving the player's best score and theme preference.

Git and GitHub — Version control and project hosting.

GitHub Pages — Hosting the game as a website.

🚀 Run the Project Locally

1. Clone the repository

Replace YOUR_USERNAME with your GitHub username.

git clone https://github.com/YOUR_USERNAME/wildsnake.git

2. Enter the project directory

cd wildsnake

3. Start a local web server

If Python is installed, run:

python -m http.server 8000

4. Open the game

Visit the following address in your browser:

http://localhost:8000

Alternatively, open index.html directly in your browser. A local server is recommended for more reliable testing.

📁 Project Structure

wildsnake/
├── index.html       # Game structure
├── style.css        # Styling and themes
├── script.js        # Game logic and rendering
├── assets/          # Wildlife images and other assets
└── README.md        # Project documentation

Your actual folder and asset filenames may differ depending on your repository.

🌐 Live Demo

Play the game: [Add your GitHub Pages URL here]

Example:

https://YOUR_USERNAME.github.io/wildsnake/

Replace the example with your actual published website address.

📸 Screenshots

Add screenshots of your game here to showcase the jungle environment, glowing food, and gameplay.

Example Markdown:

![WildSnake Gameplay](screenshots/gameplay.png)

To use this example, create a screenshots folder and add an image named gameplay.png.

🧠 What I Learned

Through this project, I explored:

Building interactive browser-based games with JavaScript.

Rendering graphics and animations using HTML5 Canvas.

Implementing keyboard and touch controls.

Detecting collisions and managing game states.

Using arrays to manage snake movement and obstacles.

Applying the FIFO principle to maintain a fixed obstacle limit.

Using browser Local Storage to preserve player preferences and scores.

Organizing a project into HTML, CSS, and JavaScript files.

Using Git and GitHub to manage and publish a project.

🔮 Future Improvements

Potential improvements include:

More realistic wildlife animations.

Increasingly challenging jungle environments.

Additional sound effects and background music.

Multiple game modes and difficulty levels.

A leaderboard for comparing high scores.

Improved mobile controls and gameplay.

👨‍💻 Author

YOUR NAME

GitHub: YOUR_USERNAME

Explore the jungle. Hunt for food. Survive longer. Become the ultimate WildSnake! 🐍🌿
