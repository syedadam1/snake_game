# WildSnake presentation speaking guide

Approximate presentation time: 10?12 minutes.

## Slides 1?6: project overview
Use the existing opening notes for the project motivation, scope, game loop, architecture and engine.

## Slide 7: UML class diagram ? game engine
?Each rectangle is a class. The top compartment gives the class name, the middle compartment lists attributes, and the bottom compartment lists selected operations. A minus sign means private and a plus sign means public. Game composes a Snake and a World; the filled diamond is at the owner end. World composes Food. Snake contains multiple Point values for its body. Game has an association with the GameObserver interface. Direction is an enumeration. The labels show multiplicities: Game has one Snake and World; a Snake body contains one or more Point segments.?

Point out that the diagram is intentionally focused: the detailed UML tables on the next slides list more members than fit in a readable class diagram.

## Slide 8: UML class diagram ? utility classes
?Grid<T> is a template class intended to store cells of a chosen type. ScoreManager handles current and high scores in a file. These are shown separately because they are not part of the live Game composition: Grid?s methods are declared but not defined, and ScoreManager is not connected to Game?s score.?

## Slide 9: Point, Direction, Snake and Food table
?Point stores x and y and overloads equality operators so coordinates can be compared. Direction is an enum with four values. Snake stores its body in a deque of Points, tracks its direction and growth state, and provides movement, growth and collision methods. Food stores a Point position.?

## Slide 10: Grid, World and Game table
?Grid<T> has dimensions and generic cells, with access and bounds operations declared. World stores board dimensions, food, obstacles and a random-number generator; it checks bounds and places food. Game owns Snake and World, tracks score and game over, and coordinates direction changes, ticks, reset and observer notification.?

## Slide 11: GameObserver and ScoreManager table
?GameObserver is an abstract interface because its callbacks are pure virtual. Game can notify an observer when score changes or the game ends. ScoreManager loads and saves a high score in a file, but it is separate from the Game score lifecycle.?

## Slide 12: OOP principles
?Encapsulation is private class state with public operations. Abstraction means callers can use Game operations without knowing every implementation detail. Composition is visible when Game owns Snake and World, and World owns Food. The observer interface supports polymorphism through virtual callbacks, but the current source has no concrete observer class. There is no implemented derived-class hierarchy, so inheritance is a possible extension rather than a feature we claim is implemented.?

## Slide 13: other C++ features
?Point overloads equality operators. Grid<T> illustrates templates but is incomplete. The code also uses exceptions, standard containers, smart pointers, constructors, const getters and file handling in ScoreManager. These support the design but are separate from the core OOP principles.?

## Slides 14?17: API, interface, status and conclusion
Explain the four HTTP routes; show the controls and screenshot; clearly say that the report does not claim a successful build/test run, obstacles are empty by default, and the C++ ScoreManager is not integrated with live scoring. Finish with verification and integration as next steps.

## Optional live demo
Start both services before class. Show the connected status, start, steer toward food, pause with Space, resume and restart. If setup is unreliable, use the screenshots and explain the request flow.
