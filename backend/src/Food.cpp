#include "Food.h"

Food::Food(Point position)
    : position_(position)
{
}

Point Food::getPosition() const
{
    return position_;
}

void Food::setPosition(Point position)
{
    position_ = position;
}