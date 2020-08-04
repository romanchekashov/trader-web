import * as React from "react";
import {memo, useEffect, useState} from "react";
import {playSound} from "../../assets/assets";
import {getSwingStates} from "../../api/rest/analysisRestApi";
import {WebsocketService, WSEvent} from "../../api/WebsocketService";
import {PatternResult} from "../alerts/data/PatternResult";
import {SwingStateDto} from "./data/SwingStateDto";
import SwingState from "./SwingState";
import {MarketStateFilterDto} from "../market-state/data/MarketStateFilterDto";
import {Button} from "primereact/button";

type Props = {
    filter: MarketStateFilterDto
    initSwingStates?: SwingStateDto[]
};
let fetchAlertsAttempt = 0;
let previousAlertsCount = 0;

const SwingStateList: React.FC<Props> = ({filter, initSwingStates}) => {

    const [swingStates, setSwingStates] = useState<SwingStateDto[]>(initSwingStates || []);
    const [fetchDataStatus, setFetchDataStatus] = useState(null);

    const fetchAlerts = () => {
        setFetchDataStatus("Loading swing states for " + filter.secId + "...");
        getSwingStates(filter)
            .then(states => {
                setDataReceivedFromServer(states);
                setFetchDataStatus(null);
            })
            .catch(reason => {
                setSwingStates([]);
                setFetchDataStatus("Cannot get swing states for " + filter.secId);
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
                        setDataReceivedFromServer(states);
                    });
            }
            fetchAlerts();
        } else if (initSwingStates) {
            setDataReceivedFromServer(initSwingStates);
        }

        // Specify how to clean up after this effect:
        return function cleanup() {
            if (alertsSubscription) alertsSubscription.unsubscribe();
        };
    }, [filter, initSwingStates]);

    const setDataReceivedFromServer = (states: SwingStateDto[]): void => {
        setSwingStates(states);
        // notifyOnNewAlert(newAlerts);
    };

    if (!filter) {
        return (<>Filter for market state is not set.</>);
    }

    if (filter && fetchDataStatus) {
        return (
            <div>
                {fetchDataStatus}
                <Button icon="pi pi-refresh" style={{marginLeft: '.25em'}} onClick={fetchAlerts}/>
            </div>
        );
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