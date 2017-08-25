import { Action, ActionReducer } from '@ngrx/store';

interface StaticAction<A, P> {
	new(...args: any[]): A;
	prototype: {payload?: P};
}

export interface ReducerCommand<S, P> {
	(state: S, payload: P): S;
}

export interface CommandReducerMapping {
	action: StaticAction<Action, any>;
	command: ReducerCommand<any, any>;
}

declare module '@ngrx/store' {
	interface ActionReducer<S> {
		useMockCommand?<P>(command: ReducerCommand<S, P>, mockCommand: ReducerCommand<S, P>): CommandReducerMapping[];
	}
}

/**
 * A command-style redux reducer for Angular and [ngrx/store](https://github.com/ngrx/store) with type checking for
 * actions and their payloads.
 *
 * @example
 *
 *     // add-bar.reducer-command.ts
 *     export function addBarReducerCommand: ReducerCommand<FooState, Bar> = (
 *         foo: FooState, payload: Bar
 *     ): Favorites => {
 *         foo = {...foo};
 *         foo.bar = payload;
 *
 *         return foo;
 *     }
 *
 *     // foo.reducer.ts
 *     export const fooReducer: ActionReducer<FooState> =
 *         new CommandReducer<FooState>(DEFAULT_STATE)
 *         .add(AddBarAction, addBarReducerCommand)
 *         .add(AddZarAction, addZarReducerCommand)
 *         .reducer();
 */
export class CommandReducer<S> {
	private map: CommandReducerMapping[] = [];

	constructor(private defaultState: S) {
		// Make `useMockCommand` easily accessible when only exporting the `ActionReducer` from a module
		this._reducer.useMockCommand = this.useMockCommand;
	}

	/**
	 * Adds a `ReducerCommand` function that will be executed when the store receives the specified action.
	 *
	 * Actions and ReducerCommands are many-to-many, so you may use any combination, as many times as you like as long
	 * as the `ReducerCommand` function signature is compatible with the `ActionReducer`'s state and the `Action`'s
	 * payload.
	 *
	 * @param action
	 * @param command
	 * @chainable
	 */
	add = <P>(action: StaticAction<Action, P>, command: ReducerCommand<S, P>): CommandReducer<S> => {
		this.map.push({action, command});

		return this;
	};

	/**
	 * Returns the `ActionReducer` to be used within `@ngrx/store`.
	 */
	reducer = (): ActionReducer<S> => this._reducer;

	/**
	 * Replaces each occurance of a `ReducerCommand` with a mock `ReducerCommand`. Ideal for spying on command execution
	 * in test scenarios.
	 *
	 * Accessible as a method on the returned `ActionReducer` instance.
	 *
	 * @example
	 *
	 *     // foo.reducer.ts
	 *     export const fooReducer: ActionReducer<Foo> =
	 *         new CommandReducer<Foo>(DEFAULT_STATE)
	 *         .add(AddBarAction, addBarReducerCommand)
	 *         .reducer();
	 *
	 *     // foo.reducer.spec.ts - an example using jasmine
	 *     const myMockCommand = jasmine.createSpy('myMockCommand');
	 *     fooReducer.useMockCommand(AddBarAction, myMockCommand);
	 *     // ... dispatch AddBarAction to store ...
	 *     expect(myMockCommand).toHaveBeenCalled();
	 *
	 * @param command       The command you want to replace
	 * @param mockCommand   The command you want to use in it's place.
	 * @returns An array of affected `CommandReducerMapping` objects.
	 */
	private useMockCommand = <P>(
		command: ReducerCommand<S, P>, mockCommand: ReducerCommand<S, P>
	): CommandReducerMapping[] => {
		return this.map
			.filter((mapping: CommandReducerMapping) => {
				if (mapping.command === command) {
					mapping.command = mockCommand;
					return true;
				}
				return false;
			});
	};

	/**
	 * The `ActionReducer`. To be accessed via `reducer()`.
	 */
	private _reducer: ActionReducer<S> = ((state: S, action: Action): S => {
		if (typeof state === 'undefined') {
			state = this.defaultState;
		}

		return this.map.reduce(
			(prevState: S, mapping: CommandReducerMapping) => action instanceof mapping.action
				? mapping.command(prevState, action.payload)
				: prevState,
			state
		);
	}) as ActionReducer<S>;
}
