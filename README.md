# State Machine: A Deterministic State Management System

State Machine is a lightweight, deterministic state management system designed for multiplayer games. It provides a robust framework for handling states, actions, and time-based computations.

## Features

- Deterministic state management
- Action logging and replay
- Time-based tick system
- Efficient state caching
- Support for custom game logic
- Ability to rollback and recalculate states

## Installation

To install and run the project:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the project
4. Start an HTTP server in the `/docs` directory

You can use any HTTP server of your choice. For example, with `http-server`:

```
npm install -g http-server
cd docs
http-server
```

Then open your browser and navigate to `http://localhost:8080` (or whatever port your HTTP server is using).

### Types

- `Time`: Represents time as a 48-bit number
- `Tick`: Represents a game tick as a 48-bit number
- `StateLogs<S>`: A record of game states indexed by ticks
- `ActionLogs<A>`: A record of actions indexed by ticks
- `Mach<S, A>`: The main state management object
- `Game<S, A>`: Defines the game logic (init, when, tick functions)

### Main Functions

- `new_mach<S, A>`: Creates a new Mach instance with a specific TPS (ticks per second).
- `time_to_tick<S, A>`: Converts time in milliseconds to ticks.
- `register_action<S, A>`: Registers an action at the corresponding tick. Can be used for local player actions or to synchronize actions from other players in a multiplayer game.
- `compute<S, A>`: Updates the game state based on ticks and registered actions up to a specific point in time.

### General Explanation

- Game: Interface that defines how the game behaves.
  - init: Initializes the game state.
  - when: Defines how the game state changes with an action.
  - tick: Defines how the game state is updated each tick.
- The `init`, `when`, and `tick` functions of the game must be pure to ensure determinism.
- The system supports state rollback, allowing recalculation from a previous point if necessary.
- Ideal for games that require precise synchronization between multiple players.

This system is particularly useful for multiplayer games where precise synchronization and the ability to replay previous states are crucial.

### Usage

```typescript
import { new_mach, register_action, compute, Mach, Time } from 'state-machine';

// Definition of State and Action types
type State = { /* ... */ };
type Action = 
  | { $: "SetNick", time: Time, pid: UID, name: string }
  | { $: "KeyEvent", time: Time, pid: UID, key: Key, down: boolean };

// Implementation of game logic
function init(): State {
   /* initial state */ 
  };
  
function when(action: Action, state: State): State { 
    // Logic to handle actions
    switch (action.$) {
      case "SetNick":
        // Update player nickname
        break;
      case "KeyEvent":
        // Handle keyboard events
        break;
    }
    return state;
  };

function tick(state: State): State {
    // Update game state each tick
    return state;
  };

// Create a new Game instance 
const game: Game<State, Action> = { init, tick, when };
// Create a new Mach instance
const mach: Mach<State, Action> = new_mach(60); // 60 ticks per second

// Register actions
register_action(mach, { $: "SetNick", time: 1000, pid: "player1", name: "Alice" });
register_action(mach, { $: "KeyEvent", time: 1500, pid: "player1", key: "ArrowUp", down: true });

// Compute game state at a specific time
const state = compute(mach, game, 2000);
```

This system is particularly useful for multiplayer games where precise synchronization and the ability to replay previous states are crucial.