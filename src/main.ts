export type Time = number; // 48-bit
export type Tick = number; // 48-bit

export type StateLogs<S>  = { [key: Tick]: S };
export type StateNode<S> = {
  tick: Tick,
  keep: number,
  life: number,
  state: S,
  older: StateNode<S> | null
};

export type StateLogs<S>  = StateNode<S> | null;
export type ActionLogs<A> = { [key: Tick]: A[] };

export type Mach<S, A> = {
  ticks_per_second: number,
  genesis_tick: Tick,
  cached_tick: Tick,
  state_logs: StateLogs<S>,
  action_logs: ActionLogs<A>,
};

export type Game<S, A> = {
  init: () => S,
  when: (action: A, state: S) => S,
  tick: (state: S) => S,
};

export function new_mach<S, A>(ticks_per_second: number): Mach<S, A> {
  return {
    ticks_per_second,
    genesis_tick: Infinity,
    cached_tick: -Infinity,
    state_logs: null,
    action_logs: {},
  };
}

export function time_to_tick<S, A>(mach: Mach<S, A>, time: Time): Tick {
  return Math.floor(time / 1000 * mach.ticks_per_second);
}

function push<S>(new_state: S, states: StateLogs<S>, t: Tick): StateLogs<S> {
  if (states === null) {
    return {tick: t, keep: 0, life: 0, state: new_state, older: null};
  } else {
    const {tick, keep, life, state, older} = states;
    if (keep === 0) {
      return {tick, keep: 1, life, state, older};
    } else {
      if (life > 0) {
        return {tick: t, keep: 0, life: 0, state: new_state, older: {tick, keep: 0, life: life - 1, state, older}};
      } else {
        return {tick: t, keep: 0, life, state: new_state, older: push(state, older, tick)};
      }
    }
  }
}

function rollback<S>(amount: number, states: StateLogs<S>): StateLogs<S> {
  if (states === null) return null;
  let cut = 0;
  for (let i = 0; i < amount; ++i) {
    if (states === null) return null;
    cut += states.life + 1;
    states = states.older;
  }
  if (states === null) return null;
  states.keep = 0;
  states.life = states.life + cut;
  return states;
}

function find_rollback_amount<S>(target_tick: Tick, states: StateLogs<S>): number {
  let rollback_amount = 0;
  let current = states;
  let prev = null;

  // Traverse the list until we find a tick less than the target
  while (current !== null && current.tick > target_tick) {
    prev = current;
    current = current.older;
    rollback_amount++;
  }

  // If we've gone too far back (or the list is empty), return the last valid rollback amount
  if (current === null && prev !== null) {
    return rollback_amount - 1;
  }

  return rollback_amount;
}

export function register_action<S, A>(mach: Mach<S, A>, action: A & { time: Time }) {
  var time = action.time;
  var tick = time_to_tick(mach, time);
  var hash = JSON.stringify(action);
  
  // Initilize this tick's actions
  if (!mach.action_logs[tick]) {
    mach.action_logs[tick] = [];
  }

  // Updates the first action tick
  mach.genesis_tick = Math.min(mach.genesis_tick, tick);
  
  // Get this tick's actions
  var actions = mach.action_logs[tick];

  // If the message is duplicated, skip it
  for (let action of actions) {
    if (JSON.stringify(action) == hash) {
      return;
    }
  }

  // Deletes all > tick states
  if (tick < mach.cached_tick) {
    // TODO: better way to find rollback amount
    const rollback_amount = find_rollback_amount(tick, mach.state_logs);
    mach.state_logs = rollback(rollback_amount, mach.state_logs);
  }

  mach.cached_tick = Math.min(mach.cached_tick, tick);

  // Pushes the action
  actions.push(action); 
}

export function compute<S, A>(mach: Mach<S, A>, game: Game<S, A>, time: Time): S {
  var ini_t : Tick;
  var end_t = time_to_tick(mach, time);
  var state : S;

  if (mach.state_logs === null) {
    state = game.init();
    ini_t = mach.genesis_tick;
  } else {
    state = mach.state_logs.state;
    ini_t = mach.state_logs.tick;
  }

  if (end_t - ini_t > 1000) {
    return state;
  }

  // NOTE: actions of tick X happen AFTER its recorded state
  for (var t = ini_t; t <= end_t; ++t) {
    // Caches this tick
    mach.cached_tick = Math.max(mach.cached_tick, t);
    mach.state_logs = push(state, mach.state_logs, t);

    // Computes the tick
    state = game.tick(state);

    // Computes the actions
    var actions = mach.action_logs[t] || [];
    for (var action of actions) {
      state = game.when(action, state);
    }
  }

  return state;
}
