import { createContext } from 'react'
import { Bot } from '../types';

export enum MyBotsActions {
    "SET_BOTS" = "setBots",
}

interface MyBotsState {
    myBots: Bot[]
}

interface MyBotsAction {
    type: MyBotsActions;
    payload: unknown;
}

export const initialState: MyBotsState = { myBots: [] }

export const myBotsReducer = (state: MyBotsState, action: MyBotsAction): MyBotsState => {
    console.log('in reducer', state, action);
    switch (action.type) {
        case MyBotsActions.SET_BOTS : {
            console.log('in set bots')
            return {myBots: action.payload as Bot[]}
        }
        default: 
          return state;
    }
}

const MyBotsContext = createContext<{state: MyBotsState; dispatch: (value: MyBotsAction) => void }>({
    state: initialState,
    dispatch: () => null,
})

export default MyBotsContext;