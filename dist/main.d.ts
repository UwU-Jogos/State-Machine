export type Time = number;
export type Tick = number;
export type StateLogs<S> = {
    [key: Tick]: S;
};
export type ActionLogs<A> = {
    [key: Tick]: A[];
};
export type Mach<S, A> = {
    ticks_per_second: number;
    genesis_tick: Tick;
    cached_tick: Tick;
    state_logs: StateLogs<S>;
    action_logs: ActionLogs<A>;
};
export type Game<S, A> = {
    init: () => S;
    when: (action: A, state: S) => S;
    tick: (state: S) => S;
};
export declare function new_mach<S, A>(ticks_per_second: number): Mach<S, A>;
export declare function time_to_tick<S, A>(mach: Mach<S, A>, time: Time): Tick;
export declare function register_action<S, A>(mach: Mach<S, A>, action: A & {
    time: Time;
}): void;
export declare function compute<S, A>(mach: Mach<S, A>, game: Game<S, A>, time: Time): S;
