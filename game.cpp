#include "Game.h"
#include <vector>

Game::Game(int width, int height)
    : snake_(Point{width / 2, height / 2}),
      world_(width, height),
      score_(0),
      gameOver_(false),
      observer_(nullptr)
{
    std::vector<Point> occupied(
        snake_.getBody().begin(),
        snake_.getBody().end()
    );

    world_.placeFood(occupied);
}

void Game::setObserver(std::unique_ptr<GameObserver> observer)
{
    observer_ = std::move(observer);
}

void Game::changeDirection(Direction direction)
{
    if (gameOver_)
        return;

    snake_.setDirection(direction);
}

void Game::tick()
{
    if (gameOver_)
        return;

    snake_.move();

    checkCollisions();

    if (gameOver_)
        return;

    if (snake_.getBody().front() == world_.getFood().getPosition())
    {
        snake_.grow();
        updateScore();

        std::vector<Point> occupied(
            snake_.getBody().begin(),
            snake_.getBody().end()
        );

        try
        {
            world_.placeFood(occupied);
        }
        catch (const std::runtime_error&)
        {
            gameOver_ = true;

            if (observer_)
                observer_->onGameOver();
        }
    }
}

void Game::checkCollisions()
{
    Point head = snake_.getBody().front();

    if (!world_.isInside(head) ||
        snake_.hitsItself() ||
        world_.hasObstacle(head))
    {
        gameOver_ = true;

        if (observer_)
            observer_->onGameOver();
    }
}

void Game::updateScore()
{
    ++score_;

    if (observer_)
        observer_->onScoreChanged(score_);
}

void Game::reset()
{
    snake_ = Snake(Point{
        world_.getWidth() / 2,
        world_.getHeight() / 2
    });

    score_ = 0;
    gameOver_ = false;

    std::vector<Point> occupied(
        snake_.getBody().begin(),
        snake_.getBody().end()
    );

    world_.placeFood(occupied);

    if (observer_)
        observer_->onScoreChanged(score_);
}

int Game::getScore() const
{
    return score_;
}

bool Game::isGameOver() const
{
    return gameOver_;
}

const Snake& Game::getSnake() const
{
    return snake_;
}

const World& Game::getWorld() const
{
    return world_;
}
