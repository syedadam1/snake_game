
#ifndef GAME_H
#define GAME_H

#include "Snake.h"
#include "World.h"
#include <memory>
#include <stdexcept>

class GameObserver
{
public:
    virtual void onScoreChanged(int score) = 0;
    virtual void onGameOver() = 0;

    virtual ~GameObserver() = default;
};

class Game
{
private:
    Snake snake_;
    World world_;
    int score_;
    bool gameOver_;
    std::unique_ptr<GameObserver> observer_;

    void checkCollisions();
    void updateScore();

public:
    Game(int width = 30, int height = 20);

    void setObserver(std::unique_ptr<GameObserver> observer);

    void changeDirection(Direction direction);
    void tick();
    void reset();

    int getScore() const;
    bool isGameOver() const;

    const Snake& getSnake() const;
    const World& getWorld() const;
};

#endif