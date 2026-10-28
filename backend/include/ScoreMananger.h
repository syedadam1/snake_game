
#ifndef SCOREMANAGER_H
#define SCOREMANAGER_H

#include <string>

class ScoreManager
{
private:
    int currentScore_;
    int highScore_;
    std::string filePath_;

public:
    explicit ScoreManager(std::string filePath = "highscore.txt");

    void resetCurrentScore();
    void addPoints(int points);

    int getCurrentScore() const;
    int getHighScore() const;

    void loadHighScore();
    void saveHighScore() const;
};

#endif
