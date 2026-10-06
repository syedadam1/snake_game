// Build: g++ -std=c++17 -O2 -Wall snake.cpp -pthread -o snake
// Controls: type w/a/s/d (or q) then Enter. Swap StdinInput for ncurses/SDL later.
#include<bits/stdc++.h>
#include <chrono>
#include <deque>
#include <iostream>
#include <mutex>
#include <optional>
#include <queue>
#include <random>
#include <string>
#include <thread>

enum class Dir { Up, Down, Left, Right };

struct Point {
    int x, y;
    bool operator==(const Point& o) const { return x == o.x && y == o.y; }
};

inline bool opposite(Dir a, Dir b) {
    return (a == Dir::Up && b == Dir::Down) || (a == Dir::Down && b == Dir::Up) ||
           (a == Dir::Left && b == Dir::Right) || (a == Dir::Right && b == Dir::Left);
}

// ---------- Snake: deque = push new head at front, pop tail at back ----------
class Snake {
public:
    explicit Snake(Point start) { body_.push_front(start); }

    Point nextHead(Dir d) const {
        Point h = body_.front();
        switch (d) {
            case Dir::Up:    --h.y; break;
            case Dir::Down:  ++h.y; break;
            case Dir::Left:  --h.x; break;
            case Dir::Right: ++h.x; break;
        }
        return h;
    }
    void move(Dir d, bool grow) {
        body_.push_front(nextHead(d));
        if (!grow) body_.pop_back();
    }
    const std::deque<Point>& body() const { return body_; }

private:
    std::deque<Point> body_;
};

// ---------- World: rules only, no I/O ----------
class World {
public:
    World(int w, int h) : w_(w), h_(h), snake_({w / 2, h / 2}), rng_(std::random_device{}()) {
        spawnFood();
    }

    void step(Dir d) {
        Point next = snake_.nextHead(d);
        bool grow = (next == food_);

        if (next.x < 0 || next.y < 0 || next.x >= w_ || next.y >= h_) { alive_ = false; return; }

        // tail moves away this tick unless we grow, so it's safe to step onto it
        const auto& b = snake_.body();
        size_t check = grow ? b.size() : b.size() - 1;
        for (size_t i = 0; i < check; ++i)
            if (b[i] == next) { alive_ = false; return; }

        snake_.move(d, grow);
        if (grow) { ++score_; spawnFood(); }
    }

    int width() const { return w_; }
    int height() const { return h_; }
    int score() const { return score_; }
    bool alive() const { return alive_; }
    const Snake& snake() const { return snake_; }
    Point food() const { return food_; }

private:
    void spawnFood() {
        std::uniform_int_distribution<int> dx(0, w_ - 1), dy(0, h_ - 1);
        for (;;) {
            Point p{dx(rng_), dy(rng_)};
            bool onSnake = false;
            for (const auto& s : snake_.body()) if (s == p) { onSnake = true; break; }
            if (!onSnake) { food_ = p; return; }
        }
    }

    int w_, h_, score_ = 0;
    bool alive_ = true;
    Snake snake_;
    Point food_{0, 0};
    std::mt19937 rng_;
};

// ---------- Renderer interface: swap console for SDL without touching Game ----------
class IRenderer {
public:
    virtual ~IRenderer() = default;
    virtual void draw(const World& w) = 0;
};

class ConsoleRenderer : public IRenderer {
public:
    void draw(const World& w) override {
        std::string out = "\x1b[H\x1b[2J";  // cursor home + clear
        out += "Score: " + std::to_string(w.score()) + "\n";
        out += '+' + std::string(w.width(), '-') + "+\n";
        for (int y = 0; y < w.height(); ++y) {
            out += '|';
            for (int x = 0; x < w.width(); ++x) {
                Point p{x, y};
                char c = ' ';
                if (p == w.food()) c = '*';
                const auto& b = w.snake().body();
                for (size_t i = 0; i < b.size(); ++i)
                    if (b[i] == p) { c = (i == 0) ? '@' : 'o'; break; }
                out += c;
            }
            out += "|\n";
        }
        out += '+' + std::string(w.width(), '-') + "+\n";
        if (!w.alive()) out += "Game over!\n";
        std::cout << out << std::flush;
    }
};

// ---------- Input: background thread feeds a thread-safe queue ----------
class StdinInput {
public:
    StdinInput() { std::thread([this] { readLoop(); }).detach(); }

    std::optional<char> poll() {
        std::lock_guard<std::mutex> lock(m_);
        if (keys_.empty()) return std::nullopt;
        char c = keys_.front();
        keys_.pop();
        return c;
    }

private:
    void readLoop() {
        char c;
        while (std::cin.get(c)) {
            std::lock_guard<std::mutex> lock(m_);
            keys_.push(c);
        }
    }
    std::mutex m_;
    std::queue<char> keys_;
};

// ---------- Game: owns the loop ----------
class Game {
public:
    Game(World& world, IRenderer& renderer, StdinInput& input)
        : world_(world), renderer_(renderer), input_(input) {}

    void run() {
        using clock = std::chrono::steady_clock;
        constexpr std::chrono::milliseconds kTick{150};  // snake moves every 150 ms
        constexpr auto kMaxLag = kTick * 5;              // avoid spiral of death

        auto prev = clock::now();
        std::chrono::nanoseconds lag{0};

        renderer_.draw(world_);
        while (running_ && world_.alive()) {
            auto now = clock::now();
            lag += now - prev;
            prev = now;
            if (lag > kMaxLag) lag = kMaxLag;

            processInput();                  // 1. drain input as fast as it arrives

            while (lag >= kTick) {           // 2. update in fixed steps
                update();
                lag -= kTick;
            }

            renderer_.draw(world_);          // 3. render once per frame
            std::this_thread::sleep_for(std::chrono::milliseconds(10));  // don't burn CPU
        }
        renderer_.draw(world_);
    }

private:
    void processInput() {
        while (auto c = input_.poll()) {
            if (*c == 'q') { running_ = false; return; }

            Dir d;
            switch (*c) {
                case 'w': d = Dir::Up; break;
                case 's': d = Dir::Down; break;
                case 'a': d = Dir::Left; break;
                case 'd': d = Dir::Right; break;
                default: continue;
            }
            // compare against the last *queued* turn, not the current heading,
            // so rapid "up, left" inputs both register but 180-degree turns don't
            Dir ref = pending_.empty() ? heading_ : pending_.back();
            if (d != ref && !opposite(d, ref) && pending_.size() < 2) pending_.push(d);
        }
    }

    void update() {
        if (!pending_.empty()) {  // one queued turn consumed per tick
            heading_ = pending_.front();
            pending_.pop();
        }
        world_.step(heading_);
    }

    World& world_;
    IRenderer& renderer_;
    StdinInput& input_;
    std::queue<Dir> pending_;  // buffered turns
    Dir heading_ = Dir::Right;
    bool running_ = true;
};

int main() {
    World world(20, 10);
    ConsoleRenderer renderer;
    StdinInput input;
    Game game(world, renderer, input);
    game.run();
    std::cout << "Final score: " << world.score() << "\n";
    return 0;
}
