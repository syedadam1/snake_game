#include "Game.h"
#include "ScoreManager.h"
#include <exception>
#include <iostream>

int main()
{
    try
    {
        Game game(30, 20);
        ScoreManager scores("highscore.txt");

        std::cout << "WildSnake Game Engine\n";
        std::cout << "---------------------\n";
        std::cout << "Board: "
                  << game.getWorld().getWidth()
                  << " x "
                  << game.getWorld().getHeight()
                  << '\n';

        std::cout << "Initial score: "
                  << game.getScore()
                  << '\n';

        std::cout << "Saved high score: "
                  << scores.getHighScore()
                  << '\n';

        game.tick();

        std::cout << "Game engine updated successfully.\n";

        return 0;
    }
    catch (const std::exception& error)
    {
        std::cerr << "Error: "
                  << error.what()
                  << '\n';

        return 1;
    }
}