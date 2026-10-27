  ```cpp
#ifndef SNAKE_H
#define SNAKE_H

#include "Point.h"
#include <deque>

enum class Direction
{
    UP,
    DOWN,
    LEFT,
    RIGHT
};

class Snake
{
private:
    std::deque<Point> body_;
    Direction direction_;
    bool growing_;

public:
    explicit Snake(Point start = Point{5, 5});

    const std::deque<Point>& getBody() const;
    Direction getDirection() const;

    void setDirection(Direction direction);
    void move();
    void grow();

    bool occupies(const Point& point) const;
    bool hitsItself() const;
};

#endif
```
