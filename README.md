# ngrx-command-reducer

A command-style pattern reducer for [ngrx/store](https://github.com/ngrx/store) with type checking for actions and their payloads.

## Installation

```
$ npm install ngrx-command-reducer
```

## Example usage

### Reducer

The command reducer will ensure that an action can only be mapped to a command expecting a payload of the same type.

```js
import { ActionReducer } from '@ngrx/store';
import { CommandReducer } from '@fathom-london/ngrx-command-reducer';
import { CurrentUser } from './current-user';
// more imports etc...

const DEFAULT_STATE = {
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

export const loginCommand = (state: CurrentUser, payload: LoginParams): CurrentUser => {
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

this.store$.dispatch(new LoginAction({username, password}));
```