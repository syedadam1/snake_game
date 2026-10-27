#ifndef GRID_TPP
#define GRID_TPP

#include <stdexcept>

template <typename T>
Grid<T>::Grid(int width, int height)
    : width_(width),
      height_(height),
      cells_()
{
    if (width <= 0 || height <= 0)
    {
        throw std::invalid_argument(
            "Grid dimensions must be positive"
        );
    }

    cells_.resize(
        static_cast<std::size_t>(width) *
        static_cast<std::size_t>(height)
    );
}

template <typename T>
int Grid<T>::getWidth() const
{
    return width_;
}

template <typename T>
int Grid<T>::getHeight() const
{
    return height_;
}

template <typename T>
bool Grid<T>::contains(const Point& point) const
{
    return point.x >= 0 &&
           point.x < width_ &&
           point.y >= 0 &&
           point.y < height_;
}

template <typename T>
T& Grid<T>::at(const Point& point)
{
    if (!contains(point))
    {
        throw std::out_of_range(
            "Grid position is outside the board"
        );
    }

    return cells_[
        static_cast<std::size_t>(point.y) * width_ + point.x
    ];
}

template <typename T>
const T& Grid<T>::at(const Point& point) const
{
    if (!contains(point))
    {
        throw std::out_of_range(
            "Grid position is outside the board"
        );
    }

    return cells_[
        static_cast<std::size_t>(point.y) * width_ + point.x
    ];
}

#endif
