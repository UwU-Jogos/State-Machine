# Mach: A Deterministic State Management System

Mach is a lightweight, deterministic state management system designed for multiplayer games. It provides a robust framework for handling states, actions, and time-based computations.

## Features

- Deterministic state management
- Action logging and replay
- Time-based tick system
- Efficient state caching
- Support for custom game logic

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

## Usage

The main components of Mach are:

### Types

- `Time`: Represents time as a 48-bit number
- `Tick`: Represents a game tick as a 48-bit number
- `StateLogs<S>`: A record of game states indexed by ticks
- `ActionLogs<A>`: A record of actions indexed by ticks
- `Mach<S, A>`: The main state management object
- `Game<S, A>`: Defines the game logic (init, when, tick functions)

### Functions

- `new_mach<S, A>`: Creates a new Mach instance
- `time_to_tick<S, A>`: Converts time to a tick
- `register_action<S, A>`: Registers an action at a specific time
- `compute<S, A>`: Computes the game state at a given time

## Example

```typescript
import { new_mach, register_action, compute, Game, Mach } from './mach';

// Define your game state and action types
type State = { /* ... */ };
type Action = { /* ... */ };

// Implement your game logic
const game: Game<State, Action> = {
  init: () => ({ /* initial state */ }),
  when: (action, state) => { /* handle action */ },
  tick: (state) => { /* update state each tick */ },
};

// Create a new Mach instance
const mach: Mach<State, Action> = new_mach(60); // 60 ticks per second

// Register actions
register_action(mach, { /* action data */, time: 1000 });

// Compute game state at a specific time
const state = compute(mach, game, 2000);
```

