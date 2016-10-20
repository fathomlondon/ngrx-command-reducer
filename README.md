# ngrx-command-reducer

A command-style redux reducer for Angular 2 and [ngrx/store](https://github.com/ngrx/store) with type checking for actions and their payloads.

* Reducers essentially become a clean map of actions to pure function commands. 
* The highly-testable commands encapsulate your business logic and return state.
* Actions are class based (no more magic strings!) and have typed payloads.
* State and action payloads are type checked against the commands you map them to.

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
  .add(LoginSuccessAction, loginSuccessCommand)
  .add(LoginErrorAction, loginErrorCommand)
  .reducer();
```


### Action

```js
import { Action } from '@ngrx/store';
import { LoginParams } from './login-params';

export class LoginAction implements Action {
  /**
   * Assinging a meaningful value to the `type` property is not 
   * mandatory. It's only required for guaranteed compatibility with any 
   * third-party ngrx tools not using an `instanceof` check for actions.
   */
  type: string = 'LoginAction';

  constructor(public payload?: LoginParams) {
    //
  }
}
```


### Command

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

If using [@ngrx/effects](https://github.com/ngrx/effects), you can respond to a typed action by replacing the `.ofType` operator with `.filter`:

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