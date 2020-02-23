import {CREATE_COURSE} from "./analysisActions";

export function analysisReducer(state: any = [], action: any) {
    switch (action.type) {
        case CREATE_COURSE:
            return [...state, { ...action.course }];
        default:
            return state;
    }
}
