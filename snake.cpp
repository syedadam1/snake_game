#include "Snake.h"
#include <algorithm>
#include <stdexcept>

Snake::Snake(Point start)
    : body_{start},
      direction_(Direction::RIGHT),
      growing_(false)
{
}

const std::deque<Point>& Snake::getBody() const
{
    return body_;
}

Direction Snake::getDirection() const
{
    return direction_;
}

void Snake::setDirection(Direction direction)
{
    switch (direction)
    {
        case Direction::UP:
        case Direction::DOWN:
        case Direction::LEFT:
        case Direction::RIGHT:
            break;

        default:
            throw std::invalid_argument("Invalid snake direction");
    }

    if (body_.size() > 1)
    {
        bool opposite =
            (direction_ == Direction::UP && direction == Direction::DOWN) ||
            (direction_ == Direction::DOWN && direction == Direction::UP) ||
            (direction_ == Direction::LEFT && direction == Direction::RIGHT) ||
            (direction_ == Direction::RIGHT && direction == Direction::LEFT);

        if (opposite)
            return;
    }

    direction_ = direction;
}

void Snake::move()
{
    Point head = body_.front();

    switch (direction_)
    {
        case Direction::UP:
            --head.y;
            break;

        case Direction::DOWN:
            ++head.y;
            break;

        case Direction::LEFT:
            --head.x;
            break;

        case Direction::RIGHT:
            ++head.x;
            break;
    }

    body_.push_front(head);

    if (growing_)
    {
        growing_ = false;
    }
    else
    {
        body_.pop_back();
    }
}

void Snake::grow()
{
    growing_ = true;
}

bool Snake::occupies(const Point& point) const
{
    return std::find(body_.begin(), body_.end(), point) != body_.end();
}

bool Snake::hitsItself() const
{
    if (body_.size() < 2)
        return false;

    for (std::size_t i = 1; i < body_.size(); ++i)
    {
        if (body_.front() == body_[i])
            return true;
    }

    return false;
}
