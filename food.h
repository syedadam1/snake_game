```cpp
#ifndef FOOD_H
#define FOOD_H

#include "Point.h"

class Food
{
private:
    Point position_;

public:
    explicit Food(Point position = Point{10, 10});

    Point getPosition() const;
    void setPosition(Point position);
};

#endif
```
