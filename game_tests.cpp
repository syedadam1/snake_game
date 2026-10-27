#include "Game.h"
#include "Point.h"
#include "Snake.h"
#include "World.h"

#include <exception>
#include <iostream>
#include <stdexcept>
#include <string>

namespace
{
    int passed = 0;
    int failed = 0;

    void check(bool condition, const std::string& name)
    {
        if (condition)
        {
            ++passed;
            std::cout << "[PASS] " << name << '\n';
        }
        else
        {
            ++failed;
            std::cout << "[FAIL] " << name << '\n';
        }
    }

    template <typename Function>
    void checkThrows(
        Function function,
        const std::string& name
    )
    {
        try
        {
            function();
            check(false, name);
        }
        catch (const std::exception&)
        {
            check(true, name);
        }
    }
}

int main()
{
    std::cout << "WildSnake Game Engine Tests\n";
    std::cout << "===========================\n\n";

    Point first{3, 4};
    Point second{3, 4};
    Point third{5, 6};

    check(first == second, "Equal positions compare correctly");
    check(first != third, "Different positions compare correctly");

    Snake snake(Point{5, 5});

    check(
        snake.getBody().front() == Point{5, 5},
        "Snake starts at the specified position"
    );

    snake.move();

    check(
        snake.getBody().front() == Point{6, 5},
        "Snake moves right initially"
    );

    snake.setDirection(Direction::UP);
    snake.move();

    check(
        snake.getBody().front() == Point{6, 4},
        "Snake changes direction"
    );

    check(
        !snake.hitsItself(),
        "Snake does not initially collide with itself"
    );

    checkThrows(
        []()
        {
            Snake testSnake;
            testSnake.setDirection(
                static_cast<Direction>(999)
            );
        },
        "Invalid direction is rejected"
    );

    World world(30, 20);

    check(
        world.isInside(Point{0, 0}),
        "World accepts its top-left position"
    );

    check(
        world.isInside(Point{29, 19}),
        "World accepts its bottom-right position"
    );

    check(
        !world.isInside(Point{-1, 0}),
        "World rejects negative coordinates"
    );

    check(
        !world.isInside(Point{30, 20}),
        "World rejects coordinates beyond its boundary"
    );

    checkThrows(
        []()
        {
            World invalidWorld(3, 3);
        },
        "World rejects dimensions below the minimum"
    );

    Grid<int> grid(4, 3);

    grid.at(Point{2, 1}) = 42;

    check(
        grid.at(Point{2, 1}) == 42,
        "Grid stores and retrieves values"
    );

    check(
        grid.contains(Point{3, 2}),
        "Grid recognizes valid positions"
    );

    check(
        !grid.contains(Point{4, 2}),
        "Grid rejects invalid positions"
    );

    checkThrows(
        [&grid]()
        {
            grid.at(Point{10, 10});
        },
        "Grid rejects out-of-range access"
    );

    checkThrows(
        []()
        {
            Grid<int> invalidGrid(0, 5);
        },
        "Grid rejects invalid dimensions"
    );

    Game game(30, 20);

    check(
        game.getScore() == 0,
        "Game begins with zero score"
    );

    check(
        !game.isGameOver(),
        "Game begins in the active state"
    );

    game.tick();

    check(
        game.getSnake().getBody().front() == Point{16, 10},
        "Game tick advances the snake"
    );

    game.reset();

    check(
        game.getScore() == 0,
        "Reset restores the score"
    );

    check(
        !game.isGameOver(),
        "Reset restores the active game state"
    );

    std::cout << "\n===========================\n";
    std::cout << "Passed: " << passed << '\n';
    std::cout << "Failed: " << failed << '\n';

    return failed == 0 ? 0 : 1;
}
