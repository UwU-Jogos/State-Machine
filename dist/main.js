// TODO: new_mach function
export function new_mach(ticks_per_second) {
    return {
        ticks_per_second,
        genesis_tick: Infinity,
        cached_tick: -Infinity,
        state_logs: {},
        action_logs: {},
    };
}
export function time_to_tick(mach, time) {
    return Math.floor(time / 1000 * mach.ticks_per_second);
}
export function register_action(mach, action) {
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
    // Deletes all >tick states
    for (let t = tick + 1; t <= mach.cached_tick; ++t) {
        delete mach.state_logs[t];
    }
    mach.cached_tick = Math.min(mach.cached_tick, tick);
    // Pushes the action
    actions.push(action);
}
export function compute(mach, game, time) {
    var ini_t = mach.cached_tick;
    var end_t = time_to_tick(mach, time);
    var state = mach.state_logs[ini_t];
    if (!state) {
        state = game.init();
        ini_t = mach.genesis_tick;
    }
    if (end_t - ini_t > 1000) {
        return state;
    }
    // NOTE: actions of tick X happen AFTER its recorded state
    for (var t = ini_t; t <= end_t; ++t) {
        // Caches this tick
        mach.cached_tick = Math.max(mach.cached_tick, t);
        mach.state_logs[t] = state;
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
