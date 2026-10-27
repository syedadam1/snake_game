#include "ScoreManager.h"
#include <algorithm>
#include <fstream>
#include <stdexcept>
#include <utility>

ScoreManager::ScoreManager(std::string filePath)
    : currentScore_(0),
      highScore_(0),
      filePath_(std::move(filePath))
{
    if (filePath_.empty())
    {
        throw std::invalid_argument(
            "High-score file path cannot be empty"
        );
    }

    loadHighScore();
}

void ScoreManager::resetCurrentScore()
{
    currentScore_ = 0;
}

void ScoreManager::addPoints(int points)
{
    if (points < 0)
    {
        throw std::invalid_argument(
            "Points cannot be negative"
        );
    }

    if (points > 0 &&
        currentScore_ > std::numeric_limits<int>::max() - points)
    {
        throw std::overflow_error("Score limit exceeded");
    }

    currentScore_ += points;

    if (currentScore_ > highScore_)
    {
        highScore_ = currentScore_;
        saveHighScore();
    }
}

int ScoreManager::getCurrentScore() const
{
    return currentScore_;
}

int ScoreManager::getHighScore() const
{
    return highScore_;
}

void ScoreManager::loadHighScore()
{
    std::ifstream file(filePath_);

    if (!file.is_open())
        return;

    int storedScore = 0;

    if (file >> storedScore && storedScore >= 0)
    {
        highScore_ = storedScore;
    }
}

void ScoreManager::saveHighScore() const
{
    std::ofstream file(filePath_);

    if (!file.is_open())
    {
        throw std::runtime_error(
            "Unable to save high score"
        );
    }

    file << highScore_ << '\n';

    if (!file)
    {
        throw std::runtime_error(
            "Failed while writing high score"
        );
    }
}
