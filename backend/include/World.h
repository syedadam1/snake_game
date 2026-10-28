
#ifndef WORLD_H
#define WORLD_H

#include "Point.h"
#include "Food.h"
#include <vector>
#include <random>

template <typename T>
class Grid
{
private:
    int width_;
    int height_;
    std::vector<T> cells_;

public:
    Grid(int width, int height);

    int getWidth() const;
    int getHeight() const;

    bool contains(const Point& point) const;
    T& at(const Point& point);
    const T& at(const Point& point) const;
};

class World
{
private:
    int width_;
    int height_;
    Food food_;
    std::vector<Point> obstacles_;
    std::mt19937 rng_;

public:
    World(int width = 30, int height = 20);

    int getWidth() const;
    int getHeight() const;

    const Food& getFood() const;
    const std::vector<Point>& getObstacles() const;

    bool isInside(const Point& point) const;
    bool hasObstacle(const Point& point) const;

    void placeFood(const std::vector<Point>& occupied);
};

#endif