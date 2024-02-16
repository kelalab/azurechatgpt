import { createContext } from 'react'

export enum EditActions {
    "SET_EDIT" = "setEdit",
}

interface EditState {
    edit: boolean
}

interface EditAction {
    type: EditActions;
    payload: unknown;
}

export const initialState: EditState = { edit: false }

export const editReducer = (state: EditState, action: EditAction): EditState => {
    console.log('in reducer', state, action);
    switch (action.type) {
        case EditActions.SET_EDIT: {
            console.log('in set bots')
            return {edit: action.payload as boolean}
        }
        default: 
          return state;
    }
}

const MyBotsContext = createContext<{state: EditState; dispatch: (value: EditAction) => void }>({
    state: initialState,
    dispatch: () => null,
})

export default MyBotsContext;