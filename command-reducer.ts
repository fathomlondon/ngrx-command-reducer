import { Action, ActionReducer } from '@ngrx/store';

interface ActionMapping<A, P> {
	new(): A;
	prototype: {payload?: P};
}

interface ActionCommandMapping<S, P> {
	(state: S, payload: P): S;
}

export class CommandReducer<S> {
	private map = [];

	constructor(private defaultState: S) {
		//
	}

	add = <A extends Action, P>(action: ActionMapping<A, P>, command: ActionCommandMapping<S, P>) => {
		this.map.push({action, command});

		return this;
	};

	reducer = (): ActionReducer<S> => this._reducer;

	private _reducer: ActionReducer<S> = (state: S, action: Action): S => {
		if (typeof state === 'undefined') {
			state = this.defaultState;
		}

		return this.map.reduce(
			(prevState, mapping) => action instanceof mapping.action
				? mapping.command(prevState, action.payload)
				: prevState,
			state
		);
	}
}
