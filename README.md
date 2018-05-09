# This project is dead, much like the use of Angular.

# ngrx-command-reducer

A command-style redux reducer for Angular and [ngrx/store](https://github.com/ngrx/store) with type checking for actions
and their payloads.

* Reducers essentially become a clean map of actions to pure function commands. 
* The highly-testable commands encapsulate your business logic and return state.
* Actions are class based (no more magic strings!) and have typed payloads.
* State and action payloads are type checked against the commands you map them to.
* Highly testable

## Installation

```
$ npm install ngrx-command-reducer
```

## Example usage

### Reducer

The command reducer will ensure that an action can only be mapped to a command expecting a payload of the same type.

```js
import { ActionReducer } from '@ngrx/store';
import { CommandReducer } from 'ngrx-command-reducer';
import { CurrentUser } from './current-user';
// more imports etc...

const DEFAULT_STATE: CurrentUser = {
  isLoading: false,
  user: null,
  error: null
};

export const currentUserReducer: ActionReducer<CurrentUser> = new CommandReducer<CurrentUser>(DEFAULT_STATE)
  .add(LoginAction, loginCommand)
  .add(LoginSuccessAction, loginSuccessReducerCommand)
  .add(LoginErrorAction, loginErrorReducerCommand)
  .reducer();
```


### Action

```js
import { Action } from '@ngrx/store';
import { LoginParams } from './login-params';

export class LoginAction implements Action {
  /**
   * Assigning a meaningful value to the `type` property is not 
   * mandatory. It's only required for guaranteed compatibility with any 
   * third-party ngrx tools not using an `instanceof` check for actions.
   */
  type: string = 'LoginAction';

  constructor(public payload: LoginParams) {
    //
  }
}
```


### ReducerCommand

```js
import { LoginParams } from './login-params';
import { CurrentUser } from './current-user';

export function loginCommand(state: CurrentUser, payload: LoginParams): CurrentUser {
  state = Object.assign({}, state);
  state.isLoading = true;
  state.error = null;
  
  // Access payload.username or payload.password if you need to
  
  return state;
};
```


### Effects

If using [@ngrx/effects](https://github.com/ngrx/effects), you can respond to a typed action by replacing the `.ofType` 
operator with `.filter`:

```js
@Effect() login$ = this.actions$
  .filter(action => action instanceof LoginAction)
  .map((action: LoginAction) => {
    // Access action.payload.username or action.payload.password
  })
```


### Dispatch

```js
const username = 'missfoo';
const password = 'ilikebar';

// The LoginAction payload is defined by the LoginParams interface
this.store$.dispatch(new LoginAction({username, password}));
```

### Testing

#### ReducerCommands

`ReducerCommands` are extremely easy to test, as they should be implemented as pure functions. 

1. Import the pure function into your test spec
1. Pass a mock state and payload when manually executing the reducer command
1. Assert on the returned state

#### Reducers

You can also test that the `CommandReducer` is executing the correct command functions when specific actions are 
dispatched. Simply mock your commands with `useMockCommand()` like so:
 
_foo.reducer.ts:_

```js
export const fooReducer: ActionReducer<Foo> = new CommandReducer<Foo>(DEFAULT_STATE)
  .add(AddBarAction, addBarReducerCommand)
  .reducer();
```
    
_foo.reducer.spec.ts — an example using jasmine:_

```js
const myMockCommand = jasmine.createSpy('myMockCommand');
fooReducer.useMockCommand(AddBarAction, myMockCommand);

// ... dispatch AddBarAction to store ...

expect(myMockCommand).toHaveBeenCalled();
```
