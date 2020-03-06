import {applyMiddleware, createStore} from "redux";
import reduxImmutableStateInvariant from "redux-immutable-state-invariant";
import rootReducer from "./rootReducer";
import {composeWithDevTools} from 'redux-devtools-extension/developmentOnly';
import thunk from "redux-thunk";

const store = createStore(
    rootReducer,
    {},
    composeWithDevTools(applyMiddleware(thunk, reduxImmutableStateInvariant()))
);

export type AppDispatch = typeof store.dispatch

// export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>

export default store;