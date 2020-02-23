import { combineReducers } from "redux";
import {analysisReducer} from "../features/analysis/analysisReducer";

export const rootReducer = combineReducers({
    analysisReducer
});
