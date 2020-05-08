import {AppDispatch} from "../../app/store";
import {ResultDto} from "../../common/data/journal/ResultDto";
import {getStat} from "../../common/api/rest/journalRestApi";

export const LOAD_STAT_SUCCESS = "LOAD_STAT_SUCCESS";

interface LoadStatSuccessAction {
    type: typeof LOAD_STAT_SUCCESS
    stat: ResultDto[]
}

export interface TradeJournalState {
    stat: ResultDto[]
}

export type TradeJournalActionTypes = LoadStatSuccessAction

export const loadStatSuccess = (stat: ResultDto[]): LoadStatSuccessAction => ({type: LOAD_STAT_SUCCESS, stat});

export const loadStat = () => (dispatch: AppDispatch) => {
    // getStat()
    //     .then(stat => {
    //         dispatch(loadStatSuccess(stat));
    //     })
    //     .catch(error => {
    //         throw error;
    //     });
};