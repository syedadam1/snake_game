cmake_minimum_required(VERSION 3.20)

project(WildSnake LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

include(CTest)
include(FetchContent)

find_package(Threads REQUIRED)

FetchContent_Declare(
    cpp_httplib
    GIT_REPOSITORY https://github.com/yhirose/cpp-httplib.git
    GIT_TAG v0.18.3
    GIT_SHALLOW TRUE
)

FetchContent_Declare(
    nlohmann_json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG v3.12.0
    GIT_SHALLOW TRUE
)

FetchContent_MakeAvailable(cpp_httplib nlohmann_json)

add_library(game_engine
    src/Snake.cpp
    src/Food.cpp
    src/World.cpp
    src/Game.cpp
    src/ScoreManager.cpp
)

target_include_directories(game_engine
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_compile_options(game_engine
    PRIVATE
        $<$<CXX_COMPILER_ID:GNU,Clang>:-Wall -Wextra -Wpedantic>
        $<$<CXX_COMPILER_ID:MSVC>:/W4>
)

add_executable(wildsnake_server
    server.cpp
)

target_link_libraries(wildsnake_server
    PRIVATE
        game_engine
        httplib::httplib
        nlohmann_json::nlohmann_json
        Threads::Threads
)

add_executable(wildsnake_smoke
    src/main.cpp
)

target_link_libraries(wildsnake_smoke
    PRIVATE
        game_engine
)

if(BUILD_TESTING)
    add_executable(game_tests
        ../tests/game_tests.cpp
    )

    target_link_libraries(game_tests
        PRIVATE
            game_engine
    )

    add_test(
        NAME WildSnakeGameTests
        COMMAND game_tests
    )
endif()
