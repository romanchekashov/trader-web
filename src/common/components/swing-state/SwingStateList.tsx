import * as React from "react";
import {memo, useEffect, useState} from "react";
import {playSound} from "../../assets/assets";
import {getSwingStates} from "../../api/rest/analysisRestApi";
import {WebsocketService, WSEvent} from "../../api/WebsocketService";
import {PatternResult} from "../alerts/data/PatternResult";
import {SwingStateDto} from "./data/SwingStateDto";
import SwingState from "./SwingState";
import {MarketStateFilterDto} from "../market-state/data/MarketStateFilterDto";

type Props = {
    filter: MarketStateFilterDto
};
let fetchAlertsAttempt = 0;
let previousAlertsCount = 0;

const SwingStateList: React.FC<Props> = ({filter}) => {

    const [swingStates, setSwingStates] = useState<SwingStateDto[]>([]);
    const [fetchAlertsError, setFetchAlertsError] = useState(null);

    const fetchAlerts = () => {
        getSwingStates(filter)
            .then(states => {
                setAlertsReceivedFromServer(states);
                setFetchAlertsError(null);
            })
            .catch(reason => {
                setSwingStates([]);
                setFetchAlertsError("Cannot get swing states for " + filter.secCode);
                if (fetchAlertsAttempt < 3) {
                    fetchAlertsAttempt++;
                    fetchAlerts();
                }
            });
    };

    const notifyOnNewAlert = (newAlerts: PatternResult[]): void => {
        if (newAlerts && newAlerts.length !== previousAlertsCount) {
            playSound(4);
            previousAlertsCount = newAlerts.length;
        }
    };

    useEffect(() => {
        let alertsSubscription;
        if (filter) {
            fetchAlertsAttempt = 0;

            if (filter.fetchByWS) {
                alertsSubscription = WebsocketService.getInstance()
                    .on<SwingStateDto[]>(filter.history ? WSEvent.HISTORY_SWING_STATES : WSEvent.SWING_STATES)
                    .subscribe(states => {
                        for (const state of states) {
                            for (const item of state.items) {
                                item.start = new Date(item.start);
                                item.end = new Date(item.end);
                            }
                        }
                        setAlertsReceivedFromServer(states);
                    });
            } else {
                fetchAlerts();
            }
        }

        // Specify how to clean up after this effect:
        return function cleanup() {
            if (alertsSubscription) alertsSubscription.unsubscribe();
        };
    }, [filter]);

    const setAlertsReceivedFromServer = (states: SwingStateDto[]): void => {
        setSwingStates(states);
        // notifyOnNewAlert(newAlerts);
    };

    if (!filter) {
        return (<>Filter for market state is not set.</>);
    }

    if (filter && fetchAlertsError) {
        return (<div style={{color: "red"}}>{fetchAlertsError}</div>);
    }

    return (
        <div className="p-grid swing-state-list">
            <div className="p-col-12">
                {
                    swingStates.map(swingState => <SwingState key={swingState.interval} swingState={swingState}/>)
                }
            </div>
        </div>
    )
};

export default memo(SwingStateList);