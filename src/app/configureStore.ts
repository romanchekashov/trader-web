import { createStore, applyMiddleware, compose } from "redux";
import reduxImmutableStateInvariant from "redux-immutable-state-invariant";
import {rootReducer} from "./rootReducer";
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';

export function configureStore(initialState?: any) {
    return createStore(
        rootReducer,
        initialState,
        composeWithDevTools(applyMiddleware(reduxImmutableStateInvariant()))
    );
}