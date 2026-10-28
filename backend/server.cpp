#include "Game.h"
#include <httplib.h>
#include <nlohmann/json.hpp>

#include <iostream>
#include <mutex>
#include <string>

using json = nlohmann::json;

namespace
{
    Game game(30, 20);
    std::mutex gameMutex;

    void addCorsHeaders(httplib::Response& response)
    {
        response.set_header("Access-Control-Allow-Origin", "*");
        response.set_header(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS"
        );
        response.set_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        );
    }

    void sendJson(
        httplib::Response& response,
        const json& data,
        int status = 200
    )
    {
        response.status = status;
        response.set_content(data.dump(), "application/json");
        addCorsHeaders(response);
    }

    json makeGameState()
    {
        const World& world = game.getWorld();
        const Snake& snake = game.getSnake();

        json body = json::array();

        for (const Point& point : snake.getBody())
        {
            body.push_back({
                {"x", point.x},
                {"y", point.y}
            });
        }

        Point food = world.getFood().getPosition();

        json obstacles = json::array();

        for (const Point& point : world.getObstacles())
        {
            obstacles.push_back({
                {"x", point.x},
                {"y", point.y}
            });
        }

        return {
            {"width", world.getWidth()},
            {"height", world.getHeight()},
            {"snake", body},
            {"food", {
                {"x", food.x},
                {"y", food.y}
            }},
            {"obstacles", obstacles},
            {"score", game.getScore()},
            {"gameOver", game.isGameOver()}
        };
    }

    bool parseDirection(
        const std::string& value,
        Direction& direction
    )
    {
        if (value == "UP")
            direction = Direction::UP;
        else if (value == "DOWN")
            direction = Direction::DOWN;
        else if (value == "LEFT")
            direction = Direction::LEFT;
        else if (value == "RIGHT")
            direction = Direction::RIGHT;
        else
            return false;

        return true;
    }
}

int main()
{
    httplib::Server server;

    server.Options(
        "/.*",
        [](const httplib::Request&, httplib::Response& response)
        {
            addCorsHeaders(response);
            response.status = 204;
        }
    );

    server.Get(
        "/api/state",
        [](const httplib::Request&, httplib::Response& response)
        {
            std::lock_guard<std::mutex> lock(gameMutex);
            sendJson(response, makeGameState());
        }
    );

    server.Post(
        "/api/direction",
        [](const httplib::Request& request,
           httplib::Response& response)
        {
            try
            {
                json data = json::parse(request.body);

                if (!data.contains("direction") ||
                    !data["direction"].is_string())
                {
                    sendJson(
                        response,
                        {{"error", "A direction string is required"}},
                        400
                    );
                    return;
                }

                Direction direction;

                if (!parseDirection(
                        data["direction"].get<std::string>(),
                        direction))
                {
                    sendJson(
                        response,
                        {{"error", "Invalid direction"}},
                        400
                    );
                    return;
                }

                std::lock_guard<std::mutex> lock(gameMutex);

                game.changeDirection(direction);

                sendJson(response, makeGameState());
            }
            catch (const json::exception&)
            {
                sendJson(
                    response,
                    {{"error", "Invalid JSON request"}},
                    400
                );
            }
            catch (const std::exception& error)
            {
                sendJson(
                    response,
                    {{"error", error.what()}},
                    400
                );
            }
        }
    );

    server.Post(
        "/api/tick",
        [](const httplib::Request&, httplib::Response& response)
        {
            std::lock_guard<std::mutex> lock(gameMutex);

            try
            {
                game.tick();
                sendJson(response, makeGameState());
            }
            catch (const std::exception& error)
            {
                sendJson(
                    response,
                    {{"error", error.what()}},
                    500
                );
            }
        }
    );

    server.Post(
        "/api/reset",
        [](const httplib::Request&, httplib::Response& response)
        {
            std::lock_guard<std::mutex> lock(gameMutex);

            try
            {
                game.reset();
                sendJson(response, makeGameState());
            }
            catch (const std::exception& error)
            {
                sendJson(
                    response,
                    {{"error", error.what()}},
                    500
                );
            }
        }
    );

    server.Get(
        "/",
        [](const httplib::Request&, httplib::Response& response)
        {
            sendJson(
                response,
                {
                    {"name", "WildSnake Game Engine"},
                    {"status", "running"},
                    {"stateEndpoint", "/api/state"},
                    {"directionEndpoint", "/api/direction"},
                    {"tickEndpoint", "/api/tick"},
                    {"resetEndpoint", "/api/reset"}
                }
            );
        }
    );

    std::cout << "WildSnake backend starting...\n";
    std::cout << "API address: http://127.0.0.1:8080\n";

    if (!server.listen("127.0.0.1", 8080))
    {
        std::cerr << "Failed to start the HTTP server.\n";
        return 1;
    }

    return 0;
}