#include "World.h"
#include <algorithm>
#include <stdexcept>

World::World(int width, int height)
    : width_(width),
      height_(height),
      food_(Point{1, 1}),
      obstacles_(),
      rng_(std::random_device{}())
{
    if (width_ < 5 || height_ < 5)
    {
        throw std::invalid_argument(
            "World dimensions must be at least 5 by 5"
        );
    }
}

int World::getWidth() const
{
    return width_;
}

int World::getHeight() const
{
    return height_;
}

const Food& World::getFood() const
{
    return food_;
}

const std::vector<Point>& World::getObstacles() const
{
    return obstacles_;
}

bool World::isInside(const Point& point) const
{
    return point.x >= 0 &&
           point.x < width_ &&
           point.y >= 0 &&
           point.y < height_;
}

bool World::hasObstacle(const Point& point) const
{
    return std::find(
        obstacles_.begin(),
        obstacles_.end(),
        point
    ) != obstacles_.end();
}

void World::placeFood(const std::vector<Point>& occupied)
{
    std::vector<Point> available;

    for (int y = 0; y < height_; ++y)
    {
        for (int x = 0; x < width_; ++x)
        {
            Point candidate{x, y};

            bool blocked =
                std::find(occupied.begin(), occupied.end(), candidate)
                    != occupied.end();

            if (!blocked && !hasObstacle(candidate))
            {
                available.push_back(candidate);
            }
        }
    }

    if (available.empty())
    {
        throw std::runtime_error(
            "No available position for food"
        );
    }

    std::uniform_int_distribution<std::size_t> distribution(
        0,
        available.size() - 1
    );

    food_.setPosition(available[distribution(rng_)]);
}
